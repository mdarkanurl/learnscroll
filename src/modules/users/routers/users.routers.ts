import { UsersControllers } from './../controllers/users.controllers';
import { Hono } from 'hono';
import zodVaildation from '#validation';
import { isAuthenticated } from "#middlewares";
import { ChangePasswordSchema } from '../dto/change-password.dto';
import { UpdateProfileSchema } from '../dto/update-profile.dto';
import { UpdateNameSchema } from '../dto/update-name.dto';

const usersRouters = new Hono();
const usersControllers = new UsersControllers();

usersRouters.post(
    '/change-password',
    zodVaildation(ChangePasswordSchema),
    isAuthenticated(),
    (c) => usersControllers.changePassword(c)
);

usersRouters.put(
    "/update-name",
    zodVaildation(UpdateNameSchema),
    isAuthenticated(),
    (c) => usersControllers.updateName(c)
);

usersRouters.get(
    "/me",
    isAuthenticated(),
    (c) => usersControllers.me(c)
);

usersRouters.put(
    "/profiles",
    zodVaildation(UpdateProfileSchema),
    isAuthenticated(),
    (c) => usersControllers.updateProfile(c)
);

usersRouters.get(
    "/profiles",
    isAuthenticated(),
    (c) => usersControllers.profiles(c)
);

export {
    usersRouters
}
