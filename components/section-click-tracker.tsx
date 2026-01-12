"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

function getSectionIdFromHash(hash: string | null | undefined) {
  if (!hash) return null
  if (!hash.startsWith("#")) return null
  const id = hash.slice(1).trim()
  return id.length > 0 ? id : null
}

export function SectionClickTracker() {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!window.gtag) return

      const target = event.target as Element | null
      if (!target) return

      const anchor = target.closest("a[href]") as HTMLAnchorElement | null
      const sectionFromAnchorHash = getSectionIdFromHash(anchor?.getAttribute("href"))

      const sectionEl = target.closest("section[id]") as HTMLElement | null
      const sectionId = sectionFromAnchorHash ?? sectionEl?.id ?? "unknown"

      const clickable = (anchor ?? target.closest("button") ?? target.closest("[role='button']") ?? target) as
        | HTMLElement
        | null

      const ariaLabel = clickable?.getAttribute("aria-label")?.trim()
      const text = clickable?.textContent?.replace(/\s+/g, " ").trim()
      const label = ariaLabel || text || clickable?.tagName?.toLowerCase() || "unknown"

      window.gtag("event", "section_click", {
        section_id: sectionId,
        click_label: label,
        click_tag: clickable?.tagName?.toLowerCase() || "unknown",
        page_path: window.location.pathname,
      })
    }

    document.addEventListener("click", handler, true)
    return () => document.removeEventListener("click", handler, true)
  }, [])

  return null
}
