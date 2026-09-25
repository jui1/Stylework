import type { ErrorRequestHandler } from "express";
import { logger } from "../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  logger.error({ err: error }, "unhandled error");
  response.status(500).json({ error: "Internal server error" });
};
