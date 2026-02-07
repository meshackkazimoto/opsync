export type EmployeeRole = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  createdBy?: string;
};

export type EmployeeRoleCreateInput = Pick<EmployeeRole, "name" | "description">;
export type EmployeeRoleUpdateInput = Partial<EmployeeRoleCreateInput>;
