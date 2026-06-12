import { Hono } from "hono";
import { AdminVideoControllers } from "../../controllers";
import { isAuthenticated } from "#middlewares";
import zodVaildation from "#validation";
import { generateSignature } from "../../dto/admin/admin.generate-signature.dto";

const adminVideoRouters = new Hono();
const adminVideoControllers = new AdminVideoControllers();

adminVideoRouters.get(
    "/signature",
    zodVaildation(generateSignature),
    isAuthenticated(),
    (c) => adminVideoControllers.generateSignature(c)
);

export {
    adminVideoRouters
};
