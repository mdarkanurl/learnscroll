import { zValidator } from '@hono/zod-validator'
import type z from 'zod'

export function zodVaildation<T extends z.ZodTypeAny>(schema: T) {
    return zValidator('json', schema, (result, c) => {
        if (!result.success) {
            return c.json({
                message: 'Invalid input!',
                errors: result.error.issues,
            }, 400)
        }
    })
}
