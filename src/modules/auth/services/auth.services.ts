import { db, profiles, refresh_tokens, users } from "#db";
import redis from "#redis";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { sendEmail } from "#queue";
import type { SignupSchemaDto } from "../dto/signup.dto";
import { JwtUtils } from "#utils";
import CustomError from "#error";

export class AuthServices {

    private readonly db = db;
    private readonly redis = redis;
    private readonly jwtUtils = new JwtUtils();

    async signup(input: SignupSchemaDto): Promise<string | { token: string; message: string }> {
        try {
            const { firstname, lastname, email, password } = input;

            const [existingUser] = await this.db
                .select()
                .from(users)
                .where(sql`lower(${users.email}) = lower(${email})`)
                .limit(1);

            const pendingKey = `signup:${email}`;
            const pending = await this.redis.get(pendingKey);
            
            if (existingUser || pending) {
                return "If email valid, you will receive a verification email shortly.";
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

            // gnerate a token and store it to cookie so that verify email endpoint identifies the user and verify the code
            const token =  this.jwtUtils.generateJwtToken({ email }, 60 * 15); // token valid for 15 minutes

            const userData = JSON.stringify({
                firstname,
                lastname,
                email: email,
                password: hashedPassword,
                token,
                verificationCode
            });

            await this.redis.set(pendingKey, userData, "EX", 900);

            await sendEmail({
                email: email,
                subject: "Verify your email",
                body: `Your verification code is: ${verificationCode}`
            });

            return {
                token,
                message: "If email valid, you will receive a verification email shortly."
            };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            if(error instanceof jwt.JsonWebTokenError) throw new CustomError("Invalid token", 400);
            if(error instanceof jwt.TokenExpiredError) throw new CustomError("Expired token", 400);
            throw error;
        }
    }

    async verifyEmail(
        userInfo: { userAgent: string; userIp: string },
        token: string,
        code: number
    ): Promise<{ message: string, accessToken: string, refreshToken: string }> {
        try {
            const payload = this.jwtUtils.verifyJwtToken(token) as { email: string };
            const { email } = payload;

            const pendingKey = `signup:${email}`;
            const pending = await this.redis.get(pendingKey);

            if (!pending) {
                throw new CustomError("Invalid verification code", 400);
            }

            const userData = JSON.parse(pending);

            if (userData.verificationCode !== code.toString()) {
                throw new CustomError("Invalid verification code", 400);
            }

            const [user] = await this.db.insert(users).values({
                firstname: userData.firstname,
                lastname: userData.lastname,
                email: userData.email,
                password: userData.password,
            }).returning({ id: users.id, email: users.email });

            await this.redis.del(pendingKey);

            const accessToken = this.jwtUtils.generateJwtToken({ userId: user?.id, email: user?.email }, 60 * 15);
            const refreshToken = this.jwtUtils.generateJwtToken({ userId: user?.id, email: user?.email }, 60 * 60 * 24 * 30);

            // hash the refreshtoken
            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

            // Store the refreshToken
            await this.db.insert(refresh_tokens).values({
                userId: user?.id as string,
                tokenHash: hashedRefreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                userAgent: userInfo.userAgent,
                userIp: userInfo.userIp
            });
            
            return {
                message: "Email verified successfully",
                accessToken,
                refreshToken
            };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            if(error instanceof jwt.JsonWebTokenError) throw new CustomError("Invalid token", 400);
            if(error instanceof jwt.TokenExpiredError) throw new CustomError("Expired token", 400);
            throw error;
        }
    }

    async login(
        userInfo: { userAgent: string; userIp: string },
        email: string,
        password: string
    ): Promise<{ message: string, mfaRequired: false, accessToken: string, refreshToken: string } |
    { message: string, mfaRequired: true, mfaToken: string }> {
        try {
            const [user] = await this.db
                .select()
                .from(users)
                .where(sql`lower(${users.email}) = lower(${email})`)
                .limit(1);

            if (!user) throw new CustomError("Invalid email or password", 401);

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) throw new CustomError("Invalid email or password", 401);

            if (user.mfaEnabled) {
                const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
                const mfaToken = this.jwtUtils.generateJwtToken({ userId: user.id, email: user.email }, 60 * 5); // 5 min

                const mfaKey = `mfa:${user.id}:${mfaToken}`;
                await this.redis.set(mfaKey, JSON.stringify({ code: mfaCode, userInfo }), "EX", 300);

                await sendEmail({
                    email: user.email,
                    subject: "Your verification code",
                    body: `Your verification code is: ${mfaCode}`
                });

                return {
                    message: "MFA code sent to your email",
                    mfaRequired: true,
                    mfaToken
                };
            }

            const accessToken = this.jwtUtils.generateJwtToken({ userId: user.id, email: user.email }, 60 * 15);
            const refreshToken = this.jwtUtils.generateJwtToken({ userId: user.id, email: user.email }, 60 * 60 * 24 * 30);

            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

            await this.db.insert(refresh_tokens).values({
                userId: user.id,
                tokenHash: hashedRefreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                userAgent: userInfo.userAgent,
                userIp: userInfo.userIp
            });

            return {
                message: "Login successful",
                mfaRequired: false,
                accessToken,
                refreshToken
            };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            if(error instanceof jwt.JsonWebTokenError) throw new CustomError("Invalid token", 400);
            if(error instanceof jwt.TokenExpiredError) throw new CustomError("Expired token", 400);
            throw error;
        }
    }

