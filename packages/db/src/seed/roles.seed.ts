import { db } from "src";
import { roles } from "src/schema";

export async function seedRoles() {
  const data = [
    "ADMIN",
    "HR",
    "SALES",
    "PROCUREMENT",
    "VIEWER",
  ];

  const records = data.map((name) => ({ name }));

  await db
    .insert(roles)
    .values(records)
    .onConflictDoNothing();

  console.log("✅ Roles seeded");
}
