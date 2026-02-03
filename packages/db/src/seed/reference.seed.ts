import { db } from "src";
import { expenses } from "src/schema";

export async function seedReferenceData() {
  const categories = [
    "Office Supplies",
    "Transport",
    "Utilities",
    "Internet",
    "Maintenance",
  ];

  for (const category of categories) {
    await db.insert(expenses)
      .values({
        category,
        description: "Default category",
        amount: "0",
        expenseDate: new Date(),
        createdBy: "00000000-0000-0000-0000-000000000000"
      })
      .onConflictDoNothing();
  }

  console.log("Reference data seeded");
}