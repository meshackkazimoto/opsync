import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const userRoles = pgTable("user_roles", {
  userId: uuid("user_id").notNull(),
  roleName: varchar("role_name", { length: 50 }).notNull()
});