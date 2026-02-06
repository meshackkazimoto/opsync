import { pgTable, uuid, varchar, date, numeric, timestamp } from "drizzle-orm/pg-core";

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  method: varchar("method", { length: 30 }).notNull(),
  paidAt: date("paid_at"),
  reference: varchar("reference", { length: 255 }),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});