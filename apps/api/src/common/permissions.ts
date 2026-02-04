export const Permissions = {
  EMPLOYEE_READ: "EMPLOYEE_READ",
  EMPLOYEE_WRITE: "EMPLOYEE_WRITE",

  SALES_READ: "SALES_READ",
  SALES_WRITE: "SALES_WRITE",

  PURCHASE_READ: "PURCHASE_READ",
  PURCHASE_WRITE: "PURCHASE_WRITE",

  REPORT_READ: "REPORT_READ",
} as const;

export type Permission =
  (typeof Permissions)[keyof typeof Permissions];