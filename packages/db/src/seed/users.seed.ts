import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { userRoles, users } from "src/schema";
import { db } from "src";

export async function seedAdminUser() {
  const adminId = randomUUID();

  const passwordHash = await bcrypt.hash("admin123", 10);

  await db.insert(users)
    .values({
      id: adminId,
      email: "admin@opsync.local",
      passwordHash,
    })
    .onConflictDoNothing();

  await db.insert(userRoles)
    .values({
      userId: adminId,
      roleName: "ADMIN",
    })
    .onConflictDoNothing();

  console.log("Admin user seeded");
}