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
  "PAID",
  "PARTIAL",
  "CANCELLED",
]);

export const purchaseStatusEnum = pgEnum("purchase_status_enum", [
  "PENDING",
  "RECEIVED",
  "PAID",
  "CANCELLED",
]);