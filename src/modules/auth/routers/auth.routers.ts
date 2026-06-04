import { AuthControllers } from './../controllers/auth.controllers';
import { Hono } from 'hono';
import { LoginSchema } from '../dto/login.dto';
import { SignupSchema } from '../dto/signup.dto';
import { VerifyEmailSchema } from '../dto/verify-email.dto';
import { ForgotPasswordSchema } from '../dto/forgot-password.dto';
import { ResetPasswordSchema } from '../dto/reset-password.dto';
import zodVaildation from '#validation';
import { isAuthenticated } from "#middlewares";

const authRouters = new Hono();
const authControllers = new AuthControllers();

authRouters.post(
    '/signup',
    zodVaildation(SignupSchema),
    (c) => authControllers.signup(c)
);

authRouters.post(
    '/verify-email',
    zodVaildation(VerifyEmailSchema),
    (c) => authControllers.verifyEmail(c)
);

authRouters.post(
    '/login',
    zodVaildation(LoginSchema),
    (c) => authControllers.login(c)
)

authRouters.post(
    '/forgot-password',
    zodVaildation(ForgotPasswordSchema),
    (c) => authControllers.forgotPassword(c)
)

authRouters.put(
    '/reset-password',
    zodVaildation(ResetPasswordSchema),
    (c) => authControllers.resetPassword(c)
)

authRouters.post(
    '/refresh-token',
    (c) => authControllers.refreshToken(c)
)

authRouters.post(
    '/logout',
    isAuthenticated(),
    (c) => authControllers.logout(c)
)

authRouters.post(
    '/logout-all',
    isAuthenticated(),
    (c) => authControllers.logoutAll(c)
)

authRouters.get(
    '/sessions',
    isAuthenticated(),
    (c) => authControllers.sessions(c)
)

authRouters.delete(
    '/sessions/:sessionId',
    isAuthenticated(),
    (c) => authControllers.revokeSession(c)
)

export {
    authRouters
}
