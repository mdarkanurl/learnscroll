import { db, refresh_tokens, users } from "#db";
import redis from "#redis";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { sendEmail } from "#queue";
import type { SignupSchemaDto } from "../dto/signup.dto";
import { env } from "#configs";
import CustomError from "#error";

export class AuthServices {

    private readonly db = db;
    private readonly redis = redis;

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
            const token =  this.generateJwtToken({ email }, 60 * 15); // token valid for 15 minutes

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
            throw new CustomError("An unexpected error occurred", 500);
        }
    }

    async verifyEmail(token: string, code: number): Promise<{ message: string, accessToken: string, refreshToken: string }> {
        try {
            const payload = this.verifyJwtToken(token) as { email: string };
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
            }).returning({ id: users.id });

            await this.redis.del(pendingKey);

            const accessToken = this.generateJwtToken({ userId: user?.id }, 60 * 30);
            const refreshToken = this.generateJwtToken({ userId: user?.id }, 60 * 60 * 24 * 30);

            // hash the refreshtoken
            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

            // Store the refreshToken
            await this.db.insert(refresh_tokens).values({
                userId: user?.id as string,
                tokenHash: hashedRefreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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
            throw new CustomError("An unexpected error occurred", 500);
        }
    }

    async login(email: string, password: string): Promise<{ message: string, accessToken: string, refreshToken: string }> {
        try {
            const [user] = await this.db
                .select()
                .from(users)
                .where(sql`lower(${users.email}) = lower(${email})`)
                .limit(1);

            if (!user) throw new CustomError("Invalid email or password", 401);

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) throw new CustomError("Invalid email or password", 401);

            const accessToken = this.generateJwtToken({ userId: user.id }, 60 * 30);
            const refreshToken = this.generateJwtToken({ userId: user.id }, 60 * 60 * 24 * 30);

            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

            await this.db.insert(refresh_tokens).values({
                userId: user.id,
                tokenHash: hashedRefreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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
            throw new CustomError("An unexpected error occurred", 500);
        }
    }

    private generateJwtToken(payload: Object, expiresIn: number): string {
        return jwt.sign(payload, env.jwtSecret, { expiresIn });
    }

    private verifyJwtToken(token: any) {
        return jwt.verify(token, env.jwtSecret);
    }
}
