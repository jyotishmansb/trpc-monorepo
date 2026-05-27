import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { themesTable } from "./theme";

export const formStatusEnum = pgEnum("form_status", ["draft", "published"]);
export const formVisibilityEnum = pgEnum("form_visibility", ["public", "unlisted"]);

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  themeId: uuid("theme_id").references(() => themesTable.id, { onDelete: "set null" }),

  title: varchar("title", { length: 255 }).notNull().default("Untitled Form"),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),

  status: formStatusEnum("status").notNull().default("draft"),
  visibility: formVisibilityEnum("visibility").notNull().default("public"),

  isTemplate: boolean("is_template").default(false),
  submitMessage: text("submit_message").default("Thank you for your response! 🎉"),
  redirectUrl: text("redirect_url"),

  // Custom theme overrides (JSON blob overriding themeId settings)
  themeOverrides: jsonb("theme_overrides"),

  responseCount: uuid("response_count"), // kept for fast denormalization if needed
  closedAt: timestamp("closed_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
