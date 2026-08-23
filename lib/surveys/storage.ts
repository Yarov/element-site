import { persistedFlowSchema } from "./schema"
import type { SurveyFlow } from "./model"

const KEY = "elementspa:surveys-admin:v1"

export function loadLocalFlow(): SurveyFlow | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = persistedFlowSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data.flow : null
  } catch {
    return null
  }
}

export function saveLocalFlow(flow: SurveyFlow) {
  if (typeof window === "undefined") return false
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ version: 1, flow }))
    return true
  } catch {
    return false
  }
}

export function clearLocalFlow() {
  try { window.localStorage.removeItem(KEY) } catch { /* storage is optional */ }
}
