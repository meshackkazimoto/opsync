import { Hono } from "hono";
import { and, desc, eq, inArray, or, sql, ilike, gte, lte } from "drizzle-orm";

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
  createCustomerSchema,
  updateCustomerSchema,
  createItemSchema,
  updateItemSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  createPaymentSchema,
} from "@opsync/validation";

import { customers, items, invoices, invoiceItems, payments } from "@opsync/db/schema";

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

async function nextInvoiceNumber(executor: { execute: (query: any) => Promise<any> }) {
  const result = await executor.execute(sql`select nextval('invoice_number_seq') as seq`);
  const seq = Number((result as any).rows?.[0]?.seq ?? 0);
  const year = new Date().getFullYear();
  return `INV-${year}-${String(seq).padStart(6, "0")}`;
}

export const salesRoutes = new Hono<{ Variables: AuthVariables }>();

salesRoutes.use(jwtMiddleware);

/** ---------------- Customers ---------------- */
salesRoutes.get(
  "/customers",
  requirePermission(Permissions.CUSTOMER_READ),
  async (c) => {
    const { page, pageSize } = parsePagination(c.req.query());
    const q = c.req.query("q");

    const conditions = [] as any[];
    if (q) {
      const like = `%${q}%`;
      conditions.push(
        or(
          ilike(customers.name, like),
          ilike(customers.email, like),
          ilike(customers.phone, like)
        )
      );
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(customers)
      .where(where)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(customers.createdAt));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(where);

    return success(c, {
      data: rows,
      meta: { page, pageSize, total: Number(count ?? 0) },
    });
  }
);

salesRoutes.post(
  "/customers",
  requirePermission(Permissions.CUSTOMER_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const body = parseBody<{
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    }>(createCustomerSchema, await c.req.json());

    const [created] = await db
      .insert(customers)
      .values({ ...body, createdBy: auth.userId })
      .returning();

    return success(c, created, 201);
  }
);

salesRoutes.get(
  "/customers/:id",
  requirePermission(Permissions.CUSTOMER_READ),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid customer id");

    const rows = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Customer not found");
    }

    return success(c, rows[0]);
  }
);

salesRoutes.put(
  "/customers/:id",
  requirePermission(Permissions.CUSTOMER_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid customer id");
    const body = parseBody<{
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    }>(updateCustomerSchema, await c.req.json());

    const [updated] = await db
      .update(customers)
      .set(body)
      .where(eq(customers.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError("Customer not found");
    }

    return success(c, updated);
  }
);

salesRoutes.delete(
  "/customers/:id",
  requirePermission(Permissions.CUSTOMER_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid customer id");

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(eq(invoices.customerId, id));

    if (Number(count ?? 0) > 0) {
      throw new ConflictError("Customer has invoices and cannot be deleted");
    }

    const [deleted] = await db
      .delete(customers)
      .where(eq(customers.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundError("Customer not found");
    }

    return success(c, { id });
  }
);

/** ---------------- Items ---------------- */
salesRoutes.get(
  "/items",
  requirePermission(Permissions.ITEM_READ),
  async (c) => {
    const { page, pageSize } = parsePagination(c.req.query());
    const q = c.req.query("q");

    const conditions = [] as any[];
    if (q) {
      const like = `%${q}%`;
      conditions.push(or(ilike(items.name, like), ilike(items.sku, like)));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(items)
      .where(where)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(items.createdAt));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(where);

    return success(c, {
      data: rows,
      meta: { page, pageSize, total: Number(count ?? 0) },
    });
  }
);

salesRoutes.post(
  "/items",
  requirePermission(Permissions.ITEM_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const body = parseBody<{
      name: string;
      sku?: string;
      unitPrice: number;
      isService?: boolean;
    }>(createItemSchema, await c.req.json());

    const [created] = await db
      .insert(items)
      .values({
        ...body,
        unitPrice: String(body.unitPrice),
        createdBy: auth.userId,
      })
      .returning();

    return success(c, created, 201);
  }
);

salesRoutes.get(
  "/items/:id",
  requirePermission(Permissions.ITEM_READ),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid item id");

    const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Item not found");
    }

    return success(c, rows[0]);
  }
);

