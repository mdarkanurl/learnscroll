import { Hono } from "hono";
import { adminCoursesRouters, usersCoursesRouters } from "./routers"

const coursesRouters = new Hono();

// router
coursesRouters.route("/admin", adminCoursesRouters);
coursesRouters.route("/users", usersCoursesRouters);

export default coursesRouters;