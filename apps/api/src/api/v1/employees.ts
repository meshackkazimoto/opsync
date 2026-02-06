import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { employees } from "@opsync/db/schema";
import { createEmployeeSchema, updateEmployeeSchema, uuidSchema } from "@opsync/validation";
import { db } from "../../db/client";
import { success } from "../../http/response";
import { NotFoundError, ValidationError } from "../../http/errors";
import { jwtMiddleware } from "../../middleware/jwt";
import { requirePermission } from "../../middleware/permission";
import { Permissions } from "@opsync/config";
import type { AuthVariables } from "../../middleware/jwt";

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
    throw new ValidationError("Invalid employee id", parsed.error.flatten());
  }
  return parsed.data;
}

export const employeeRoutes = new Hono<{ Variables: AuthVariables }>();

employeeRoutes.use(jwtMiddleware);

employeeRoutes.get(
  "/",
  requirePermission(Permissions.EMPLOYEE_READ),
  async (c) => {
    const rows = await db.select().from(employees);
    return success(c, rows);
  }
);

employeeRoutes.get(
  "/:id",
  requirePermission(Permissions.EMPLOYEE_READ),
  async (c) => {
    const id = parseId(c.req.param("id"));
    
    const rows = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Employee not found");
    }

    return success(c, rows[0]);
  }
);

employeeRoutes.post(
  "/",
  requirePermission(Permissions.EMPLOYEE_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const body = parseBody<{
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      position: string;
      department: string;
      employmentDate?: string;
      status?: "ACTIVE" | "INACTIVE";
    }>(createEmployeeSchema, await c.req.json());

    const [created] = await db
      .insert(employees)
      .values({
        ...body,
        createdBy: auth.userId,
      })
      .returning();

    return success(c, created, 201);
  }
);

employeeRoutes.put(
  "/:id",
  requirePermission(Permissions.EMPLOYEE_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"));
    const body = parseBody<{
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      position?: string;
      department?: string;
      employmentDate?: string;
      status?: "ACTIVE" | "INACTIVE";
    }>(updateEmployeeSchema, await c.req.json());

    const [updated] = await db
      .update(employees)
      .set(body)
      .where(eq(employees.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError("Employee not found");
    }

    return success(c, updated);
  }
);

employeeRoutes.delete(
  "/:id",
  requirePermission(Permissions.EMPLOYEE_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"));
    const [deleted] = await db
      .delete(employees)
      .where(eq(employees.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundError("Employee not found");
    }

    return success(c, { id });
  }
);
