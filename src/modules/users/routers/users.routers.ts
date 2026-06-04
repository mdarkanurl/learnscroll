import { UsersControllers } from './../controllers/users.controllers';
import { Hono } from 'hono';
import zodVaildation from '#validation';
import { isAuthenticated } from "#middlewares";
import { ChangePasswordSchema } from '../dto/change-password.dto';

const usersRouters = new Hono();
const usersControllers = new UsersControllers();

usersRouters.post(
    '/change-password',
    zodVaildation(ChangePasswordSchema),
    isAuthenticated(),
    (c) => usersControllers.changePassword(c)
);

usersRouters.get(
    "/me",
    isAuthenticated(),
    (c) => usersControllers.me(c)
);

export {
    usersRouters
}
