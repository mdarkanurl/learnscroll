import { CoursesControllers } from './../controllers/courses.controllers';
import { Hono } from 'hono';
import { isAuthenticated } from "#middlewares";
import zodVaildation from '#validation';
import { CreateCourseSchema } from '../dto/create-course.dto';
import { UpdateCourseSchema } from '../dto/update-course.dto';

const coursesRouters = new Hono();
const coursesControllers = new CoursesControllers();

coursesRouters.post(
    '/',
    isAuthenticated(),
    zodVaildation(CreateCourseSchema),
    (c) => coursesControllers.createCourses(c)
);

coursesRouters.put(
    '/:id',
    isAuthenticated(),
    zodVaildation(UpdateCourseSchema),
    (c) => coursesControllers.updateCourses(c)
);

export {
    coursesRouters
}
