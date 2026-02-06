import app from "./app";
import { config } from "./config/env";
import { logger } from "@opsync/logger";

Bun.serve({
  fetch: app.fetch,
  port: config.PORT,
});

logger.info({ port: config.PORT }, "API server started");
