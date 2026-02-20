import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"
import * as schema from "./schema"
import { getEnv } from "@/lib/utils/get-env"

config({ path: ".env.local" })

export const sql = neon(getEnv("DATABASE_URL"))
export const db = drizzle({ client: sql, schema })
