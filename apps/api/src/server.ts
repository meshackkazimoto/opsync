import { Hono } from "hono";
import { meRoute } from "./routes/me.route";
import authRoute from "./routes/auth.route";

const app = new Hono();

app.route("/auth", authRoute);
app.route("/", meRoute);

export default app;