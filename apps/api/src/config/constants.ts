import { Permissions } from "@opsync/config";
import type { Permission, Role } from "@opsync/config";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: Object.values(Permissions),
  HR: [
    Permissions.EMPLOYEE_READ,
    Permissions.EMPLOYEE_WRITE,
    Permissions.EXPENSE_READ,
    Permissions.EXPENSE_WRITE,
  ],
  SALES: [
    Permissions.CUSTOMER_READ,
    Permissions.CUSTOMER_WRITE,
    Permissions.ITEM_READ,
    Permissions.ITEM_WRITE,
    Permissions.INVOICE_READ,
    Permissions.INVOICE_WRITE,
    Permissions.PAYMENT_READ,
    Permissions.PAYMENT_WRITE,
  ],
  PROCUREMENT: [
    Permissions.SUPPLIER_READ,
    Permissions.SUPPLIER_WRITE,
    Permissions.PURCHASE_ORDER_READ,
    Permissions.PURCHASE_ORDER_WRITE,
    Permissions.EXPENSE_READ,
  ],
  VIEWER: [
    Permissions.EMPLOYEE_READ,
    Permissions.CUSTOMER_READ,
    Permissions.ITEM_READ,
    Permissions.INVOICE_READ,
    Permissions.PAYMENT_READ,
    Permissions.SUPPLIER_READ,
    Permissions.PURCHASE_ORDER_READ,
    Permissions.EXPENSE_READ,
    Permissions.REPORT_READ,
  ],
};

export function permissionsForRoles(roles: Role[]): Permission[] {
  const permissions = roles.flatMap((role) => ROLE_PERMISSIONS[role] ?? []);
  return Array.from(new Set(permissions));
}
