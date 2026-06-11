import { Hono } from 'hono'
import { logger } from 'hono/logger'
import authRoutes from '#auth';
import usersRouters from '#users';
import instructorsRoutes from '#instructors';
import coursesRoutes from '#courses';
import videoRouters from '#video';

const app = new Hono()

// middlewares
app.use('*', logger())

// router
app.route("/api/auth", authRoutes)
app.route("/api/users", usersRouters)
app.route("/api/instructors", instructorsRoutes)
app.route("/api/courses", coursesRoutes)
app.route("/api/video", videoRouters);

app.get("/", (c) => {
    return c.json({
        ok: true,
        message: "App is running!"
    });
});

export default app
