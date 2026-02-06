import { Hono } from "hono";
import { eq, inArray } from "drizzle-orm";

import type { AuthVariables } from "../../middleware/jwt";
import { jwtMiddleware } from "../../middleware/jwt";
import { requirePermission } from "../../middleware/permission";
import { Permissions } from "@opsync/config";

import { db } from "../../db/client";
import { success } from "../../http/response";
import { NotFoundError, ValidationError } from "../../http/errors";

import { uuidSchema } from "@opsync/validation";
import type { z } from "zod";
import {
  createCustomerSchema,
  updateCustomerSchema,
  createItemSchema,
  updateItemSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  createPaymentSchema,
} from "@opsync/validation";

import { customers, items, invoices, invoiceItems, payments } from "@opsync/db/schema";

function parseBody<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) throw new ValidationError("Validation failed", result.error.flatten());
  return result.data;
}

function parseUuid(value: string, message: string) {
  const parsed = uuidSchema.safeParse(value);
  if (!parsed.success) throw new ValidationError(message, parsed.error.flatten());
  return parsed.data;
}

export const salesRoutes = new Hono<{ Variables: AuthVariables }>();

salesRoutes.use(jwtMiddleware);

/** ---------------- Customers ---------------- */
salesRoutes.get(
  "/customers",
  requirePermission(Permissions.CUSTOMER_READ),
  async (c) => {
    const rows = await db.select().from(customers);
    return success(c, rows);
  }
);

salesRoutes.post(
  "/customers",
  requirePermission(Permissions.CUSTOMER_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const body = parseBody(createCustomerSchema, await c.req.json());
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
    const id = parseUuid(c.req.param("id"), "Invalid customer id");
    const rows = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    if (rows.length === 0) throw new NotFoundError("Customer not found");
    return success(c, rows[0]);
  }
);

salesRoutes.put(
  "/customers/:id",
  requirePermission(Permissions.CUSTOMER_WRITE),
  async (c) => {
    const id = parseUuid(c.req.param("id"), "Invalid customer id");
    const body = parseBody(updateCustomerSchema, await c.req.json());
    const [updated] = await db.update(customers).set(body).where(eq(customers.id, id)).returning();
    if (!updated) throw new NotFoundError("Customer not found");
    return success(c, updated);
  }
);

salesRoutes.delete(
  "/customers/:id",
  requirePermission(Permissions.CUSTOMER_WRITE),
  async (c) => {
    const id = parseUuid(c.req.param("id"), "Invalid customer id");
    const [deleted] = await db.delete(customers).where(eq(customers.id, id)).returning();
    if (!deleted) throw new NotFoundError("Customer not found");
    return success(c, { id });
  }
);

/** ---------------- Items ---------------- */
salesRoutes.get(
  "/items",
  requirePermission(Permissions.ITEM_READ),
  async (c) => {
    const rows = await db.select().from(items);
    return success(c, rows);
  }
);

salesRoutes.post(
  "/items",
  requirePermission(Permissions.ITEM_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const body = parseBody(createItemSchema, await c.req.json());
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
    const id = parseUuid(c.req.param("id"), "Invalid item id");
    const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);
    if (rows.length === 0) throw new NotFoundError("Item not found");
    return success(c, rows[0]);
  }
);

salesRoutes.put(
  "/items/:id",
  requirePermission(Permissions.ITEM_WRITE),
  async (c) => {
    const id = parseUuid(c.req.param("id"), "Invalid item id");
    const body = parseBody(updateItemSchema, await c.req.json());
    const payload: any = { ...body };
    if (payload.unitPrice !== undefined) payload.unitPrice = String(payload.unitPrice);

    const [updated] = await db.update(items).set(payload).where(eq(items.id, id)).returning();
    if (!updated) throw new NotFoundError("Item not found");
    return success(c, updated);
  }
);

salesRoutes.delete(
  "/items/:id",
  requirePermission(Permissions.ITEM_WRITE),
  async (c) => {
    const id = parseUuid(c.req.param("id"), "Invalid item id");
    const [deleted] = await db.delete(items).where(eq(items.id, id)).returning();
    if (!deleted) throw new NotFoundError("Item not found");
    return success(c, { id });
  }
);

