import { pgTable, uuid, numeric, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { invoiceStatusEnum } from "./enums";

export const invoices = pgTable("invoices", {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }),
    status: invoiceStatusEnum("status").notNull(),
    issuedAt: timestamp("issued_at").defaultNow()
},
    (t) => ({
        customerIdx: index("idx_invoices_customer").on(t.customerId),
        statusIdx: index("idx_invoices_status").on(t.status),
    })
);