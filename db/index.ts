import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const globalForDb = globalThis as unknown as { surveyDb?: ReturnType<typeof drizzle> }

export function getDb() {
  if (!process.env.DATABASE_URL) return null
  if (!globalForDb.surveyDb) {
    const client = postgres(process.env.DATABASE_URL, { prepare: false })
    globalForDb.surveyDb = drizzle(client, { schema })
  }
  return globalForDb.surveyDb
}
