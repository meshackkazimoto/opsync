export const Roles = {
  ADMIN: "ADMIN",
  HR: "HR",
  SALES: "SALES",
  PROCUREMENT: "PROCUREMENT",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
