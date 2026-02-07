import { relations } from "drizzle-orm";

import { users } from "./users";
import { roles } from "./roles";
import { userRoles } from "./user_roles";

import { employees } from "./employees";
import { attendance } from "./attendance";
import { leaves } from "./leaves";

import { customers } from "./customers";
import { invoices } from "./invoices";
import { items } from "./items";
import { invoiceItems } from "./invoice_items";
import { payments } from "./payments";

import { suppliers } from "./suppliers";
import { purchases } from "./purchases";
import { purchaseOrders } from "./purchase_orders";
import { purchaseOrderItems } from "./purchase_order_items";

import { expenses } from "./expenses";
import { expenseCategories } from "./expense_categories";
import { assets } from "./assets";

import { documents } from "./documents";
import { auditLogs } from "./audit_logs";

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  auditLogs: many(auditLogs),
  items: many(items),
  payments: many(payments),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleName],
    references: [roles.name],
  }),
}));

export const employeesRelations = relations(employees, ({ many }) => ({
  attendance: many(attendance),
  leaves: many(leaves),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  employee: one(employees, {
    fields: [attendance.employeeId],
    references: [employees.id],
  }),
}));

export const leavesRelations = relations(leaves, ({ one }) => ({
  employee: one(employees, {
    fields: [leaves.employeeId],
    references: [employees.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  items: many(invoiceItems),
  payments: many(payments),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [items.createdBy],
    references: [users.id],
  }),
  invoiceItems: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  item: one(items, {
    fields: [invoiceItems.itemId],
    references: [items.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  createdByUser: one(users, {
    fields: [payments.createdBy],
    references: [users.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  purchases: many(purchases),
  purchaseOrders: many(purchaseOrders),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [purchases.supplierId],
    references: [suppliers.id],
  }),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
  items: many(purchaseOrderItems),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
}));

export const documentsRelations = relations(documents, () => ({}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({ many }) => ({
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
  createdByUser: one(users, {
    fields: [expenses.createdBy],
    references: [users.id],
  }),

  employee: one(employees, {
    fields: [expenses.employeeId],
    references: [employees.id],
  }),

  supplier: one(suppliers, {
    fields: [expenses.supplierId],
    references: [suppliers.id],
  }),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  createdByUser: one(users, {
    fields: [assets.createdBy],
    references: [users.id],
  }),

  assignedEmployee: one(employees, {
    fields: [assets.assignedTo],
    references: [employees.id],
  }),
}));
