import { Hono } from "hono";
import { v1Routes } from "./api/v1";

const app = new Hono();

app.route("/api/v1", v1Routes);

export default app;