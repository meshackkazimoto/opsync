import { pgTable, uuid, date, boolean, uniqueIndex } from "drizzle-orm/pg-core";

export const attendance = pgTable("attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id").notNull(),
  date: date("date").notNull(),
  present: boolean("present").default(false)
},
  (t) => [
    uniqueIndex("uniq_attendance").on(t.employeeId, t.date)
  ]
);