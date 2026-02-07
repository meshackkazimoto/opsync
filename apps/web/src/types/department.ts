export type Department = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  createdBy?: string;
};

export type DepartmentCreateInput = Pick<Department, "name" | "description">;
export type DepartmentUpdateInput = Partial<DepartmentCreateInput>;
