export type CreateEmployeeRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
};

export type UpdateEmployeeRequest = Partial<CreateEmployeeRequest>;

export type EmployeeResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  position: string;
  department: string;
  createdAt: Date;
};