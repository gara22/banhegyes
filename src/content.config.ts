import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

export const categories = [
  "Egyéb",
  "Hirdetmény",
  "Rendelet",
  "Meghívó",
  "Tájékoztató",
  "Pályázat",
  "Közlemény",
] as const;

const attachment = z.object({
  title: z.string(),
  // Path below /public, e.g. /dokumentumok/valami.pdf
  file: z.string().startsWith("/dokumentumok/"),
});

const news = defineCollection({
  loader: glob({ base: "./src/content/news", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(categories).default("Egyéb"),
    kind: z.enum(["hirdetmeny", "abszurd"]).default("hirdetmeny"),
    excerpt: z.string().optional(),
    image: z.string().startsWith("/").optional(),
    imageAlt: z.string().default(""),
    author: z.string().default("hivatal"),
    tags: z.array(z.string()).default([]),
    attachments: z.array(attachment).default([]),
    draft: z.boolean().default(false),
  }),
});

// Rich, hand-written pages. Paths mirror the URL (e.g. onkormanyzat.md -> /onkormanyzat/).
const pages = defineCollection({
  loader: glob({ base: "./src/content/pages", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Lists child menu items as a "•" link list under the content.
    showChildren: z.boolean().default(false),
    attachments: z.array(attachment).default([]),
  }),
});

// Short parody pages for the long tail of menu items; id is the URL path without slashes at the ends.
const stubs = defineCollection({
  loader: file("./src/content/stubs.yaml"),
  schema: z.object({
    paragraphs: z.array(z.string()).min(1),
    attachments: z.array(attachment).default([]),
  }),
});

const galleries = defineCollection({
  loader: glob({ base: "./src/content/galleries", pattern: "**/*.yaml" }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    cover: z.string().startsWith("/"),
    images: z
      .array(
        z.object({
          src: z.string().startsWith("/"),
          title: z.string(),
          alt: z.string(),
        }),
      )
      .min(1),
  }),
});

export const collections = { news, pages, stubs, galleries };
