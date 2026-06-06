import { CoursesControllers } from './../controllers/courses.controllers';
import { Hono } from 'hono';
import { isAuthenticated } from "#middlewares";
import zodVaildation from '#validation';
import { CreateCourseSchema } from '../dto/create-course.dto';

const coursesRouters = new Hono();
const coursesControllers = new CoursesControllers();

coursesRouters.post(
    '/',
    isAuthenticated(),
    zodVaildation(CreateCourseSchema),
    (c) => coursesControllers.createCourses(c)
);

export {
    coursesRouters
}
