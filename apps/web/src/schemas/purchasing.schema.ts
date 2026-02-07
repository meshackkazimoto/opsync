import { z } from "zod";

export const purchasingFilterSchema = z.object({
  query: z.string().optional(),
  status: z.string().optional(),
});

export type PurchasingFilterSchema = z.infer<typeof purchasingFilterSchema>;
