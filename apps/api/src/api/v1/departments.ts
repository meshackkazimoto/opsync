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
  createDepartmentSchema,
  updateDepartmentSchema,
} from "@opsync/validation";

import { departments } from "@opsync/db/schema";

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
    throw new ValidationError("Invalid department id", parsed.error.flatten());
  }
  return parsed.data;
}

export const departmentRoutes = new Hono<{ Variables: AuthVariables }>();

departmentRoutes.use(jwtMiddleware);

departmentRoutes.get(
  "/",
  requirePermission(Permissions.EMPLOYEE_READ),
  async (c) => {
    const q = c.req.query("q");
    const where = q ? ilike(departments.name, `%${q}%`) : undefined;

    const rows = await db
      .select()
      .from(departments)
      .where(where)
      .orderBy(desc(departments.createdAt));

    return success(c, rows);
  }
);

departmentRoutes.post(
  "/",
  requirePermission(Permissions.EMPLOYEE_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const body = parseBody<{ name: string; description?: string }>(
      createDepartmentSchema,
      await c.req.json()
    );

    const [created] = await db
      .insert(departments)
      .values({ ...body, createdBy: auth.userId })
      .returning();

    return success(c, created, 201);
  }
);

departmentRoutes.put(
  "/:id",
  requirePermission(Permissions.EMPLOYEE_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"));
    const body = parseBody<{ name?: string; description?: string }>(
      updateDepartmentSchema,
      await c.req.json()
    );

    const [updated] = await db
      .update(departments)
      .set(body)
      .where(eq(departments.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError("Department not found");
    }

    return success(c, updated);
  }
);

departmentRoutes.delete(
  "/:id",
  requirePermission(Permissions.EMPLOYEE_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"));
    const [deleted] = await db
      .delete(departments)
      .where(eq(departments.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundError("Department not found");
    }

    return success(c, { id });
  }
);
