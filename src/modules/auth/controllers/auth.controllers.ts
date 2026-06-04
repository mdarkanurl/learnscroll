import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { AuthServices } from "../services/auth.services";
import type { LoginSchemaDto } from "../dto/login.dto";
import type { SignupSchemaDto } from "../dto/signup.dto";
import type { VerifyEmailSchemaDto } from "../dto/verify-email.dto";
import type { ForgotPasswordSchemaDto } from "../dto/forgot-password.dto";
import type { ResetPasswordSchemaDto } from "../dto/reset-password.dto";
import type { VerifyPasswordSchemaDto } from "../dto/verify-password.dto";
import CustomError from "#error";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { getConnInfo } from 'hono/bun'

export class AuthControllers {
    private readonly authServices = new AuthServices();

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
            const info = getConnInfo(c);
            const ipAddress = info.remote.address;

            if (!token) {
                return c.json({
                    success: false,
                    message: "Verification token not found"
                }, 400);
            }

            const response = await this.authServices
                .verifyEmail(
                    {
                        userAgent: c.req.header("User-Agent") || "Unknown",
                        userIp: ipAddress || "Unknown"
                    },
                    token,
                    code
                );

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

    async forgotPassword(c: Context<any, any, { out: { json: ForgotPasswordSchemaDto } }>) {
        try {
            const { email } = c.req.valid("json");

            const response = await this.authServices.forgotPassword(email);

            setCookie(c, 'forgot_password_token', response.token, {
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

    async resetPassword(c: Context<any, any, { out: { json: ResetPasswordSchemaDto } }>) {
        try {
            const { code, newPassword } = c.req.valid("json");
            const token = getCookie(c, "forgot_password_token");

            if (!token) {
                return c.json({
                    success: false,
                    message: "Reset token not found"
                }, 400);
            }

            const response = await this.authServices.resetPassword(token, code, newPassword);

            deleteCookie(c, 'forgot_password_token');

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

    async refreshToken(c: Context) {
        try {
            const token = getCookie(c, "refresh_token");

            if (!token) {
                return c.json({
                    success: false,
                    message: "Refresh token not found"
                }, 400);
            }

            const info = getConnInfo(c);
            const ipAddress = info.remote.address;

            const response = await this.authServices.refreshToken(
                {
                    userAgent: c.req.header("User-Agent") || "Unknown",
                    userIp: ipAddress || "Unknown"
                },
                token
            );

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
                message: "Token refreshed successfully"
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

    async logout(c: Context) {
        try {
            const userId = c.get("jwtPayload")?.userId;

            const response = await this.authServices
            .logout(
                c.req.header("User-Agent") || "Unknown",
                userId
            );

            deleteCookie(c, 'access_token');
            deleteCookie(c, 'refresh_token');

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

    async logoutAll(c: Context) {
        try {
            const userId = c.get("jwtPayload")?.userId;

            const response = await this.authServices.logoutAll(userId);

            deleteCookie(c, 'access_token');
            deleteCookie(c, 'refresh_token');

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

    async sessions(c: Context) {
        try {
            const userId = c.get("jwtPayload")?.userId as string;

            const data = await this.authServices.getSessions(userId);
            return c.json({
                success: true,
                data
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

    async revokeSession(c: Context) {
        try {
            const userId = c.get("jwtPayload")?.userId as string;
            const sessionId = c.req.param("sessionId") as string;

            const response = await this.authServices.revokeSession(userId, sessionId);
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

    async verifyPassword(c: Context<any, any, { out: { json: VerifyPasswordSchemaDto } }>) {
        try {
            const { password } = c.req.valid("json");
            const email = c.get("jwtPayload")?.email as string;

            const response = await this.authServices.verifyPassword(email, password);

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

    async deleteAccount(c: Context) {
        try {
            const userId = c.get("jwtPayload")?.userId as string;

            const response = await this.authServices.deleteAccount(userId);

            deleteCookie(c, 'access_token');
            deleteCookie(c, 'refresh_token');

            return c.json({ success: true, message: response });
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

    async login(c: Context<any, any, { out: { json: LoginSchemaDto } }>) {
        try {
            const { email, password } = c.req.valid("json");
            const info = getConnInfo(c);
            const ipAddress = info.remote.address;

            const response = await this.authServices
                .login(
                    {
                        userAgent: c.req.header("User-Agent") || "Unknown",
                        userIp: ipAddress || "Unknown"
                    },
                    email,
                    password
                );

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
