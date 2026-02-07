import { randomUUID } from "crypto";
import { db } from "../index";
import {
  suppliers,
  purchaseOrders,
  purchaseOrderItems,
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

export async function seedPurchasing() {
  console.log("🌱 Seeding purchasing data...");

  const adminId = await getAdminId();

  const supplierData = [
    {
      id: randomUUID(),
      name: "Global Supplies Ltd",
      email: "sales@globalsupplies.local",
      phone: "+255700200001",
      address: "Dar es Salaam",
      createdBy: adminId,
    },
    {
      id: randomUUID(),
      name: "Metro Office World",
      email: "info@metrooffice.local",
      phone: "+255700200002",
      address: "Arusha",
      createdBy: adminId,
    },
    {
      id: randomUUID(),
      name: "Evergreen Traders",
      email: "support@evergreen.local",
      phone: "+255700200003",
      address: "Dodoma",
      createdBy: adminId,
    },
    {
      id: randomUUID(),
      name: "Peak Hardware",
      email: "hello@peakhardware.local",
      phone: "+255700200004",
      address: "Moshi",
      createdBy: adminId,
    },
    {
      id: randomUUID(),
      name: "Sunrise Logistics",
      email: "contact@sunrise.local",
      phone: "+255700200005",
      address: "Zanzibar",
      createdBy: adminId,
    },
  ];

  const existingSuppliers = await db
    .select({ email: suppliers.email })
    .from(suppliers)
    .where(inArray(suppliers.email, supplierData.map((s) => s.email)));

  const existingEmails = new Set(
    existingSuppliers.map((row) => row.email).filter((email): email is string => !!email)
  );

  const suppliersToInsert = supplierData.filter((s) => !existingEmails.has(s.email));
  if (suppliersToInsert.length > 0) {
    await db.insert(suppliers).values(suppliersToInsert).onConflictDoNothing();
  }

  const supplierRows = await db.select().from(suppliers).limit(3);
  if (supplierRows.length === 0) {
    console.log("⚠️ Skipping purchase order seeds due to missing suppliers");
    return;
  }

  const [supplierA, supplierB, supplierC] = supplierRows;

  const orderSeeds = [
    {
      orderNumber: "PO-2026-000001",
      supplierId: supplierA.id,
      status: "DRAFT" as const,
      orderDate: "2026-02-05",
      notes: "Office equipment order",
      items: [
        { itemName: "Desk", quantity: 5, unitPrice: 150 },
        { itemName: "Chair", quantity: 10, unitPrice: 75 },
      ],
    },
    {
      orderNumber: "PO-2026-000002",
      supplierId: supplierB.id,
      status: "APPROVED" as const,
      orderDate: "2026-02-03",
      notes: "Networking upgrades",
      items: [
        { itemName: "Router", quantity: 3, unitPrice: 220 },
        { itemName: "Switch", quantity: 2, unitPrice: 310 },
      ],
    },
    {
      orderNumber: "PO-2026-000003",
      supplierId: supplierC.id,
      status: "RECEIVED" as const,
      orderDate: "2026-01-28",
      receivedDate: "2026-02-02",
      notes: "Stationery bulk order",
      items: [
        { itemName: "Paper Reams", quantity: 20, unitPrice: 6 },
        { itemName: "Ink Cartridges", quantity: 8, unitPrice: 25 },
      ],
    },
  ];

  for (const seed of orderSeeds) {
    const existingOrder = await db
      .select({ id: purchaseOrders.id })
      .from(purchaseOrders)
      .where(eq(purchaseOrders.orderNumber, seed.orderNumber))
      .limit(1);

    if (existingOrder.length > 0) {
      continue;
    }

    let subtotal = 0;
    const computedLines = seed.items.map((line) => {
      const lineTotal = line.unitPrice * line.quantity;
      subtotal += lineTotal;
      return { ...line, lineTotal };
    });

    const [order] = await db
      .insert(purchaseOrders)
      .values({
        orderNumber: seed.orderNumber,
        supplierId: seed.supplierId,
        status: seed.status,
        orderDate: seed.orderDate,
        receivedDate: seed.receivedDate,
        notes: seed.notes,
        subtotal: String(subtotal),
        total: String(subtotal),
        createdBy: adminId,
      })
      .returning();

    await db
      .insert(purchaseOrderItems)
      .values(
        computedLines.map((line) => ({
          id: randomUUID(),
          purchaseOrderId: order.id,
          itemName: line.itemName,
          quantity: line.quantity,
          unitPrice: String(line.unitPrice),
          lineTotal: String(line.lineTotal),
        }))
      )
      .onConflictDoNothing();
  }

  await db.execute(sql`
    select setval(
      'purchase_order_number_seq',
      (
        select greatest(
          coalesce(max(split_part(order_number, '-', 3)::int), 0),
          3
        )
        from purchase_orders
      ),
      true
    )
  `);

  console.log("✅ Purchasing data seeded");
}