    async verifyMfa(
        mfaToken: string,
        code: number
    ): Promise<{ message: string, accessToken: string, refreshToken: string }> {
        try {
            const payload = this.jwtUtils.verifyJwtToken(mfaToken) as { userId: string; email: string };

            const mfaKey = `mfa:${payload.userId}:${mfaToken}`;
            const stored = await this.redis.get(mfaKey);

            if (!stored) throw new CustomError("Invalid or expired MFA code", 400);

            const { code: storedCode, userInfo } = JSON.parse(stored);

            if (storedCode !== code.toString()) throw new CustomError("Invalid MFA code", 400);

            await this.redis.del(mfaKey);

            const accessToken = this.jwtUtils.generateJwtToken({ userId: payload.userId, email: payload.email }, 60 * 15);
            const refreshToken = this.jwtUtils.generateJwtToken({ userId: payload.userId, email: payload.email }, 60 * 60 * 24 * 30);

            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

            await this.db.insert(refresh_tokens).values({
                userId: payload.userId,
                tokenHash: hashedRefreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                userAgent: userInfo.userAgent,
                userIp: userInfo.userIp
            });

            return {
                message: "Login successful",
                accessToken,
                refreshToken
            };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            if(error instanceof jwt.JsonWebTokenError) throw new CustomError("Invalid token", 400);
            if(error instanceof jwt.TokenExpiredError) throw new CustomError("Expired token", 400);
            throw error;
        }
    }

    async forgotPassword(email: string): Promise<{ token: string; message: string }> {
        const [user] = await this.db
            .select({ id: users.id })
            .from(users)
            .where(sql`lower(${users.email}) = lower(${email})`)
            .limit(1);

        const token = this.jwtUtils.generateJwtToken({ email }, 60 * 15);

        if (!user) return {
            token,
            message: "If account exists, you will receive a password reset email shortly."
        };

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetKey = `reset:${email}`;

        const resetData = JSON.stringify({
            email,
            resetCode,
            token
        });

        // delete already requested for password reset
        await this.redis.del(resetKey);
        await this.redis.set(resetKey, resetData, "EX", 900);

        await sendEmail({
            email,
            subject: "Reset your password",
            body: `Your password reset code is: ${resetCode}`
        });

        return {
            token,
            message: "If account exists, you will receive a password reset email shortly."
        };
    }

