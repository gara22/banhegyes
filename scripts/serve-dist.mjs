// Minimal static server for dist/ (used by Playwright). Usage: node scripts/serve-dist.mjs [port]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL("../dist/", import.meta.url).pathname;
const port = Number(process.argv[2] ?? 4399);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".xml": "application/rss+xml",
  ".ico": "image/x-icon",
};

async function resolve(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath)).replace(
    /^(\.\.[/\\])+/,
    "",
  );
  let file = join(root, safe);
  const info = await stat(file).catch(() => null);
  if (info?.isDirectory()) file = join(file, "index.html");
  return file;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  try {
    const file = await resolve(pathname);
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[extname(file)] ?? "application/octet-stream",
    });
    res.end(body);
  } catch {
    const body = await readFile(join(root, "404.html")).catch(
      () => "Not found",
    );
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(body);
  }
}).listen(port, () => console.log(`serving dist on http://localhost:${port}`));
