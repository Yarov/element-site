"use client"

import "@xyflow/react/dist/style.css"
import { useEffect, useMemo, useState } from "react"
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
  useEdgesState,
  useNodesState,
} from "@xyflow/react"
import { BarChart3, Check, ChevronLeft, ChevronRight, CircleAlert, ClipboardList, FilePlus2, GripVertical, LayoutDashboard, Link2, MoreHorizontal, Play, Plus, Save, Settings2, Trash2, Users } from "lucide-react"
import type { NodeType, SurveyField, SurveyFlow, WorkflowNode } from "@/lib/surveys/model"
import { evaluateFlow } from "@/lib/surveys/evaluator"
import { emptyFlow, seedFlow } from "@/lib/surveys/fixtures"
import { loadLocalFlow, saveLocalFlow } from "@/lib/surveys/storage"

type StoredFlow = { id: string; name: string; graph: SurveyFlow }
type FlowNodeData = { node: WorkflowNode; selected: boolean }
type WorkflowCanvasNode = Node<FlowNodeData, "workflow">

const nodeMeta: Record<NodeType, { label: string; description: string; accent: string }> = {
  trigger: { label: "Inicio", description: "Cuándo mostrar", accent: "#7c3aed" },
  condition: { label: "Filtro", description: "A quién mostrar", accent: "#2563eb" },
  survey: { label: "Encuesta", description: "Qué preguntar", accent: "#db2777" },
  action: { label: "Final", description: "Qué hacer después", accent: "#059669" },
}

function WorkflowNodeCard({ data }: NodeProps<WorkflowCanvasNode>) {
  const { node, selected } = data
  const meta = nodeMeta[node.type]
  const subtitle = node.type === "trigger"
    ? `Visitas >= ${node.config.visitCount ?? 3}`
    : node.type === "survey"
      ? `${((node.config.fields as SurveyField[] | undefined) ?? []).length} preguntas`
      : node.type === "action"
        ? String(node.config.message ?? "Acción configurada")
        : String(node.config.rule ?? "Regla configurada")
  return (
    <div className={`min-w-52 rounded-lg border bg-white shadow-sm ${selected ? "border-slate-950 ring-2 ring-slate-950/10" : "border-slate-200"}`}>
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white" style={{ background: meta.accent }} />
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
        <span className="h-2 w-2 rounded-full" style={{ background: meta.accent }} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{meta.label}</span>
        <MoreHorizontal className="ml-auto size-4 text-slate-300" />
      </div>
      <div className="px-3 py-3">
        <p className="truncate text-sm font-semibold text-slate-900">{node.label}</p>
        <p className="mt-1 max-w-45 truncate text-xs text-slate-500">{subtitle}</p>
      </div>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white" style={{ background: meta.accent }} />
    </div>
  )
}

const nodeTypes: NodeTypes = { workflow: WorkflowNodeCard as NodeTypes[string] }

function toCanvasNodes(flow: SurveyFlow): WorkflowCanvasNode[] {
  return flow.nodes.map((node, index) => ({
    id: node.id,
    type: "workflow",
    position: node.position ?? { x: 70 + index * 280, y: 170 },
    data: { node, selected: false },
  }))
}

