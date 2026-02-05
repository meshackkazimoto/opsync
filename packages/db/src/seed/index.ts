import { seedEmployees } from "./employees.seed";
import { seedRoles } from "./roles.seed";
import { seedAdminUser } from "./users.seed";
// import { seedReferenceData } from "./reference.seed";

async function runSeed() {
  console.log("🌱 Seeding database...");

  await seedEmployees();
  await seedRoles();
  await seedAdminUser();
  // await seedReferenceData();

  console.log("✅ Database seeding complete");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("❌ Seeding failed", err);
  process.exit(1);
});