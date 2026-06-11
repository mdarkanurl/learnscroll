import { Hono } from "hono";
import { adminVideoRouters } from "./routers"

const videoRouters = new Hono();

// router
videoRouters.route("/admin", adminVideoRouters);

export default videoRouters;
