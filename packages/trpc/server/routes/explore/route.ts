import { z } from "../../schema";
import { publicProcedure, router } from "../../trpc";
import { db } from "@repo/database";
import * as schema from "@repo/database/schema";
import { eq, and, desc, count, inArray } from "drizzle-orm";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Explore"];
const getPath = generatePath("/explore");

export const exploreRouter = router({
  listPublicForms: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/forms"),
        tags: TAGS,
        summary: "List public published forms for the explore page",
      },
    })
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(12),
        search: z.string().optional(),
      })
    )
    .output(
      z.object({
        forms: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            description: z.string().nullable(),
            slug: z.string(),
            responseCount: z.number(),
            theme: z.object({
              name: z.string(),
              slug: z.string(),
              primaryColor: z.string(),
              backgroundColor: z.string(),
              textColor: z.string(),
              category: z.string(),
            }).nullable(),
            creator: z.object({
              fullName: z.string(),
              profileImageUrl: z.string().nullable(),
            }),
          })
        ),
        total: z.number(),
        page: z.number(),
        totalPages: z.number(),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;

      const baseWhere = and(
        eq(schema.formsTable.status, "published"),
        eq(schema.formsTable.visibility, "public")
      );

      const formsQuery = db
        .select({
          id: schema.formsTable.id,
          title: schema.formsTable.title,
          description: schema.formsTable.description,
          slug: schema.formsTable.slug,
          theme: {
            name: schema.themesTable.name,
            slug: schema.themesTable.slug,
            primaryColor: schema.themesTable.primaryColor,
            backgroundColor: schema.themesTable.backgroundColor,
            textColor: schema.themesTable.textColor,
            category: schema.themesTable.category,
          },
          creator: {
            fullName: schema.usersTable.fullName,
            profileImageUrl: schema.usersTable.profileImageUrl,
          },
        })
        .from(schema.formsTable)
        .leftJoin(schema.themesTable, eq(schema.formsTable.themeId, schema.themesTable.id))
        .innerJoin(schema.usersTable, eq(schema.formsTable.userId, schema.usersTable.id))
        .where(baseWhere)
        .orderBy(desc(schema.formsTable.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [forms, [{ total }]] = await Promise.all([
        formsQuery,
        db
          .select({ total: count() })
          .from(schema.formsTable)
          .where(baseWhere),
      ]);

      // Get response counts for these forms
      const formIds = forms.map((f) => f.id);
      const responseCounts =
        formIds.length > 0
          ? await db
              .select({ formId: schema.responsesTable.formId, count: count() })
              .from(schema.responsesTable)
              .where(
                formIds.length === 1
                  ? eq(schema.responsesTable.formId, formIds[0]!)
                  : inArray(schema.responsesTable.formId, formIds)
              )
              .groupBy(schema.responsesTable.formId)
          : [];

      const countMap = new Map(responseCounts.map((r) => [r.formId, r.count]));
      const totalPages = Math.ceil(total / input.limit);

      return {
        forms: forms.map((f) => ({
          ...f,
          theme: f.theme?.name ? f.theme : null,
          responseCount: countMap.get(f.id) ?? 0,
        })),
        total,
        page: input.page,
        totalPages,
      };
    }),

  listTemplates: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/templates"),
        tags: TAGS,
        summary: "List public forms marked as templates",
      },
    })
    .input(z.undefined())
    .output(
      z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().nullable(),
          slug: z.string(),
          fieldCount: z.number(),
          theme: z.object({
            name: z.string(),
            slug: z.string(),
            primaryColor: z.string(),
            backgroundColor: z.string(),
            textColor: z.string(),
            category: z.string(),
          }).nullable(),
        })
      )
    )
    .query(async () => {
      const templates = await db
        .select({
          id: schema.formsTable.id,
          title: schema.formsTable.title,
          description: schema.formsTable.description,
          slug: schema.formsTable.slug,
          theme: {
            name: schema.themesTable.name,
            slug: schema.themesTable.slug,
            primaryColor: schema.themesTable.primaryColor,
            backgroundColor: schema.themesTable.backgroundColor,
            textColor: schema.themesTable.textColor,
            category: schema.themesTable.category,
          },
        })
        .from(schema.formsTable)
        .leftJoin(schema.themesTable, eq(schema.formsTable.themeId, schema.themesTable.id))
        .where(
          and(
            eq(schema.formsTable.isTemplate, true),
            eq(schema.formsTable.status, "published"),
            eq(schema.formsTable.visibility, "public")
          )
        )
        .orderBy(desc(schema.formsTable.createdAt));

      // Get field counts
      const formIds = templates.map((t) => t.id);
      const fieldCounts =
        formIds.length > 0
          ? await db
              .select({ formId: schema.fieldsTable.formId, count: count() })
              .from(schema.fieldsTable)
              .where(
                formIds.length === 1
                  ? eq(schema.fieldsTable.formId, formIds[0]!)
                  : inArray(schema.fieldsTable.formId, formIds)
              )
              .groupBy(schema.fieldsTable.formId)
          : [];

      const countMap = new Map(fieldCounts.map((f) => [f.formId, f.count]));

      return templates.map((t) => ({
        ...t,
        theme: t.theme?.name ? t.theme : null,
        fieldCount: countMap.get(t.id) ?? 0,
      }));
    }),
});
