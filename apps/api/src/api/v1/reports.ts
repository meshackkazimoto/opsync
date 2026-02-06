import { Hono } from "hono";
import { success } from "../../http/response";

export const reportsRoutes = new Hono();

reportsRoutes.get("/", (c) => success(c, { message: "Reports module not implemented" }));
