"use client";

import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { FilePlus2, Plus, Save, Send, Trash2 } from "lucide-react";
import type {
  ConditionConfig,
  SurveyField,
  SurveyFlow,
  VisitorSignals,
  WorkflowNode,
} from "@/lib/surveys/model";
import { evaluateFlow } from "@/lib/surveys/evaluator";
import { createStarterFlow } from "@/lib/surveys/fixtures";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { toast } from "sonner";
import { validateFlow } from "@/lib/surveys/schema";
import type { SurveyAnalytics } from "@/lib/surveys/analytics";
import { demoSurveyAnalytics } from "@/lib/surveys/analytics-demo";
import { locations, services } from "@/lib/data";

type StoredFlow = {
  id: string;
  name: string;
  status: "draft" | "published" | "paused";
  graph: SurveyFlow;
};
type NodeKind = "trigger" | "condition" | "survey" | "action";
type WorkflowCanvasNode = Node<{ node: WorkflowNode }, "workflow">;
type StudioTab = "canvas" | "data";

const meta: Record<NodeKind, { name: string; color: string }> = {
  trigger: { name: "Trigger", color: "border-violet-500" },
  condition: { name: "Condición", color: "border-amber-500" },
  survey: { name: "Encuesta", color: "border-pink-500" },
  action: { name: "Final", color: "border-emerald-500" },
};

function WorkflowNodeCard({ data, selected }: NodeProps<WorkflowCanvasNode>) {
  const node = data.node;
  const subtitle =
    node.type === "trigger"
      ? `${node.config.visitCount ?? 3}+ visitas`
      : node.type === "condition"
        ? conditionDescription(node.config as ConditionConfig)
        : node.type === "survey"
          ? `${((node.config.fields as SurveyField[] | undefined) ?? []).length} preguntas`
          : String(node.config.message ?? "Acción");

  return (
    <div
      className={`relative min-w-52 rounded-xl border-l-4 bg-white shadow-sm ${meta[node.type as NodeKind]?.color ?? "border-slate-400"} ${selected ? "ring-2 ring-slate-900/15" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-3 !border-2 !border-white !bg-slate-500"
      />
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {meta[node.type as NodeKind]?.name}
        </p>
        <p className="mt-2 text-sm font-semibold">{node.label}</p>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
      {node.type === "condition" ? (
        <div className="absolute -right-20 top-3 grid gap-5 text-[10px] font-semibold text-slate-500">
          <span>Match</span>
          <span>Otherwise</span>
          <Handle
            id="match"
            type="source"
            position={Position.Right}
            style={{ top: 7 }}
            className="!size-3 !border-2 !border-white !bg-emerald-500"
          />
          <Handle
            id="else"
            type="source"
            position={Position.Right}
            style={{ top: 33 }}
            className="!size-3 !border-2 !border-white !bg-amber-500"
          />
        </div>
      ) : (
        <Handle
          id="next"
          type="source"
          position={Position.Right}
          className="!size-3 !border-2 !border-white !bg-slate-500"
        />
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  workflow: WorkflowNodeCard as NodeTypes[string],
};

function toNodes(flow: SurveyFlow): WorkflowCanvasNode[] {
  return flow.nodes.map((node, index) => ({
    id: node.id,
    type: "workflow",
    position: node.position ?? { x: 100 + index * 260, y: 170 },
    data: { node },
  }));
}

function toEdges(flow: SurveyFlow): Edge[] {
  return flow.edges.map((edge) => ({
    id: `${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    sourceHandle: edge.outcome ?? "next",
    label:
      edge.outcome === "match"
        ? "Match"
        : edge.outcome === "else"
          ? "Otherwise"
          : undefined,
    animated: true,
    style: { stroke: "#64748b", strokeWidth: 2 },
  }));
}

function conditionDescription(config: ConditionConfig) {
  switch (config.kind) {
    case "visitCount":
      return `${config.value}+ visitas`;
    case "pagePath":
      return config.value;
    case "selectedServiceId":
      return (
        services.find((service) => String(service.id) === config.value)
          ?.title ?? "Servicio"
      );
    case "selectedBranchId":
      return (
        locations[config.value as keyof typeof locations]?.name ?? "Sucursal"
      );
    case "whatsappBookingIntent":
      return "Intención WhatsApp";
    case "cooldown":
      return `${Math.round(config.value / 60_000)} min`;
  }
}

function defaultCondition(): ConditionConfig {
  return { kind: "visitCount", operator: "gte", value: 3 };
}

function conditionForKind(kind: ConditionConfig["kind"]): ConditionConfig {
  switch (kind) {
    case "visitCount":
      return { kind, operator: "gte", value: 3 };
    case "pagePath":
      return { kind, operator: "equals", value: "/" };
    case "selectedServiceId":
      return {
        kind,
        operator: "equals",
        value: String(services[0]?.id ?? ""),
      };
    case "selectedBranchId":
      return {
        kind,
        operator: "equals",
        value: Object.keys(locations)[0] ?? "",
      };
    case "whatsappBookingIntent":
      return { kind, operator: "isTrue", value: true };
    case "cooldown":
      return { kind, operator: "elapsed", value: 86_400_000 };
  }
}

