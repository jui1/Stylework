import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { createApp } from "./app.js";

describe("webhook rate limit", () => {
  it("returns 429 after the configured number of requests", async () => {
    const app = createApp({ webhookRateLimitMax: 2, webhookRateLimitWindowMs: 60_000 });

    const first = await request(app).post("/webhook/meta-lead").send({});
    const second = await request(app).post("/webhook/meta-lead").send({});
    const third = await request(app).post("/webhook/meta-lead").send({});

    assert.equal(first.status, 400);
    assert.equal(second.status, 400);
    assert.equal(third.status, 429);
    assert.equal(third.body.error, "Too many requests");
  });
});

describe("security headers and CORS", () => {
  it("sets helmet headers and allows the configured origin", async () => {
    const app = createApp();
    const response = await request(app).get("/health").set("Origin", "http://localhost:5173");

    assert.equal(response.status, 200);
    assert.equal(response.headers["x-powered-by"], undefined);
    assert.equal(typeof response.headers["x-content-type-options"], "string");
    assert.equal(response.headers["access-control-allow-origin"], "http://localhost:5173");
  });

  it("does not reflect a disallowed origin", async () => {
    const app = createApp();
    const response = await request(app).get("/health").set("Origin", "https://evil.example");

    assert.equal(response.headers["access-control-allow-origin"], undefined);
  });
});
