import { createMiddleware } from "hono/factory";
import { logger } from "@opsync/logger";
import { AppError } from "../http/errors";
import { error as errorResponse } from "../http/response";

export const errorMiddleware = createMiddleware(async (c, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      logger.warn({ err }, "Request error");
      return errorResponse(c, err.message, err.status, err.code, err.details);
    }

    logger.error({ err }, "Unhandled error");
    return errorResponse(c, "Internal Server Error", 500, "INTERNAL_ERROR");
  }
});
