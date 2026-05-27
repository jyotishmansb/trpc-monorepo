import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { db } from "@repo/database";
import * as schema from "@repo/database/schema";
import { eq, gt } from "drizzle-orm";

export async function createContext({ req }: CreateExpressContextOptions) {
  let user: schema.SelectUser | null = null;

  // Extract token from Authorization header or cookie (manual parse)
  const authHeader = req.headers.authorization;
  let token: string | null = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    const cookieHeader = req.headers.cookie ?? "";
    const cookieMatch = cookieHeader.match(/(?:^|;\s*)chaiToken=([^;]+)/);
    if (cookieMatch) token = decodeURIComponent(cookieMatch[1]!);
  }

  if (token) {
    try {
      const [session] = await db
        .select({
          session: schema.sessionsTable,
          user: schema.usersTable,
        })
        .from(schema.sessionsTable)
        .innerJoin(schema.usersTable, eq(schema.sessionsTable.userId, schema.usersTable.id))
        .where(
          eq(schema.sessionsTable.token, token)
        )
        .limit(1);

      if (session && session.session.expiresAt > new Date()) {
        user = session.user;
      }
    } catch {
      // Invalid token — user stays null
    }
  }

  return { user, req };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
