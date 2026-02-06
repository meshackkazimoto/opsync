import { Hono } from "hono";
import {
  listEmployeesController,
  getEmployeeController,
  createEmployeeController,
  updateEmployeeController,
  deleteEmployeeController,
} from "./employee.controller";
import { jwtMiddleware } from "src/middleware/jwt.middleware";
import { Permissions } from "src/common/permissions";
import { requirePermission } from "src/middleware/permission.middleware";

export const employeeRoutes = new Hono();

employeeRoutes.use(jwtMiddleware);

employeeRoutes.get(
  "/",
  requirePermission(Permissions.EMPLOYEE_READ),
  listEmployeesController
);

employeeRoutes.get(
  "/:id",
  requirePermission(Permissions.EMPLOYEE_READ),
  getEmployeeController
);

employeeRoutes.post(
  "/",
  requirePermission(Permissions.EMPLOYEE_WRITE),
  createEmployeeController
);

employeeRoutes.put(
  "/:id",
  requirePermission(Permissions.EMPLOYEE_WRITE),
  updateEmployeeController
);

employeeRoutes.delete(
  "/:id",
  requirePermission(Permissions.EMPLOYEE_WRITE),
  deleteEmployeeController
);