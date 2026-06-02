import { db, users } from "#db";
import redis from "#redis";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { sendEmail } from "#queue";
import type { SignupSchemaDto } from "../dto/signup.dto";

export class AuthServices {

    private readonly db = db;
    private readonly redis = redis;

    async signup(input: SignupSchemaDto): Promise<string> {
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

            const userData = JSON.stringify({
                firstname,
                lastname,
                email: email,
                password: hashedPassword,
                verificationCode
            });

            await this.redis.set(pendingKey, userData, "EX", 900);

            await sendEmail({
                email: email,
                subject: "Verify your email",
                body: `Your verification code is: ${verificationCode}`
            });

            return "If email valid, you will receive a verification email shortly.";
        } catch (error) {
            throw error;
        }
    }
}
