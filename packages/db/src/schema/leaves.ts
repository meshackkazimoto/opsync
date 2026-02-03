import { pgTable, uuid, varchar, date } from "drizzle-orm/pg-core";

export const leaves = pgTable("leaves", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id").notNull(),
  type: varchar("type", { length: 50 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: varchar("status", { length: 20 })
});