import { z } from "zod";
import { uuidSchema } from "./common";
import { moneySchema } from "./sales";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const createExpenseCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const updateExpenseCategorySchema = createExpenseCategorySchema.partial();

export const createExpenseSchema = z.object({
  categoryId: uuidSchema,
  amount: moneySchema.positive(),
  expenseDate: dateSchema,
  description: z.string().min(1),
  supplierId: uuidSchema.optional(),
  employeeId: uuidSchema.optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
