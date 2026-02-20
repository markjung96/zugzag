import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { getEnv } from "@/lib/utils/get-env"

const hasRedisConfig =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN

const redis = hasRedisConfig
  ? new Redis({
      url: getEnv("KV_REST_API_URL"),
      token: getEnv("KV_REST_API_TOKEN"),
    })
  : null

export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "ratelimit:auth",
    })
  : null

export const mutationRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      prefix: "ratelimit:mutation",
    })
  : null
