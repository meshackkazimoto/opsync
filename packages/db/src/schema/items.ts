import { pgTable, uuid, varchar, numeric, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const items = pgTable("items", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
  isService: boolean("is_service").default(false).notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
  (t) => [
    index("idx_items_name").on(t.name),
    index("idx_items_sku").on(t.sku),
  ]
);
