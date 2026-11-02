// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://nagybanhegyes.example",
  trailingSlash: "always",
  build: { format: "directory" },
});
