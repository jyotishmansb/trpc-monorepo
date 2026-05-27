import { z } from "../../schema";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@repo/database";
import * as schema from "@repo/database/schema";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Authentication"];
const getPath = generatePath("/auth");

// Password helpers using Node crypto (no bcrypt dep needed)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const attempt = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(attempt, "hex"));
}

function generateToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export const authRouter = router({
  register: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/register"),
        tags: TAGS,
        summary: "Register a new creator account",
        description: "Creates a new user with email/password authentication",
      },
    })
    .input(
      z.object({
        fullName: z.string().min(2).max(80),
        email: z.string().email(),
        password: z.string().min(8).max(128),
      })
    )
    .output(
      z.object({
        token: z.string(),
        user: z.object({
          id: z.string(),
          fullName: z.string(),
          email: z.string(),
          profileImageUrl: z.string().nullable(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const [existing] = await db
        .select()
        .from(schema.usersTable)
        .where(eq(schema.usersTable.email, input.email))
        .limit(1);

      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
      }

      const [user] = await db
        .insert(schema.usersTable)
        .values({
          fullName: input.fullName,
          email: input.email,
          emailVerified: false,
          profileImageUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(input.email)}`,
        })
        .returning();

      await db.insert(schema.passwordsTable).values({
        userId: user.id,
        hash: hashPassword(input.password),
      });

      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await db.insert(schema.sessionsTable).values({
        userId: user.id,
        token,
        expiresAt,
      });

      return {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
        },
      };
    }),

  login: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/login"),
        tags: TAGS,
        summary: "Login with email and password",
      },
    })
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .output(
      z.object({
        token: z.string(),
        user: z.object({
          id: z.string(),
          fullName: z.string(),
          email: z.string(),
          profileImageUrl: z.string().nullable(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const [userRecord] = await db
        .select({ user: schema.usersTable, password: schema.passwordsTable })
        .from(schema.usersTable)
        .leftJoin(schema.passwordsTable, eq(schema.passwordsTable.userId, schema.usersTable.id))
        .where(eq(schema.usersTable.email, input.email))
        .limit(1);

      if (!userRecord || !userRecord.password) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const valid = verifyPassword(input.password, userRecord.password.hash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await db.insert(schema.sessionsTable).values({
        userId: userRecord.user.id,
        token,
        expiresAt,
      });

      return {
        token,
        user: {
          id: userRecord.user.id,
          fullName: userRecord.user.fullName,
          email: userRecord.user.email,
          profileImageUrl: userRecord.user.profileImageUrl,
        },
      };
    }),

  logout: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/logout"),
        tags: TAGS,
        summary: "Invalidate current session token",
      },
    })
    .input(z.object({ token: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      await db
        .delete(schema.sessionsTable)
        .where(eq(schema.sessionsTable.token, input.token));
      return { success: true };
    }),

  me: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/me"),
        tags: TAGS,
        summary: "Get current authenticated user",
      },
    })
    .input(z.undefined())
    .output(
      z.object({
        id: z.string(),
        fullName: z.string(),
        email: z.string(),
        emailVerified: z.boolean().nullable(),
        profileImageUrl: z.string().nullable(),
        createdAt: z.date().nullable(),
      })
    )
    .query(({ ctx }) => {
      return {
        id: ctx.user.id,
        fullName: ctx.user.fullName,
        email: ctx.user.email,
        emailVerified: ctx.user.emailVerified,
        profileImageUrl: ctx.user.profileImageUrl,
        createdAt: ctx.user.createdAt,
      };
    }),
});
