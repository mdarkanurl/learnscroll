import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { AuthServices } from "../services/auth.services";
import type { SignupSchemaDto } from "../dto/signup.dto";
import CustomError from "#error";

export class AuthControllers {
    constructor(
        private readonly authServices = new AuthServices()
    ) {
        this.authServices = authServices;
    }

    async signup(c: Context<any, any, { out: { json: SignupSchemaDto } }>) {
        try {
            const userInput = c.req.valid("json");
        
            const response = await this.authServices.signup(userInput);
            
            return c.json({
                success: true,
                message: response
            });
        } catch (error) {
            if (error instanceof CustomError) {
                return c.json({
                    success: false,
                    message: error.message
                }, error.statusCode as ContentfulStatusCode);
            }
            return c.json({
                success: false,
                message: "An unexpected error occurred"
            }, 500);
        }
    }
}
