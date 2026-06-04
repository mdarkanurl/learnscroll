import { Hono } from 'hono'
import { logger } from 'hono/logger'
import authRoutes from '#auth';
import usersRouters from '#users';

const app = new Hono()

// middlewares
app.use('*', logger())

// router
app.route("/api/auth", authRoutes)
app.route("/api/users", usersRouters)

app.get("/", (c) => {
    return c.json({
        ok: true,
        message: "App is running!"
    });
});

export default app
