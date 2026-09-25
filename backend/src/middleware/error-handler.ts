import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../errors/http-error.js";
import { logger } from "../lib/logger.js";

function isDatabaseError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientValidationError
  );
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: "Invalid payload",
      details: error.flatten(),
    });
    return;
  }

  if (error instanceof HttpError) {
    if (error.statusCode >= 500) {
      logger.error({ err: error }, "request failed");
    }

    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (isDatabaseError(error)) {
    logger.error({ err: error }, "database request failed");
    response.status(500).json({ error: "Unable to complete the database request" });
    return;
  }

  logger.error({ err: error }, "unhandled error");
  response.status(500).json({ error: "Internal server error" });
};
