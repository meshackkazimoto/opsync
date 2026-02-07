import { z } from "zod";

export const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.string().min(1, "Role is required"),
  department: z.string().min(1, "Department is required"),
  status: z.enum(["active", "inactive", "on_leave"]),
  phone: z.string().optional(),
  hireDate: z.string().optional(),
});

export type EmployeeSchema = z.infer<typeof employeeSchema>;
