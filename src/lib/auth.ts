import "server-only";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import { schema } from "./schema";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const secret = process.env.BETTER_AUTH_SECRET;

export const isAuthConfigured = Boolean(db && secret);

export const auth = db && secret
  ? betterAuth({
      baseURL,
      secret,
      database: drizzleAdapter(db, { provider: "pg", schema }),
      emailAndPassword: { enabled: true },
      plugins: [nextCookies()],
    })
  : null;

export const authSetupMessage =
  "Anmeldung ist noch nicht eingerichtet. Setze DATABASE_URL und BETTER_AUTH_SECRET und führe anschließend die Datenbankmigration aus.";
