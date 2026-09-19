import "server-only";
import { drizzle } from "drizzle-orm/neon-http";
import { schema } from "./schema";

const databaseUrl = process.env.DATABASE_URL;

export const isDatabaseConfigured = Boolean(databaseUrl);

export const db = databaseUrl
  ? drizzle(databaseUrl, { schema })
  : undefined;
