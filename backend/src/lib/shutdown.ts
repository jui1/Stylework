import type { Server } from "node:http";
import { logger as appLogger } from "./logger.js";
import { prisma } from "./prisma.js";

type ShutdownLogger = {
  info: (object: object, message: string) => void;
  error: (object: object, message: string) => void;
};

type ShutdownOptions = {
  server: Server;
  signal: string;
  disconnect?: () => Promise<void>;
  exit?: (code: number) => void;
  logger?: ShutdownLogger;
  timeoutMs?: number;
};

let shuttingDown = false;

export function shutdown({
  server,
  signal,
  disconnect = () => prisma.$disconnect(),
  exit = (code) => process.exit(code),
  logger = appLogger,
  timeoutMs = 10_000,
}: ShutdownOptions): void {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info({ signal }, "shutting down");

  const timer = setTimeout(() => {
    logger.error({ signal }, "forced shutdown");
    exit(1);
  }, timeoutMs);
  timer.unref();

  server.close((error) => {
    clearTimeout(timer);

    void disconnect().finally(() => {
      if (error) {
        logger.error({ err: error }, "server close failed");
        exit(1);
        return;
      }

      exit(0);
    });
  });
}

export function resetShutdownState(): void {
  shuttingDown = false;
}
