import { createMiddleware } from "hono/factory";
import type { Permission } from "../common/permissions";

export function requirePermission(permission: Permission) {
  return createMiddleware(async (c, next) => {
    const auth = c.get("auth");

    if (!auth) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    if (!auth.permissions.includes(permission)) {
      return c.json(
        {
          success: false,
          message: "Forbidden",
        },
        403
      );
    }

    await next();
  });
}