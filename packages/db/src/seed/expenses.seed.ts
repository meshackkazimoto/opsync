import { randomUUID } from "crypto";
import { db } from "../index";
import {
  expenseCategories,
  expenses,
  users,
  employees,
  suppliers,
} from "../schema";
import { eq, inArray, sql } from "drizzle-orm";

async function getAdminId() {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "admin@opsync.local"))
    .limit(1);

  if (rows.length === 0) {
    throw new Error("Admin user not found. Seed users first.");
  }

  return rows[0].id;
}

export async function seedExpenses() {
  console.log("🌱 Seeding expenses data...");

  const adminId = await getAdminId();

  const categoryData = [
    { name: "Office Supplies", description: "Stationery and consumables" },
    { name: "Transport", description: "Travel and logistics" },
    { name: "Utilities", description: "Electricity and water" },
    { name: "Internet", description: "Connectivity and ISP" },
    { name: "Maintenance", description: "Repairs and upkeep" },
  ];

  const existingCategories = await db
    .select({ name: expenseCategories.name })
    .from(expenseCategories)
    .where(inArray(expenseCategories.name, categoryData.map((c) => c.name)));

  const existingNames = new Set(
    existingCategories.map((row) => row.name).filter((name): name is string => !!name)
  );

  const categoriesToInsert = categoryData
    .filter((c) => !existingNames.has(c.name))
    .map((c) => ({
      id: randomUUID(),
      ...c,
      createdBy: adminId,
    }));

  if (categoriesToInsert.length > 0) {
    await db
      .insert(expenseCategories)
      .values(categoriesToInsert)
      .onConflictDoNothing();
  }

  const categoryRows = await db.select().from(expenseCategories);
  const categoryMap = new Map(categoryRows.map((c) => [c.name, c.id]));

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(expenses);

  if (Number(count ?? 0) > 0) {
    console.log("✅ Expenses already seeded");
    return;
  }

  const supplierRows = await db.select({ id: suppliers.id }).from(suppliers).limit(2);
  const employeeRows = await db.select({ id: employees.id }).from(employees).limit(2);

  const supplierId = supplierRows[0]?.id;
  const employeeId = employeeRows[0]?.id;

  const expenseData = [
    { category: "Office Supplies", amount: 120.5, date: "2026-02-01", description: "Printer paper" },
    { category: "Transport", amount: 45, date: "2026-02-02", description: "Client visit taxi" },
    { category: "Utilities", amount: 310, date: "2026-02-02", description: "Electricity bill" },
    { category: "Internet", amount: 95, date: "2026-02-03", description: "ISP invoice" },
    { category: "Maintenance", amount: 220, date: "2026-02-03", description: "AC servicing" },
    { category: "Office Supplies", amount: 60, date: "2026-02-04", description: "Notebooks" },
    { category: "Transport", amount: 30, date: "2026-02-04", description: "Delivery run" },
    { category: "Utilities", amount: 280, date: "2026-02-05", description: "Water bill" },
    { category: "Internet", amount: 100, date: "2026-02-05", description: "Backup link" },
    { category: "Maintenance", amount: 75, date: "2026-02-06", description: "Cleaning service" },
    { category: "Office Supplies", amount: 42, date: "2026-02-06", description: "Marker pens" },
    { category: "Transport", amount: 55, date: "2026-02-07", description: "Warehouse trip" },
    { category: "Utilities", amount: 190, date: "2026-02-07", description: "Generator fuel" },
    { category: "Internet", amount: 88, date: "2026-02-07", description: "Domain renewal" },
    { category: "Maintenance", amount: 160, date: "2026-02-07", description: "Security checks" },
  ];

  const records = expenseData.map((e) => ({
    id: randomUUID(),
    categoryId: categoryMap.get(e.category)!,
    amount: String(e.amount),
    expenseDate: e.date,
    description: e.description,
    supplierId,
    employeeId,
    createdBy: adminId,
  }));

  await db.insert(expenses).values(records).onConflictDoNothing();

  console.log("✅ Expenses seeded");
}
