import { z } from "zod";

export const expensesFilterSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
});

export type ExpensesFilterSchema = z.infer<typeof expensesFilterSchema>;
