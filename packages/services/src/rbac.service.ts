import { Context, Effect } from "effect";

export type Role =
  | "ADMIN"
  | "HR"
  | "SALES"
  | "PROCUREMENT"
  | "VIEWER";

export type Permission =
  | "EMPLOYEE_READ"
  | "EMPLOYEE_WRITE"
  | "SALES_READ"
  | "SALES_WRITE"
  | "PURCHASE_READ"
  | "PURCHASE_WRITE"
  | "REPORT_READ";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "EMPLOYEE_READ",
    "EMPLOYEE_WRITE",
    "SALES_READ",
    "SALES_WRITE",
    "PURCHASE_READ",
    "PURCHASE_WRITE",
    "REPORT_READ",
  ],
  HR: ["EMPLOYEE_READ", "EMPLOYEE_WRITE", "REPORT_READ"],
  SALES: ["SALES_READ", "SALES_WRITE"],
  PROCUREMENT: ["PURCHASE_READ", "PURCHASE_WRITE"],
  VIEWER: ["REPORT_READ"],
};

export interface RBACService {
  permissionsForRoles(
    roles: Role[]
  ): Effect.Effect<Permission[], never, never>;

  hasPermission(
    roles: Role[],
    permission: Permission
  ): Effect.Effect<boolean, never, never>;
}

export const RBACService =
  Context.GenericTag<RBACService>("RBACService");

export const RBACServiceLive = Effect.succeed<RBACService>({
  permissionsForRoles(roles) {
    return Effect.succeed(
      Array.from(
        new Set(
          roles.flatMap((role) => ROLE_PERMISSIONS[role] ?? [])
        )
      )
    );
  },

  hasPermission(roles, permission) {
    return Effect.succeed(
      roles.some((role) =>
        ROLE_PERMISSIONS[role]?.includes(permission)
      )
    );
  },
});