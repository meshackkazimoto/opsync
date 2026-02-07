import { z } from "zod";

export const employeeRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
});

export type EmployeeRoleSchema = z.infer<typeof employeeRoleSchema>;

export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
});

export type DepartmentSchema = z.infer<typeof departmentSchema>;
