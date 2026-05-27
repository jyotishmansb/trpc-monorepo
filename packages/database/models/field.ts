import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const fieldTypeEnum = pgEnum("field_type", [
  "text",
  "textarea",
  "email",
  "number",
  "phone",
  "url",
  "select",
  "multiselect",
  "checkbox",
  "radio",
  "rating",
  "date",
  "time",
  "file",
  "statement",
]);

export const fieldsTable = pgTable("fields", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),

  type: fieldTypeEnum("type").notNull().default("text"),
  label: varchar("label", { length: 500 }).notNull().default("Question"),
  placeholder: varchar("placeholder", { length: 255 }),
  helpText: text("help_text"),

  required: boolean("required").notNull().default(false),
  order: integer("order").notNull().default(0),

  // For select/multiselect/radio/checkbox
  options: jsonb("options").$type<{ label: string; value: string }[]>(),

  // Validation rules
  validations: jsonb("validations").$type<{
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    patternMessage?: string;
  }>(),

  // Rating config
  ratingConfig: jsonb("rating_config").$type<{
    maxRating: number;
    icon: "star" | "heart" | "thumb";
  }>(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectField = typeof fieldsTable.$inferSelect;
export type InsertField = typeof fieldsTable.$inferInsert;