salesRoutes.put(
  "/items/:id",
  requirePermission(Permissions.ITEM_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid item id");
    const body = parseBody<{
      name?: string;
      sku?: string;
      unitPrice?: number;
      isService?: boolean;
    }>(updateItemSchema, await c.req.json());

    const payload: any = { ...body };
    if (payload.unitPrice !== undefined) {
      payload.unitPrice = String(payload.unitPrice);
    }

    const [updated] = await db
      .update(items)
      .set(payload)
      .where(eq(items.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError("Item not found");
    }

    return success(c, updated);
  }
);

salesRoutes.delete(
  "/items/:id",
  requirePermission(Permissions.ITEM_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid item id");

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoiceItems)
      .where(eq(invoiceItems.itemId, id));

    if (Number(count ?? 0) > 0) {
      throw new ConflictError("Item is used on invoices and cannot be deleted");
    }

    const [deleted] = await db
      .delete(items)
      .where(eq(items.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundError("Item not found");
    }

    return success(c, { id });
  }
);

/** ---------------- Invoices ---------------- */
salesRoutes.get(
  "/invoices",
  requirePermission(Permissions.INVOICE_READ),
  async (c) => {
    const { page, pageSize } = parsePagination(c.req.query());
    const q = c.req.query("q");
    const status = c.req.query("status");
    const customerId = c.req.query("customerId");
    const dateFrom = c.req.query("dateFrom");
    const dateTo = c.req.query("dateTo");

    const conditions = [] as any[];

    if (q) {
      conditions.push(ilike(invoices.invoiceNumber, `%${q}%`));
    }

    if (status) {
      const allowed = ["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "VOID"];
      if (!allowed.includes(status)) {
        throw new ValidationError("Invalid status filter");
      }
      conditions.push(eq(invoices.status, status as any));
    }

    if (customerId) {
      const parsed = parseId(customerId, "Invalid customer id");
      conditions.push(eq(invoices.customerId, parsed));
    }

    if (dateFrom) {
      conditions.push(gte(invoices.issueDate, parseDateParam(dateFrom, "Invalid dateFrom")));
    }

    if (dateTo) {
      conditions.push(lte(invoices.issueDate, parseDateParam(dateTo, "Invalid dateTo")));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(invoices)
      .where(where)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(invoices.createdAt));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(where);

    return success(c, {
      data: rows,
      meta: { page, pageSize, total: Number(count ?? 0) },
    });
  }
);

salesRoutes.post(
  "/invoices",
  requirePermission(Permissions.INVOICE_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const body = parseBody<{
      customerId: string;
      dueDate?: string;
      notes?: string;
      items: { itemId: string; quantity: number; unitPrice?: number }[];
    }>(createInvoiceSchema, await c.req.json());

    const invoice = await db.transaction(async (tx) => {
      const customerRows = await tx
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.id, body.customerId))
        .limit(1);

      if (customerRows.length === 0) {
        throw new NotFoundError("Customer not found");
      }

      const itemIds = body.items.map((line) => line.itemId);
      const dbItems = await tx
        .select()
        .from(items)
        .where(inArray(items.id, itemIds));

      const itemsById = new Map(dbItems.map((item) => [item.id, item]));
      let subtotal = 0;

      const computedLines = body.items.map((line) => {
        const item = itemsById.get(line.itemId);
        if (!item) {
          throw new NotFoundError(`Item not found: ${line.itemId}`);
        }

        const unitPrice = line.unitPrice ?? Number(item.unitPrice);
        const lineTotal = unitPrice * line.quantity;
        subtotal += lineTotal;

        return {
          itemId: line.itemId,
          quantity: line.quantity,
          unitPrice: toMoney(unitPrice),
          lineTotal: toMoney(lineTotal),
        };
      });

      const invoiceNumber = await nextInvoiceNumber(tx);
      const [created] = await tx
        .insert(invoices)
        .values({
          invoiceNumber,
          customerId: body.customerId,
          status: "DRAFT",
          dueDate: body.dueDate,
          notes: body.notes,
          subtotal: String(toMoney(subtotal)),
          totalPaid: "0",
          balance: String(toMoney(subtotal)),
          createdBy: auth.userId,
        })
        .returning();

      for (const line of computedLines) {
        await tx.insert(invoiceItems).values({
          invoiceId: created.id,
          itemId: line.itemId,
          quantity: line.quantity,
          unitPrice: String(line.unitPrice),
          lineTotal: String(line.lineTotal),
        });
      }

      return created;
    });

    return success(c, invoice, 201);
  }
);

salesRoutes.get(
  "/invoices/:id",
  requirePermission(Permissions.INVOICE_READ),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid invoice id");

    const inv = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (inv.length === 0) {
      throw new NotFoundError("Invoice not found");
    }

    const lines = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    const pays = await db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, id));

    return success(c, { invoice: inv[0], items: lines, payments: pays });
  }
);

