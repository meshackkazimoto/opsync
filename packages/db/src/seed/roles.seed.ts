import { db } from "src";
import { roles } from "src/schema";

export async function seedRoles() {
  const data = [
    "ADMIN",
     "HR" ,
    "SALES" ,
    "PROCUREMENT",
    "VIEWER" 
  ];

  await db.insert(roles)
    .values(data as [])
    .onConflictDoNothing();

  console.log("✅ Roles seeded");
}