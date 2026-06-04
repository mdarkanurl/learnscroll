import { db, refresh_tokens, users } from "#db";
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
            const refreshToken = this.jwtUtils.generateJwtToken({ userId: user?.id }, 60 * 60 * 24 * 30);

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
    ): Promise<{ message: string, accessToken: string, refreshToken: string }> {
        try {
            const [user] = await this.db
                .select()
                .from(users)
                .where(sql`lower(${users.email}) = lower(${email})`)
                .limit(1);

            if (!user) throw new CustomError("Invalid email or password", 401);

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) throw new CustomError("Invalid email or password", 401);

            const accessToken = this.jwtUtils.generateJwtToken({ userId: user.id, email: user.email }, 60 * 15);
            const refreshToken = this.jwtUtils.generateJwtToken({ userId: user.id }, 60 * 60 * 24 * 30);

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
            const payload = this.jwtUtils.verifyJwtToken(token) as { userId: string };

            const [storedToken] = await this.db
                .select()
                .from(refresh_tokens)
                .where(sql`${refresh_tokens.userId} = ${payload.userId} AND ${refresh_tokens.revokedAt} IS NULL AND ${refresh_tokens.expiresAt} > NOW()`)
                .orderBy(sql`${refresh_tokens.createdAt} DESC`)
                .limit(1);

            if (!storedToken) throw new CustomError("Invalid or expired refresh token", 401);

            const isTokenValid = await bcrypt.compare(token, storedToken.tokenHash);
            if (!isTokenValid) throw new CustomError("Invalid refresh token", 401);

            const accessToken = this.jwtUtils.generateJwtToken({ userId: payload.userId }, 60 * 15);
            const newRefreshToken = this.jwtUtils.generateJwtToken({ userId: payload.userId }, 60 * 60 * 24 * 30);

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

    async logout(userId: string): Promise<string> {
        await this.db.update(refresh_tokens)
            .set({ revokedAt: new Date() })
            .where(sql`${refresh_tokens.userId} = ${userId}`);

        return "Logged out successfully";
    }

    async changePassword(email: string, currentPassword: string, newPassword: string): Promise<string> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(sql`lower(${users.email}) = lower(${email})`)
            .limit(1);

        if (!user) throw new CustomError("User not found", 404);

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) throw new CustomError("Current password is incorrect", 401);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.db.update(users)
            .set({ password: hashedPassword })
            .where(sql`lower(${users.email}) = lower(${email})`);

        return "Password changed successfully";
    }
}
