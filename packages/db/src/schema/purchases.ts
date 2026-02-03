import { pgTable, uuid, numeric, varchar, timestamp } from "drizzle-orm/pg-core";

export const purchases = pgTable("purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  supplierId: uuid("supplier_id").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow()
});