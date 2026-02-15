import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { getAllPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artículos sobre bienestar, masajes sensoriales y relajación para hombres en Ciudad de México. Consejos, guías y novedades de ElementSpa.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | ElementSpa",
    description:
      "Artículos sobre bienestar, masajes sensoriales y relajación para hombres en Ciudad de México.",
    url: "/blog",
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main className="min-h-screen bg-background py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <h1 className="text-4xl md:text-5xl font-serif mb-4">Blog</h1>
        <p className="text-muted-foreground mb-12 max-w-2xl">
          Artículos sobre bienestar, relajación y masajes sensoriales para hombres en CDMX.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="rounded-lg border border-border bg-card overflow-hidden transition-colors hover:border-primary/50">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <time className="text-xs text-muted-foreground tracking-wider uppercase">
                    {new Date(post.date).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h2 className="text-xl font-serif mt-2 mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
