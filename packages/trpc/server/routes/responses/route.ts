import { z } from "../../schema";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@repo/database";
import * as schema from "@repo/database/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Responses"];
const getPath = generatePath("/responses");

// In-memory rate limiter: { ip -> [timestamp, ...] }
const rateStore = new Map<string, number[]>();
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT = 10; // 10 submissions per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateStore.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT) return false;
  timestamps.push(now);
  rateStore.set(ip, timestamps);
  return true;
}

export const responsesRouter = router({
  submit: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/submit/{formSlug}"),
        tags: TAGS,
        summary: "Submit a public form response",
        description: "Rate limited to 10 submissions per IP per 10 minutes",
      },
    })
    .input(
      z.object({
        formSlug: z.string(),
        answers: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])),
        respondentEmail: z.string().email().optional(),
        respondentName: z.string().optional(),
        completionTimeSeconds: z.number().int().optional(),
      })
    )
    .output(z.object({ success: z.boolean(), responseId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const ip = ctx.req?.ip ?? ctx.req?.socket?.remoteAddress ?? "unknown";

      if (!checkRateLimit(ip)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many submissions. Please wait a few minutes.",
        });
      }

      // Fetch form
      const [form] = await db
        .select()
        .from(schema.formsTable)
        .where(eq(schema.formsTable.slug, input.formSlug))
        .limit(1);

      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      if (form.status !== "published") {
        throw new TRPCError({ code: "FORBIDDEN", message: "This form is not accepting responses" });
      }

      // Fetch fields and validate required fields
      const fields = await db
        .select()
        .from(schema.fieldsTable)
        .where(eq(schema.fieldsTable.formId, form.id));

      for (const field of fields) {
        if (field.required && field.type !== "statement") {
          const answer = input.answers[field.label];
          if (answer === undefined || answer === null || answer === "") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Field "${field.label}" is required`,
            });
          }
        }
      }

      const [response] = await db
        .insert(schema.responsesTable)
        .values({
          formId: form.id,
          answers: input.answers,
          respondentEmail: input.respondentEmail,
          respondentName: input.respondentName,
          completionTimeSeconds: input.completionTimeSeconds,
          ipAddress: ip,
          userAgent: ctx.req?.headers["user-agent"],
        })
        .returning({ id: schema.responsesTable.id });

      return { success: true, responseId: response.id };
    }),

  list: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/form/{formId}"),
        tags: TAGS,
        summary: "List responses for a form (paginated)",
      },
    })
    .input(
      z.object({
        formId: z.string().uuid(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .output(
      z.object({
        responses: z.array(
          z.object({
            id: z.string(),
            respondentEmail: z.string().nullable(),
            respondentName: z.string().nullable(),
            answers: z.record(z.string(), z.any()),
            completionTimeSeconds: z.number().nullable(),
            submittedAt: z.date().nullable(),
          })
        ),
        total: z.number(),
        page: z.number(),
        totalPages: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify form ownership
      const [form] = await db
        .select({ id: schema.formsTable.id })
        .from(schema.formsTable)
        .where(and(eq(schema.formsTable.id, input.formId), eq(schema.formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!form) throw new TRPCError({ code: "NOT_FOUND" });

      const offset = (input.page - 1) * input.limit;

      const [responses, [{ total }]] = await Promise.all([
        db
          .select({
            id: schema.responsesTable.id,
            respondentEmail: schema.responsesTable.respondentEmail,
            respondentName: schema.responsesTable.respondentName,
            answers: schema.responsesTable.answers,
            completionTimeSeconds: schema.responsesTable.completionTimeSeconds,
            submittedAt: schema.responsesTable.submittedAt,
          })
          .from(schema.responsesTable)
          .where(eq(schema.responsesTable.formId, input.formId))
          .orderBy(desc(schema.responsesTable.submittedAt))
          .limit(input.limit)
          .offset(offset),
        db
          .select({ total: count() })
          .from(schema.responsesTable)
          .where(eq(schema.responsesTable.formId, input.formId)),
      ]);

      return {
        responses: responses.map((r) => ({
          ...r,
          answers: r.answers as Record<string, unknown>,
        })),
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  getById: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{responseId}"),
        tags: TAGS,
        summary: "Get a single response by ID",
      },
    })
    .input(z.object({ responseId: z.string().uuid(), formId: z.string().uuid() }))
    .output(z.object({
      id: z.string(),
      respondentEmail: z.string().nullable(),
      respondentName: z.string().nullable(),
      answers: z.record(z.string(), z.any()),
      completionTimeSeconds: z.number().nullable(),
      ipAddress: z.string().nullable(),
      submittedAt: z.date().nullable(),
    }))
    .query(async ({ ctx, input }) => {
      // Verify form ownership first
      const [form] = await db
        .select({ id: schema.formsTable.id })
        .from(schema.formsTable)
        .where(and(eq(schema.formsTable.id, input.formId), eq(schema.formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!form) throw new TRPCError({ code: "NOT_FOUND" });

      const [response] = await db
        .select()
        .from(schema.responsesTable)
        .where(and(eq(schema.responsesTable.id, input.responseId), eq(schema.responsesTable.formId, input.formId)))
        .limit(1);

      if (!response) throw new TRPCError({ code: "NOT_FOUND" });

      return { ...response, answers: response.answers as Record<string, unknown> };
    }),

  delete: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/{responseId}"),
        tags: TAGS,
        summary: "Delete a response",
      },
    })
    .input(z.object({ responseId: z.string().uuid(), formId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [form] = await db
        .select({ id: schema.formsTable.id })
        .from(schema.formsTable)
        .where(and(eq(schema.formsTable.id, input.formId), eq(schema.formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!form) throw new TRPCError({ code: "NOT_FOUND" });

      await db
        .delete(schema.responsesTable)
        .where(and(eq(schema.responsesTable.id, input.responseId), eq(schema.responsesTable.formId, input.formId)));

      return { success: true };
    }),
});
