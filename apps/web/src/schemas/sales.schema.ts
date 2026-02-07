import { z } from "zod";

export const salesFilterSchema = z.object({
  query: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type SalesFilterSchema = z.infer<typeof salesFilterSchema>;
