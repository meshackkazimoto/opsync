import { Hono } from "hono";
import { authRoutes } from "./auth/auth.routes";
import { employeeRoutes } from "./employees/employee.routes";

export const v1Routes = new Hono();

v1Routes.route("/auth", authRoutes);
v1Routes.route("/employees", employeeRoutes);