import jwt from "jsonwebtoken";
import { env } from "#configs";

export class JwtUtils {
    private readonly jwt = jwt;

    generateJwtToken(payload: Object, expiresIn: number): string {
        return this.jwt.sign(payload, env.jwtSecret, { expiresIn });
    }

    verifyJwtToken(token: string) {
        return this.jwt.verify(token, env.jwtSecret);
    }
}
