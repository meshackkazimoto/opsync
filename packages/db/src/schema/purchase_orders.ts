import { date, index, numeric, pgTable, timestamp, uuid, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { suppliers } from "./suppliers";
import { users } from "./users";
import { purchaseOrderStatusEnum } from "./enums";

export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: varchar("order_number", { length: 30 }).notNull(),
  supplierId: uuid("supplier_id")
    .notNull()
    .references(() => suppliers.id, { onDelete: "restrict" }),
  status: purchaseOrderStatusEnum("status").notNull().default("DRAFT"),
  orderDate: date("order_date"),
  receivedDate: date("received_date"),
  notes: varchar("notes", { length: 1000 }),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
  (t) => [
    uniqueIndex("idx_purchase_orders_number").on(t.orderNumber),
    index("idx_purchase_orders_supplier").on(t.supplierId),
    index("idx_purchase_orders_status").on(t.status),
    index("idx_purchase_orders_order_date").on(t.orderDate),
  ]
);
