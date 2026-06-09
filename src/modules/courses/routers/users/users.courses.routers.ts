import { UsersCoursesControllers } from '../../controllers';
import { Hono } from 'hono';
import usersSectionsRouters from './users.lectures.routers';

const usersCoursesRouters = new Hono();
const usersCoursesControllers = new UsersCoursesControllers();

usersCoursesRouters.get(
    '/',
    (c) => usersCoursesControllers.getAllCourses(c)
);

usersCoursesRouters.route("/sections/:courseId", usersSectionsRouters);

export default usersCoursesRouters;
