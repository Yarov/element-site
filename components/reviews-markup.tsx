import { testimonials, buildReviewsJsonLd } from "@/lib/testimonials-data"
import { ORG_ID, SPA_ROMA_NORTE_ID, SPA_COYOACAN_ID } from "@/lib/schema"

interface ReviewsMarkupProps {
  /**
   * Restrict reviews to a specific branch. Defaults to all (homepage).
   * Use "romaNorte" or "coyoacan" on branch pages.
   */
  branch?: "romaNorte" | "coyoacan" | "all"
}

const ITEM_REVIEWED_BY_BRANCH = {
  romaNorte: SPA_ROMA_NORTE_ID,
  coyoacan: SPA_COYOACAN_ID,
} as const

/**
 * Emits JSON-LD `Review[]` payloads for the testimonials displayed on the
 * page. Server-rendered so it appears in the initial HTML (no JS required
 * for crawlers / AI agents).
 */
export function ReviewsMarkup({ branch = "all" }: ReviewsMarkupProps) {
  const subset =
    branch === "all"
      ? testimonials
      : testimonials.filter((t) => t.branch === branch)

  const itemReviewed =
    branch === "all" ? ORG_ID : ITEM_REVIEWED_BY_BRANCH[branch]

  const reviews = buildReviewsJsonLd(subset, itemReviewed)

  return (
    <>
      {reviews.map((review, i) => (
        <script
          key={`review-${i}-${review.author.name}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(review) }}
        />
      ))}
    </>
  )
}