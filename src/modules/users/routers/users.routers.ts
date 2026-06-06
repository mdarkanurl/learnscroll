import { enableMFASchema } from './../dto/enable-mfa.dto';
import { UsersControllers } from './../controllers/users.controllers';
import { Hono } from 'hono';
import zodVaildation from '#validation';
import { isAuthenticated } from "#middlewares";
import { ChangePasswordSchema } from '../dto/change-password.dto';
import { UpdateProfileSchema } from '../dto/update-profile.dto';
import { UpdateNameSchema } from '../dto/update-name.dto';
import { UpdatePrivacySchema } from '../dto/update-privacy.dto';

const usersRouters = new Hono();
const usersControllers = new UsersControllers();

usersRouters.post(
    '/change-password',
    zodVaildation(ChangePasswordSchema),
    isAuthenticated(),
    (c) => usersControllers.changePassword(c)
);

usersRouters.put(
    "/mfa",
    zodVaildation(enableMFASchema),
    isAuthenticated(),
    (c) => usersControllers.enableMfa(c)
);

usersRouters.get(
    "/is-public",
    isAuthenticated(),
    (c) => usersControllers.getProfileStatus(c)
);

usersRouters.get(
    "/is-course-visible",
    isAuthenticated(),
    (c) => usersControllers.getCoursesVisible(c)
);

usersRouters.put(
    "/is-public",
    zodVaildation(UpdatePrivacySchema),
    isAuthenticated(),
    (c) => usersControllers.updateProfileStatus(c)
);

usersRouters.put(
    "/is-course-visible",
    zodVaildation(UpdatePrivacySchema),
    isAuthenticated(),
    (c) => usersControllers.updateCoursesVisible(c)
);

usersRouters.put(
    "/profile-picture",
    isAuthenticated(),
    (c) => usersControllers.updateProfilePicture(c)
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
