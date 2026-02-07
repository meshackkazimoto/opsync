import { seedEmployees } from "./employees.seed";
import { seedRoles } from "./roles.seed";
import { seedAdminUser } from "./users.seed";
import { seedSales } from "./sales.seed";
import { seedPurchasing } from "./purchasing.seed";
import { seedExpenses } from "./expenses.seed";
// import { seedReferenceData } from "./reference.seed";

async function runSeed() {
  console.log("🌱 Seeding database...");

  await seedEmployees();
  await seedRoles();
  await seedAdminUser();
  await seedSales();
  await seedPurchasing();
  await seedExpenses();
  // await seedReferenceData();

  console.log("✅ Database seeding complete");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("❌ Seeding failed", err);
  process.exit(1);
});
