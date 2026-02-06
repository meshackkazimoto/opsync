import { z } from "zod";

const statusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(3).optional(),
  position: z.string().min(1),
  department: z.string().min(1),
  employmentDate: z.coerce.date().optional(),
  status: statusSchema.optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
