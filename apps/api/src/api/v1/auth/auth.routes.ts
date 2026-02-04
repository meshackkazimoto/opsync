import { Hono } from "hono";
import { loginController, refreshController } from "./auth.controller";

export const authRoutes = new Hono();

authRoutes.post("/login", loginController);
authRoutes.post("/refresh", refreshController);