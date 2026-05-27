import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const responsesTable = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),

  respondentEmail: varchar("respondent_email", { length: 255 }),
  respondentName: varchar("respondent_name", { length: 255 }),

  // Map of fieldId -> answer value
  answers: jsonb("answers")
    .notNull()
    .$type<Record<string, string | string[] | number | boolean>>(),

  // Metadata
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  completionTimeSeconds: integer("completion_time_seconds"),
  referrer: text("referrer"),

  submittedAt: timestamp("submitted_at").defaultNow(),
});

export type SelectResponse = typeof responsesTable.$inferSelect;
export type InsertResponse = typeof responsesTable.$inferInsert;
