import { z } from "../../schema";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@repo/database";
import * as schema from "@repo/database/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

export const formsRouter = router({
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/"), tags: TAGS, summary: "List creator forms" } })
    .input(z.undefined())
    .output(z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      slug: z.string(),
      status: z.enum(["draft", "published"]),
      visibility: z.enum(["public", "unlisted"]),
      isTemplate: z.boolean().nullable(),
      createdAt: z.date().nullable(),
      updatedAt: z.date().nullable(),
      responseCount: z.number(),
      theme: z.object({ id: z.string(), name: z.string(), slug: z.string(), primaryColor: z.string(), backgroundColor: z.string() }).nullable(),
    })))
    .query(async ({ ctx }) => {
      const forms = await db
        .select({
          id: schema.formsTable.id,
          title: schema.formsTable.title,
          description: schema.formsTable.description,
          slug: schema.formsTable.slug,
          status: schema.formsTable.status,
          visibility: schema.formsTable.visibility,
          isTemplate: schema.formsTable.isTemplate,
          createdAt: schema.formsTable.createdAt,
          updatedAt: schema.formsTable.updatedAt,
          theme: {
            id: schema.themesTable.id,
            name: schema.themesTable.name,
            slug: schema.themesTable.slug,
            primaryColor: schema.themesTable.primaryColor,
            backgroundColor: schema.themesTable.backgroundColor,
          },
        })
        .from(schema.formsTable)
        .leftJoin(schema.themesTable, eq(schema.formsTable.themeId, schema.themesTable.id))
        .where(eq(schema.formsTable.userId, ctx.user.id))
        .orderBy(desc(schema.formsTable.createdAt));

      // Get response counts
      const responseCounts = await db
        .select({ formId: schema.responsesTable.formId, count: count() })
        .from(schema.responsesTable)
        .groupBy(schema.responsesTable.formId);

      const countMap = new Map(responseCounts.map((r) => [r.formId, r.count]));

      return forms.map((f) => ({
        ...f,
        theme: f.theme?.id ? f.theme : null,
        responseCount: countMap.get(f.id) ?? 0,
      }));
    }),

  getById: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/{id}"), tags: TAGS, summary: "Get form by ID (creator)" } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      slug: z.string(),
      status: z.enum(["draft", "published"]),
      visibility: z.enum(["public", "unlisted"]),
      isTemplate: z.boolean().nullable(),
      submitMessage: z.string().nullable(),
      redirectUrl: z.string().nullable(),
      themeId: z.string().nullable(),
      createdAt: z.date().nullable(),
      updatedAt: z.date().nullable(),
      fields: z.array(z.object({
        id: z.string(),
        type: z.string(),
        label: z.string(),
        placeholder: z.string().nullable(),
        helpText: z.string().nullable(),
        required: z.boolean(),
        order: z.number(),
        options: z.any().nullable(),
        validations: z.any().nullable(),
        ratingConfig: z.any().nullable(),
      })),
    }))
    .query(async ({ ctx, input }) => {
      const [form] = await db
        .select()
        .from(schema.formsTable)
        .where(and(eq(schema.formsTable.id, input.id), eq(schema.formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });

      const fields = await db
        .select()
        .from(schema.fieldsTable)
        .where(eq(schema.fieldsTable.formId, form.id))
        .orderBy(schema.fieldsTable.order);

      return { ...form, fields };
    }),

  getBySlug: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/slug/{slug}"), tags: TAGS, summary: "Get published form by slug (public)" } })
    .input(z.object({ slug: z.string() }))
    .output(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      slug: z.string(),
      status: z.enum(["draft", "published"]),
      visibility: z.enum(["public", "unlisted"]),
      submitMessage: z.string().nullable(),
      themeId: z.string().nullable(),
      fields: z.array(z.object({
        id: z.string(),
        type: z.string(),
        label: z.string(),
        placeholder: z.string().nullable(),
        helpText: z.string().nullable(),
        required: z.boolean(),
        order: z.number(),
        options: z.any().nullable(),
        validations: z.any().nullable(),
        ratingConfig: z.any().nullable(),
      })),
      theme: z.object({
        name: z.string(),
        primaryColor: z.string(),
        backgroundColor: z.string(),
        textColor: z.string(),
        accentColor: z.string(),
        cardColor: z.string(),
        fontFamily: z.string(),
        borderRadius: z.string(),
        gradientConfig: z.any().nullable(),
      }).nullable(),
    }))
    .query(async ({ input }) => {
      const [form] = await db
        .select({
          form: schema.formsTable,
          theme: schema.themesTable,
        })
        .from(schema.formsTable)
        .leftJoin(schema.themesTable, eq(schema.formsTable.themeId, schema.themesTable.id))
        .where(eq(schema.formsTable.slug, input.slug))
        .limit(1);

      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      if (form.form.status !== "published") {
        throw new TRPCError({ code: "NOT_FOUND", message: "This form is not published" });
      }

      const fields = await db
        .select()
        .from(schema.fieldsTable)
        .where(eq(schema.fieldsTable.formId, form.form.id))
        .orderBy(schema.fieldsTable.order);

      return {
        ...form.form,
        fields,
        theme: form.theme
          ? {
              name: form.theme.name,
              primaryColor: form.theme.primaryColor,
              backgroundColor: form.theme.backgroundColor,
              textColor: form.theme.textColor,
              accentColor: form.theme.accentColor,
              cardColor: form.theme.cardColor,
              fontFamily: form.theme.fontFamily,
              borderRadius: form.theme.borderRadius,
              gradientConfig: form.theme.gradientConfig,
            }
          : null,
      };
    }),

  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/"), tags: TAGS, summary: "Create a new form" } })
    .input(z.object({
      title: z.string().min(1).max(255).default("Untitled Form"),
      description: z.string().max(1000).optional(),
      themeId: z.string().uuid().optional(),
    }))
    .output(z.object({ id: z.string(), slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const slug = generateSlug(input.title);
      const [form] = await db
        .insert(schema.formsTable)
        .values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          slug,
          themeId: input.themeId,
          status: "draft",
          visibility: "public",
        })
        .returning({ id: schema.formsTable.id, slug: schema.formsTable.slug });

      return form;
    }),

  update: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("/{id}"), tags: TAGS, summary: "Update form metadata and settings" } })
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().max(1000).nullable().optional(),
      themeId: z.string().uuid().nullable().optional(),
      submitMessage: z.string().max(500).optional(),
      redirectUrl: z.string().url().nullable().optional(),
      visibility: z.enum(["public", "unlisted"]).optional(),
      isTemplate: z.boolean().optional(),
    }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const result = await db
        .update(schema.formsTable)
        .set(updates)
        .where(and(eq(schema.formsTable.id, id), eq(schema.formsTable.userId, ctx.user.id)));

      return { success: true };
    }),

  publish: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/publish"), tags: TAGS, summary: "Publish a form" } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean(), slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [form] = await db
        .update(schema.formsTable)
        .set({ status: "published" })
        .where(and(eq(schema.formsTable.id, input.id), eq(schema.formsTable.userId, ctx.user.id)))
        .returning({ slug: schema.formsTable.slug });

      if (!form) throw new TRPCError({ code: "NOT_FOUND" });
      return { success: true, slug: form.slug };
    }),

  unpublish: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/unpublish"), tags: TAGS, summary: "Unpublish a form" } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(schema.formsTable)
        .set({ status: "draft" })
        .where(and(eq(schema.formsTable.id, input.id), eq(schema.formsTable.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/{id}"), tags: TAGS, summary: "Delete a form" } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(schema.formsTable)
        .where(and(eq(schema.formsTable.id, input.id), eq(schema.formsTable.userId, ctx.user.id)));
      return { success: true };
    }),

  duplicate: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/duplicate"), tags: TAGS, summary: "Duplicate a form" } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ id: z.string(), slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [original] = await db
        .select()
        .from(schema.formsTable)
        .where(and(eq(schema.formsTable.id, input.id), eq(schema.formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!original) throw new TRPCError({ code: "NOT_FOUND" });

      const newSlug = generateSlug(original.title + " copy");
      const [newForm] = await db
        .insert(schema.formsTable)
        .values({
          userId: ctx.user.id,
          title: original.title + " (Copy)",
          description: original.description,
          themeId: original.themeId,
          slug: newSlug,
          status: "draft",
          visibility: original.visibility,
          submitMessage: original.submitMessage,
          isTemplate: false,
        })
        .returning({ id: schema.formsTable.id, slug: schema.formsTable.slug });

      // Duplicate fields
      const fields = await db
        .select()
        .from(schema.fieldsTable)
        .where(eq(schema.fieldsTable.formId, original.id));

      if (fields.length > 0) {
        await db.insert(schema.fieldsTable).values(
          fields.map(({ id, formId, createdAt, updatedAt, ...f }) => ({
            ...f,
            formId: newForm.id,
          }))
        );
      }

      return newForm;
    }),
});
