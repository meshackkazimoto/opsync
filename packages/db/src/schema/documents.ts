import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }),
  path: varchar("path", { length: 500 }),
  uploadedAt: timestamp("uploaded_at").defaultNow()
});