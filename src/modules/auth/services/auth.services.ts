import { db, users } from "#db";
import redis from "#redis";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { sendEmail } from "#queue";
import type { SignupSchemaDto } from "../dto/signup.dto";
import { env } from "#configs";

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
            const token =  await this.generateJwtToken({ email }, 60 * 15);

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
            throw error;
        }
    }

    private async generateJwtToken(payload: Object, expiresIn: number): Promise<string> {
        return jwt.sign(payload, env.jwtSecret, { expiresIn });
    }
}
