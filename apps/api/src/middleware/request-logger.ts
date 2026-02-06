import { createMiddleware } from "hono/factory";
import { logger } from "@opsync/logger";

export const requestLogger = createMiddleware(async (c, next) => {
  const start = Date.now();

  await next();

  const ms = Date.now() - start;
  logger.info(
    {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: ms,
    },
    "HTTP request"
  );
});
