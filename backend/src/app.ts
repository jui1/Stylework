import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { routes } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  if (env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
