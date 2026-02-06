import { Hono } from "hono";
import { v1Routes } from "./api/v1";
import { errorMiddleware } from "./middleware/error";
import { requestLogger } from "./middleware/request-logger";
import { healthHandler } from "./health";

const app = new Hono();

app.use("*", requestLogger);
app.use("*", errorMiddleware);

app.get("/health", healthHandler);
app.route("/api/v1", v1Routes);

export default app;
