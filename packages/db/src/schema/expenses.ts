import { pgTable, uuid, varchar, numeric, date, index, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { suppliers } from "./suppliers";
import { employees } from "./employees";
import { expenseCategories } from "./expense_categories";

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => expenseCategories.id, { onDelete: "restrict" }),
  description: varchar("description", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  expenseDate: date("expense_date").notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  employeeId: uuid("employee_id").references(() => employees.id, { onDelete: "set null" }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
  (t) => [
    index("idx_expenses_date").on(t.expenseDate),
    index("idx_expenses_category").on(t.categoryId),
    index("idx_expenses_supplier").on(t.supplierId),
  ]
);
