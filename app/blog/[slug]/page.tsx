import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { MDXRemote } from "next-mdx-remote/rsc"
import { getAllPosts, getPostBySlug } from "@/lib/blog"
import { buildBreadcrumb, SITE_URL } from "@/lib/schema"

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const { meta } = getPostBySlug(slug)
    return {
      title: meta.title,
      description: meta.description,
      alternates: {
        canonical: `/blog/${slug}`,
      },
      openGraph: {
        title: meta.title,
        description: meta.description,
        url: `/blog/${slug}`,
        type: "article",
        publishedTime: meta.date,
        images: [{ url: meta.image, alt: meta.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: meta.title,
        description: meta.description,
        images: [meta.image],
      },
    }
  })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { meta, content } = getPostBySlug(slug)

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.description,
    image: `${SITE_URL}${meta.image}`,
    datePublished: meta.date,
    url: `${SITE_URL}/blog/${slug}`,
    inLanguage: "es-MX",
    author: {
      "@type": "Organization",
      name: "ElementSpa",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "ElementSpa",
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
    ...(meta.tags?.length ? { keywords: meta.tags.join(", ") } : {}),
  }

  const breadcrumbJsonLd = buildBreadcrumb([
    { name: "Inicio", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: meta.title, path: `/blog/${slug}` },
  ])

  return (
    <main className="min-h-screen bg-background py-24 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article className="max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al blog
        </Link>

        <time className="text-xs text-muted-foreground tracking-wider uppercase">
          {new Date(meta.date).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>

        <h1 className="text-4xl md:text-5xl font-serif mt-3 mb-8">{meta.title}</h1>

        <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-12">
          <Image src={meta.image} alt={meta.title} fill className="object-cover" priority />
        </div>

        <div className="prose prose-invert prose-headings:font-serif prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary prose-th:text-foreground prose-td:text-muted-foreground prose-table:border-border prose-hr:border-border max-w-none [&_table]:border [&_table]:border-border [&_th]:border [&_th]:border-border [&_th]:px-4 [&_th]:py-2 [&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-2">
          <MDXRemote source={content} />
        </div>
      </article>
    </main>
  )
}
