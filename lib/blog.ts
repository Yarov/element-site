import fs from "fs"
import path from "path"
import matter from "gray-matter"

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  image: string
  tags?: string[]
}

const contentDir = path.join(process.cwd(), "content")

export function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"))

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "")
    const raw = fs.readFileSync(path.join(contentDir, filename), "utf-8")
    const { data } = matter(raw)

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      image: data.image,
      tags: data.tags,
    }
  })

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string) {
  const filePath = path.join(contentDir, `${slug}.mdx`)
  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  return {
    meta: {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      image: data.image,
      tags: data.tags,
    } as BlogPost,
    content,
  }
}
