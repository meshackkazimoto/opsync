import { Permissions } from "@opsync/config";
import type { Permission, Role } from "@opsync/config";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: Object.values(Permissions),
  HR: [Permissions.EMPLOYEE_READ, Permissions.EMPLOYEE_WRITE],
  SALES: [Permissions.SALES_READ, Permissions.SALES_WRITE],
  PROCUREMENT: [Permissions.PURCHASE_READ, Permissions.PURCHASE_WRITE],
  VIEWER: [
    Permissions.EMPLOYEE_READ,
    Permissions.SALES_READ,
    Permissions.PURCHASE_READ,
    Permissions.REPORT_READ,
  ],
};

export function permissionsForRoles(roles: Role[]): Permission[] {
  const permissions = roles.flatMap((role) => ROLE_PERMISSIONS[role] ?? []);
  return Array.from(new Set(permissions));
}
