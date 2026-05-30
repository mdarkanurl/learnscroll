import { RedisClient } from "bun";
import { env } from "#configs";
export const redis = new RedisClient(env.redisUrl);
