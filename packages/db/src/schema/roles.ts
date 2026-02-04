import { pgTable, varchar } from "drizzle-orm/pg-core";
import { roleEnum } from "./enums";

export const roles = pgTable("roles", {
  name: roleEnum("name").primaryKey()
});