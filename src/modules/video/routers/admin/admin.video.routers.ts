import { Hono } from "hono";
import { AdminVideoControllers } from "../../controllers";
import { isAuthenticated } from "#middlewares";

const adminVideoRouters = new Hono();
const adminVideoControllers = new AdminVideoControllers();

adminVideoRouters.get(
    "/signature",
    isAuthenticated(),
    (c) => adminVideoControllers.generateSignature(c));

export {
    adminVideoRouters
};
