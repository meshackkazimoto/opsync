import { pgTable, uuid, numeric, varchar, timestamp, index, date, uniqueIndex } from "drizzle-orm/pg-core";
import { invoiceStatusEnum } from "./enums";
import { customers } from "./customers";
import { users } from "./users";

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 30 }).notNull(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "restrict" }),
  issuedAt: timestamp("issued_at").defaultNow(),
  status: invoiceStatusEnum("status").notNull(),
  issueDate: date("issue_date"),
  dueDate: date("due_date"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull().default("0"),
  totalPaid: numeric("total_paid", { precision: 14, scale: 2 }).notNull().default("0"),
  balance: numeric("balance", { precision: 14, scale: 2 }).notNull().default("0"),
  notes: varchar("notes", { length: 1000 }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
  (t) => [
    uniqueIndex("idx_invoices_number").on(t.invoiceNumber),
    index("idx_invoices_customer").on(t.customerId),
    index("idx_invoices_status").on(t.status),
    index("idx_invoices_issue_date").on(t.issueDate),
  ]
);
