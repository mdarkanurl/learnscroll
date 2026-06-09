import { Hono } from 'hono';
import { isAuthenticated } from "#middlewares";
import zodVaildation from '#validation';
import { CreateLectureSchema } from '../dto/create-lecture.dto';
import { UpdateLectureSchema } from '../dto/update-lecture.dto';
import { LecturesControllers } from '../controllers/lectures.controllers';

const lecturesRouters = new Hono();
const lecturesControllers = new LecturesControllers();

lecturesRouters.post(
    '/',
    isAuthenticated(),
    zodVaildation(CreateLectureSchema),
    (c) => lecturesControllers.createLecture(c)
);

lecturesRouters.put(
    '/:lectureId',
    isAuthenticated(),
    zodVaildation(UpdateLectureSchema),
    (c) => lecturesControllers.updateLecture(c)
);

export {
    lecturesRouters
}
