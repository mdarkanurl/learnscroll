import { Hono } from 'hono';
import { isAuthenticated } from "#middlewares";
import { UserLecturesControllers } from '../../controllers';

const usersLecturesRouters = new Hono();
const usersLecturesControllers = new UserLecturesControllers();

usersLecturesRouters.get(
    '/',
    isAuthenticated(),
    (c) => usersLecturesControllers.getLectures(c)
);

usersLecturesRouters.get(
    '/:lectureId',
    isAuthenticated(),
    (c) => usersLecturesControllers.getLecture(c)
);

export default usersLecturesRouters;
