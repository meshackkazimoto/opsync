import { pgTable, uuid, numeric, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { purchaseStatusEnum } from "./enums";

export const purchases = pgTable("purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  supplierId: uuid("supplier_id").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  status: purchaseStatusEnum("status").notNull(),
  createdAt: timestamp("created_at").defaultNow()
},
  (t) => [
    index("idx_purchases_supplier").on(t.supplierId),
    index("idx_purchases_status").on(t.status),
  ]
);