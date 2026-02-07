import { Hono } from "hono";
import { and, desc, eq, ilike, or, sql, gte, lte } from "drizzle-orm";

import type { AuthVariables } from "../../middleware/jwt";
import { jwtMiddleware } from "../../middleware/jwt";
import { requirePermission } from "../../middleware/permission";
import { Permissions } from "@opsync/config";

import { db } from "../../db/client";
import { success } from "../../http/response";
import { ConflictError, NotFoundError, ValidationError } from "../../http/errors";

import {
  uuidSchema,
  paginationSchema,
  createSupplierSchema,
  updateSupplierSchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
} from "@opsync/validation";

import {
  suppliers,
  purchaseOrders,
  purchaseOrderItems,
  expenses,
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

function toMoney(value: number) {
  return Number(value.toFixed(2));
}

async function nextPurchaseOrderNumber(executor: { execute: (query: any) => Promise<any> }) {
  const result = await executor.execute(sql`select nextval('purchase_order_number_seq') as seq`);
  const seq = Number((result as any).rows?.[0]?.seq ?? 0);
  const year = new Date().getFullYear();
  return `PO-${year}-${String(seq).padStart(6, "0")}`;
}

export const purchasingRoutes = new Hono<{ Variables: AuthVariables }>();

purchasingRoutes.use(jwtMiddleware);

/** ---------------- Suppliers ---------------- */
purchasingRoutes.get(
  "/suppliers",
  requirePermission(Permissions.SUPPLIER_READ),
  async (c) => {
    const { page, pageSize } = parsePagination(c.req.query());
    const q = c.req.query("q");

    const conditions = [] as any[];
    if (q) {
      const like = `%${q}%`;
      conditions.push(
        or(
          ilike(suppliers.name, like),
          ilike(suppliers.email, like),
          ilike(suppliers.phone, like)
        )
      );
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(suppliers)
      .where(where)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(suppliers.createdAt));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(suppliers)
      .where(where);

    return success(c, {
      data: rows,
      meta: { page, pageSize, total: Number(count ?? 0) },
    });
  }
);

purchasingRoutes.post(
  "/suppliers",
  requirePermission(Permissions.SUPPLIER_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const body = parseBody<{
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      contact?: string;
    }>(createSupplierSchema, await c.req.json());

    const [created] = await db
      .insert(suppliers)
      .values({ ...body, createdBy: auth.userId })
      .returning();

    return success(c, created, 201);
  }
);

purchasingRoutes.get(
  "/suppliers/:id",
  requirePermission(Permissions.SUPPLIER_READ),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid supplier id");

    const rows = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Supplier not found");
    }

    return success(c, rows[0]);
  }
);

purchasingRoutes.put(
  "/suppliers/:id",
  requirePermission(Permissions.SUPPLIER_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid supplier id");
    const body = parseBody<{
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      contact?: string;
    }>(updateSupplierSchema, await c.req.json());

    const [updated] = await db
      .update(suppliers)
      .set(body)
      .where(eq(suppliers.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError("Supplier not found");
    }

    return success(c, updated);
  }
);

purchasingRoutes.delete(
  "/suppliers/:id",
  requirePermission(Permissions.SUPPLIER_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid supplier id");

    const [{ poCount }] = await db
      .select({ poCount: sql<number>`count(*)` })
      .from(purchaseOrders)
      .where(eq(purchaseOrders.supplierId, id));

    if (Number(poCount ?? 0) > 0) {
      throw new ConflictError("Supplier is linked to purchase orders");
    }

    const [{ expenseCount }] = await db
      .select({ expenseCount: sql<number>`count(*)` })
      .from(expenses)
      .where(eq(expenses.supplierId, id));

    if (Number(expenseCount ?? 0) > 0) {
      throw new ConflictError("Supplier is linked to expenses");
    }

    const [deleted] = await db
      .delete(suppliers)
      .where(eq(suppliers.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundError("Supplier not found");
    }

    return success(c, { id });
  }
);

/** ---------------- Purchase Orders ---------------- */
purchasingRoutes.get(
  "/purchase-orders",
  requirePermission(Permissions.PURCHASE_ORDER_READ),
  async (c) => {
    const { page, pageSize } = parsePagination(c.req.query());
    const status = c.req.query("status");
    const supplierId = c.req.query("supplierId");
    const dateFrom = c.req.query("dateFrom");
    const dateTo = c.req.query("dateTo");
    const q = c.req.query("q");

    const conditions = [] as any[];
    if (status) {
      const allowed = ["DRAFT", "APPROVED", "RECEIVED", "CANCELLED"];
      if (!allowed.includes(status)) {
        throw new ValidationError("Invalid status filter");
      }
      conditions.push(eq(purchaseOrders.status, status as any));
    }
    if (supplierId) {
      const parsed = parseId(supplierId, "Invalid supplier id");
      conditions.push(eq(purchaseOrders.supplierId, parsed));
    }
    if (dateFrom) {
      conditions.push(gte(purchaseOrders.orderDate, parseDateParam(dateFrom, "Invalid dateFrom")));
    }
    if (dateTo) {
      conditions.push(lte(purchaseOrders.orderDate, parseDateParam(dateTo, "Invalid dateTo")));
    }
    if (q) {
      conditions.push(ilike(purchaseOrders.orderNumber, `%${q}%`));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(purchaseOrders)
      .where(where)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(purchaseOrders.createdAt));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(purchaseOrders)
      .where(where);

    return success(c, {
      data: rows,
      meta: { page, pageSize, total: Number(count ?? 0) },
    });
  }
);

purchasingRoutes.post(
  "/purchase-orders",
  requirePermission(Permissions.PURCHASE_ORDER_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const body = parseBody<{
      supplierId: string;
      orderDate?: string;
      notes?: string;
      items: { itemName: string; quantity: number; unitPrice: number }[];
    }>(createPurchaseOrderSchema, await c.req.json());

    const order = await db.transaction(async (tx) => {
      const supplierRows = await tx
        .select({ id: suppliers.id })
        .from(suppliers)
        .where(eq(suppliers.id, body.supplierId))
        .limit(1);

      if (supplierRows.length === 0) {
        throw new NotFoundError("Supplier not found");
      }

      let subtotal = 0;
      const computedLines = body.items.map((line) => {
        const lineTotal = line.unitPrice * line.quantity;
        subtotal += lineTotal;
        return {
          itemName: line.itemName,
          quantity: line.quantity,
          unitPrice: toMoney(line.unitPrice),
          lineTotal: toMoney(lineTotal),
        };
      });

      const orderNumber = await nextPurchaseOrderNumber(tx);

      const [created] = await tx
        .insert(purchaseOrders)
        .values({
          orderNumber,
          supplierId: body.supplierId,
          status: "DRAFT",
          orderDate: body.orderDate,
          notes: body.notes,
          subtotal: String(toMoney(subtotal)),
          total: String(toMoney(subtotal)),
          createdBy: auth.userId,
        })
        .returning();

      for (const line of computedLines) {
        await tx.insert(purchaseOrderItems).values({
          purchaseOrderId: created.id,
          itemName: line.itemName,
          quantity: line.quantity,
          unitPrice: String(line.unitPrice),
          lineTotal: String(line.lineTotal),
        });
      }

      return created;
    });

    return success(c, order, 201);
  }
);

purchasingRoutes.get(
  "/purchase-orders/:id",
  requirePermission(Permissions.PURCHASE_ORDER_READ),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid purchase order id");

    const rows = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Purchase order not found");
    }

    const lines = await db
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, id));

    return success(c, { order: rows[0], items: lines });
  }
);

