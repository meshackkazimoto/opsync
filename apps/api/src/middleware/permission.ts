import { createMiddleware } from "hono/factory";
import type { Permission } from "@opsync/config";
import { error } from "../http/response";

export function requirePermission(permission: Permission) {
  return createMiddleware(async (c, next) => {
    const auth = c.get("auth");

    if (!auth) {
      return error(c, "Unauthorized", 401, "UNAUTHORIZED");
    }

    if (!auth.permissions.includes(permission)) {
      return error(c, "Forbidden", 403, "FORBIDDEN");
    }

    await next();
  });
}