salesRoutes.put(
  "/invoices/:id",
  requirePermission(Permissions.INVOICE_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid invoice id");
    const body = parseBody<{
      dueDate?: string;
      notes?: string;
      items?: { itemId: string; quantity: number; unitPrice?: number }[];
    }>(updateInvoiceSchema, await c.req.json());

    const updated = await db.transaction(async (tx) => {
      const invRows = await tx
        .select()
        .from(invoices)
        .where(eq(invoices.id, id))
        .limit(1);

      if (invRows.length === 0) {
        throw new NotFoundError("Invoice not found");
      }

      const inv = invRows[0];
      if (inv.status !== "DRAFT") {
        throw new ConflictError("Only draft invoices can be updated");
      }

      let subtotal = Number(inv.subtotal);

      if (body.items) {
        const itemIds = body.items.map((line) => line.itemId);
        const dbItems = await tx
          .select()
          .from(items)
          .where(inArray(items.id, itemIds));

        const itemsById = new Map(dbItems.map((item) => [item.id, item]));
        subtotal = 0;

        const computedLines = body.items.map((line) => {
          const item = itemsById.get(line.itemId);
          if (!item) {
            throw new NotFoundError(`Item not found: ${line.itemId}`);
          }

          const unitPrice = line.unitPrice ?? Number(item.unitPrice);
          const lineTotal = unitPrice * line.quantity;
          subtotal += lineTotal;

          return {
            itemId: line.itemId,
            quantity: line.quantity,
            unitPrice: toMoney(unitPrice),
            lineTotal: toMoney(lineTotal),
          };
        });

        await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));

        for (const line of computedLines) {
          await tx.insert(invoiceItems).values({
            invoiceId: id,
            itemId: line.itemId,
            quantity: line.quantity,
            unitPrice: String(line.unitPrice),
            lineTotal: String(line.lineTotal),
          });
        }
      }

      const [result] = await tx
        .update(invoices)
        .set({
          dueDate: body.dueDate ?? inv.dueDate,
          notes: body.notes ?? inv.notes,
          subtotal: String(toMoney(subtotal)),
          balance: String(Math.max(0, toMoney(subtotal) - Number(inv.totalPaid))),
        })
        .where(eq(invoices.id, id))
        .returning();

      return result;
    });

    return success(c, updated);
  }
);

salesRoutes.post(
  "/invoices/:id/issue",
  requirePermission(Permissions.INVOICE_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid invoice id");

    const rows = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Invoice not found");
    }

    if (rows[0].status !== "DRAFT") {
      throw new ConflictError("Only draft invoices can be issued");
    }

    const [updated] = await db
      .update(invoices)
      .set({ status: "ISSUED", issueDate: new Date().toISOString().slice(0, 10) })
      .where(eq(invoices.id, id))
      .returning();

    return success(c, updated);
  }
);

salesRoutes.post(
  "/invoices/:id/void",
  requirePermission(Permissions.INVOICE_WRITE),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid invoice id");

    const rows = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Invoice not found");
    }

    const inv = rows[0];
    if (inv.status === "PAID") {
      throw new ConflictError("Paid invoices cannot be voided");
    }
    if (inv.status === "PARTIALLY_PAID") {
      throw new ConflictError("Partially paid invoices cannot be voided");
    }
    if (inv.status === "VOID") {
      throw new ConflictError("Invoice is already voided");
    }

    const [updated] = await db
      .update(invoices)
      .set({ status: "VOID", balance: "0" })
      .where(eq(invoices.id, id))
      .returning();

    return success(c, updated);
  }
);

salesRoutes.post(
  "/invoices/:id/payments",
  requirePermission(Permissions.PAYMENT_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const invoiceId = parseId(c.req.param("id"), "Invalid invoice id");
    const body = parseBody<{
      amount: number;
      method: "CASH" | "BANK" | "MOBILE_MONEY" | "CARD";
      paidAt?: string;
      reference?: string;
    }>(createPaymentSchema, await c.req.json());

    const payment = await db.transaction(async (tx) => {
      const invRows = await tx
        .select()
        .from(invoices)
        .where(eq(invoices.id, invoiceId))
        .limit(1);

      if (invRows.length === 0) {
        throw new NotFoundError("Invoice not found");
      }

      const inv = invRows[0];
      if (inv.status === "VOID") {
        throw new ConflictError("Cannot pay a void invoice");
      }
      if (inv.status === "DRAFT") {
        throw new ConflictError("Invoice must be issued before payment");
      }
      if (inv.status === "PAID") {
        throw new ConflictError("Invoice is already paid");
      }

      const [created] = await tx
        .insert(payments)
        .values({
          invoiceId,
          amount: String(body.amount),
          method: body.method,
          paidAt: body.paidAt,
          reference: body.reference,
          createdBy: auth.userId,
        })
        .returning();

      const [{ total }] = await tx
        .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)` })
        .from(payments)
        .where(eq(payments.invoiceId, invoiceId));

      const totalPaid = Number(total ?? 0);
      const subtotal = Number(inv.subtotal);
      const balance = Math.max(0, toMoney(subtotal - totalPaid));

      const status = balance === 0 ? "PAID" : "PARTIALLY_PAID";

      await tx
        .update(invoices)
        .set({ totalPaid: String(totalPaid), balance: String(balance), status })
        .where(eq(invoices.id, invoiceId));

      return created;
    });

    return success(c, payment, 201);
  }
);

salesRoutes.get(
  "/invoices/:id/payments",
  requirePermission(Permissions.PAYMENT_READ),
  async (c) => {
    const { page, pageSize } = parsePagination(c.req.query());
    const invoiceId = parseId(c.req.param("id"), "Invalid invoice id");

    const inv = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (inv.length === 0) {
      throw new NotFoundError("Invoice not found");
    }

    const rows = await db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(payments.createdAt));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId));

    return success(c, {
      data: rows,
      meta: { page, pageSize, total: Number(count ?? 0) },
    });
  }
);

salesRoutes.get(
  "/invoices/:id/pdf",
  requirePermission(Permissions.INVOICE_READ),
  async (c) => {
    const id = parseId(c.req.param("id"), "Invalid invoice id");
    return success(c, { message: "todo", invoiceId: id });
  }
);
