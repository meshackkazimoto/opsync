import { index, integer, numeric, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { purchaseOrders } from "./purchase_orders";

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  purchaseOrderId: uuid("purchase_order_id")
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 14, scale: 2 }).notNull(),
},
  (t) => [
    index("idx_purchase_order_items_order").on(t.purchaseOrderId),
  ]
);
