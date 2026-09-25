import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const healthRouter = Router();

healthRouter.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get("/health/ready", async (_request, response) => {
  const timestamp = new Date().toISOString();

  try {
    await prisma.$queryRaw`SELECT 1`;
    response.status(200).json({
      status: "ok",
      database: "up",
      timestamp,
    });
  } catch {
    response.status(503).json({
      status: "error",
      database: "down",
      timestamp,
    });
  }
});
