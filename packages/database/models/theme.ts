import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const themesTable = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull().default("general"),

  // Colors
  primaryColor: varchar("primary_color", { length: 20 }).notNull().default("#6366f1"),
  backgroundColor: varchar("background_color", { length: 20 }).notNull().default("#ffffff"),
  textColor: varchar("text_color", { length: 20 }).notNull().default("#111827"),
  accentColor: varchar("accent_color", { length: 20 }).notNull().default("#8b5cf6"),
  cardColor: varchar("card_color", { length: 20 }).notNull().default("#f9fafb"),

  // Typography
  fontFamily: varchar("font_family", { length: 100 }).notNull().default("Inter"),
  fontSize: varchar("font_size", { length: 10 }).notNull().default("base"),

  // Extras
  borderRadius: varchar("border_radius", { length: 10 }).notNull().default("md"),
  coverImage: text("cover_image"),
  gradientConfig: jsonb("gradient_config"),

  isBuiltIn: boolean("is_built_in").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectTheme = typeof themesTable.$inferSelect;
export type InsertTheme = typeof themesTable.$inferInsert;
