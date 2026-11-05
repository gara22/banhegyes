import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { createApp } from "./app.js";

const silent = { error() {} };
let dir;
let server;
let base;

async function start(config = {}) {
  server = createApp({ dataDir: dir, log: silent, ...config }).listen(
    0,
    "127.0.0.1",
  );
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
}

const post = (body, headers = {}) =>
  fetch(`${base}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const stored = async () => {
  try {
    return (await readFile(join(dir, "messages.jsonl"), "utf8"))
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l));
  } catch {
    return [];
  }
};

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "contact-"));
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(dir, { recursive: true, force: true });
});

describe("contact api", () => {
  it("answers the health check", async () => {
    await start();
    const res = await fetch(`${base}/healthz`);
    assert.equal(res.status, 200);
  });

  it("stores a valid JSON message with trimmed fields", async () => {
    await start();
    const res = await post({ name: "  Teszt Elek ", message: " Szia! " });
    assert.equal(res.status, 200);
    const [record] = await stored();
    assert.equal(record.name, "Teszt Elek");
    assert.equal(record.message, "Szia!");
    assert.ok(!Number.isNaN(Date.parse(record.receivedAt)));
  });

  it("accepts a url-encoded form post", async () => {
    await start();
    const res = await fetch(`${base}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "name=Elek&message=Hello",
    });
    assert.equal(res.status, 200);
    assert.equal((await stored()).length, 1);
  });

  it("rejects missing, empty, non-string and oversized fields", async () => {
    await start({ rateLimitPerHour: 100 });
    for (const body of [
      {},
      { name: "", message: "x" },
      { name: "x", message: "   " },
      { name: 5, message: "x" },
      { name: "x".repeat(101), message: "x" },
      { name: "x", message: "x".repeat(2001) },
      "[1,2]",
      "not json",
    ]) {
      assert.equal(
        (await post(body)).status,
        400,
        JSON.stringify(body).slice(0, 40),
      );
    }
    assert.equal((await stored()).length, 0);
  });

  it("silently drops honeypot submissions", async () => {
    await start();
    const res = await post({
      name: "Bot",
      message: "spam",
      website: "http://spam.example",
    });
    assert.equal(res.status, 200);
    assert.equal((await stored()).length, 0);
  });

  it("rejects unsupported content types, bad methods and unknown paths", async () => {
    await start();
    const text = await fetch(`${base}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "x",
    });
    assert.equal(text.status, 415);
    assert.equal((await fetch(`${base}/api/contact`)).status, 405);
    assert.equal((await fetch(`${base}/nope`)).status, 404);
  });

  it("rejects oversized bodies", async () => {
    await start();
    const res = await post({ name: "x", message: "y".repeat(20_000) });
    assert.equal(res.status, 413);
  });

  it("enforces the allowed origin when configured", async () => {
    await start({ allowedOrigin: "https://banhegyes.hu" });
    assert.equal(
      (
        await post(
          { name: "a", message: "b" },
          { Origin: "https://evil.example" },
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await post(
          { name: "a", message: "b" },
          { Origin: "https://banhegyes.hu" },
        )
      ).status,
      200,
    );
  });

  it("rate limits per client and uses the proxy-appended address when trusted", async () => {
    await start({ rateLimitPerHour: 2, trustProxy: true });
    const send = (ip) =>
      post(
        { name: "a", message: "b" },
        { "X-Forwarded-For": `1.1.1.1, ${ip}` },
      );
    assert.equal((await send("9.9.9.9")).status, 200);
    assert.equal((await send("9.9.9.9")).status, 200);
    const limited = await send("9.9.9.9");
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get("retry-after")) > 0);
    assert.equal((await send("8.8.8.8")).status, 200);
  });

  it("forwards to the webhook and survives webhook failures", async () => {
    const calls = [];
    await start({
      webhookUrl: "https://hooks.example/x",
      rateLimitPerHour: 10,
      fetchImpl: async (url, init) => {
        calls.push({ url, body: JSON.parse(init.body) });
        if (calls.length === 2) throw new Error("down");
        return { ok: true, status: 200 };
      },
    });
    assert.equal((await post({ name: "Elek", message: "Hello" })).status, 200);
    assert.equal(calls[0].url, "https://hooks.example/x");
    assert.match(calls[0].body.text, /Elek/);
    assert.deepEqual(calls[0].body.allowed_mentions, { parse: [] });

    assert.equal((await post({ name: "Elek", message: "Again" })).status, 200);
    assert.equal((await stored()).length, 2);
  });

  it("returns 500 when the message cannot be stored", async () => {
    await start({ dataDir: "/proc/nonexistent/contact" });
    assert.equal((await post({ name: "a", message: "b" })).status, 500);
  });
});
