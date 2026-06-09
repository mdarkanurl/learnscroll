import { Hono } from 'hono';
import { isAuthenticated } from "#middlewares";
import zodVaildation from '#validation';
import { CreateLectureSchema } from '../../dto/create-lecture.dto';
import { UpdateLectureSchema } from '../../dto/update-lecture.dto';
import { AdminLecturesControllers } from '../../controllers';

const adminLecturesRouters = new Hono();
const adminLecturesControllers = new AdminLecturesControllers();

adminLecturesRouters.post(
    '/',
    isAuthenticated(),
    zodVaildation(CreateLectureSchema),
    (c) => adminLecturesControllers.createLecture(c)
);

adminLecturesRouters.put(
    '/:lectureId',
    isAuthenticated(),
    zodVaildation(UpdateLectureSchema),
    (c) => adminLecturesControllers.updateLecture(c)
);

adminLecturesRouters.delete(
    '/:lectureId',
    isAuthenticated(),
    (c) => adminLecturesControllers.deleteLecture(c)
);

export default adminLecturesRouters;
