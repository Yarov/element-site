import { z } from "zod"

export const componentSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["banner", "hero", "block", "survey", "cta"]),
  slot: z.enum(["home.banner", "home.hero", "home.promo", "service.cta"]),
  title: z.string().trim().min(1),
  body: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
  imageUrl: z.string().optional(),
  questions: z.array(z.object({ id: z.string(), label: z.string().min(1), kind: z.enum(["text", "rating", "choice"]), options: z.array(z.string()).optional() })).optional(),
})

export const campaignSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  description: z.string(),
  status: z.enum(["draft", "published", "paused"]),
  audience: z.object({ minVisits: z.number().int().min(1), pagePath: z.string().min(1) }),
  priority: z.number().int().min(0).max(100).default(50),
  startsAt: z.string().datetime().nullable().default(null),
  endsAt: z.string().datetime().nullable().default(null),
  components: z.array(componentSchema).min(1),
  updatedAt: z.string(),
})
