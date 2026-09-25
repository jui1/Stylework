import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

async function start(): Promise<void> {
  await prisma.$connect();
  logger.info("database connected");

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "API listening");
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, "shutting down");
    server.close(() => {
      void prisma.$disconnect().finally(() => {
        process.exit(0);
      });
    });
  };

  process.on("SIGINT", () => {
    shutdown("SIGINT");
  });
  process.on("SIGTERM", () => {
    shutdown("SIGTERM");
  });
}

start().catch((error: unknown) => {
  logger.error({ err: error }, "failed to start");
  process.exit(1);
});
