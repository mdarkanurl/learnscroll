import { Hono } from 'hono';

const authRouters = new Hono();

authRouters.post('/signup', (c) => {
    return c.json({
        success: true,
        message: "I'm from signup endpoint!"
    });
});

export {
    authRouters
}
