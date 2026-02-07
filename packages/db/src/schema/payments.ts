import { pgTable, uuid, varchar, date, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { invoices } from "./invoices";
import { users } from "./users";
import { paymentMethodEnum } from "./enums";

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  paidAt: date("paid_at"),
  reference: varchar("reference", { length: 255 }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
  (t) => [
    index("idx_payments_invoice").on(t.invoiceId),
    index("idx_payments_paid_at").on(t.paidAt),
  ]
);
