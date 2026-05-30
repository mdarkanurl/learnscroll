import { AuthControllers } from './../controllers/auth.controllers';
import { Hono } from 'hono';
import { SignupSchema } from '../dto/signup.dto';
import zodVaildation from '#validation';

const authRouters = new Hono();
const authControllers = new AuthControllers();

authRouters.post(
    '/signup',
    zodVaildation(SignupSchema),
    (c) => authControllers.signup(c)
);


export {
    authRouters
}
