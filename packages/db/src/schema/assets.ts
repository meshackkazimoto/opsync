import {
  pgTable,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),

  condition: varchar("condition", { length: 50 }),
  status: varchar("status", { length: 30 }),

  assignedTo: uuid("assigned_to"),
  createdBy: uuid("created_by").notNull(),
});