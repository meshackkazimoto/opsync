import { pgTable, uuid, varchar, date } from "drizzle-orm/pg-core";

export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  employmentDate: date("employment_date"),
  status: varchar("status", { length: 20 })
});