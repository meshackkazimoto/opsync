import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role_enum", [
  "ADMIN",
  "HR",
  "SALES",
  "PROCUREMENT",
  "VIEWER",
]);

export const employeeStatusEnum = pgEnum("employee_status_enum", [
  "ACTIVE",
  "INACTIVE",
]);

export const invoiceStatusEnum = pgEnum("invoice_status_enum", [
  "DRAFT",
  "ISSUED",
  "PARTIALLY_PAID",
  "PAID",
  "VOID",
]);

export const purchaseStatusEnum = pgEnum("purchase_status_enum", [
  "PENDING",
  "RECEIVED",
  "PAID",
  "CANCELLED",
]);

export const purchaseOrderStatusEnum = pgEnum("purchase_order_status_enum", [
  "DRAFT",
  "APPROVED",
  "RECEIVED",
  "CANCELLED",
]);

export const paymentMethodEnum = pgEnum("payment_method_enum", [
  "CASH",
  "BANK",
  "MOBILE_MONEY",
  "CARD",
]);
