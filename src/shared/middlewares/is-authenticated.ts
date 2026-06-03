import jwt from 'jsonwebtoken';
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { JwtUtils } from "#utils";

type AuthStrategy = "cookies" | "is_instructor";

interface AuthOptions {
  strategy?: AuthStrategy;
  exclude?: string[];
}

const jwtUtils = new JwtUtils();

export const isAuthenticated = (options: AuthOptions = {}) => {
  const { strategy = "cookies", exclude = [], } = options;

  return createMiddleware(async (c, next) => {
    if (exclude.includes(c.req.path)) return next();

    const accesstoken = getCookie(c, "access_token");
    if (strategy === "cookies") {
      if (!accesstoken) return c.json({
        success: false,
        message: "Unauthenticated"
      }, 401);

    // verify the token and get the payload
    let payload;
      try {
        payload = jwtUtils.verifyJwtToken(accesstoken) as { userId: string, email: string };
      } catch (error) {
        if(error instanceof jwt.JsonWebTokenError) return c.json({
          success: false,
          message: "Invalid token"
        }, 400);
        if(error instanceof jwt.TokenExpiredError) return c.json({
          success: false,
          message: "Expired token"
        }, 400);
      }

      // Store payload on context so downstream handlers can access it
      c.set("jwtPayload", payload);
      return next();
    }

    throw new Error(`[isAuthenticated] Unknown strategy: "${strategy}"`);
  });
};
