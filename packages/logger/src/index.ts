import pino, { type Logger } from "pino";
import { config } from "@opsync/config";

const isPretty = config.LOG_PRETTY;

const baseLogger = pino({
  level: config.LOG_LEVEL,
  base: {
    service: "opsync-api",
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  ...(isPretty && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
        messageFormat: "{msg}",
        hideObject: false,
        singleLine: false,
        useLevelLabels: true,
        levelFirst: true,
      },
    },
  }),
});

function formatContext(ctx?: string): string {
  if (!ctx) return "";
  if (ctx.startsWith("[") && ctx.endsWith("]")) return ctx;
  return `[${ctx}]`;
}

function createLoggerAdapter(pinoLogger: Logger, prefixContext?: string) {
  const formattedContext = formatContext(prefixContext);

  const withContext = (message: string) =>
    formattedContext ? `${formattedContext} ${message}` : message;

  return {
    info: (dataOrMsg: object | string, msg?: string) => {
      if (typeof dataOrMsg === "string") {
        pinoLogger.info(withContext(dataOrMsg));
      } else {
        pinoLogger.info(dataOrMsg, withContext(msg ?? ""));
      }
    },

    warn: (dataOrMsg: object | string, msg?: string) => {
      if (typeof dataOrMsg === "string") {
        pinoLogger.warn(withContext(dataOrMsg));
      } else {
        pinoLogger.warn(dataOrMsg, withContext(msg ?? ""));
      }
    },

    error: (dataOrMsg: object | string, msg?: string) => {
      if (typeof dataOrMsg === "string") {
        pinoLogger.error(withContext(dataOrMsg));
      } else {
        pinoLogger.error(dataOrMsg, withContext(msg ?? ""));
      }
    },

    debug: (dataOrMsg: object | string, msg?: string) => {
      if (typeof dataOrMsg === "string") {
        pinoLogger.debug(withContext(dataOrMsg));
      } else {
        pinoLogger.debug(dataOrMsg, withContext(msg ?? ""));
      }
    },
  };
}

export const logger = createLoggerAdapter(baseLogger);

export function createLoggerWithContext(context: string) {
  const childLogger = baseLogger.child({ context });
  return createLoggerAdapter(childLogger, context);
}

export default logger;