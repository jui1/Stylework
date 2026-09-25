import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Request, Response } from "express";
import { errorHandler } from "./error-handler.js";

function mockResponse() {
  const response = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
  };

  return response;
}

describe("errorHandler", () => {
  it("does not expose the error message or stack for unexpected failures", () => {
    const error = new Error("database password leaked");
    error.stack = "Error: database password leaked\n    at secret.ts:1:1";
    const response = mockResponse();

    errorHandler(error, {} as Request, response as unknown as Response, () => undefined);

    const serialized = JSON.stringify(response.body);
    assert.equal(response.statusCode, 500);
    assert.equal((response.body as { error: string }).error, "Internal server error");
    assert.equal(serialized.includes("database password leaked"), false);
    assert.equal(serialized.includes("secret.ts"), false);
    assert.equal(serialized.includes("stack"), false);
  });

  it("returns a safe message for invalid JSON", () => {
    const error = new SyntaxError("Unexpected token");
    Object.assign(error, { body: "{", status: 400 });
    const response = mockResponse();

    errorHandler(error, {} as Request, response as unknown as Response, () => undefined);

    assert.equal(response.statusCode, 400);
    assert.deepEqual(response.body, { error: "Invalid JSON" });
  });
});
