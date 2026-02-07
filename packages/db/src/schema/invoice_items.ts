import { pgTable, uuid, integer, numeric, index } from "drizzle-orm/pg-core";
import { invoices } from "./invoices";
import { items } from "./items";

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 14, scale: 2 }).notNull(),
},
  (t) => [
    index("idx_invoice_items_invoice").on(t.invoiceId),
    index("idx_invoice_items_item").on(t.itemId),
  ]
);