function toCanvasEdges(flow: SurveyFlow): Edge[] {
  return flow.edges.map((edge) => ({
    id: `${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    type: "smoothstep",
    style: { stroke: "#94a3b8", strokeWidth: 1.5 },
  }))
}

export function SurveysAdminApp() {
  const [flow, setFlow] = useState<SurveyFlow>(seedFlow)
  const [serverId, setServerId] = useState<string | null>(null)
  const [savedFlows, setSavedFlows] = useState<StoredFlow[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(seedFlow.nodes[0]?.id ?? null)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(true)
  const [visits, setVisits] = useState(3)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [status, setStatus] = useState("Cargando...")
  const [nodes, setNodes, onNodesChange] = useNodesState(toCanvasNodes(seedFlow))
  const [edges, setEdges, onEdgesChange] = useEdgesState(toCanvasEdges(seedFlow))

  useEffect(() => {
    let active = true
    async function load() {
      const local = loadLocalFlow()
      try {
        const response = await fetch("/api/admin/surveys")
        if (!response.ok) throw new Error("API unavailable")
        const body = await response.json() as { flows: Array<{ id: string; name: string; graph: SurveyFlow }> }
        const remote = body.flows.map((item) => ({ id: item.id, name: item.name, graph: item.graph }))
        if (!active) return
        setSavedFlows(remote)
        if (remote[0]) openFlow(remote[0])
        else if (local) applyFlow(local, null, "Borrador local restaurado")
        else setStatus("Flujo nuevo sin guardar")
      } catch {
        if (active) {
          if (local) applyFlow(local, null, "Modo local: API no disponible")
          else setStatus("Modo local: API no disponible")
        }
      }
    }
    void load()
    return () => { active = false }
  }, [])

  useEffect(() => {
    setNodes(toCanvasNodes(flow))
    setEdges(toCanvasEdges(flow))
  }, [flow, setEdges, setNodes])

  const selectedNode = flow.nodes.find((node) => node.id === selectedNodeId)
  const surveyNode = flow.nodes.find((node) => node.type === "survey")
  const surveyFields = ((surveyNode?.config.fields as SurveyField[] | undefined) ?? [])
  const selectedField = surveyFields.find((field) => field.id === selectedFieldId) ?? surveyFields[0]
  const evaluation = useMemo(() => evaluateFlow(flow, { visitCount: visits }), [flow, visits])

  function applyFlow(next: SurveyFlow, id: string | null, nextStatus: string) {
    setFlow(next)
    setServerId(id)
    setSelectedNodeId(next.nodes[0]?.id ?? null)
    const firstSurvey = next.nodes.find((node) => node.type === "survey")
    setSelectedFieldId(((firstSurvey?.config.fields as SurveyField[] | undefined) ?? [])[0]?.id ?? null)
    setStatus(nextStatus)
    setAnswers({})
  }

  function openFlow(stored: StoredFlow) {
    applyFlow(stored.graph, stored.id, `Editando ${stored.name}`)
  }

  function updateFlow(updater: (current: SurveyFlow) => SurveyFlow) {
    setFlow((current) => {
      const next = { ...updater(current), updatedAt: new Date().toISOString() }
      saveLocalFlow(next)
      return next
    })
    setStatus("Cambios sin guardar")
  }

  function updateNode(id: string, patch: Partial<WorkflowNode>) {
    updateFlow((current) => ({ ...current, nodes: current.nodes.map((node) => node.id === id ? { ...node, ...patch } : node) }))
  }

  function addNode(type: NodeType) {
    const id = `${type}-${crypto.randomUUID()}`
    const newNode: WorkflowNode = {
      id,
      type,
      label: type === "trigger" ? "Tercera visita" : type === "survey" ? "Encuesta de experiencia" : type === "condition" ? "Visitante recurrente" : "Mostrar agradecimiento",
      config: type === "trigger" ? { visitCount: 3 } : type === "survey" ? { fields: [] } : type === "condition" ? { rule: "visitCount >= 3" } : { message: "Gracias por compartir tu opinión." },
      position: { x: 160 + flow.nodes.length * 160, y: 170 },
    }
    updateFlow((current) => ({ ...current, nodes: [...current.nodes, newNode] }))
    setSelectedNodeId(id)
  }

  function removeNode() {
    if (!selectedNodeId || !window.confirm("¿Eliminar este paso del flujo?")) return
    updateFlow((current) => ({
      ...current,
      nodes: current.nodes.filter((node) => node.id !== selectedNodeId),
      edges: current.edges.filter((edge) => edge.from !== selectedNodeId && edge.to !== selectedNodeId),
    }))
    setSelectedNodeId(null)
  }

  function addQuestion(kind: SurveyField["kind"]) {
    if (!surveyNode) return
    const question: SurveyField = {
      id: crypto.randomUUID(),
      kind,
      label: kind === "rating" ? "¿Qué tan probable es que regreses?" : kind === "singleChoice" ? "¿Qué servicio te interesa?" : kind === "cta" ? "¿Quieres conocer nuestras promociones?" : "Escribe tu respuesta",
      required: kind !== "cta",
      ...(kind === "singleChoice" ? { options: ["Masaje relajante", "Masaje sensorial", "Otro"] } : {}),
    }
    const fields = [...surveyFields, question]
    updateNode(surveyNode.id, { config: { ...surveyNode.config, fields } })
    setSelectedNodeId(surveyNode.id)
    setSelectedFieldId(question.id)
  }

  function updateQuestion(patch: Partial<SurveyField>) {
    if (!surveyNode || !selectedField) return
    const fields = surveyFields.map((field) => field.id === selectedField.id ? { ...field, ...patch } : field)
    updateNode(surveyNode.id, { config: { ...surveyNode.config, fields } })
  }

  function deleteQuestion() {
    if (!surveyNode || !selectedField || !window.confirm("¿Eliminar esta pregunta?")) return
    const fields = surveyFields.filter((field) => field.id !== selectedField.id)
    updateNode(surveyNode.id, { config: { ...surveyNode.config, fields } })
    setSelectedFieldId(fields[0]?.id ?? null)
  }

  function connect(connection: Connection) {
    if (!connection.source || !connection.target || connection.source === connection.target) return
    updateFlow((current) => ({
      ...current,
      edges: [...current.edges.filter((edge) => edge.from !== connection.source), { from: connection.source, to: connection.target }],
    }))
  }

  function saveNodePosition(_: unknown, node: Node) {
    updateNode(node.id, { position: node.position })
  }

  async function save() {
    setStatus("Guardando...")
    try {
      const response = await fetch(serverId ? `/api/admin/surveys/${serverId}` : "/api/admin/surveys", {
        method: serverId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ flow }),
      })
      if (!response.ok) throw new Error("Save failed")
      const saved = await response.json() as { id: string }
      setServerId(saved.id)
      setSavedFlows((current) => [...current.filter((item) => item.id !== saved.id), { id: saved.id, name: flow.name, graph: flow }])
      saveLocalFlow(flow)
      setStatus("Guardado en PostgreSQL")
    } catch {
      saveLocalFlow(flow)
      setStatus("No se conectó a API; guardado localmente")
    }
  }

  async function deleteFlow() {
    if (!serverId || !window.confirm("¿Eliminar este flujo guardado?")) return
    try {
      const response = await fetch(`/api/admin/surveys/${serverId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Delete failed")
      setSavedFlows((current) => current.filter((item) => item.id !== serverId))
      applyFlow(emptyFlow(), null, "Flujo eliminado")
    } catch {
      setStatus("No se pudo eliminar el flujo")
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5"><div className="grid size-8 place-items-center rounded-lg bg-slate-950 text-xs font-bold text-white">E</div><span className="font-semibold tracking-tight">ElementSpa Ops</span></div>
          <nav className="space-y-1 p-3 text-sm"><p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace</p><button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-slate-600 hover:bg-slate-50"><LayoutDashboard className="size-4" /> Overview</button><button className="flex w-full items-center gap-3 rounded-md bg-slate-950 px-3 py-2 font-medium text-white"><ClipboardList className="size-4" /> Encuestas</button><button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-slate-600 hover:bg-slate-50"><Users className="size-4" /> Audiencias</button><button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-slate-600 hover:bg-slate-50"><BarChart3 className="size-4" /> Resultados</button></nav>
          <div className="mt-auto border-t border-slate-200 p-3"><button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><Settings2 className="size-4" /> Configuración</button></div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-7"><div className="flex items-center gap-3"><button className="rounded-md p-2 hover:bg-slate-100 lg:hidden"><ChevronRight className="size-4" /></button><div><p className="text-xs text-slate-400">Encuestas / Constructor</p><p className="text-sm font-semibold">{flow.name}</p></div></div><div className="flex items-center gap-2"><span className="hidden text-xs text-slate-500 sm:inline-flex sm:items-center sm:gap-1">{status.includes("No ") || status.includes("no ") ? <CircleAlert className="size-3 text-amber-500" /> : <Check className="size-3 text-emerald-500" />}{status}</span>{serverId && <button onClick={deleteFlow} className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>}<button onClick={save} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"><Save className="size-4" /> Guardar</button></div></header>

          <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_360px]">
            <aside className="border-b border-slate-200 bg-white p-4 xl:border-b-0 xl:border-r">
              <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold">Flujos</h2><button onClick={() => applyFlow(emptyFlow(), null, "Flujo nuevo")} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"><FilePlus2 className="size-4" /></button></div>
              <div className="space-y-1">{savedFlows.length === 0 && <p className="rounded-md border border-dashed border-slate-200 p-3 text-xs leading-5 text-slate-500">Crea y guarda tu primer flujo.</p>}{savedFlows.map((item) => <button key={item.id} onClick={() => openFlow(item)} className={`flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm ${serverId === item.id ? "bg-slate-100 font-medium text-slate-950" : "text-slate-600 hover:bg-slate-50"}`}><span className="size-2 rounded-full bg-violet-500" /> <span className="truncate">{item.name}</span></button>)}</div>
              <div className="mt-6 border-t border-slate-100 pt-5"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Añadir paso</p><div className="grid grid-cols-2 gap-2">{(Object.keys(nodeMeta) as NodeType[]).map((type) => <button key={type} onClick={() => addNode(type)} className="rounded-md border border-slate-200 px-2 py-2 text-left text-xs font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50"><Plus className="mb-1 size-3" />{nodeMeta[type].label}</button>)}</div></div>
            </aside>

            <section className="flex min-h-[620px] min-w-0 flex-col bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3"><div className="flex items-center gap-2"><button className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">Flujo</button><button onClick={() => setPreviewOpen((value) => !value)} className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100">{previewOpen ? "Ocultar preview" : "Ver preview"}</button></div><div className="flex items-center gap-1 text-xs text-slate-400"><GripVertical className="size-4" /> Arrastra y conecta</div></div>
              <div className="min-h-0 flex-1"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={(_, node) => { setSelectedNodeId(node.id); setSelectedFieldId(null) }} onNodeDragStop={saveNodePosition} onConnect={connect} onEdgesDelete={(deleted) => updateFlow((current) => ({ ...current, edges: current.edges.filter((edge) => !deleted.some((item) => item.id === `${edge.from}-${edge.to}`)) }))} fitView><Background color="#cbd5e1" gap={20} size={1} /><Controls /><MiniMap nodeColor="#64748b" /></ReactFlow></div>
              <div className="border-t border-slate-200 bg-white p-3"><button onClick={() => applyFlow(seedFlow, null, "Ejemplo restaurado") } className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900"><ChevronLeft className="size-3" /> Restaurar ejemplo de tercera visita</button></div>
            </section>

            <aside className="border-t border-slate-200 bg-white xl:border-l xl:border-t-0">
              <div className="border-b border-slate-200 px-5 py-4"><h2 className="text-sm font-semibold">{selectedNode?.type === "survey" ? "Constructor de encuesta" : "Configuración del paso"}</h2><p className="mt-1 text-xs text-slate-500">{selectedNode ? nodeMeta[selectedNode.type].description : "Selecciona un paso del flujo"}</p></div>
              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-5">
                <div className="space-y-4"><div><label className="text-xs font-medium text-slate-600">Nombre del flujo</label><input value={flow.name} onChange={(event) => updateFlow((current) => ({ ...current, name: event.target.value }))} className="mt-1.5 h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-500" /></div><div><label className="text-xs font-medium text-slate-600">Descripción</label><textarea value={flow.description} onChange={(event) => updateFlow((current) => ({ ...current, description: event.target.value }))} className="mt-1.5 min-h-18 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-slate-500" /></div></div>
                {selectedNode && selectedNode.type !== "survey" && <div className="mt-6 space-y-4 border-t border-slate-100 pt-5"><div><label className="text-xs font-medium text-slate-600">Nombre del paso</label><input value={selectedNode.label} onChange={(event) => updateNode(selectedNode.id, { label: event.target.value })} className="mt-1.5 h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-500" /></div>{selectedNode.type === "trigger" && <div><label className="text-xs font-medium text-slate-600">Número de visitas</label><input type="number" min={1} value={Number(selectedNode.config.visitCount ?? 3)} onChange={(event) => updateNode(selectedNode.id, { config: { ...selectedNode.config, visitCount: Math.max(1, Number(event.target.value)) } })} className="mt-1.5 h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-500" /></div>}{selectedNode.type === "condition" && <div><label className="text-xs font-medium text-slate-600">Regla</label><input value={String(selectedNode.config.rule ?? "")} onChange={(event) => updateNode(selectedNode.id, { config: { ...selectedNode.config, rule: event.target.value } })} className="mt-1.5 h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-500" /></div>}{selectedNode.type === "action" && <div><label className="text-xs font-medium text-slate-600">Mensaje final</label><textarea value={String(selectedNode.config.message ?? "")} onChange={(event) => updateNode(selectedNode.id, { config: { ...selectedNode.config, message: event.target.value } })} className="mt-1.5 min-h-20 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-slate-500" /></div>}<button onClick={removeNode} className="inline-flex items-center gap-2 text-xs font-medium text-red-600"><Trash2 className="size-3" /> Eliminar paso</button></div>}
                {selectedNode?.type === "survey" && <div className="mt-6 border-t border-slate-100 pt-5"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-slate-700">Preguntas</span><div className="flex gap-1"><button onClick={() => addQuestion("text")} className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium">+ Texto</button><button onClick={() => addQuestion("singleChoice")} className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium">+ Opción</button><button onClick={() => addQuestion("rating")} className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium">+ Rating</button></div></div><div className="space-y-2">{surveyFields.length === 0 && <p className="rounded-md border border-dashed border-slate-200 p-3 text-xs text-slate-500">Añade una pregunta para construir la encuesta.</p>}{surveyFields.map((field, index) => <button key={field.id} onClick={() => setSelectedFieldId(field.id)} className={`flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left ${selectedField?.id === field.id ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}><span className="grid size-5 place-items-center rounded bg-slate-100 text-[10px] font-semibold">{index + 1}</span><span className="min-w-0 flex-1 truncate text-xs font-medium">{field.label}</span><ChevronRight className="size-3 text-slate-400" /></button>)}</div>{selectedField && <div className="mt-4 space-y-3 rounded-lg border border-slate-200 p-3"><div><label className="text-xs font-medium text-slate-600">Tipo</label><select value={selectedField.kind} onChange={(event) => updateQuestion({ kind: event.target.value as SurveyField["kind"] })} className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"><option value="text">Texto abierto</option><option value="singleChoice">Opción única</option><option value="rating">Rating</option><option value="cta">CTA</option></select></div><div><label className="text-xs font-medium text-slate-600">Pregunta</label><textarea value={selectedField.label} onChange={(event) => updateQuestion({ label: event.target.value })} className="mt-1 min-h-18 w-full rounded-md border border-slate-200 p-2 text-sm" /></div>{selectedField.kind === "singleChoice" && <div><label className="text-xs font-medium text-slate-600">Opciones, una por línea</label><textarea value={(selectedField.options ?? []).join("\n")} onChange={(event) => updateQuestion({ options: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} className="mt-1 min-h-20 w-full rounded-md border border-slate-200 p-2 text-sm" /></div>}<label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={selectedField.required} onChange={(event) => updateQuestion({ required: event.target.checked })} /> Obligatoria</label><button onClick={deleteQuestion} className="text-xs font-medium text-red-600">Eliminar pregunta</button></div>}</div>}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {previewOpen && <aside className="fixed bottom-5 right-5 z-50 w-[min(390px,calc(100vw-2.5rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><div className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded bg-slate-950 text-white"><Play className="size-3" /></span><span className="text-sm font-semibold">Vista del visitante</span></div><button onClick={() => setPreviewOpen(false)} className="text-slate-400 hover:text-slate-900">×</button></div><div className="p-4"><div className="mb-4 flex items-center justify-between rounded-md bg-slate-50 p-2 text-xs"><span className="text-slate-500">Visitas simuladas</span><select value={visits} onChange={(event) => setVisits(Number(event.target.value))} className="rounded border border-slate-200 bg-white px-2 py-1"><option value={2}>2</option><option value={3}>3</option><option value={4}>4+</option></select></div>{!evaluation.matched ? <div className="py-8 text-center"><p className="text-sm font-semibold">Todavía no aparece</p><p className="mt-1 text-xs text-slate-500">La encuesta se activa desde {Number(flow.nodes.find((node) => node.type === "trigger")?.config.visitCount ?? 3)} visitas.</p></div> : surveyFields.length === 0 ? <div className="py-8 text-center text-sm text-slate-500">Añade preguntas al nodo Encuesta.</div> : <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{flow.name}</p><h3 className="mt-2 text-lg font-semibold leading-6">Cuéntanos sobre tu experiencia</h3><div className="mt-5 space-y-5">{surveyFields.map((field, index) => <div key={field.id}><label className="text-sm font-medium">{index + 1}. {field.label}{field.required && <span className="text-rose-500"> *</span>}</label>{field.kind === "text" && <textarea value={String(answers[field.id] ?? "")} onChange={(event) => setAnswers((current) => ({ ...current, [field.id]: event.target.value }))} placeholder="Escribe tu respuesta" className="mt-2 min-h-20 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-slate-900" />}{field.kind === "singleChoice" && <div className="mt-2 space-y-2">{(field.options ?? []).map((option) => <button key={option} onClick={() => setAnswers((current) => ({ ...current, [field.id]: option }))} className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${answers[field.id] === option ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 hover:border-slate-400"}`}>{option}</button>)}</div>}{field.kind === "rating" && <div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button key={value} onClick={() => setAnswers((current) => ({ ...current, [field.id]: value }))} className={`grid size-9 place-items-center rounded-md text-sm font-medium ${answers[field.id] === value ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{value}</button>)}</div>}{field.kind === "cta" && <button onClick={() => setAnswers((current) => ({ ...current, [field.id]: "clicked" }))} className="mt-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white">Sí, quiero saber más</button>}</div>)}</div><div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs text-slate-400">Preview solamente</span><button className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white">Continuar</button></div></div>}</div></aside>}
    </main>
  )
}
