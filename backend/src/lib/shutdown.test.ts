import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Server } from "node:http";
import { resetShutdownState, shutdown } from "./shutdown.js";

describe("shutdown", () => {
  it("closes the server, disconnects, and exits once", async () => {
    resetShutdownState();
    const calls: string[] = [];
    const server = {
      close(callback: (error?: Error) => void) {
        calls.push("close");
        callback();
      },
    } as Server;

    shutdown({
      server,
      signal: "SIGTERM",
      disconnect: async () => {
        calls.push("disconnect");
      },
      exit: (code) => {
        calls.push(`exit:${code}`);
      },
      logger: {
        info: () => undefined,
        error: () => undefined,
      },
    });

    shutdown({
      server,
      signal: "SIGINT",
      disconnect: async () => {
        calls.push("disconnect-again");
      },
      exit: () => {
        calls.push("exit-again");
      },
      logger: {
        info: () => undefined,
        error: () => undefined,
      },
    });

    await new Promise((resolve) => setImmediate(resolve));

    assert.deepEqual(calls, ["close", "disconnect", "exit:0"]);
  });
});
