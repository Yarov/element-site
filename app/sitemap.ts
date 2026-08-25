import type { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/blog"
import { PUBLIC_ROUTES } from "@/lib/public-routes"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://elementspa.mx"

  const posts = getAllPosts()

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path === "/" ? "" : route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  return [...staticEntries, ...blogEntries]
}
