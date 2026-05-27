import { z } from "../../schema";
import { protectedProcedure, router } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@repo/database";
import * as schema from "@repo/database/schema";
import { eq, and, desc, count, avg, sql } from "drizzle-orm";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Analytics"];
const getPath = generatePath("/analytics");

export const analyticsRouter = router({
  getFormStats: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/form/{formId}"),
        tags: TAGS,
        summary: "Get analytics stats for a form",
      },
    })
    .input(z.object({ formId: z.string().uuid() }))
    .output(
      z.object({
        totalResponses: z.number(),
        avgCompletionSeconds: z.number().nullable(),
        responsesLast7Days: z.number(),
        responsesLast30Days: z.number(),
        dailyData: z.array(
          z.object({
            date: z.string(),
            count: z.number(),
          })
        ),
        fieldCount: z.number(),
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

      const now = new Date();
      const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        [{ total }],
        [{ avgSeconds }],
        [{ last7Count }],
        [{ last30Count }],
        [{ fieldCount }],
        allResponses,
      ] = await Promise.all([
        db.select({ total: count() }).from(schema.responsesTable).where(eq(schema.responsesTable.formId, input.formId)),
        db.select({ avgSeconds: avg(schema.responsesTable.completionTimeSeconds) }).from(schema.responsesTable).where(eq(schema.responsesTable.formId, input.formId)),
        db.select({ last7Count: count() }).from(schema.responsesTable).where(
          and(eq(schema.responsesTable.formId, input.formId), sql`${schema.responsesTable.submittedAt} >= ${last7}`)
        ),
        db.select({ last30Count: count() }).from(schema.responsesTable).where(
          and(eq(schema.responsesTable.formId, input.formId), sql`${schema.responsesTable.submittedAt} >= ${last30}`)
        ),
        db.select({ fieldCount: count() }).from(schema.fieldsTable).where(eq(schema.fieldsTable.formId, input.formId)),
        db.select({ submittedAt: schema.responsesTable.submittedAt })
          .from(schema.responsesTable)
          .where(and(eq(schema.responsesTable.formId, input.formId), sql`${schema.responsesTable.submittedAt} >= ${last30}`))
          .orderBy(schema.responsesTable.submittedAt),
      ]);

      // Build daily data for last 30 days
      const dailyMap = new Map<string, number>();
      for (let i = 0; i < 30; i++) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        dailyMap.set(d.toISOString().split("T")[0]!, 0);
      }
      for (const r of allResponses) {
        if (r.submittedAt) {
          const key = r.submittedAt.toISOString().split("T")[0]!;
          if (dailyMap.has(key)) {
            dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
          }
        }
      }

      const dailyData = Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalResponses: total,
        avgCompletionSeconds: avgSeconds !== null ? Number(avgSeconds) : null,
        responsesLast7Days: last7Count,
        responsesLast30Days: last30Count,
        dailyData,
        fieldCount,
      };
    }),

  getFieldStats: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/form/{formId}/fields"),
        tags: TAGS,
        summary: "Get per-field answer distribution analytics",
      },
    })
    .input(z.object({ formId: z.string().uuid() }))
    .output(
      z.array(
        z.object({
          fieldId: z.string(),
          fieldLabel: z.string(),
          fieldType: z.string(),
          answerDistribution: z.record(z.string(), z.number()),
          totalAnswers: z.number(),
          avgValue: z.number().nullable(),
        })
      )
    )
    .query(async ({ ctx, input }) => {
      const [form] = await db
        .select({ id: schema.formsTable.id })
        .from(schema.formsTable)
        .where(and(eq(schema.formsTable.id, input.formId), eq(schema.formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!form) throw new TRPCError({ code: "NOT_FOUND" });

      const fields = await db
        .select()
        .from(schema.fieldsTable)
        .where(eq(schema.fieldsTable.formId, input.formId))
        .orderBy(schema.fieldsTable.order);

      const responses = await db
        .select({ answers: schema.responsesTable.answers })
        .from(schema.responsesTable)
        .where(eq(schema.responsesTable.formId, input.formId));

      return fields.map((field) => {
        const distribution: Record<string, number> = {};
        let totalAnswers = 0;
        let numericSum = 0;
        let numericCount = 0;

        for (const r of responses) {
          const answers = r.answers as Record<string, unknown>;
          const answer = answers[field.label];
          if (answer === undefined || answer === null || answer === "") continue;

          totalAnswers++;
          const key = String(answer);
          distribution[key] = (distribution[key] ?? 0) + 1;

          if (field.type === "rating" || field.type === "number") {
            const num = Number(answer);
            if (!isNaN(num)) {
              numericSum += num;
              numericCount++;
            }
          }
        }

        return {
          fieldId: field.id,
          fieldLabel: field.label,
          fieldType: field.type,
          answerDistribution: distribution,
          totalAnswers,
          avgValue: numericCount > 0 ? numericSum / numericCount : null,
        };
      });
    }),
});
