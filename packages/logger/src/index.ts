import pino from "pino";
import { config } from "@opsync/config";

const level = config.NODE_ENV === "production" ? "info" : "debug";

export const logger = pino({
  level,
  base: {
    service: "opsync-api",
  },
});
