import { randomUUID } from "crypto";
import { db } from "../index";
import {
  customers,
  items,
  invoices,
  invoiceItems,
  payments,
  users,
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

export async function seedSales() {
  console.log("🌱 Seeding sales data...");

  const adminId = await getAdminId();

  const customerData = [
    {
      id: randomUUID(),
      name: "Acme Corp",
      email: "billing@acme.local",
      phone: "+255700100001",
      address: "Dar es Salaam",
      createdBy: adminId,
    },
    {
      id: randomUUID(),
      name: "BlueWave Logistics",
      email: "finance@bluewave.local",
      phone: "+255700100002",
      address: "Arusha",
      createdBy: adminId,
    },
    {
      id: randomUUID(),
      name: "Kilimanjaro Traders",
      email: "accounts@kili.local",
      phone: "+255700100003",
      address: "Moshi",
      createdBy: adminId,
    },
    {
      id: randomUUID(),
      name: "Nile Tech",
      email: "payments@nile.local",
      phone: "+255700100004",
      address: "Dodoma",
      createdBy: adminId,
    },
    {
      id: randomUUID(),
      name: "Savannah Hotels",
      email: "accounts@savannah.local",
      phone: "+255700100005",
      address: "Zanzibar",
      createdBy: adminId,
    },
  ];

  const existingCustomers = await db
    .select({ email: customers.email })
    .from(customers)
    .where(inArray(customers.email, customerData.map((c) => c.email)));

  const existingEmails = new Set(
    existingCustomers.map((row) => row.email).filter((email): email is string => !!email)
  );

  const customersToInsert = customerData.filter((c) => !existingEmails.has(c.email));
  if (customersToInsert.length > 0) {
    await db.insert(customers).values(customersToInsert).onConflictDoNothing();
  }

  const itemData = [
    { name: "Consulting Hours", sku: "SERV-001", unitPrice: "150.00", isService: true },
    { name: "Implementation Package", sku: "SERV-002", unitPrice: "1200.00", isService: true },
    { name: "Support Retainer", sku: "SERV-003", unitPrice: "500.00", isService: true },
    { name: "Laptop", sku: "PROD-001", unitPrice: "900.00", isService: false },
    { name: "Printer", sku: "PROD-002", unitPrice: "350.00", isService: false },
    { name: "Office Chair", sku: "PROD-003", unitPrice: "120.00", isService: false },
    { name: "Networking Kit", sku: "PROD-004", unitPrice: "450.00", isService: false },
    { name: "Software License", sku: "PROD-005", unitPrice: "250.00", isService: false },
    { name: "Security Audit", sku: "SERV-004", unitPrice: "800.00", isService: true },
    { name: "Training Session", sku: "SERV-005", unitPrice: "300.00", isService: true },
  ];

  const existingItems = await db
    .select({ sku: items.sku })
    .from(items)
    .where(inArray(items.sku, itemData.map((i) => i.sku)));

  const existingSkus = new Set(
    existingItems.map((row) => row.sku).filter((sku): sku is string => !!sku)
  );

  const itemsToInsert = itemData
    .filter((i) => !existingSkus.has(i.sku))
    .map((i) => ({
      id: randomUUID(),
      ...i,
      createdBy: adminId,
    }));

  if (itemsToInsert.length > 0) {
    await db.insert(items).values(itemsToInsert).onConflictDoNothing();
  }

  const allCustomers = await db.select().from(customers).limit(5);
  const allItems = await db.select().from(items).limit(10);

  if (allCustomers.length === 0 || allItems.length === 0) {
    console.log("⚠️ Skipping invoice seeds due to missing customers/items");
    return;
  }

  const [customerA, customerB, customerC] = allCustomers;
  const [itemA, itemB, itemC] = allItems;

  const invoiceSeeds = [
    {
      invoiceNumber: "INV-2026-000001",
      status: "DRAFT" as const,
      customerId: customerA.id,
      issueDate: null,
      dueDate: "2026-02-20",
      notes: "Draft invoice for February",
      lines: [
        { itemId: itemA.id, quantity: 2, unitPrice: Number(itemA.unitPrice) },
        { itemId: itemB.id, quantity: 1, unitPrice: Number(itemB.unitPrice) },
      ],
    },
    {
      invoiceNumber: "INV-2026-000002",
      status: "ISSUED" as const,
      customerId: customerB.id,
      issueDate: "2026-02-05",
      dueDate: "2026-02-25",
      notes: "Issued invoice",
      lines: [
        { itemId: itemA.id, quantity: 1, unitPrice: Number(itemA.unitPrice) },
        { itemId: itemC.id, quantity: 3, unitPrice: Number(itemC.unitPrice) },
      ],
    },
    {
      invoiceNumber: "INV-2026-000003",
      status: "PARTIALLY_PAID" as const,
      customerId: customerC.id,
      issueDate: "2026-02-03",
      dueDate: "2026-02-18",
      notes: "Partially paid invoice",
      lines: [
        { itemId: itemB.id, quantity: 2, unitPrice: Number(itemB.unitPrice) },
      ],
      payment: {
        amount: 200,
        method: "CASH" as const,
        paidAt: "2026-02-06",
        reference: "PAY-0001",
      },
    },
  ];

  for (const seed of invoiceSeeds) {
    const existingInvoice = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(eq(invoices.invoiceNumber, seed.invoiceNumber))
      .limit(1);

    if (existingInvoice.length > 0) {
      continue;
    }

    let subtotal = 0;
    const computedLines = seed.lines.map((line) => {
      const lineTotal = line.unitPrice * line.quantity;
      subtotal += lineTotal;
      return { ...line, lineTotal };
    });

    let totalPaid = 0;
    if (seed.payment) {
      totalPaid = seed.payment.amount;
    }

    const balance = Math.max(0, subtotal - totalPaid);

    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber: seed.invoiceNumber,
        customerId: seed.customerId,
        status: seed.status,
        issueDate: seed.issueDate ?? undefined,
        dueDate: seed.dueDate,
        notes: seed.notes,
        subtotal: String(subtotal),
        totalPaid: String(totalPaid),
        balance: String(balance),
        createdBy: adminId,
      })
      .returning();

    await db
      .insert(invoiceItems)
      .values(
        computedLines.map((line) => ({
          id: randomUUID(),
          invoiceId: invoice.id,
          itemId: line.itemId,
          quantity: line.quantity,
          unitPrice: String(line.unitPrice),
          lineTotal: String(line.lineTotal),
        }))
      )
      .onConflictDoNothing();

    if (seed.payment) {
      await db
        .insert(payments)
        .values({
          id: randomUUID(),
          invoiceId: invoice.id,
          amount: String(seed.payment.amount),
          method: seed.payment.method,
          paidAt: seed.payment.paidAt,
          reference: seed.payment.reference,
          createdBy: adminId,
        })
        .onConflictDoNothing();
    }
  }

  await db.execute(sql`\n    select setval(\n      'invoice_number_seq',\n      (\n        select greatest(\n          coalesce(max(split_part(invoice_number, '-', 3)::int), 0),\n          3\n        )\n        from invoices\n      ),\n      true\n    )\n  `);

  console.log("✅ Sales data seeded");
}
