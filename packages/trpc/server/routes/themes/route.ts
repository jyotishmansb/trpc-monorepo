import { z } from "../../schema";
import { publicProcedure, router } from "../../trpc";
import { db } from "@repo/database";
import * as schema from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { generatePath } from "../../utils/path-generator";
import { TRPCError } from "@trpc/server";

const TAGS = ["Themes"];
const getPath = generatePath("/themes");

const themeSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  primaryColor: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  accentColor: z.string(),
  cardColor: z.string(),
  fontFamily: z.string(),
  fontSize: z.string(),
  borderRadius: z.string(),
  coverImage: z.string().nullable(),
  gradientConfig: z.any().nullable(),
  isBuiltIn: z.boolean().nullable(),
});

export const themesRouter = router({
  list: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/"), tags: TAGS, summary: "List all available themes" } })
    .input(z.undefined())
    .output(z.array(themeSchema))
    .query(async () => {
      return await db.select().from(schema.themesTable);
    }),

  getBySlug: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/{slug}"), tags: TAGS, summary: "Get a theme by slug" } })
    .input(z.object({ slug: z.string() }))
    .output(themeSchema)
    .query(async ({ input }) => {
      const [theme] = await db
        .select()
        .from(schema.themesTable)
        .where(eq(schema.themesTable.slug, input.slug))
        .limit(1);
      if (!theme) throw new TRPCError({ code: "NOT_FOUND" });
      return theme;
    }),
});
