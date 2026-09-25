import type { RequestHandler } from "express";
import { pinoHttp } from "pino-http";
import { logger } from "../lib/logger.js";

export const requestLogger: RequestHandler = pinoHttp({
  logger,
  redact: ["req.headers.authorization", "req.headers.cookie"],
  customLogLevel: (_request, response, error) => {
    if (error || response.statusCode >= 500) {
      return "error";
    }

    if (response.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },
});
