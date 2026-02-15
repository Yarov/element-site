import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/aviso-de-privacidad",
    },
    sitemap: "https://elementspa.mx/sitemap.xml",
  }
}
