import { CoursesControllers } from './../controllers/courses.controllers';
import { Hono } from 'hono';
import { isAuthenticated } from "#middlewares";
import zodVaildation from '#validation';
import { CreateCourseSchema } from '../dto/create-course.dto';
import { UpdateCourseSchema } from '../dto/update-course.dto';
import { UpdateEnrollmentPrivacySchema } from '../dto/update-enrollment-privacy.dto';
import { CreateSectionSchema } from '../dto/create-section.dto';
import { UpdateSectionSchema } from '../dto/update-section.dto';

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

coursesRouters.post(
    '/:id/sections',
    isAuthenticated(),
    zodVaildation(CreateSectionSchema),
    (c) => coursesControllers.createSection(c)
);

coursesRouters.put(
    '/:id/sections/:sectionId',
    isAuthenticated(),
    zodVaildation(UpdateSectionSchema),
    (c) => coursesControllers.updateSection(c)
);

coursesRouters.delete(
    '/:id/sections/:sectionId',
    isAuthenticated(),
    (c) => coursesControllers.deleteSection(c)
);

export {
    coursesRouters
}
