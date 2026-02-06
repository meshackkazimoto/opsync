import { pgTable, uuid, numeric, varchar, timestamp, index, date } from "drizzle-orm/pg-core";
import { invoiceStatusEnum } from "./enums";

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  issuedAt: timestamp("issued_at").defaultNow(),
  status: invoiceStatusEnum("status").notNull(),
  issueDate: date("issue_date"),
  dueDate: date("due_date"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull().default("0"),
  totalPaid: numeric("total_paid", { precision: 14, scale: 2 }).notNull().default("0"),
  balance: numeric("balance", { precision: 14, scale: 2 }).notNull().default("0"),
  notes: varchar("notes", { length: 1000 }),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
  (t) => [
    index('idx_invoices_customer').on(t.customerId),
    index("idx_invoices_status").on(t.status),
  ]
);
