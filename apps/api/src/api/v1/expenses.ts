import { Hono } from "hono";
import { and, desc, eq, ilike, sql, gte, lte } from "drizzle-orm";

import type { AuthVariables } from "../../middleware/jwt";
import { jwtMiddleware } from "../../middleware/jwt";
import { requirePermission } from "../../middleware/permission";
import { Permissions } from "@opsync/config";

import { db } from "../../db/client";
import { success } from "../../http/response";
import { NotFoundError, ValidationError } from "../../http/errors";

import {
  uuidSchema,
  paginationSchema,
  createExpenseCategorySchema,
  createExpenseSchema,
  updateExpenseSchema,
} from "@opsync/validation";

import {
  expenseCategories,
  expenses,
  suppliers,
  employees,
} from "@opsync/db/schema";

function parseBody<T>(schema: { safeParse: (input: unknown) => any }, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Validation failed", result.error.flatten());
  }
  return result.data as T;
}

function parseId(value: string, message: string) {
  const parsed = uuidSchema.safeParse(value);
  if (!parsed.success) {
    throw new ValidationError(message, parsed.error.flatten());
  }
  return parsed.data;
}

function parsePagination(input: unknown) {
  const parsed = paginationSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Invalid pagination", parsed.error.flatten());
  }
  return parsed.data;
}

function parseDateParam(value: string, message: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ValidationError(message);
  }
  return value;
}

export const expensesRoutes = new Hono<{ Variables: AuthVariables }>();

expensesRoutes.use(jwtMiddleware);

/** ---------------- Expense Categories ---------------- */
expensesRoutes.get(
  "/categories",
  requirePermission(Permissions.EXPENSE_READ),
  async (c) => {
    const { page, pageSize } = parsePagination(c.req.query());
    const q = c.req.query("q");

    const conditions = [] as any[];
    if (q) {
      const like = `%${q}%`;
      conditions.push(ilike(expenseCategories.name, like));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(expenseCategories)
      .where(where)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(expenseCategories.createdAt));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(expenseCategories)
      .where(where);

    return success(c, {
      data: rows,
      meta: { page, pageSize, total: Number(count ?? 0) },
    });
  }
);

expensesRoutes.post(
  "/categories",
  requirePermission(Permissions.EXPENSE_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const body = parseBody<{
      name: string;
      description?: string;
    }>(createExpenseCategorySchema, await c.req.json());

    const [created] = await db
      .insert(expenseCategories)
      .values({ ...body, createdBy: auth.userId })
      .returning();

    return success(c, created, 201);
  }
);

/** ---------------- Expenses ---------------- */
expensesRoutes.get(
  "/",
  requirePermission(Permissions.EXPENSE_READ),
  async (c) => {
    const { page, pageSize } = parsePagination(c.req.query());
    const categoryId = c.req.query("categoryId");
    const supplierId = c.req.query("supplierId");
    const dateFrom = c.req.query("dateFrom");
    const dateTo = c.req.query("dateTo");

    const conditions = [] as any[];
    if (categoryId) {
      const parsed = parseId(categoryId, "Invalid category id");
      conditions.push(eq(expenses.categoryId, parsed));
    }
    if (supplierId) {
      const parsed = parseId(supplierId, "Invalid supplier id");
      conditions.push(eq(expenses.supplierId, parsed));
    }
    if (dateFrom) {
      conditions.push(gte(expenses.expenseDate, parseDateParam(dateFrom, "Invalid dateFrom")));
    }
    if (dateTo) {
      conditions.push(lte(expenses.expenseDate, parseDateParam(dateTo, "Invalid dateTo")));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(expenses)
      .where(where)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(expenses.expenseDate));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(expenses)
      .where(where);

    return success(c, {
      data: rows,
      meta: { page, pageSize, total: Number(count ?? 0) },
    });
  }
);

expensesRoutes.post(
  "/",
  requirePermission(Permissions.EXPENSE_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const body = parseBody<{
      categoryId: string;
      amount: number;
      expenseDate: string;
      description: string;
      supplierId?: string;
      employeeId?: string;
    }>(createExpenseSchema, await c.req.json());

    const categoryRows = await db
      .select({ id: expenseCategories.id })
      .from(expenseCategories)
      .where(eq(expenseCategories.id, body.categoryId))
      .limit(1);

    if (categoryRows.length === 0) {
      throw new NotFoundError("Expense category not found");
    }

    if (body.supplierId) {
      const supplierRows = await db
        .select({ id: suppliers.id })
        .from(suppliers)
        .where(eq(suppliers.id, body.supplierId))
        .limit(1);

      if (supplierRows.length === 0) {
        throw new NotFoundError("Supplier not found");
      }
    }

    if (body.employeeId) {
      const employeeRows = await db
        .select({ id: employees.id })
        .from(employees)
        .where(eq(employees.id, body.employeeId))
        .limit(1);

      if (employeeRows.length === 0) {
        throw new NotFoundError("Employee not found");
      }
    }

    const [created] = await db
      .insert(expenses)
      .values({
        categoryId: body.categoryId,
        amount: String(body.amount),
        expenseDate: body.expenseDate,
        description: body.description,
        supplierId: body.supplierId,
        employeeId: body.employeeId,
        createdBy: auth.userId,
      })
      .returning();

    return success(c, created, 201);
  }
);

expensesRoutes.get(
  "/:id",
  requirePermission(Permissions.EXPENSE_READ),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid expense id");

    const rows = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Expense not found");
    }

    return success(c, rows[0]);
  }
);

expensesRoutes.put(
  "/:id",
  requirePermission(Permissions.EXPENSE_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid expense id");
    const body = parseBody<{
      categoryId?: string;
      amount?: number;
      expenseDate?: string;
      description?: string;
      supplierId?: string;
      employeeId?: string;
    }>(updateExpenseSchema, await c.req.json());

    if (body.categoryId) {
      const categoryRows = await db
        .select({ id: expenseCategories.id })
        .from(expenseCategories)
        .where(eq(expenseCategories.id, body.categoryId))
        .limit(1);

      if (categoryRows.length === 0) {
        throw new NotFoundError("Expense category not found");
      }
    }

    if (body.supplierId) {
      const supplierRows = await db
        .select({ id: suppliers.id })
        .from(suppliers)
        .where(eq(suppliers.id, body.supplierId))
        .limit(1);

      if (supplierRows.length === 0) {
        throw new NotFoundError("Supplier not found");
      }
    }

    if (body.employeeId) {
      const employeeRows = await db
        .select({ id: employees.id })
        .from(employees)
        .where(eq(employees.id, body.employeeId))
        .limit(1);

      if (employeeRows.length === 0) {
        throw new NotFoundError("Employee not found");
      }
    }

    const payload: any = { ...body };
    if (payload.amount !== undefined) {
      payload.amount = String(payload.amount);
    }

    const [updated] = await db
      .update(expenses)
      .set(payload)
      .where(eq(expenses.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError("Expense not found");
    }

    return success(c, updated);
  }
);

expensesRoutes.delete(
  "/:id",
  requirePermission(Permissions.EXPENSE_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid expense id");

    const [deleted] = await db
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundError("Expense not found");
    }

    return success(c, { id });
  }
);
