import cors from "cors";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { requestLogger } from "./middleware/request-logger.js";
import { createRoutes } from "./routes/index.js";

export type AppOptions = {
  webhookRateLimitMax?: number;
  webhookRateLimitWindowMs?: number;
};

export function createApp(options: AppOptions = {}) {
  const app = express();
  const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

  app.disable("x-powered-by");

  if (env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins,
      methods: ["GET", "POST", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);

  const webhookRateLimit = rateLimit({
    windowMs: options.webhookRateLimitWindowMs ?? env.WEBHOOK_RATE_LIMIT_WINDOW_MS,
    limit: options.webhookRateLimitMax ?? env.WEBHOOK_RATE_LIMIT_MAX,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests" },
  });

  app.use(createRoutes(webhookRateLimit));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
