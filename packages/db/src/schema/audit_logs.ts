import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  action: varchar("action", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow()
});