import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }),
  contact: varchar("contact", { length: 100 })
});