import { Hono } from "hono";
import { jwtMiddleware } from "../../../middleware/jwt.middleware";
import { requirePermission } from "../../../middleware/permission.middleware";
import { Permissions } from "../../../common/permissions";
import { listEmployeesController, } from "./employee.controller";

export const employeeRoutes = new Hono();

employeeRoutes.use(jwtMiddleware);

employeeRoutes.get("/", requirePermission(Permissions.EMPLOYEE_READ), listEmployeesController);