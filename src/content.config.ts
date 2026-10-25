import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const faq = z.object({ q: z.string(), a: z.string() });

// Service pages. Body copy is markdown; {{city}}, {{phone}} etc. come from business.json.
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    service: z.string(), // must match a slug in business.json services
    title: z.string(), // final length (after {{tokens}}) is checked by scripts/audit.mjs
    description: z.string(),
    h1: z.string(),
    intro: z.string(),
    image: z.string(),
    related: z.array(z.string()),
    faqs: z.array(faq).min(4).max(6),
    emergency: z.boolean().default(false),
    checklist: z.array(z.string()).optional(),
  }),
});

// City pages. Each one must be written for that town, not copied.
const areas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/areas' }),
  schema: z.object({
    city: z.string(), // must match an entry in business.json serviceArea
    title: z.string(), // final length (after {{tokens}}) is checked by scripts/audit.mjs
    description: z.string(),
    h1: z.string(),
    intro: z.string(),
    image: z.string(),
    trees: z.array(z.string()),
    nearby: z.array(z.string()).optional(),
    faqs: z.array(faq).min(3).max(6),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(), // final length (after {{tokens}}) is checked by scripts/audit.mjs
    description: z.string(),
    h1: z.string(),
    intro: z.string(),
    image: z.string(),
    faqs: z.array(faq).optional(),
  }),
});

export const collections = { services, areas, guides };
