"use client"

import { useEffect, useState } from "react"
import type { MarketingComponent } from "@/lib/marketing/model"
import { getActiveComponent, trackMarketingEvent, type ActiveComponent } from "@/lib/marketing/client"

export function MarketingVisitorTracker() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return
    const seenThisSession = sessionStorage.getItem("elementspa_visit_recorded")
    if (seenThisSession) return
    const current = Number(document.cookie.split("; ").find((entry) => entry.startsWith("elementspa_visits="))?.split("=")[1] ?? 0)
    document.cookie = `elementspa_visits=${current + 1}; path=/; max-age=2592000; samesite=lax`
    sessionStorage.setItem("elementspa_visit_recorded", "1")
  }, [])
  return null
}

export function MarketingSlot({ slot }: { slot: MarketingComponent["slot"] }) {
  const [active, setActive] = useState<ActiveComponent | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    void getActiveComponent(slot).then((result) => {
      setActive(result)
      if (result) trackMarketingEvent(result, "impression")
    })
  }, [slot])
  const component = active?.component
  if (!component || component.kind === "hero") return null
  if (component.kind === "survey") return <section className="bg-card py-14"><div className="mx-auto max-w-xl rounded-xl border border-border bg-background p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Tu opinión</p><h2 className="mt-2 font-serif text-2xl">{component.title}</h2><p className="mt-2 text-sm text-muted-foreground">{component.body}</p><div className="mt-6 space-y-5">{(component.questions ?? []).map((question) => <div key={question.id}><label className="text-sm font-medium">{question.label}</label>{question.kind === "rating" ? <div className="mt-2 flex gap-2">{[1, 2, 3, 4, 5].map((value) => <button key={value} onClick={() => setAnswers((current) => ({ ...current, [question.id]: String(value) }))} className={`grid size-9 place-items-center rounded-md text-sm ${answers[question.id] === String(value) ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{value}</button>)}</div> : question.kind === "choice" ? <div className="mt-2 flex flex-wrap gap-2">{(question.options ?? []).map((option) => <button key={option} onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))} className={`rounded-md border px-3 py-2 text-sm ${answers[question.id] === option ? "border-primary bg-primary/10" : "border-border"}`}>{option}</button>)}</div> : <textarea onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} className="mt-2 min-h-20 w-full rounded-md border border-border bg-background p-3 text-sm" placeholder="Escribe tu respuesta" />}</div>)}</div><button onClick={() => active && trackMarketingEvent(active, "response", { answers })} className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">{component.ctaLabel}</button></div></section>
  return <section className="bg-card py-8"><div className="mx-auto max-w-7xl px-6"><div className="rounded-xl border border-primary/30 bg-primary/10 p-6 md:flex md:items-center md:justify-between md:gap-8"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Experiencia personalizada</p><h2 className="mt-2 font-serif text-2xl">{component.title}</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{component.body}</p></div><a onClick={() => active && trackMarketingEvent(active, "click")} href={component.ctaHref} className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground md:mt-0">{component.ctaLabel}</a></div></div></section>
}
