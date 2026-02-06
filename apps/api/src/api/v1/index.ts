import { Hono } from "hono";
import { authRoutes } from "./auth";
import { employeeRoutes } from "./employees";
import { salesRoutes } from "./sales";
import { purchasingRoutes } from "./purchasing";
import { expensesRoutes } from "./expenses";
import { reportsRoutes } from "./reports";

const v1 = new Hono();

v1.route("/auth", authRoutes);
v1.route("/employees", employeeRoutes);
v1.route("/sales", salesRoutes);
v1.route("/purchasing", purchasingRoutes);
v1.route("/expenses", expensesRoutes);
v1.route("/reports", reportsRoutes);

export { v1 as v1Routes };
