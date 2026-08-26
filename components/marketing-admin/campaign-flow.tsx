"use client"

import "@xyflow/react/dist/style.css"
import { useEffect, useState } from "react"
import { Background, Handle, Position, ReactFlow, type Edge, type Node, type NodeProps } from "@xyflow/react"
import { CheckCircle2, ImageIcon, Send, Users } from "lucide-react"
import type { Campaign, MarketingComponent } from "@/lib/marketing/model"

type FlowData = { icon: "audience" | "condition" | "component" | "publish"; eyebrow: string; title: string; detail: string }
type FlowNode = Node<FlowData, "campaign">

const icons = { audience: Users, condition: CheckCircle2, component: ImageIcon, publish: Send }

function CampaignNode({ data }: NodeProps<FlowNode>) {
  const Icon = icons[data.icon]
  return <div className="min-w-45 rounded-xl border border-slate-200 bg-white shadow-sm"><Handle type="target" position={Position.Left} className="!size-3 !border-2 !border-white !bg-slate-500" /><div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2"><span className="grid size-6 place-items-center rounded-md bg-slate-100 text-slate-600"><Icon className="size-3.5" /></span><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{data.eyebrow}</span></div><div className="px-3 py-3"><p className="text-sm font-semibold text-slate-900">{data.title}</p><p className="mt-1 text-xs text-slate-500">{data.detail}</p></div><Handle type="source" position={Position.Right} className="!size-3 !border-2 !border-white !bg-slate-500" /></div>
}

const nodeTypes = { campaign: CampaignNode }

export function CampaignFlow({ campaign, component, campaignId, onUpdate }: { campaign: Campaign; component: MarketingComponent; campaignId: string | null; onUpdate: (patch: Partial<Campaign>) => void }) {
  const componentTitle = component.kind === "hero" ? "Hero personalizado" : component.kind === "banner" ? "Banner promocional" : component.kind === "survey" ? "Encuesta" : component.kind === "block" ? "Bloque de página" : "CTA"
  const nodes: FlowNode[] = [
    { id: "audience", type: "campaign", position: { x: 0, y: 55 }, data: { icon: "audience", eyebrow: "Audiencia", title: `${campaign.audience.minVisits}+ visitas`, detail: campaign.audience.pagePath } },
    { id: "condition", type: "campaign", position: { x: 235, y: 55 }, data: { icon: "condition", eyebrow: "Condición", title: "Visita recurrente", detail: "Coincide cookie y página" } },
    { id: "component", type: "campaign", position: { x: 470, y: 55 }, data: { icon: "component", eyebrow: "Componente", title: componentTitle, detail: component.slot } },
    { id: "publish", type: "campaign", position: { x: 705, y: 55 }, data: { icon: "publish", eyebrow: "Entrega", title: campaign.status === "published" ? "Activo" : "En borrador", detail: campaign.status === "published" ? "Visible para audiencia" : "Publica para activarlo" } },
  ]
  const edges: Edge[] = [["audience", "condition"], ["condition", "component"], ["component", "publish"]].map(([source, target]) => ({ id: `${source}-${target}`, source, target, animated: campaign.status === "published", style: { stroke: campaign.status === "published" ? "#059669" : "#94a3b8", strokeWidth: 2 } }))
  return <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"><div className="h-54"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} panOnDrag zoomOnScroll={false} zoomOnPinch={false} fitView fitViewOptions={{ padding: 0.16 }}><Background color="#cbd5e1" gap={18} size={1} /></ReactFlow></div><div className="grid gap-3 border-t border-slate-200 bg-white p-3 text-xs md:grid-cols-4"><label className="font-medium text-slate-600">Prioridad <input type="number" min={0} max={100} step={1} value={campaign.priority} onChange={(event) => onUpdate({ priority: Math.max(0, Math.min(100, Math.round(Number(event.target.value) || 0))) })} className="mt-1 block h-8 w-full rounded border border-slate-200 px-2 text-sm" /></label><label className="font-medium text-slate-600">Inicia <input type="datetime-local" value={campaign.startsAt?.slice(0, 16) ?? ""} onChange={(event) => onUpdate({ startsAt: event.target.value ? new Date(event.target.value).toISOString() : null })} className="mt-1 block h-8 w-full rounded border border-slate-200 px-2 text-sm" /></label><label className="font-medium text-slate-600">Termina <input type="datetime-local" value={campaign.endsAt?.slice(0, 16) ?? ""} onChange={(event) => onUpdate({ endsAt: event.target.value ? new Date(event.target.value).toISOString() : null })} className="mt-1 block h-8 w-full rounded border border-slate-200 px-2 text-sm" /></label><CampaignMetrics campaignId={campaignId} /></div></div>
}

function CampaignMetrics({ campaignId }: { campaignId: string | null }) {
  const [metrics, setMetrics] = useState({ impressions: 0, clicks: 0, responses: 0 })
  useEffect(() => { if (campaignId) void fetch(`/api/admin/campaigns/${campaignId}`).then((response) => response.ok ? response.json() : null).then((data) => data && setMetrics(data)) }, [campaignId])
  return <div className="font-medium text-slate-600">Resultados <div className="mt-1 flex h-8 items-center gap-3 rounded border border-slate-200 px-2 text-[11px]"><span>{metrics.impressions} imp.</span><span>{metrics.clicks} clics</span><span>{metrics.responses} resp.</span></div></div>
}
