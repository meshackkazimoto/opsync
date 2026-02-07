import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: varchar("address", { length: 500 }),
  contact: varchar("contact", { length: 100 }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
  (t) => [
    index("idx_suppliers_name").on(t.name),
    index("idx_suppliers_email").on(t.email),
    index("idx_suppliers_phone").on(t.phone),
  ]
);
