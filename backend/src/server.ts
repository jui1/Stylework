import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import { shutdown } from "./lib/shutdown.js";

const app = createApp();

async function start(): Promise<void> {
  await prisma.$connect();
  logger.info("database connected");

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "API listening");
  });

  process.on("SIGINT", () => {
    shutdown({ server, signal: "SIGINT" });
  });
  process.on("SIGTERM", () => {
    shutdown({ server, signal: "SIGTERM" });
  });
}

start().catch((error: unknown) => {
  logger.error({ err: error }, "failed to start");
  process.exit(1);
});
