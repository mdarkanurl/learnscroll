import { AuthControllers } from './../controllers/auth.controllers';
import { Hono } from 'hono';
import { SignupSchema } from '../dto/signup.dto';
import { VerifyEmailSchema } from '../dto/verify-email.dto';
import zodVaildation from '#validation';

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
)


export {
    authRouters
}
