import { InstructorsControllers } from './../controllers/instructors.controllers';
import { Hono } from 'hono';
import { isAuthenticated } from "#middlewares";

const instructorsRouters = new Hono();
const instructorsControllers = new InstructorsControllers();

instructorsRouters.post(
    '/signup',
    isAuthenticated(),
    (c) => instructorsControllers.create(c)
);

export {
    instructorsRouters
}
