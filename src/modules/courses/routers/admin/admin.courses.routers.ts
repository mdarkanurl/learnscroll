import { AdminCoursesControllers } from '../../controllers';
import { Hono } from 'hono';
import { isAuthenticated } from "#middlewares";
import zodVaildation from '#validation';
import { CreateCourseSchema } from '../../dto/create-course.dto';
import { UpdateCourseSchema } from '../../dto/update-course.dto';
import { UpdateEnrollmentPrivacySchema } from '../../dto/update-enrollment-privacy.dto';
import adminSectionsRouters from './admin.sections.routers';

const adminCoursesRouters = new Hono();
const adminCoursesControllers = new AdminCoursesControllers();

adminCoursesRouters.get(
    '/',
    isAuthenticated(),
    (c) => adminCoursesControllers.getAllCourses(c)
);

adminCoursesRouters.post(
    '/',
    isAuthenticated(),
    zodVaildation(CreateCourseSchema),
    (c) => adminCoursesControllers.createCourses(c)
);

adminCoursesRouters.put(
    '/:id',
    isAuthenticated(),
    zodVaildation(UpdateCourseSchema),
    (c) => adminCoursesControllers.updateCourses(c)
);

adminCoursesRouters.put(
    '/:id/unpublish',
    isAuthenticated(),
    (c) => adminCoursesControllers.archiveCourse(c)
);

adminCoursesRouters.put(
    '/:id/enrollment-privacy',
    isAuthenticated(),
    zodVaildation(UpdateEnrollmentPrivacySchema),
    (c) => adminCoursesControllers.updateEnrollmentPrivacy(c)
);

adminCoursesRouters.route("/sections/:courseId", adminSectionsRouters);

export default adminCoursesRouters;
