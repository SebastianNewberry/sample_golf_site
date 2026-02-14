import "server-only";

// for seeding the database

// import { drizzle } from "drizzle-orm/neon-http";
// import { neon } from "@neondatabase/serverless";
// import * as schema from "./schema";

// const sql = neon(process.env.DATABASE_URL! || ""); // add database url manually if using db-seed script

// export const db = drizzle(sql, { schema });

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// This caches the connection in serverless environments to improve performance


const sql = neon(process.env.DATABASE_URL!);

// Passing { schema } ensures db.select() and db.query are fully typed
export const db = drizzle(sql, { schema });
