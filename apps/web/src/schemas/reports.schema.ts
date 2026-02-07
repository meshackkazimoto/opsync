import { z } from "zod";

export const reportsFilterSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  department: z.string().optional(),
});

export type ReportsFilterSchema = z.infer<typeof reportsFilterSchema>;
