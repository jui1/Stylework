import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEnv } from "./env.js";

const validEnv = {
  DATABASE_URL: "postgresql://stylework:stylework@localhost:5432/stylework",
};

describe("parseEnv", () => {
  it("applies defaults for optional settings", () => {
    const env = parseEnv(validEnv);

    assert.equal(env.NODE_ENV, "development");
    assert.equal(env.PORT, 4000);
    assert.equal(env.CORS_ORIGIN, "http://localhost:5173");
    assert.equal(env.WEBHOOK_RATE_LIMIT_MAX, 60);
  });

  it("rejects a missing database url", () => {
    assert.throws(() => parseEnv({}), /DATABASE_URL/);
  });

  it("rejects an invalid CORS origin", () => {
    assert.throws(
      () => parseEnv({ ...validEnv, CORS_ORIGIN: "ftp://files.example" }),
      /CORS_ORIGIN/,
    );
  });
});
