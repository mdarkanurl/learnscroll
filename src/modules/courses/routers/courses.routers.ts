import { CoursesControllers } from './../controllers/courses.controllers';
import { Hono } from 'hono';
import { isAuthenticated } from "#middlewares";
import zodVaildation from '#validation';
import { CreateCourseSchema } from '../dto/create-course.dto';
import { UpdateCourseSchema } from '../dto/update-course.dto';
import { UpdateEnrollmentPrivacySchema } from '../dto/update-enrollment-privacy.dto';
import { sectionsRouters } from './sections.routers';

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

coursesRouters.put(
    '/:id/unpublish',
    isAuthenticated(),
    (c) => coursesControllers.archiveCourse(c)
);

coursesRouters.put(
    '/:id/enrollment-privacy',
    isAuthenticated(),
    zodVaildation(UpdateEnrollmentPrivacySchema),
    (c) => coursesControllers.updateEnrollmentPrivacy(c)
);

coursesRouters.route("/sections/:courseId", sectionsRouters);

export {
    coursesRouters
}
