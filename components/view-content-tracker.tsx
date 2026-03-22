"use client"

import { useEffect } from "react"
import { trackViewContent } from "@/lib/meta-tracking"

interface ViewContentTrackerProps {
  contentName: string
  contentCategory?: string
  value?: number
}

export function ViewContentTracker({ contentName, contentCategory, value }: ViewContentTrackerProps) {
  useEffect(() => {
    trackViewContent(contentName, contentCategory, value)
  }, [contentName, contentCategory, value])

  return null
}