purchasingRoutes.put(
  "/purchase-orders/:id",
  requirePermission(Permissions.PURCHASE_ORDER_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid purchase order id");
    const body = parseBody<{
      supplierId?: string;
      orderDate?: string;
      notes?: string;
      items?: { itemName: string; quantity: number; unitPrice: number }[];
    }>(updatePurchaseOrderSchema, await c.req.json());

    const updated = await db.transaction(async (tx) => {
      const orderRows = await tx
        .select()
        .from(purchaseOrders)
        .where(eq(purchaseOrders.id, id))
        .limit(1);

      if (orderRows.length === 0) {
        throw new NotFoundError("Purchase order not found");
      }

      const order = orderRows[0];
      if (order.status !== "DRAFT") {
        throw new ConflictError("Only draft purchase orders can be updated");
      }

      if (body.supplierId) {
        const supplierRows = await tx
          .select({ id: suppliers.id })
          .from(suppliers)
          .where(eq(suppliers.id, body.supplierId))
          .limit(1);

        if (supplierRows.length === 0) {
          throw new NotFoundError("Supplier not found");
        }
      }

      let subtotal = Number(order.subtotal);

      if (body.items) {
        subtotal = 0;
        const computedLines = body.items.map((line) => {
          const lineTotal = line.unitPrice * line.quantity;
          subtotal += lineTotal;
          return {
            itemName: line.itemName,
            quantity: line.quantity,
            unitPrice: toMoney(line.unitPrice),
            lineTotal: toMoney(lineTotal),
          };
        });

        await tx
          .delete(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, id));

        for (const line of computedLines) {
          await tx.insert(purchaseOrderItems).values({
            purchaseOrderId: id,
            itemName: line.itemName,
            quantity: line.quantity,
            unitPrice: String(line.unitPrice),
            lineTotal: String(line.lineTotal),
          });
        }
      }

      const [result] = await tx
        .update(purchaseOrders)
        .set({
          supplierId: body.supplierId ?? order.supplierId,
          orderDate: body.orderDate ?? order.orderDate,
          notes: body.notes ?? order.notes,
          subtotal: String(toMoney(subtotal)),
          total: String(toMoney(subtotal)),
        })
        .where(eq(purchaseOrders.id, id))
        .returning();

      return result;
    });

    return success(c, updated);
  }
);

purchasingRoutes.post(
  "/purchase-orders/:id/approve",
  requirePermission(Permissions.PURCHASE_ORDER_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid purchase order id");

    const rows = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Purchase order not found");
    }

    if (rows[0].status !== "DRAFT") {
      throw new ConflictError("Only draft purchase orders can be approved");
    }

    const [updated] = await db
      .update(purchaseOrders)
      .set({ status: "APPROVED" })
      .where(eq(purchaseOrders.id, id))
      .returning();

    return success(c, updated);
  }
);

purchasingRoutes.post(
  "/purchase-orders/:id/receive",
  requirePermission(Permissions.PURCHASE_ORDER_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid purchase order id");

    const rows = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Purchase order not found");
    }

    if (rows[0].status !== "APPROVED") {
      throw new ConflictError("Only approved purchase orders can be received");
    }

    const [updated] = await db
      .update(purchaseOrders)
      .set({ status: "RECEIVED", receivedDate: new Date().toISOString().slice(0, 10) })
      .where(eq(purchaseOrders.id, id))
      .returning();

    return success(c, updated);
  }
);
