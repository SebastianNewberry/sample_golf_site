import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL! || ""); // add database url manually if using db-seed script

export const db = drizzle(sql, { schema });
