import { Hono } from "hono";
import { and, desc, eq, gte, inArray, lt, lte, sql } from "drizzle-orm";

import type { AuthVariables } from "../../middleware/jwt";
import { jwtMiddleware } from "../../middleware/jwt";
import { requirePermission } from "../../middleware/permission";
import { Permissions } from "@opsync/config";

import { db } from "../../db/client";
import { success } from "../../http/response";
import { ValidationError } from "../../http/errors";

import {
  employees,
  customers,
  invoices,
  payments,
  expenses,
  expenseCategories,
} from "@opsync/db/schema";

function parseDateParam(value: string, message: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ValidationError(message);
  }
  return value;
}

function getDefaultMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export const reportsRoutes = new Hono<{ Variables: AuthVariables }>();

reportsRoutes.use(jwtMiddleware);

reportsRoutes.get(
  "/overview",
  requirePermission(Permissions.REPORT_READ),
  async (c) => {
    const { start, end } = getDefaultMonthRange();

    const [{ count: employeesCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees);

    const [{ count: customersCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers);

    const [{ count: invoicesOutstandingCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(inArray(invoices.status, ["ISSUED", "PARTIALLY_PAID"]));

    const [{ total: salesThisMonth }] = await db
      .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)` })
      .from(payments)
      .where(and(gte(payments.paidAt, start), lt(payments.paidAt, end)));

    const [{ total: expensesThisMonth }] = await db
      .select({ total: sql<number>`coalesce(sum(${expenses.amount}), 0)` })
      .from(expenses)
      .where(and(gte(expenses.expenseDate, start), lt(expenses.expenseDate, end)));

    return success(c, {
      employeesCount: Number(employeesCount ?? 0),
      customersCount: Number(customersCount ?? 0),
      invoicesOutstandingCount: Number(invoicesOutstandingCount ?? 0),
      salesThisMonth: Number(salesThisMonth ?? 0),
      expensesThisMonth: Number(expensesThisMonth ?? 0),
    });
  }
);

reportsRoutes.get(
  "/sales",
  requirePermission(Permissions.REPORT_READ),
  async (c) => {
    const dateFrom = c.req.query("dateFrom");
    const dateTo = c.req.query("dateTo");

    let start = "";
    let end = "";
    let endInclusive = false;

    if (dateFrom || dateTo) {
      if (!dateFrom || !dateTo) {
        throw new ValidationError("dateFrom and dateTo are required together");
      }
      start = parseDateParam(dateFrom, "Invalid dateFrom");
      end = parseDateParam(dateTo, "Invalid dateTo");
      endInclusive = true;
      if (start > end) {
        throw new ValidationError("dateFrom must be before dateTo");
      }
    } else {
      const range = getDefaultMonthRange();
      start = range.start;
      end = range.end;
      endInclusive = false;
    }

    const dateFilter = endInclusive
      ? and(gte(invoices.issueDate, start), lte(invoices.issueDate, end))
      : and(gte(invoices.issueDate, start), lt(invoices.issueDate, end));

    const [{ count: invoicesIssued }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(
        and(
          dateFilter,
          inArray(invoices.status, ["ISSUED", "PARTIALLY_PAID", "PAID"])
        )
      );

    const paymentsDateFilter = endInclusive
      ? and(gte(payments.paidAt, start), lte(payments.paidAt, end))
      : and(gte(payments.paidAt, start), lt(payments.paidAt, end));

    const [{ total: revenueCollected }] = await db
      .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)` })
      .from(payments)
      .where(paymentsDateFilter);

    const totalPaidExpr = sql<number>`coalesce(sum(${payments.amount}), 0)`;

    const topCustomers = await db
      .select({
        customerId: customers.id,
        customerName: customers.name,
        totalPaid: totalPaidExpr,
      })
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(paymentsDateFilter)
      .groupBy(customers.id, customers.name)
      .orderBy(desc(totalPaidExpr))
      .limit(5);

    return success(c, {
      invoicesIssued: Number(invoicesIssued ?? 0),
      revenueCollected: Number(revenueCollected ?? 0),
      topCustomers,
    });
  }
);

reportsRoutes.get(
  "/expenses",
  requirePermission(Permissions.REPORT_READ),
  async (c) => {
    const dateFrom = c.req.query("dateFrom");
    const dateTo = c.req.query("dateTo");

    let start = "";
    let end = "";
    let endInclusive = false;

    if (dateFrom || dateTo) {
      if (!dateFrom || !dateTo) {
        throw new ValidationError("dateFrom and dateTo are required together");
      }
      start = parseDateParam(dateFrom, "Invalid dateFrom");
      end = parseDateParam(dateTo, "Invalid dateTo");
      endInclusive = true;
      if (start > end) {
        throw new ValidationError("dateFrom must be before dateTo");
      }
    } else {
      const range = getDefaultMonthRange();
      start = range.start;
      end = range.end;
      endInclusive = false;
    }

    const dateFilter = endInclusive
      ? and(gte(expenses.expenseDate, start), lte(expenses.expenseDate, end))
      : and(gte(expenses.expenseDate, start), lt(expenses.expenseDate, end));

    const totalExpr = sql<number>`coalesce(sum(${expenses.amount}), 0)`;

    const totalsByCategory = await db
      .select({
        categoryId: expenseCategories.id,
        categoryName: expenseCategories.name,
        total: totalExpr,
      })
      .from(expenses)
      .innerJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(dateFilter)
      .groupBy(expenseCategories.id, expenseCategories.name)
      .orderBy(desc(totalExpr));

    return success(c, { totalsByCategory });
  }
);
