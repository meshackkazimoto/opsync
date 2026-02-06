import { Hono } from "hono";
import { success } from "../../http/response";

export const expensesRoutes = new Hono();

expensesRoutes.get("/", (c) => success(c, { message: "Expenses module not implemented" }));
