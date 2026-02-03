import { pgTable, uuid, numeric, varchar, timestamp } from "drizzle-orm/pg-core";

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 20 }),
  issuedAt: timestamp("issued_at").defaultNow()
});