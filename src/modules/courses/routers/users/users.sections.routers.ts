import { Hono } from 'hono';
import { UsersSectionsControllers } from '../../controllers';
import usersLecturesRouters from './users.lectures.routers';

const usersSectionsRouters = new Hono();
const usersSectionsControllers = new UsersSectionsControllers();

usersSectionsRouters.route("/lectures/:courseId/:sectionId", usersLecturesRouters);

export default usersSectionsRouters;