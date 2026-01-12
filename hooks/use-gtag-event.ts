"use client"

import { useCallback } from "react"

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

type GtagParams = Record<string, unknown>

export function useGtagEvent() {
  return useCallback((eventName: string, params: GtagParams = {}) => {
    if (typeof window === "undefined") return
    window.gtag?.("event", eventName, {
      page_path: window.location.pathname,
      ...params,
    })
  }, [])
}