export function SurveyStudioApp() {
  const [flows, setFlows] = useState<StoredFlow[]>([]);
  const [flow, setFlow] = useState<SurveyFlow | null>(null);
  const [serverId, setServerId] = useState<string | null>(null);
  const [status, setStatus] = useState("Cargando encuestas...");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StudioTab>("canvas");
  const [pendingDelete, setPendingDelete] = useState<"node" | "survey" | null>(
    null,
  );
  const [previewSignals, setPreviewSignals] = useState<VisitorSignals>({
    visitCount: 3,
    pathname: "/",
  });
  const [previewNow, setPreviewNow] = useState(() => Date.now());
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowCanvasNode>(
    [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    let active = true;

    async function refreshFlows() {
      try {
        const response = await fetch("/api/admin/surveys");
        if (!response.ok) throw new Error("Could not load surveys");
        const data = (await response.json()) as {
          flows: Array<{
            id: string;
            name: string;
            status: StoredFlow["status"];
            graph: SurveyFlow;
          }>;
        };
        if (!active) return;
        const loaded = data.flows.map((item) => ({
          id: item.id,
          name: item.name,
          status: item.status,
          graph: item.graph,
        }));
        setFlows(loaded);
        const current = loaded.find((item) => item.id === serverId);
        if (current) return;
        if (loaded[0]) open(loaded[0]);
        else {
          setFlow(null);
          setServerId(null);
          setSelectedId(null);
          setStatus("Crea tu primera encuesta");
        }
      } catch {
        if (active) setStatus("No se pudo cargar PostgreSQL");
      }
    }

    void refreshFlows();
    window.addEventListener("focus", refreshFlows);
    return () => {
      active = false;
      window.removeEventListener("focus", refreshFlows);
    };
  }, [serverId]);

  useEffect(() => {
    if (flow) {
      setNodes(toNodes(flow));
      setEdges(toEdges(flow));
    }
  }, [flow, setEdges, setNodes]);

  const selected = flow?.nodes.find((node) => node.id === selectedId);
  const currentStatus = flows.find((item) => item.id === serverId)?.status;
  const result = flow ? evaluateFlow(flow, previewSignals, previewNow) : null;

  function open(item: StoredFlow) {
    setFlow(item.graph);
    setServerId(item.id);
    setSelectedId(item.graph.nodes[0]?.id ?? null);
    setStatus(item.status === "published" ? "Publicada" : "Borrador guardado");
  }
  function mutate(updater: (current: SurveyFlow) => SurveyFlow) {
    setFlow((current) =>
      current
        ? { ...updater(current), updatedAt: new Date().toISOString() }
        : current,
    );
    setStatus("Cambios sin guardar");
  }
  function updateNode(id: string, patch: Partial<WorkflowNode>) {
    mutate((current) => ({
      ...current,
      nodes: current.nodes.map((node) =>
        node.id === id ? { ...node, ...patch } : node,
      ),
    }));
  }

  async function create() {
    const draft = createStarterFlow();
    setStatus("Creando borrador...");
    const response = await fetch("/api/admin/surveys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flow: draft }),
    });
    if (!response.ok)
      return setStatus(`No se pudo crear: ${await response.text()}`);
    const item = (await response.json()) as StoredFlow;
    setFlows((current) => [item, ...current]);
    open(item);
    setStatus("Borrador creado");
  }

  function addNode(type: NodeKind) {
    if (!flow) return;
    const id = crypto.randomUUID();
    const config =
      type === "trigger"
        ? { visitCount: 3, pagePath: "/" }
        : type === "condition"
          ? defaultCondition()
          : type === "survey"
            ? { fields: [] }
            : { message: "Gracias por tu respuesta" };
    const node: WorkflowNode = {
      id,
      type,
      label:
        type === "trigger"
          ? "Visitante recurrente"
          : type === "condition"
            ? "Condición"
            : type === "survey"
              ? "Nueva encuesta"
              : "Mensaje final",
      config,
      position: { x: 130 + flow.nodes.length * 250, y: 170 },
    };
    mutate((current) => ({ ...current, nodes: [...current.nodes, node] }));
    setSelectedId(id);
  }

  function connect(connection: Connection) {
    if (!connection.source || !connection.target) return;
    const source = flow?.nodes.find((node) => node.id === connection.source);
    const outcome =
      source?.type === "condition"
        ? connection.sourceHandle === "match"
          ? "match"
          : connection.sourceHandle === "else"
            ? "else"
            : null
        : "next";
    if (!outcome) return setStatus("Usa Match u Otherwise para la condición");
    mutate((current) => ({
      ...current,
      edges: [
        ...current.edges.filter(
          (edge) =>
            !(edge.from === connection.source && edge.outcome === outcome),
        ),
        { from: connection.source, to: connection.target, outcome },
      ],
    }));
  }
  function removeNode() {
    if (!selectedId) return;
    setPendingDelete("node");
  }
  function confirmRemoveNode() {
    if (!selectedId) return;
    mutate((current) => ({
      ...current,
      nodes: current.nodes.filter((node) => node.id !== selectedId),
      edges: current.edges.filter(
        (edge) => edge.from !== selectedId && edge.to !== selectedId,
      ),
    }));
    setSelectedId(null);
    setPendingDelete(null);
    toast.success("Nodo eliminado");
  }

  function addQuestion(kind: SurveyField["kind"]) {
    if (!selected || selected.type !== "survey") return null;
    const question: SurveyField = {
      id: crypto.randomUUID(),
      kind,
      label:
        kind === "rating"
          ? "¿Qué tan probable es que reserves?"
          : kind === "singleChoice"
            ? "¿Qué experiencia te interesa?"
            : "Escribe tu respuesta",
      required: true,
      ...(kind === "singleChoice"
        ? { options: ["Relajación", "Sensorial", "Tántrico"] }
        : {}),
    };
    const fields = [
      ...((selected.config.fields as SurveyField[] | undefined) ?? []),
      question,
    ];
    updateNode(selected.id, { config: { ...selected.config, fields } });
    return question.id;
  }

  async function save(nextStatus?: StoredFlow["status"]) {
    if (!flow || !serverId) return;
    if (nextStatus === "published") {
      const validated = validateFlow(flow);
      if (!validated.success)
        return setStatus(
          validated.error.issues[0]?.message ?? "Flujo inválido",
        );
    }
    setStatus(nextStatus === "published" ? "Publicando..." : "Guardando...");
    const response = await fetch(`/api/admin/surveys/${serverId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flow, status: nextStatus }),
    });
    if (!response.ok)
      return setStatus(`No se pudo guardar: ${await response.text()}`);
    const saved = (await response.json()) as StoredFlow;
    setFlows((current) =>
      current.map((item) => (item.id === serverId ? saved : item)),
    );
    setFlow(saved.graph);
    setStatus(
      saved.status === "published"
        ? "Encuesta publicada"
        : saved.status === "paused"
          ? "Encuesta pausada"
          : "Borrador guardado",
    );
  }

  function deleteSurvey() {
    if (serverId) setPendingDelete("survey");
  }

  async function confirmDeleteSurvey() {
    if (!serverId) return;
    setStatus("Eliminando encuesta...");
    const response = await fetch(`/api/admin/surveys/${serverId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error("No se pudo eliminar la encuesta");
      return setStatus(`No se pudo eliminar: ${await response.text()}`);
    }

    const remaining = flows.filter((item) => item.id !== serverId);
    setFlows(remaining);
    if (remaining[0]) open(remaining[0]);
    else {
      setFlow(null);
      setServerId(null);
      setSelectedId(null);
      setStatus("Crea tu primera encuesta");
    }
    setPendingDelete(null);
    toast.success("Encuesta eliminada");
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="flex min-h-16 flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <div className="mr-auto shrink-0">
          <p className="text-xs text-slate-400">Survey Studio</p>
          <h1 className="text-sm font-semibold">
            Encuestas por automatización
          </h1>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          <span className="hidden text-xs text-slate-500 2xl:block">
            {status}
          </span>
          {flow && (
            <>
              <button
                onClick={() => save()}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium"
              >
                <Save className="mr-1 inline size-4" /> Guardar
              </button>
              <button
                onClick={() => save("published")}
                className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white"
              >
                <Send className="mr-1 inline size-4" />
                {currentStatus === "paused" ? "Reactivar" : "Publicar"}
              </button>
              {currentStatus === "published" && (
                <button
                  onClick={() => save("paused")}
                  className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
                >
                  Pausar
                </button>
              )}
              {serverId && (
                <button
                  onClick={() => window.open(`/?preview=${serverId}`, "_blank")}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  <span className="hidden xl:inline">Probar en landing</span>
                  <span className="xl:hidden">Probar</span>
                </button>
              )}
              {serverId && (
                <button
                  onClick={() => void deleteSurvey()}
                  aria-label="Eliminar encuesta"
                  className="grid size-9 place-items-center rounded-md text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
              <AdminLogoutButton />
            </>
          )}
        </div>
      </header>
      <div className="grid min-h-[calc(100vh-4rem)] xl:grid-cols-[250px_minmax(0,1fr)_350px]">
        <aside className="border-r border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Encuestas</h2>
            <button
              onClick={create}
              className="rounded-md bg-slate-950 p-2 text-white"
            >
              <FilePlus2 className="size-4" />
            </button>
          </div>
          <div className="mt-4 space-y-1">
            {flows.length === 0 && (
              <p className="rounded border border-dashed border-slate-200 p-3 text-xs text-slate-500">
                Crea una encuesta para empezar.
              </p>
            )}
            {flows.map((item) => (
              <button
                key={item.id}
                onClick={() => open(item)}
                className={`w-full rounded-md border px-3 py-3 text-left ${item.id === serverId ? "border-slate-900 bg-slate-50" : "border-transparent hover:bg-slate-50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium">
                    {item.name}
                  </span>
                  <span
                    className={`size-2 rounded-full ${item.status === "published" ? "bg-emerald-500" : item.status === "paused" ? "bg-amber-500" : "bg-slate-300"}`}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {item.status === "published"
                    ? "Publicada"
                    : item.status === "paused"
                      ? "Pausada"
                      : "Borrador"}
                </p>
              </button>
            ))}
          </div>
        </aside>
        <section className="flex min-h-[650px] min-w-0 flex-col bg-slate-50">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-fit rounded-lg bg-slate-100 p-1 text-sm font-medium">
              {(
                [
                  ["canvas", "Canvas"],
                  ["data", "Datos"],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-3 py-1.5 transition ${activeTab === tab ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              {activeTab === "canvas"
                ? "Conecta Trigger → Condición → Encuesta"
                : "Resultados de la encuesta seleccionada"}
            </p>
          </div>
          {activeTab === "canvas" &&
            (flow ? (
              <div className="min-h-0 flex-1">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={(_, node) => setSelectedId(node.id)}
                  onConnect={connect}
                  onNodeDragStop={(_, node) =>
                    updateNode(node.id, { position: node.position })
                  }
                  fitView
                >
                  <Panel position="top-left">
                    <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                      <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Añadir nodo
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(
                          [
                            "trigger",
                            "condition",
                            "survey",
                            "action",
                          ] as NodeKind[]
                        ).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => addNode(type)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            <Plus className="size-3" /> {meta[type].name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Panel>
                  <Background color="#cbd5e1" gap={20} size={1} />
                  <Controls />
                  <MiniMap nodeColor="#64748b" />
                </ReactFlow>
              </div>
            ) : (
              <div className="grid flex-1 place-items-center text-sm text-slate-500">
                Crea una encuesta para abrir el canvas.
              </div>
            ))}
          {activeTab === "data" && (
            <div className="overflow-y-auto p-4 sm:p-6">
              <AnalyticsPanel flow={flow} serverId={serverId} />
            </div>
          )}
        </section>
        <aside className="border-l border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold">Inspector</h2>
            <p className="mt-1 text-xs text-slate-500">
              Configura el nodo seleccionado.
            </p>
          </div>
          {flow && (
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-5">
              <label className="block text-xs font-medium text-slate-600">
                Nombre de encuesta
                <input
                  value={flow.name}
                  onChange={(event) =>
                    mutate((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="mt-1.5 h-9 w-full rounded border border-slate-200 px-3 text-sm"
                />
              </label>
              {selected ? (
                <NodeInspector
                  node={selected}
                  updateNode={updateNode}
                  addQuestion={addQuestion}
                  removeNode={removeNode}
                />
              ) : (
                <p className="mt-6 text-sm text-slate-500">
                  Selecciona un nodo.
                </p>
              )}
              <Preview
                result={result}
                signals={previewSignals}
                setSignals={setPreviewSignals}
                previewNow={previewNow}
                refreshNow={() => setPreviewNow(Date.now())}
                flowId={flow.id}
                compact
              />
            </div>
          )}
        </aside>
      </div>
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={
          pendingDelete === "survey"
            ? "¿Eliminar esta encuesta?"
            : "¿Eliminar este nodo?"
        }
        description={
          pendingDelete === "survey"
            ? "Se eliminarán también sus respuestas. Esta acción no se puede deshacer."
            : "Las conexiones de este nodo también se eliminarán. Esta acción no se puede deshacer."
        }
        onConfirm={() => {
          if (pendingDelete === "survey") void confirmDeleteSurvey();
          else confirmRemoveNode();
        }}
      />
    </main>
  );
}

const ANALYTICS_MODES = {
  REAL: "real",
  DEMO: "demo",
} as const;

type AnalyticsMode = (typeof ANALYTICS_MODES)[keyof typeof ANALYTICS_MODES];

function AnalyticsPanel({
  flow,
  serverId,
}: {
  flow: SurveyFlow | null;
  serverId: string | null;
}) {
  const [mode, setMode] = useState<AnalyticsMode>(ANALYTICS_MODES.REAL);
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fields = flow
    ? flow.nodes
        .filter((node) => node.type === "survey")
        .flatMap(
          (node) => (node.config.fields as SurveyField[] | undefined) ?? [],
        )
    : [];
  const demoAnalytics = flow ? demoSurveyAnalytics(fields) : null;

  useEffect(() => {
    if (mode !== ANALYTICS_MODES.REAL || !serverId) {
      setAnalytics(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setAnalytics(null);
    setError(null);
    setLoading(true);
    void fetch(`/api/admin/surveys/${serverId}/analytics`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("No se pudo cargar el reporte.");
        return (await response.json()) as SurveyAnalytics;
      })
      .then((data) => setAnalytics(data))
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError")
          return;
        setError("No se pudo cargar el reporte. Intenta de nuevo.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [mode, serverId]);

  const activeAnalytics =
    mode === ANALYTICS_MODES.DEMO ? demoAnalytics : analytics;
  const hasAnalyzableFields = fields.some(
    (field) =>
      field.kind === "rating" ||
      field.kind === "singleChoice" ||
      field.kind === "text",
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Respuestas</h2>
            {mode === ANALYTICS_MODES.DEMO && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                Demo
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Resultados de la encuesta seleccionada.
          </p>
        </div>
        {flow && (
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
            <button
              onClick={() => setMode(ANALYTICS_MODES.REAL)}
              className={`rounded-md px-3 py-1.5 ${mode === ANALYTICS_MODES.REAL ? "bg-slate-950 text-white shadow-sm" : "text-slate-600"}`}
            >
              Datos reales
            </button>
            <button
              onClick={() => setMode(ANALYTICS_MODES.DEMO)}
              className={`rounded-md px-3 py-1.5 ${mode === ANALYTICS_MODES.DEMO ? "bg-slate-950 text-white shadow-sm" : "text-slate-600"}`}
            >
              Datos demo
            </button>
          </div>
        )}
      </div>

      {!flow ? (
        <PanelMessage>
          Selecciona una encuesta para ver sus respuestas.
        </PanelMessage>
      ) : !hasAnalyzableFields ? (
        <PanelMessage>
          Añade preguntas de rating, opción o texto para analizar respuestas.
        </PanelMessage>
      ) : mode === ANALYTICS_MODES.REAL && !serverId ? (
        <PanelMessage>
          Guarda esta encuesta para ver datos reales. Puedes explorar Datos demo
          mientras tanto.
        </PanelMessage>
      ) : loading ? (
        <PanelMessage>Cargando respuestas...</PanelMessage>
      ) : error ? (
        <PanelMessage>{error}</PanelMessage>
      ) : activeAnalytics ? (
        <AnalyticsContent
          analytics={activeAnalytics}
          isDemo={mode === ANALYTICS_MODES.DEMO}
        />
      ) : null}
    </section>
  );
}

function PanelMessage({ children }: { children: string }) {
  return (
    <p className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
      {children}
    </p>
  );
}

function AnalyticsContent({
  analytics,
  isDemo,
}: {
  analytics: SurveyAnalytics;
  isDemo: boolean;
}) {
  if (!isDemo && analytics.totalResponses === 0) {
    return (
      <div className="mt-5">
        <TotalResponses total={0} />
        <PanelMessage>
          Aún no han llegado respuestas reales para esta encuesta.
        </PanelMessage>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-4">
      <TotalResponses total={analytics.totalResponses} />
      <div className="grid gap-3 lg:grid-cols-2">
        {analytics.questions.map((question) => (
          <article
            key={question.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {question.kind === "rating"
                ? "Rating"
                : question.kind === "singleChoice"
                  ? "Opción"
                  : "Texto"}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-slate-800">
              {question.label}
            </h3>
            {question.rating && <RatingAnalytics analytics={question.rating} />}
            {question.choice && (
              <ChoiceAnalytics options={question.choice.options} />
            )}
            {question.text && (
              <TextAnalytics responses={question.text.responses} />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function TotalResponses({ total }: { total: number }) {
  return (
    <div className="inline-flex min-w-32 flex-col rounded-xl bg-slate-950 px-4 py-3 text-white">
      <span className="text-2xl font-semibold">{total}</span>
      <span className="text-xs text-slate-300">respuestas</span>
    </div>
  );
}

function RatingAnalytics({
  analytics,
}: {
  analytics: NonNullable<SurveyAnalytics["questions"][number]["rating"]>;
}) {
  const maximum = Math.max(
    ...analytics.distribution.map((item) => item.count),
    1,
  );
  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm text-slate-600">
        {analytics.average === null
          ? "Sin calificaciones"
          : `${analytics.average.toFixed(1)} / 5`}
        <span className="ml-2 text-xs text-slate-400">
          {analytics.count} respuestas
        </span>
      </p>
      {analytics.distribution.map((item) => (
        <DistributionBar
          key={item.value}
          label={`${item.value}`}
          count={item.count}
          maximum={maximum}
        />
      ))}
    </div>
  );
}

function ChoiceAnalytics({
  options,
}: {
  options: NonNullable<
    SurveyAnalytics["questions"][number]["choice"]
  >["options"];
}) {
  const maximum = Math.max(...options.map((option) => option.count), 1);
  return (
    <div className="mt-4 space-y-2">
      {options.length ? (
        options.map((option) => (
          <DistributionBar
            key={option.value}
            label={option.value}
            count={option.count}
            maximum={maximum}
          />
        ))
      ) : (
        <p className="text-sm text-slate-500">No hay opciones configuradas.</p>
      )}
    </div>
  );
}

function DistributionBar({
  label,
  count,
  maximum,
}: {
  label: string;
  count: number;
  maximum: number;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_2rem] items-center gap-2 text-xs text-slate-600">
      <div className="min-w-0">
        <div className="mb-1 flex justify-between gap-2">
          <span className="truncate">{label}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-900"
            style={{ width: `${(count / maximum) * 100}%` }}
          />
        </div>
      </div>
      <span className="text-right tabular-nums">{count}</span>
    </div>
  );
}

function TextAnalytics({
  responses,
}: {
  responses: NonNullable<
    SurveyAnalytics["questions"][number]["text"]
  >["responses"];
}) {
  return (
    <div className="mt-4 space-y-3">
      {responses.length ? (
        responses.map((response, index) => (
          <div
            key={`${response.createdAt}-${index}`}
            className="border-l-2 border-slate-200 pl-3"
          >
            <p className="text-sm text-slate-700">{response.value}</p>
            <time
              className="mt-1 block text-[11px] text-slate-400"
              dateTime={response.createdAt}
            >
              {new Intl.DateTimeFormat("es-MX", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(response.createdAt))}
            </time>
          </div>
        ))
      ) : (
        <p className="text-sm text-slate-500">Sin respuestas de texto.</p>
      )}
    </div>
  );
}

function NodeInspector({
  node,
  updateNode,
  addQuestion,
  removeNode,
}: {
  node: WorkflowNode;
  updateNode: (id: string, patch: Partial<WorkflowNode>) => void;
  addQuestion: (kind: SurveyField["kind"]) => string | null;
  removeNode: () => void;
}) {
  const fields = (node.config.fields as SurveyField[] | undefined) ?? [];
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const selectedField =
    fields.find((field) => field.id === selectedFieldId) ?? fields[0] ?? null;

  function updateField(id: string, patch: Partial<SurveyField>) {
    updateNode(node.id, {
      config: {
        ...node.config,
        fields: fields.map((field) =>
          field.id === id ? { ...field, ...patch } : field,
        ),
      },
    });
  }

  function deleteField(id: string) {
    const remaining = fields.filter((field) => field.id !== id);
    updateNode(node.id, {
      config: { ...node.config, fields: remaining },
    });
    setSelectedFieldId(remaining[0]?.id ?? null);
  }

  return (
    <div className="mt-6 border-t border-slate-100 pt-5">
      <div className="rounded-xl bg-slate-950 p-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Editando {meta[node.type as NodeKind]?.name}
        </p>
        <p className="mt-1 text-sm font-semibold">{node.label}</p>
      </div>
      <label className="mt-5 block text-xs font-medium text-slate-600">
        Nombre del nodo
        <input
          value={node.label}
          onChange={(event) =>
            updateNode(node.id, { label: event.target.value })
          }
          className="mt-1.5 h-9 w-full rounded border border-slate-200 px-3 text-sm"
        />
      </label>
      {node.type === "trigger" && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Cuándo mostrar
          </p>
          <div className="grid gap-3">
            <label className="text-xs font-medium text-slate-600">
              Visitas mínimas
              <input
                type="number"
                min={1}
                value={Number(node.config.visitCount ?? 3)}
                onChange={(event) =>
                  updateNode(node.id, {
                    config: {
                      ...node.config,
                      visitCount: Number(event.target.value),
                    },
                  })
                }
                className="mt-1.5 h-9 w-full rounded border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-slate-600">
              Página
              <input
                value={String(node.config.pagePath ?? "/")}
                onChange={(event) =>
                  updateNode(node.id, {
                    config: { ...node.config, pagePath: event.target.value },
                  })
                }
                className="mt-1.5 h-9 w-full rounded border border-slate-200 px-3 text-sm"
              />
            </label>
          </div>
        </div>
      )}
      {node.type === "condition" && (
        <ConditionInspector node={node} updateNode={updateNode} />
      )}
      {node.type === "survey" && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Preguntas
            </p>
            <span className="text-xs text-slate-500">{fields.length}</span>
          </div>
          <div className="mt-3 flex gap-1">
            <button
              onClick={() => {
                const id = addQuestion("text");
                if (id) setSelectedFieldId(id);
              }}
              className="rounded bg-slate-100 px-2 py-1 text-xs"
            >
              + Texto
            </button>
            <button
              onClick={() => {
                const id = addQuestion("singleChoice");
                if (id) setSelectedFieldId(id);
              }}
              className="rounded bg-slate-100 px-2 py-1 text-xs"
            >
              + Opción
            </button>
            <button
              onClick={() => {
                const id = addQuestion("rating");
                if (id) setSelectedFieldId(id);
              }}
              className="rounded bg-slate-100 px-2 py-1 text-xs"
            >
              + Rating
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {fields.length === 0 && (
              <p className="text-xs text-slate-500">
                Añade al menos una pregunta.
              </p>
            )}
            {fields.map((field, index) => (
              <button
                key={field.id}
                type="button"
                onClick={() => setSelectedFieldId(field.id)}
                className={`w-full rounded border p-3 text-left transition ${selectedField?.id === field.id ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}
              >
                <span className="text-xs text-slate-400">
                  Pregunta {index + 1}
                </span>
                <p className="mt-1 truncate text-sm font-medium">
                  {field.label}
                </p>
                <p className="mt-1 text-xs text-slate-400">{field.kind}</p>
              </button>
            ))}
          </div>
          {selectedField && (
            <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-700">
                Editar pregunta
              </p>
              <label className="block text-xs font-medium text-slate-600">
                Tipo
                <select
                  value={selectedField.kind}
                  onChange={(event) =>
                    updateField(selectedField.id, {
                      kind: event.target.value as SurveyField["kind"],
                      options:
                        event.target.value === "singleChoice"
                          ? (selectedField.options ?? ["Opción 1", "Opción 2"])
                          : undefined,
                    })
                  }
                  className="mt-1.5 h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm"
                >
                  <option value="text">Texto abierto</option>
                  <option value="singleChoice">Opción única</option>
                  <option value="rating">Rating</option>
                </select>
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Pregunta
                <textarea
                  value={selectedField.label}
                  onChange={(event) =>
                    updateField(selectedField.id, { label: event.target.value })
                  }
                  className="mt-1.5 min-h-18 w-full rounded border border-slate-200 p-2 text-sm"
                />
              </label>
              {selectedField.kind === "singleChoice" && (
                <label className="block text-xs font-medium text-slate-600">
                  Opciones, una por línea
                  <textarea
                    value={(selectedField.options ?? []).join("\n")}
                    onChange={(event) =>
                      updateField(selectedField.id, {
                        options: event.target.value
                          .split("\n")
                          .map((option) => option.trim())
                          .filter(Boolean),
                      })
                    }
                    className="mt-1.5 min-h-20 w-full rounded border border-slate-200 p-2 text-sm"
                  />
                </label>
              )}
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={selectedField.required}
                  onChange={(event) =>
                    updateField(selectedField.id, {
                      required: event.target.checked,
                    })
                  }
                />
                Pregunta obligatoria
              </label>
              <button
                type="button"
                onClick={() => deleteField(selectedField.id)}
                className="text-xs font-medium text-red-600"
              >
                Eliminar pregunta
              </button>
            </div>
          )}
        </div>
      )}
      {node.type === "action" && (
        <label className="mt-4 block text-xs font-medium text-slate-600">
          Mensaje
          <textarea
            value={String(node.config.message ?? "")}
            onChange={(event) =>
              updateNode(node.id, {
                config: { ...node.config, message: event.target.value },
              })
            }
            className="mt-1.5 min-h-20 w-full rounded border border-slate-200 p-2 text-sm"
          />
        </label>
      )}
      <button
        onClick={removeNode}
        className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-red-600"
      >
        <Trash2 className="size-3" /> Eliminar nodo
      </button>
    </div>
  );
}

function ConditionInspector({
  node,
  updateNode,
}: {
  node: WorkflowNode;
  updateNode: (id: string, patch: Partial<WorkflowNode>) => void;
}) {
  const config = node.config as ConditionConfig;
  const updateConfig = (next: ConditionConfig) =>
    updateNode(node.id, { config: next });

  return (
    <div className="mt-4 space-y-3">
      <label className="block text-xs font-medium text-slate-600">
        Señal
        <select
          value={config.kind}
          onChange={(event) => {
            const kind = event.target.value as ConditionConfig["kind"];
            updateConfig(conditionForKind(kind));
          }}
          className="mt-1.5 h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm"
        >
          <option value="visitCount">Visitas</option>
          <option value="pagePath">Página actual</option>
          <option value="selectedServiceId">Servicio seleccionado</option>
          <option value="selectedBranchId">Sucursal seleccionada</option>
          <option value="whatsappBookingIntent">Intención de WhatsApp</option>
          <option value="cooldown">Cooldown</option>
        </select>
      </label>
      {config.kind === "selectedServiceId" ? (
        <CatalogSelect
          label="Servicio"
          value={config.value}
          onChange={(value) => updateConfig({ ...config, value })}
          options={services.map((service) => ({
            value: String(service.id),
            label: service.title,
          }))}
        />
      ) : config.kind === "selectedBranchId" ? (
        <CatalogSelect
          label="Sucursal"
          value={config.value}
          onChange={(value) => updateConfig({ ...config, value })}
          options={Object.entries(locations).map(([value, location]) => ({
            value,
            label: location.name,
          }))}
        />
      ) : config.kind === "whatsappBookingIntent" ? (
        <p className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          Coincide cuando hubo una intención de reservar por WhatsApp en las
          últimas 24 horas.
        </p>
      ) : (
        <label className="block text-xs font-medium text-slate-600">
          {config.kind === "pagePath"
            ? "Ruta"
            : config.kind === "cooldown"
              ? "Minutos"
              : "Visitas mínimas"}
          <input
            type={config.kind === "pagePath" ? "text" : "number"}
            min={config.kind === "pagePath" ? undefined : 0}
            value={
              config.kind === "cooldown" ? config.value / 60_000 : config.value
            }
            onChange={(event) =>
              updateConfig({
                ...config,
                value:
                  config.kind === "pagePath"
                    ? event.target.value
                    : Math.max(
                        config.kind === "cooldown" ? 1 : 0,
                        Number(event.target.value) *
                          (config.kind === "cooldown" ? 60_000 : 1),
                      ),
              } as ConditionConfig)
            }
            className="mt-1.5 h-9 w-full rounded border border-slate-200 px-3 text-sm"
          />
        </label>
      )}
      <p className="text-xs text-slate-500">
        Conecta Match y Otherwise por separado en el canvas.
      </p>
    </div>
  );
}

function CatalogSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Preview({
  result,
  signals,
  setSignals,
  previewNow,
  refreshNow,
  flowId,
  compact = false,
}: {
  result: ReturnType<typeof evaluateFlow> | null;
  signals: VisitorSignals;
  setSignals: (signals: VisitorSignals) => void;
  previewNow: number;
  refreshNow: () => void;
  flowId: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "mt-7 border-t border-slate-200 pt-5"
          : "mx-auto w-full max-w-3xl p-5 sm:p-8"
      }
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Preview</h3>
        <button
          type="button"
          onClick={refreshNow}
          className="rounded border border-slate-200 px-2 py-1 text-xs"
        >
          Actualizar hora
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Simulación aislada: no usa ni modifica señales o respuestas reales.
      </p>
      <div className="mt-4 grid gap-3">
        <label className="text-xs font-medium text-slate-600">
          Visitas
          <input
            type="number"
            min={0}
            value={signals.visitCount}
            onChange={(event) =>
              setSignals({
                ...signals,
                visitCount: Math.max(0, Number(event.target.value)),
              })
            }
            className="mt-1.5 h-9 w-full rounded border border-slate-200 px-3 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Ruta
          <input
            value={signals.pathname}
            onChange={(event) =>
              setSignals({ ...signals, pathname: event.target.value })
            }
            className="mt-1.5 h-9 w-full rounded border border-slate-200 px-3 text-sm"
          />
        </label>
        <CatalogSelect
          label="Servicio seleccionado"
          value={signals.selectedServiceId ?? ""}
          onChange={(selectedServiceId) =>
            setSignals({
              ...signals,
              selectedServiceId: selectedServiceId || undefined,
            })
          }
          options={[
            { value: "", label: "Sin selección" },
            ...services.map((service) => ({
              value: String(service.id),
              label: service.title,
            })),
          ]}
        />
        <CatalogSelect
          label="Sucursal seleccionada"
          value={signals.selectedBranchId ?? ""}
          onChange={(selectedBranchId) =>
            setSignals({
              ...signals,
              selectedBranchId: selectedBranchId || undefined,
            })
          }
          options={[
            { value: "", label: "Sin selección" },
            ...Object.entries(locations).map(([value, location]) => ({
              value,
              label: location.name,
            })),
          ]}
        />
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <input
            type="checkbox"
            checked={Boolean(signals.whatsappBookingIntentAt)}
            onChange={(event) =>
              setSignals({
                ...signals,
                whatsappBookingIntentAt: event.target.checked
                  ? previewNow
                  : undefined,
              })
            }
          />
          Intención de reservar por WhatsApp
        </label>
        <div className="grid gap-2">
          <p className="text-xs font-medium text-slate-600">
            Señales terminales (epoch ms)
          </p>
          {(["shownAt", "dismissedAt", "completedAt"] as const).map((key) => (
            <label key={key} className="text-xs text-slate-500">
              {key === "shownAt"
                ? "Mostrada"
                : key === "dismissedAt"
                  ? "Descartada"
                  : "Completada"}
              <input
                type="number"
                min={0}
                value={signals.flows?.[flowId]?.[key] ?? ""}
                onChange={(event) => {
                  const timestamp = Number(event.target.value);
                  const current = { ...signals.flows?.[flowId] };
                  if (timestamp) current[key] = timestamp;
                  else delete current[key];
                  setSignals({
                    ...signals,
                    flows: Object.keys(current).length
                      ? { ...signals.flows, [flowId]: current }
                      : undefined,
                  });
                }}
                placeholder="0"
                className="mt-1 h-8 w-full rounded border border-slate-200 px-2 text-sm"
              />
            </label>
          ))}
        </div>
      </div>
      {!result?.matched ? (
        <p className="mt-4 text-sm text-slate-500">
          No coincide: {result?.reasons.join(", ") || "flujo incompleto"}.
        </p>
      ) : result.survey ? (
        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Encuesta activa</p>
          {(
            (result.survey.config.fields as SurveyField[] | undefined) ?? []
          ).map((field) => (
            <p key={field.id} className="mt-2 text-sm font-medium">
              {field.label}
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-amber-700">
          Conecta una encuesta al trigger.
        </p>
      )}
      {result && (
        <p className="mt-4 text-xs text-slate-500">
          Ruta: {result.path.join(" → ") || "sin ruta"}
          <br />
          Diagnóstico: {result.reasons.join(", ") || "sin decisiones"}
        </p>
      )}
    </div>
  );
}
