export type EmployeeStatus = "active" | "inactive" | "on_leave";

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: EmployeeStatus;
  phone?: string;
  hireDate?: string;
};

export type EmployeeCreateInput = Omit<Employee, "id">;
export type EmployeeUpdateInput = Partial<EmployeeCreateInput>;
