import { db } from "src";
import { roles } from "src/schema";

export async function seedRoles() {
  const data = [
    { name: "ADMIN" },
    { name: "HR" },
    { name: "SALES" },
    { name: "PROCUREMENT" },
    { name: "VIEWER" },
  ];

  await db.insert(roles)
    .values(data)
    .onConflictDoNothing();

  console.log("✅ Roles seeded");
}