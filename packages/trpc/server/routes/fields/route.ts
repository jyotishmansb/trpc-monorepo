import { z } from "../../schema";
import { protectedProcedure, router } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@repo/database";
import * as schema from "@repo/database/schema";
import { eq, and, inArray } from "drizzle-orm";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Fields"];
const getPath = generatePath("/fields");

const fieldInputSchema = z.object({
  id: z.string().uuid().optional(), // Optional — new fields won't have one
  type: z.enum(["text","textarea","email","number","phone","url","select","multiselect","checkbox","radio","rating","date","time","file","statement"]),
  label: z.string().min(1).max(500),
  placeholder: z.string().max(255).optional().nullable(),
  helpText: z.string().optional().nullable(),
  required: z.boolean().default(false),
  order: z.number().int().min(0),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional().nullable(),
  validations: z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    patternMessage: z.string().optional(),
  }).optional().nullable(),
  ratingConfig: z.object({
    maxRating: z.number().min(1).max(10),
    icon: z.enum(["star", "heart", "thumb"]),
  }).optional().nullable(),
});

export const fieldsRouter = router({
  upsertFields: protectedProcedure
    .meta({
      openapi: {
        method: "PUT",
        path: getPath("/form/{formId}"),
        tags: TAGS,
        summary: "Bulk upsert fields for a form (replaces all fields)",
      },
    })
    .input(
      z.object({
        formId: z.string().uuid(),
        fields: z.array(fieldInputSchema),
      })
    )
    .output(z.object({ success: z.boolean(), count: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Verify form ownership
      const [form] = await db
        .select({ id: schema.formsTable.id })
        .from(schema.formsTable)
        .where(and(eq(schema.formsTable.id, input.formId), eq(schema.formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });

      // Delete all existing fields and re-insert (simple replace strategy)
      await db.delete(schema.fieldsTable).where(eq(schema.fieldsTable.formId, input.formId));

      if (input.fields.length > 0) {
        await db.insert(schema.fieldsTable).values(
          input.fields.map(({ id: _id, ...field }) => ({
            ...field,
            formId: input.formId,
          }))
        );
      }

      return { success: true, count: input.fields.length };
    }),

  deleteField: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/{fieldId}"),
        tags: TAGS,
        summary: "Delete a single field",
      },
    })
    .input(z.object({ fieldId: z.string().uuid(), formId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Verify form ownership
      const [form] = await db
        .select({ id: schema.formsTable.id })
        .from(schema.formsTable)
        .where(and(eq(schema.formsTable.id, input.formId), eq(schema.formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!form) throw new TRPCError({ code: "NOT_FOUND" });

      await db
        .delete(schema.fieldsTable)
        .where(and(eq(schema.fieldsTable.id, input.fieldId), eq(schema.fieldsTable.formId, input.formId)));

      return { success: true };
    }),
});
