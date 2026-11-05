// Environment: PORT, DATA_DIR, CONTACT_WEBHOOK_URL, TRUST_PROXY=1 (behind a reverse proxy), RATE_LIMIT_PER_HOUR, ALLOWED_ORIGIN.
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3000);

const server = createApp({
  dataDir: process.env.DATA_DIR ?? "/data",
  webhookUrl: process.env.CONTACT_WEBHOOK_URL ?? "",
  trustProxy: process.env.TRUST_PROXY === "1",
  rateLimitPerHour: Number(process.env.RATE_LIMIT_PER_HOUR ?? 5),
  allowedOrigin: process.env.ALLOWED_ORIGIN ?? "",
}).listen(port, "0.0.0.0", () =>
  console.log(`contact-api listening on :${port}`),
);

process.on("SIGTERM", () => server.close(() => process.exit(0)));
