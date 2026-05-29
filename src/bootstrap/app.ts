import { Hono } from 'hono'
import { logger } from 'hono/logger'
import authRoutes from '#auth';

const app = new Hono()

// middlewares
app.use('*', logger())

// router
app.route("/api/auth", authRoutes)

app.get("/", (c) => {
    return c.json({
        ok: true,
        message: "App is running!"
    });
});

export default app
