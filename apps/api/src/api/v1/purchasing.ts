import { Hono } from "hono";
import { success } from "../../http/response";

export const purchasingRoutes = new Hono();

purchasingRoutes.get("/", (c) =>
  success(c, { message: "Purchasing module not implemented" })
);
