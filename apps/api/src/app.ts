import { Hono } from "hono";
import { v1Routes } from "./api/v1";
import { requestLogger } from "./middleware/request-logger";
import { AppError } from "./http/errors";
import { error as errorResponse } from "./http/response";
import { logger } from "@opsync/logger";
import { healthHandler } from "./health";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { swaggerUI } from "@hono/swagger-ui";
import { openApiSpec } from "./openapi";

const app = new Hono();

app.use("*", requestLogger);

app.get("/health", healthHandler);
app.get("/openapi.json", (c) => c.json(openApiSpec));
app.get("/docs", swaggerUI({ url: "/openapi.json" }));
app.route("/api/v1", v1Routes);

app.onError((err, c) => {
  if (err instanceof AppError) {
    logger.warn({ err }, "Request error");
    return errorResponse(c, err.message, err.status as ContentfulStatusCode, err.code, err.details);
  }

  logger.error({ err }, "Unhandled error");
  return errorResponse(c, "Internal Server Error", 500, "INTERNAL_ERROR");
});

export default app;
