import { pgTable, varchar } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
  name: varchar("name", { length: 50 }).primaryKey()
});