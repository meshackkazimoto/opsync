import {
    pgTable,
    uuid,
    varchar,
    numeric,
    date,
    index
} from "drizzle-orm/pg-core";

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),

  category: varchar("category", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),

  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  expenseDate: date("expense_date").notNull(),

  createdBy: uuid("created_by").notNull(),
  employeeId: uuid("employee_id"),
  supplierId: uuid("supplier_id"),
},
  (t) => [
    index("idx_expenses_date").on(t.expenseDate),
    index("idx_expenses_category").on(t.category),
  ]
);