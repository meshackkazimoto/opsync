import { randomUUID } from "crypto";
import { db } from "../index";
import { employees, users } from "../schema";
import { eq } from "drizzle-orm";

export async function seedEmployees() {
  console.log("🌱 Seeding employees...");

  // 1️⃣ Get admin user (creator)
  const admin = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(eq(users.email, "admin@opsync.local"))
    .limit(1);

  if (admin.length === 0) {
    throw new Error("Admin user not found. Seed users first.");
  }

  const adminId = admin[0].id;

  // 2️⃣ Employee seed data
  const employeeData = [
    {
      id: randomUUID(),
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@opsync.local",
      phone: "+255700000001",
      position: "HR Officer",
      department: "Human Resources",
      createdBy: adminId,
    },
    {
      id: randomUUID(),
      firstName: "Mary",
      lastName: "Smith",
      email: "mary.smith@opsync.local",
      phone: "+255700000002",
      position: "Sales Executive",
      department: "Sales",
      createdBy: adminId,
    },
    {
      id: randomUUID(),
      firstName: "Peter",
      lastName: "Mwanga",
      email: "peter.mwanga@opsync.local",
      phone: "+255700000003",
      position: "Procurement Officer",
      department: "Procurement",
      createdBy: adminId,
    },
    {
      id: randomUUID(),
      firstName: "Asha",
      lastName: "Kassim",
      email: "asha.kassim@opsync.local",
      phone: "+255700000004",
      position: "Accountant",
      department: "Finance",
      createdBy: adminId,
    },
  ];

  // 3️⃣ Insert employees
  for (const employee of employeeData) {
    await db
      .insert(employees)
      .values(employee)
      .onConflictDoNothing();
  }

  console.log("✅ Employees seeded successfully");
}