/** ---------------- Invoices (MVP) ----------------
 * For now:
 * - create invoice calculates totals
 * - stores invoice + invoice items
 * - payments update totals later
 */
salesRoutes.get(
  "/invoices",
  requirePermission(Permissions.INVOICE_READ),
  async (c) => {
    const rows = await db.select().from(invoices);
    return success(c, rows);
  }
);

salesRoutes.post(
  "/invoices",
  requirePermission(Permissions.INVOICE_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const body = parseBody(createInvoiceSchema, await c.req.json());

    const customerRows = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.id, body.customerId))
      .limit(1);

    if (customerRows.length === 0) {
      throw new NotFoundError("Customer not found");
    }

    // Load items to get default unit prices
    const itemIds = body.items.map((i: any) => i.itemId);
    const dbItems = await db
      .select()
      .from(items)
      .where(inArray(items.id, itemIds));

    const itemsById = new Map(dbItems.map((i: any) => [i.id, i]));
    let subtotal = 0;

    const computedLines = body.items.map((line: any) => {
      const item = itemsById.get(line.itemId);
      if (!item) throw new NotFoundError(`Item not found: ${line.itemId}`);

      const unitPrice = line.unitPrice ?? Number(item.unitPrice);
      const lineTotal = unitPrice * line.quantity;
      subtotal += lineTotal;

      return {
        itemId: line.itemId,
        quantity: line.quantity,
        unitPrice,
        lineTotal,
      };
    });

    const [inv] = await db
      .insert(invoices)
      .values({
        customerId: body.customerId,
        status: "DRAFT",
        dueDate: body.dueDate,
        notes: body.notes,
        subtotal: String(subtotal),
        totalPaid: "0",
        balance: String(subtotal),
        createdBy: auth.userId,
      })
      .returning();

    // insert invoice items
    for (const line of computedLines) {
      await db.insert(invoiceItems).values({
        invoiceId: inv.id,
        itemId: line.itemId,
        quantity: line.quantity,
        unitPrice: String(line.unitPrice),
        lineTotal: String(line.lineTotal),
      });
    }

    return success(c, inv, 201);
  }
);

salesRoutes.get(
  "/invoices/:id",
  requirePermission(Permissions.INVOICE_READ),
  async (c) => {
    const id = parseUuid(c.req.param("id"), "Invalid invoice id");

    const inv = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    if (inv.length === 0) throw new NotFoundError("Invoice not found");

    const lines = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    const pays = await db.select().from(payments).where(eq(payments.invoiceId, id));

    return success(c, { invoice: inv[0], items: lines, payments: pays });
  }
);

salesRoutes.post(
  "/invoices/:id/issue",
  requirePermission(Permissions.INVOICE_WRITE),
  async (c) => {
    const id = parseUuid(c.req.param("id"), "Invalid invoice id");
    const [updated] = await db
      .update(invoices)
      .set({ status: "ISSUED", issueDate: new Date().toISOString().slice(0, 10) })
      .where(eq(invoices.id, id))
      .returning();

    if (!updated) throw new NotFoundError("Invoice not found");
    return success(c, updated);
  }
);

salesRoutes.post(
  "/invoices/:id/payments",
  requirePermission(Permissions.PAYMENT_WRITE),
  async (c) => {
    const auth = c.get("auth");
    const invoiceId = parseUuid(c.req.param("id"), "Invalid invoice id");
    const body = parseBody(createPaymentSchema, await c.req.json());

    const inv = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
    if (inv.length === 0) throw new NotFoundError("Invoice not found");

    const [pay] = await db
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

    // Update totals (simple calc)
    const pays = await db.select().from(payments).where(eq(payments.invoiceId, invoiceId));
    const totalPaid = pays.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    const subtotal = Number(inv[0].subtotal);
    const balance = Math.max(0, subtotal - totalPaid);

    const status = balance === 0 ? "PAID" : inv[0].status;

    await db
      .update(invoices)
      .set({ totalPaid: String(totalPaid), balance: String(balance), status })
      .where(eq(invoices.id, invoiceId));

    return success(c, pay, 201);
  }
);