    async resetPassword(token: string, code: number, newPassword: string): Promise<string> {
        try {
            const payload = this.jwtUtils.verifyJwtToken(token) as { email: string };
            const { email } = payload;

            const resetKey = `reset:${email}`;
            const reset = await this.redis.get(resetKey);

            if (!reset) throw new CustomError("Invalid or expired reset code", 400);

            const resetData = JSON.parse(reset);

            if (resetData.resetCode !== code.toString()) {
                throw new CustomError("Invalid or expired reset code", 400);
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await this.db.update(users)
                .set({ password: hashedPassword })
                .where(sql`lower(${users.email}) = lower(${email})`);

            await this.redis.del(resetKey);

            return "Password reset successfully";
        } catch (error) {
            if (error instanceof CustomError) throw error;
            if (error instanceof jwt.JsonWebTokenError) throw new CustomError("Invalid token", 400);
            if (error instanceof jwt.TokenExpiredError) throw new CustomError("Expired token", 400);
            throw error;
        }
    }

    async refreshToken(
        userInfo: { userAgent: string; userIp: string },
        token: string
    ): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            const payload = this.jwtUtils.verifyJwtToken(token) as { userId: string, email: string};

            const [storedToken] = await this.db
                .select()
                .from(refresh_tokens)
                .where(sql`${refresh_tokens.userId} = ${payload.userId} AND ${refresh_tokens.revokedAt} IS NULL AND ${refresh_tokens.expiresAt} > NOW()`)
                .orderBy(sql`${refresh_tokens.createdAt} DESC`)
                .limit(1);

            if (!storedToken) throw new CustomError("Invalid or expired refresh token", 401);

            const isTokenValid = await bcrypt.compare(token, storedToken.tokenHash);
            if (!isTokenValid) throw new CustomError("Invalid refresh token", 401);

            const accessToken = this.jwtUtils.generateJwtToken({ userId: payload.userId, email: payload.email }, 60 * 15);
            const newRefreshToken = this.jwtUtils.generateJwtToken({ userId: payload.userId, email: payload.email }, 60 * 60 * 24 * 30);

            const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

            // TODO clearup old refresh tokens from db
            await this.db.update(refresh_tokens)
                .set({ revokedAt: new Date() })
                .where(sql`${refresh_tokens.id} = ${storedToken.id}`);

            await this.db.insert(refresh_tokens).values({
                userId: payload.userId,
                tokenHash: hashedRefreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                userAgent: userInfo.userAgent,
                userIp: userInfo.userIp
            });

            return { accessToken, refreshToken: newRefreshToken };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            if(error instanceof jwt.JsonWebTokenError) throw new CustomError("Invalid token", 400);
            if(error instanceof jwt.TokenExpiredError) throw new CustomError("Expired token", 400);
            throw error;
        }
    }

    async logout(userAgent: string, userId: string): Promise<string> {
        await this.db.update(refresh_tokens)
            .set({ revokedAt: new Date() })
            .where(sql`${refresh_tokens.userId} = ${userId} AND ${refresh_tokens.userAgent} = ${userAgent}`);

        return "Logged out successfully";
    }

    async logoutAll(userId: string): Promise<string> {
        await this.db.update(refresh_tokens)
            .set({ revokedAt: new Date() })
            .where(sql`${refresh_tokens.userId} = ${userId}`);

        return "All sessions logged out successfully";
    }

    async getSessions(userId: string) {
        return this.db
            .select({
                id: refresh_tokens.id,
                userAgent: refresh_tokens.userAgent,
                userIp: refresh_tokens.userIp,
                createdAt: refresh_tokens.createdAt,
                lastUsedAt: refresh_tokens.lastUsedAt,
                expiresAt: refresh_tokens.expiresAt,
            })
            .from(refresh_tokens)
            .where(
                sql`${refresh_tokens.userId} = ${userId} AND ${refresh_tokens.revokedAt} IS NULL AND ${refresh_tokens.expiresAt} > NOW()`
            )
            .orderBy(sql`${refresh_tokens.createdAt} DESC`);
    }

    async revokeSession(userId: string, sessionId: string): Promise<string> {
        const [session] = await this.db
            .select({ id: refresh_tokens.id })
            .from(refresh_tokens)
            .where(
                sql`${refresh_tokens.id} = ${sessionId} AND ${refresh_tokens.userId} = ${userId}`
            )
            .limit(1);

        if (!session) throw new CustomError("Session not found", 404);

        await this.db.update(refresh_tokens)
            .set({ revokedAt: new Date() })
            .where(sql`${refresh_tokens.id} = ${sessionId}`);

        return "Session revoked successfully";
    }

    async verifyPassword(email: string, password: string): Promise<string> {
        const [user] = await this.db
            .select({
                id: users.id,
                password: users.password
            })
            .from(users)
            .where(sql`lower(${users.email}) = lower(${email})`)
            .limit(1);

        if (!user) throw new CustomError("User not found", 404);

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new CustomError("Current password is incorrect", 401);

        return "Password verified successfully";
    }

    async deleteAccount(userId: string): Promise<string> {
        await this.db.delete(users)
            .where(sql`${users.id} = ${userId}`);

        return "Account deleted successfully";
    }
}
