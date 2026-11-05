import express from "express";
import { rateLimit } from "express-rate-limit";
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export function createApp({
  dataDir,
  webhookUrl = "",
  trustProxy = false,
  rateLimitPerHour = 5,
  allowedOrigin = "",
  fetchImpl = fetch,
  log = console,
}) {
  const app = express();
  app.disable("x-powered-by");
  if (trustProxy) app.set("trust proxy", 1);

  app.get("/healthz", (_req, res) => res.json({ ok: true }));

  const originCheck = (req, res, next) => {
    const origin = req.get("origin");
    if (allowedOrigin && origin && origin !== allowedOrigin) {
      return res.status(403).json({ error: "forbidden_origin" });
    }
    next();
  };

  const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: rateLimitPerHour,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "rate_limited" },
  });

  async function forward(record) {
    if (!webhookUrl) return;
    const text =
      `Új üzenet a honlapról\nNév: ${record.name}\n\n${record.message}`.slice(
        0,
        1900,
      );
    try {
      const res = await fetchImpl(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // "text" suits Slack-style hooks, "content" Discord; no mentions so visitors cannot ping anyone.
        body: JSON.stringify({
          text,
          content: text,
          allowed_mentions: { parse: [] },
          ...record,
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) log.error(`webhook responded ${res.status}`);
    } catch (err) {
      log.error("webhook failed", err.message);
    }
  }

  app.post(
    "/api/contact",
    originCheck,
    limiter,
    express.json({ limit: "10kb" }),
    express.urlencoded({ extended: false, limit: "10kb" }),
    async (req, res) => {
      if (!req.body)
        return res.status(415).json({ error: "unsupported_media_type" });
      const { name, message, website } = req.body;

      // Hidden field that humans leave empty; pretend success so bots learn nothing.
      if (typeof website === "string" && website !== "")
        return res.json({ ok: true });

      const record = {
        receivedAt: new Date().toISOString(),
        name: typeof name === "string" ? name.trim() : "",
        message: typeof message === "string" ? message.trim() : "",
      };
      if (
        !record.name ||
        record.name.length > 100 ||
        !record.message ||
        record.message.length > 2000
      ) {
        return res.status(400).json({ error: "invalid" });
      }

      await mkdir(dataDir, { recursive: true });
      await appendFile(
        join(dataDir, "messages.jsonl"),
        `${JSON.stringify(record)}\n`,
      );
      await forward(record);
      res.json({ ok: true });
    },
  );

  app.all("/api/contact", (_req, res) =>
    res.set("Allow", "POST").status(405).json({ error: "method_not_allowed" }),
  );
  app.use((_req, res) => res.status(404).json({ error: "not_found" }));

  app.use((err, _req, res, _next) => {
    const status = err.status >= 400 && err.status < 500 ? err.status : 500;
    if (status === 500) log.error("unhandled error", err);
    res
      .status(status)
      .json({
        error:
          status === 413
            ? "too_large"
            : status === 500
              ? "server_error"
              : "invalid",
      });
  });

  return app;
}
