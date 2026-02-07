import { Hono } from "hono";
import { desc, eq, ilike } from "drizzle-orm";

import type { AuthVariables } from "../../middleware/jwt";
import { jwtMiddleware } from "../../middleware/jwt";
import { requirePermission } from "../../middleware/permission";
import { Permissions } from "@opsync/config";

import { db } from "../../db/client";
import { success } from "../../http/response";
import { NotFoundError, ValidationError } from "../../http/errors";

import {
  uuidSchema,
  createEmployeeRoleSchema,
  updateEmployeeRoleSchema,
} from "@opsync/validation";

import { employeeRoles } from "@opsync/db/schema";

function parseBody<T>(schema: { safeParse: (input: unknown) => any }, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Validation failed", result.error.flatten());
  }
  return result.data as T;
}

function parseId(value: string) {
  const parsed = uuidSchema.safeParse(value);
  if (!parsed.success) {
    throw new ValidationError("Invalid role id", parsed.error.flatten());
  }
  return parsed.data;
}

export const employeeRoleRoutes = new Hono<{ Variables: AuthVariables }>();

employeeRoleRoutes.use(jwtMiddleware);

employeeRoleRoutes.get(
  "/",
  requirePermission(Permissions.EMPLOYEE_READ),
  async (c) => {
    const q = c.req.query("q");
    const where = q ? ilike(employeeRoles.name, `%${q}%`) : undefined;

    const rows = await db
      .select()
      .from(employeeRoles)
      .where(where)
      .orderBy(desc(employeeRoles.createdAt));

    return success(c, rows);
  }
);

employeeRoleRoutes.post(
  "/",
  requirePermission(Permissions.EMPLOYEE_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const body = parseBody<{ name: string; description?: string }>(
      createEmployeeRoleSchema,
      await c.req.json()
    );

    const [created] = await db
      .insert(employeeRoles)
      .values({ ...body, createdBy: auth.userId })
      .returning();

    return success(c, created, 201);
  }
);

employeeRoleRoutes.put(
  "/:id",
  requirePermission(Permissions.EMPLOYEE_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"));
    const body = parseBody<{ name?: string; description?: string }>(
      updateEmployeeRoleSchema,
      await c.req.json()
    );

    const [updated] = await db
      .update(employeeRoles)
      .set(body)
      .where(eq(employeeRoles.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError("Role not found");
    }

    return success(c, updated);
  }
);

employeeRoleRoutes.delete(
  "/:id",
  requirePermission(Permissions.EMPLOYEE_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"));
    const [deleted] = await db
      .delete(employeeRoles)
      .where(eq(employeeRoles.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundError("Role not found");
    }

    return success(c, { id });
  }
);
