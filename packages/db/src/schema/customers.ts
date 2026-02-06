import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: varchar("address", { length: 500 }),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});