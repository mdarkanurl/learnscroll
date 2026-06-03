import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { AuthServices } from "../services/auth.services";
import type { LoginSchemaDto } from "../dto/login.dto";
import type { SignupSchemaDto } from "../dto/signup.dto";
import type { VerifyEmailSchemaDto } from "../dto/verify-email.dto";
import CustomError from "#error";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

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

            if(typeof response === "string") 
                return c.json({
                    success: true,
                    message: response
                });

            setCookie(c, 'verify_email_token', response.token, {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 15 * 60,
                expires: new Date(Date.now() + 15 * 60 * 1000),
                sameSite: 'Lax',
            });
            
            return c.json({
                success: true,
                message: response.message
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

    async verifyEmail(c: Context<any, any, { out: { json: VerifyEmailSchemaDto } }>) {
        try {
            const { code } = c.req.valid("json");
            const token = getCookie(c, "verify_email_token");

            if (!token) {
                return c.json({
                    success: false,
                    message: "Verification token not found"
                }, 400);
            }

            const response = await this.authServices.verifyEmail(token, code);

            if(typeof response === "string")
                return c.json({
                    success: true,
                    message: response
                });

            setCookie(c, 'access_token', response.accessToken, {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 30 * 60,
                expires: new Date(Date.now() + 30 * 60 * 1000),
                sameSite: 'Lax',
            });

            setCookie(c, 'refresh_token', response.refreshToken, {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                sameSite: 'Lax',
            });

            deleteCookie(c, 'verify_email_token')

            return c.json({
                success: true,
                message: response.message
            });

        } catch (error) {
            console.error("Error in verifyEmail controller:", error);
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

    async login(c: Context<any, any, { out: { json: LoginSchemaDto } }>) {
        try {
            const { email, password } = c.req.valid("json");

            const response = await this.authServices.login(email, password);

            setCookie(c, 'access_token', response.accessToken, {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 30 * 60,
                expires: new Date(Date.now() + 30 * 60 * 1000),
                sameSite: 'Lax',
            });

            setCookie(c, 'refresh_token', response.refreshToken, {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                sameSite: 'Lax',
            });

            return c.json({
                success: true,
                message: response.message
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
