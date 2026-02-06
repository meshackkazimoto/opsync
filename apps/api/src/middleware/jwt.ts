import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { error } from "../http/response";
import type { Permission, Role } from "@opsync/config";

export type AuthContext = {
  userId: string;
  roles: Role[];
  permissions: Permission[];
};

export type AuthVariables = {
  auth: AuthContext;
};

export const jwtMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return error(c, "Unauthorized", 401, "UNAUTHORIZED");
    }

    const token = authHeader.slice(7);

    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload & {
        roles?: Role[];
        permissions?: Permission[];
      };

      const userId = typeof payload.sub === "string" ? payload.sub : undefined;

      if (!userId) {
        return error(c, "Unauthorized", 401, "UNAUTHORIZED");
      }

      c.set("auth", {
        userId,
        roles: payload.roles ?? [],
        permissions: payload.permissions ?? [],
      });

      await next();
    } catch {
      return error(c, "Unauthorized", 401, "UNAUTHORIZED");
    }
  }
);
