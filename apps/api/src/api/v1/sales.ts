import { Hono } from "hono";
import { success } from "../../http/response";

export const salesRoutes = new Hono();

salesRoutes.get("/", (c) => success(c, { message: "Sales module not implemented" }));
