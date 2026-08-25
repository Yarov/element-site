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
} from "@xyflow/react";
import {
  CheckCircle2,
  CircleAlert,
  FilePlus2,
  Pencil,
  Plus,
  Save,
  Send,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import type {
  ConditionConfig,
  SurveyField,
  SurveyFlow,
  TriggerConfig,
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
import { PUBLIC_ROUTES } from "@/lib/public-routes";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StoredFlow = {
  id: string;
  name: string;
  status: "draft" | "published" | "paused";
  graph: SurveyFlow;
};
type NodeKind = "trigger" | "condition" | "survey" | "action";
type WorkflowCanvasNode = Node<{ node: WorkflowNode }, "workflow">;
const STUDIO_TABS = {
  BUILD: "build",
  AUDIENCE: "audience",
  SIMULATE: "simulate",
  REVIEW: "review",
  DATA: "data",
} as const;

type StudioTab = (typeof STUDIO_TABS)[keyof typeof STUDIO_TABS];

const meta: Record<NodeKind, { name: string; color: string; purpose: string }> =
  {
    trigger: {
      name: "Inicio",
      color: "border-violet-500",
      purpose: "Define cuándo puede comenzar la encuesta.",
    },
    condition: {
      name: "Condición",
      color: "border-amber-500",
      purpose: "Divide el recorrido según una señal del visitante.",
    },
    survey: {
      name: "Encuesta",
      color: "border-pink-500",
      purpose: "Recopila respuestas de la persona visitante.",
    },
    action: {
      name: "Final",
      color: "border-emerald-500",
      purpose: "Cierra el recorrido con un mensaje final.",
    },
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
      aria-label={`${meta[node.type as NodeKind]?.name ?? "Paso"}: ${node.label}`}
      aria-current={selected ? "step" : undefined}
      className={`relative min-w-52 rounded-xl border-l-4 bg-white shadow-sm transition-shadow ${meta[node.type as NodeKind]?.color ?? "border-slate-400"} ${selected ? "bg-slate-50 ring-2 ring-slate-900 ring-offset-2" : ""}`}
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
        {selected && <span className="sr-only">Paso seleccionado</span>}
      </div>
      {node.type === "condition" ? (
        <div className="absolute -right-20 top-3 grid gap-5 text-[10px] font-semibold text-slate-500">
          <span>Cumple</span>
          <span>No cumple</span>
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
      ) : node.type !== "action" ? (
        <Handle
          id="next"
          type="source"
          position={Position.Right}
          className="!size-3 !border-2 !border-white !bg-slate-500"
        />
      ) : null}
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
    id: `${edge.from}-${edge.outcome ?? "next"}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    sourceHandle: edge.outcome ?? "next",
    label:
      edge.outcome === "match"
        ? "Cumple"
        : edge.outcome === "else"
          ? "No cumple"
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
  const [activeTab, setActiveTab] = useState<StudioTab>(STUDIO_TABS.BUILD);
  const [stepEditorOpen, setStepEditorOpen] = useState(false);
  const [routePickerOpen, setRoutePickerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<"node" | "survey" | null>(
    null,
  );
  const [previewSignals, setPreviewSignals] = useState<VisitorSignals>({
    visitCount: 3,
    pathname: "/",
  });
  const [previewNow, setPreviewNow] = useState(() => Date.now());

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

  const selected = flow?.nodes.find((node) => node.id === selectedId);
  const currentStatus = flows.find((item) => item.id === serverId)?.status;
  const result = flow ? evaluateFlow(flow, previewSignals, previewNow) : null;
  const nodes = flow ? toNodes(flow) : [];
  const edges = flow ? toEdges(flow) : [];

  function open(item: StoredFlow) {
    setFlow(item.graph);
    setServerId(item.id);
    setSelectedId(item.graph.nodes[0]?.id ?? null);
    setStepEditorOpen(false);
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
    if (type === "trigger") {
      setActiveTab(STUDIO_TABS.AUDIENCE);
      return;
    }
    const id = crypto.randomUUID();
    const config =
      type === "condition"
          ? defaultCondition()
          : type === "survey"
            ? { fields: [] }
            : { message: "Gracias por tu respuesta" };
    const node: WorkflowNode = {
      id,
      type,
      label:
        type === "condition"
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
    if (!outcome)
      return setStatus("Usa Cumple o No cumple para conectar la condición");
    connectNodes(connection.source, connection.target, outcome);
  }

  function connectNodes(
    sourceId: string,
    targetId: string,
    outcome: "next" | "match" | "else",
  ) {
    if (sourceId === targetId) return;
    mutate((current) => ({
      ...current,
      edges: [
        ...current.edges.filter(
          (edge) =>
            !(edge.from === sourceId && edge.outcome === outcome),
        ),
        { from: sourceId, to: targetId, outcome },
      ],
    }));
  }
  function removeNode() {
    if (!selectedId) return;
    setPendingDelete("node");
  }
  function confirmRemoveNode() {
    if (!selectedId) return;
    if (flow?.nodes.find((node) => node.id === selectedId)?.type === "trigger") {
      setPendingDelete(null);
      return toast.error("El inicio define la distribución y no se puede eliminar.");
    }
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
      if (!validated.success) {
        toast.error(describeValidationError(validated.error.issues[0]?.message ?? ""));
        return setStatus(
          "Corrige Inicio, preguntas o conexiones antes de publicar",
        );
      }
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
           {flow ? (
             <input
               aria-label="Nombre de la encuesta"
               value={flow.name}
               onChange={(event) =>
                 mutate((current) => ({ ...current, name: event.target.value }))
               }
               className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
             />
           ) : (
             <h1 className="text-sm font-semibold">Encuestas por automatización</h1>
           )}
         </div>
         <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
           {flow && (
             <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${currentStatus === "published" ? "bg-emerald-100 text-emerald-800" : currentStatus === "paused" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600"}`}>
               {currentStatus === "published" ? "Publicada" : currentStatus === "paused" ? "Pausada" : "Borrador"}
             </span>
           )}
           <span className="hidden text-xs text-slate-500 xl:block">{status}</span>
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
                 {currentStatus === "published" ? "Publicar cambios" : currentStatus === "paused" ? "Reactivar" : "Publicar"}
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
                   <span className="hidden xl:inline">Vista previa guardada</span>
                   <span className="xl:hidden">Vista previa</span>
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
      <div
         className={`grid min-h-[calc(100vh-4rem)] ${activeTab === STUDIO_TABS.BUILD ? "lg:grid-cols-[250px_minmax(0,1fr)_350px]" : "lg:grid-cols-[250px_minmax(0,1fr)]"}`}
      >
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
                  [STUDIO_TABS.BUILD, "Construir"],
                  [STUDIO_TABS.DATA, "Datos"],
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
               {activeTab === STUDIO_TABS.BUILD
                 ? "Diseña la encuesta y define su aparición desde Inicio"
                 : "Resultados de la encuesta seleccionada"}
             </p>
           </div>
           {activeTab === STUDIO_TABS.BUILD &&
            (flow ? (
              <div className="min-h-0 flex-1">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
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
                        Agregar paso
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(
                           ["condition", "survey", "action"] as NodeKind[]
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
                  <Panel position="top-right" className="lg:hidden">
                    <button
                      type="button"
                      onClick={() => setStepEditorOpen(true)}
                      disabled={!selected}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Pencil className="size-3" /> Editar paso
                    </button>
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
          {activeTab === STUDIO_TABS.DATA && (
            <div className="overflow-y-auto p-4 sm:p-6">
              <AnalyticsPanel flow={flow} serverId={serverId} />
            </div>
          )}
        </section>
         {activeTab === STUDIO_TABS.BUILD && (
        <aside className="hidden border-l border-slate-200 bg-white lg:block">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold">Inspector</h2>
            <p className="mt-1 text-xs text-slate-500">
              Configura el paso seleccionado.
            </p>
          </div>
          {flow && (
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-5">
              {selected ? (
                <NodeInspector
                  flow={flow}
                  node={selected}
                  updateNode={updateNode}
                  addQuestion={addQuestion}
                  removeNode={removeNode}
                  openRoutePicker={() => setRoutePickerOpen(true)}
                  connectNodes={connectNodes}
                />
              ) : (
                <p className="mt-6 text-sm text-slate-500">
                  Selecciona un paso del canvas.
                </p>
              )}
            </div>
          )}
        </aside>
        )}
      </div>
      <Drawer open={stepEditorOpen} onOpenChange={setStepEditorOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Editar paso</DrawerTitle>
            <DrawerDescription>
              {selected
                ? "Los cambios se reflejan inmediatamente en el canvas."
                : "Selecciona un paso del canvas para configurarlo."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 overflow-y-auto px-5 pb-8">
            {selected && flow ? (
              <NodeInspector
                flow={flow}
                node={selected}
                updateNode={updateNode}
                addQuestion={addQuestion}
                removeNode={removeNode}
                openRoutePicker={() => setRoutePickerOpen(true)}
                connectNodes={connectNodes}
              />
            ) : (
              <p className="text-sm text-slate-500">
                Selecciona un paso del canvas.
              </p>
            )}
          </div>
        </DrawerContent>
      </Drawer>
      <RoutePickerDialog
        flow={flow}
        open={routePickerOpen}
        onOpenChange={setRoutePickerOpen}
        mutate={mutate}
      />
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

function getTrigger(flow: SurveyFlow) {
  return flow.nodes.find((node) => node.type === "trigger") ?? null;
}

function selectedPaths(config: TriggerConfig) {
  if (config.targetMode === "selected") return config.pagePaths ?? [];
  if (Array.isArray(config.pagePaths)) return config.pagePaths;
  return typeof config.pagePath === "string" ? [config.pagePath] : [];
}

function DeliveryPanel({
  flow,
  mutate,
  onChoosePages,
}: {
  flow: SurveyFlow | null;
  mutate: (updater: (current: SurveyFlow) => SurveyFlow) => void;
  onChoosePages: () => void;
}) {
  if (!flow) return <PanelMessage>Selecciona una encuesta para definir su distribución.</PanelMessage>;
  const trigger = getTrigger(flow);
  if (!trigger) return <PanelMessage>Esta encuesta necesita un paso de inicio.</PanelMessage>;
  const config = trigger.config as TriggerConfig;
  const targetMode = config.targetMode ?? (selectedPaths(config).length ? "selected" : "all");
  const paths = selectedPaths(config);
  const updateTrigger = (next: TriggerConfig) =>
    mutate((current) => ({
      ...current,
      nodes: current.nodes.map((node) =>
        node.id === trigger.id ? { ...node, config: next } : node,
      ),
    }));

  return (
    <section className="mx-auto w-full max-w-4xl space-y-5">
      <div className="rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 text-violet-300" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-200">Regla de entrada</p>
            <h2 className="mt-2 text-xl font-semibold">¿A quién y cuándo debe aparecer?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Esta regla determina la elegibilidad antes de que el recorrido comience. Las condiciones del canvas se usan después para personalizar la experiencia.
            </p>
          </div>
        </div>
        <p className="mt-6 rounded-xl bg-white/10 px-4 py-3 text-sm text-white">
          {targetMode === "all" ? "Se mostrará en cualquier página pública" : `Se mostrará en ${paths.length} ${paths.length === 1 ? "página seleccionada" : "páginas seleccionadas"}`} desde la visita {Math.max(1, Number(config.visitCount ?? 3))}.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold">Momento de aparición</h3>
          <p className="mt-1 text-sm text-slate-500">Evita interrumpir a quien apenas conoce el sitio.</p>
          <label className="mt-5 block text-sm font-medium text-slate-700">
            Mostrar después de
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={Math.max(1, Number(config.visitCount ?? 3))}
                onChange={(event) => updateTrigger({ ...config, visitCount: Math.max(1, Number(event.target.value)) })}
                className="h-11 w-24 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <span className="text-sm text-slate-500">visitas acumuladas</span>
            </div>
          </label>
          <p className="mt-3 text-xs leading-5 text-slate-500">Una persona será elegible a partir de su {Math.max(1, Number(config.visitCount ?? 3))}a visita.</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold">Páginas</h3>
          <p className="mt-1 text-sm text-slate-500">Elige el alcance de la encuesta de forma explícita.</p>
          <div className="mt-5 grid gap-2">
            <label className={`cursor-pointer rounded-xl border p-3 ${targetMode === "all" ? "border-slate-950 bg-slate-50" : "border-slate-200"}`}>
              <input
                className="sr-only"
                type="radio"
                name="page-targeting"
                checked={targetMode === "all"}
                onChange={() => updateTrigger({ visitCount: config.visitCount, targetMode: "all" })}
              />
              <span className="block text-sm font-semibold">Cualquier página pública</span>
              <span className="mt-1 block text-xs text-slate-500">La encuesta puede aparecer en cualquier ruta pública.</span>
            </label>
            <label className={`cursor-pointer rounded-xl border p-3 ${targetMode === "selected" ? "border-slate-950 bg-slate-50" : "border-slate-200"}`}>
              <input
                className="sr-only"
                type="radio"
                name="page-targeting"
                checked={targetMode === "selected"}
                onChange={() => {
                  if (paths.length) updateTrigger({ visitCount: config.visitCount, targetMode: "selected", pagePaths: paths });
                  else onChoosePages();
                }}
              />
              <span className="block text-sm font-semibold">Sólo páginas específicas</span>
              <span className="mt-1 block text-xs text-slate-500">Restringe la encuesta a las rutas que elijas.</span>
            </label>
          </div>
          {targetMode === "selected" && (
            <button type="button" onClick={onChoosePages} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800">
              <SlidersHorizontal className="size-4" /> {paths.length ? `Editar ${paths.length} páginas` : "Elegir páginas"}
            </button>
          )}
        </article>
      </div>
    </section>
  );
}

function RoutePickerDialog({
  flow,
  open,
  onOpenChange,
  mutate,
}: {
  flow: SurveyFlow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mutate: (updater: (current: SurveyFlow) => SurveyFlow) => void;
}) {
  const trigger = flow ? getTrigger(flow) : null;
  const config = (trigger?.config ?? {}) as TriggerConfig;
  const [query, setQuery] = useState("");
  const paths = selectedPaths(config);
  const routes = PUBLIC_ROUTES.filter((route) => route.label.toLowerCase().includes(query.toLowerCase()) || route.path.includes(query));
  const update = (pagePaths: string[]) => {
    if (!trigger) return;
    mutate((current) => ({
      ...current,
      nodes: current.nodes.map((node) => node.id === trigger.id ? { ...node, config: { visitCount: config.visitCount, targetMode: "selected", pagePaths } } : node),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden bg-white p-0 text-slate-900 dark:bg-white dark:text-slate-900">
        <DialogHeader className="border-b border-slate-200 p-6 pb-4">
          <DialogTitle>Elegir páginas</DialogTitle>
          <DialogDescription>La encuesta sólo podrá aparecer en estas páginas públicas.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o ruta" className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400" />
            <button type="button" onClick={() => update(PUBLIC_ROUTES.map((route) => route.path))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium">Seleccionar todas</button>
          </div>
          <p className="text-xs font-medium text-slate-500">{paths.length} {paths.length === 1 ? "página seleccionada" : "páginas seleccionadas"}</p>
          <div className="max-h-[42vh] space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
            {routes.map((route) => {
              const selected = paths.includes(route.path);
              return (
                <label key={route.path} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50">
                  <input type="checkbox" checked={selected} onChange={() => update(selected ? paths.filter((path) => path !== route.path) : [...paths, route.path])} className="size-4 rounded border-slate-300" />
                  <span className="min-w-0"><span className="block text-sm font-medium text-slate-800">{route.label}</span><span className="block truncate text-xs text-slate-500">{route.path}</span></span>
                </label>
              );
            })}
          </div>
          {paths.length === 0 && <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Elige al menos una página o vuelve a “Cualquier página pública”.</p>}
          <div className="flex justify-end"><button type="button" onClick={() => onOpenChange(false)} disabled={!paths.length} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Confirmar páginas</button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReviewPanel({
  flow,
  result,
  onNavigate,
  onPublish,
}: {
  flow: SurveyFlow | null;
  result: ReturnType<typeof evaluateFlow> | null;
  onNavigate: (tab: StudioTab) => void;
  onPublish: () => void;
}) {
  if (!flow) return <PanelMessage>Selecciona una encuesta para revisarla.</PanelMessage>;
  const validation = validateFlow(flow);
  const trigger = getTrigger(flow);
  const fields = flow.nodes.filter((node) => node.type === "survey").flatMap((node) => (node.config.fields as SurveyField[] | undefined) ?? []);
  const checks = [
    { label: "Distribución definida", detail: trigger ? "Páginas y visitas listas" : "Falta el inicio", tab: STUDIO_TABS.AUDIENCE, ready: Boolean(trigger) },
    { label: "Preguntas para visitantes", detail: fields.length ? `${fields.length} preguntas configuradas` : "Añade al menos una pregunta", tab: STUDIO_TABS.BUILD, ready: fields.length > 0 },
    { label: "Recorrido completo", detail: validation.success ? "Todas las conexiones son válidas" : describeValidationError(validation.error.issues[0]?.message ?? ""), tab: STUDIO_TABS.BUILD, ready: validation.success },
    { label: "Simulación", detail: result?.matched ? "El escenario actual es elegible" : "Comprueba un escenario antes de publicar", tab: STUDIO_TABS.SIMULATE, ready: Boolean(result?.matched) },
  ];
  return <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><h2 className="text-xl font-semibold">Revisar y publicar</h2><p className="mt-2 text-sm text-slate-500">Comprueba la experiencia antes de mostrarla a visitantes reales.</p><div className="mt-6 space-y-3">{checks.map((check) => <button key={check.label} type="button" onClick={() => onNavigate(check.tab)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-slate-400"><span className={check.ready ? "text-emerald-600" : "text-amber-600"}>{check.ready ? <CheckCircle2 className="size-5" /> : <CircleAlert className="size-5" />}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{check.label}</span><span className="mt-0.5 block text-xs text-slate-500">{check.detail}</span></span><span className="text-xs font-medium text-slate-500">Abrir</span></button>)}</div><button type="button" disabled={!validation.success} onClick={onPublish} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Send className="size-4" />{validation.success ? "Publicar encuesta" : "Corrige los puntos pendientes"}</button></section>;
}

function SettingsPanel({
  flow,
  persistedFlow,
  status,
  mutate,
}: {
  flow: SurveyFlow | null;
  persistedFlow: StoredFlow | null;
  status: string;
  mutate: (updater: (current: SurveyFlow) => SurveyFlow) => void;
}) {
  if (!flow) {
    return <PanelMessage>Selecciona o crea una encuesta para configurarla.</PanelMessage>;
  }

  const persistedStatus = persistedFlow
    ? persistedFlow.status === "published"
      ? "Publicada"
      : persistedFlow.status === "paused"
        ? "Pausada"
        : "Borrador"
    : "Aún no guardada";

  return (
    <section className="mx-auto w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div>
        <h2 className="text-lg font-semibold">Configuración</h2>
        <p className="mt-1 text-sm text-slate-500">
          Define cómo se identifica esta encuesta. Los pasos se editan desde
          Canvas.
        </p>
      </div>
      <div className="mt-6 grid gap-5">
        <label className="block text-sm font-medium text-slate-700">
          Nombre de encuesta
          <input
            value={flow.name}
            onChange={(event) =>
              mutate((current) => ({ ...current, name: event.target.value }))
            }
            className="mt-1.5 h-10 w-full rounded border border-slate-200 px-3 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Descripción
          <textarea
            value={flow.description}
            onChange={(event) =>
              mutate((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            className="mt-1.5 min-h-28 w-full rounded border border-slate-200 p-3 text-sm"
            placeholder="Explica el objetivo o contexto de esta encuesta."
          />
        </label>
      </div>
      <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
          Estado persistido
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-800">
          {persistedStatus}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {persistedFlow
            ? `Última versión guardada: ${new Intl.DateTimeFormat("es-MX", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(persistedFlow.graph.updatedAt))}`
            : "Guarda esta encuesta para crear una versión persistida."}
        </p>
        <p className="mt-3 text-xs font-medium text-slate-600">{status}</p>
      </div>
    </section>
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
  flow,
  node,
  updateNode,
  addQuestion,
  removeNode,
  openRoutePicker,
  connectNodes,
}: {
  flow: SurveyFlow;
  node: WorkflowNode;
  updateNode: (id: string, patch: Partial<WorkflowNode>) => void;
  addQuestion: (kind: SurveyField["kind"]) => string | null;
  removeNode: () => void;
  openRoutePicker: () => void;
  connectNodes: (sourceId: string, targetId: string, outcome: "next" | "match" | "else") => void;
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

  function moveField(id: string, direction: -1 | 1) {
    const index = fields.findIndex((field) => field.id === id);
    const destination = index + direction;
    if (index < 0 || destination < 0 || destination >= fields.length) return;
    const reordered = [...fields];
    [reordered[index], reordered[destination]] = [
      reordered[destination],
      reordered[index],
    ];
    updateNode(node.id, { config: { ...node.config, fields: reordered } });
  }

  return (
    <div className="mt-6 border-t border-slate-100 pt-5">
      <div className="rounded-xl bg-slate-950 p-4 text-white">
        <span className="inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
          {meta[node.type as NodeKind]?.name}
        </span>
        <p className="mt-1 text-sm font-semibold">{node.label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-300">
          {meta[node.type as NodeKind]?.purpose}
        </p>
      </div>
      <label className="mt-5 block text-xs font-medium text-slate-600">
        Nombre del paso
        <input
          value={node.label}
          onChange={(event) =>
            updateNode(node.id, { label: event.target.value })
          }
          className="mt-1.5 h-9 w-full rounded border border-slate-200 px-3 text-sm"
        />
        <span className="mt-1 block font-normal text-slate-500">
          Este nombre solo identifica el paso dentro del canvas.
        </span>
      </label>
      {node.type === "trigger" && (
        <StartInspector
          node={node}
          updateNode={updateNode}
          openRoutePicker={openRoutePicker}
        />
      )}
      {node.type === "condition" && (
        <ConditionInspector node={node} updateNode={updateNode} />
      )}
      {node.type === "survey" && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Diseña la encuesta
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Añade y ordena las preguntas que verá la persona.
              </p>
            </div>
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
              <div key={field.id} className={`flex rounded border transition ${selectedField?.id === field.id ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}>
                <button type="button" onClick={() => setSelectedFieldId(field.id)} className="min-w-0 flex-1 p-3 text-left">
                  <span className="text-xs text-slate-400">Pregunta {index + 1}</span>
                  <p className="mt-1 truncate text-sm font-medium">{field.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{field.kind}</p>
                </button>
                <div className="flex flex-col justify-center border-l border-slate-200 px-1">
                  <button type="button" aria-label={`Subir pregunta ${index + 1}`} disabled={index === 0} onClick={() => moveField(field.id, -1)} className="px-2 py-1 text-xs text-slate-500 disabled:opacity-30">↑</button>
                  <button type="button" aria-label={`Bajar pregunta ${index + 1}`} disabled={index === fields.length - 1} onClick={() => moveField(field.id, 1)} className="px-2 py-1 text-xs text-slate-500 disabled:opacity-30">↓</button>
                </div>
              </div>
            ))}
          </div>
          {selectedField && (
            <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-700">
                Configura la pregunta
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
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-800">
            Cierra la experiencia
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Este es el último paso: muestra un mensaje y no conecta con otro
            paso.
          </p>
          <label className="mt-3 block text-xs font-medium text-slate-600">
            Mensaje de cierre
            <textarea
              value={String(node.config.message ?? "")}
              onChange={(event) =>
                updateNode(node.id, {
                  config: { ...node.config, message: event.target.value },
                })
              }
              className="mt-1.5 min-h-20 w-full rounded border border-slate-200 bg-white p-2 text-sm"
            />
          </label>
        </div>
      )}
      {node.type !== "action" && (
        <ConnectionInspector
          flow={flow}
          node={node}
          connectNodes={connectNodes}
        />
      )}
      {node.type !== "trigger" && (
        <button
          onClick={removeNode}
          className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-red-600"
        >
          <Trash2 className="size-3" /> Eliminar paso
        </button>
      )}
    </div>
  );
}

function ConnectionInspector({
  flow,
  node,
  connectNodes,
}: {
  flow: SurveyFlow;
  node: WorkflowNode;
  connectNodes: (sourceId: string, targetId: string, outcome: "next" | "match" | "else") => void;
}) {
  const options = flow.nodes.filter((candidate) => candidate.id !== node.id);
  const targetFor = (outcome: "next" | "match" | "else") =>
    flow.edges.find((edge) => edge.from === node.id && edge.outcome === outcome)?.to ?? "";
  const outputs = node.type === "condition"
    ? [{ outcome: "match" as const, label: "Si cumple" }, { outcome: "else" as const, label: "Si no cumple" }]
    : [{ outcome: "next" as const, label: "Después, ir a" }];

  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-sm font-semibold text-slate-800">Conexiones</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">También puedes unir los nodos arrastrando desde sus puntos laterales.</p>
      <div className="mt-3 space-y-2">
        {outputs.map(({ outcome, label }) => (
          <label key={outcome} className="block text-xs font-medium text-slate-600">
            {label}
            <select
              value={targetFor(outcome)}
              onChange={(event) => {
                if (event.target.value) connectNodes(node.id, event.target.value, outcome);
              }}
              className="mt-1.5 h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-800"
            >
              <option value="">Seleccionar siguiente paso</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>{meta[option.type as NodeKind]?.name}: {option.label}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}

function StartInspector({
  node,
  updateNode,
  openRoutePicker,
}: {
  node: WorkflowNode;
  updateNode: (id: string, patch: Partial<WorkflowNode>) => void;
  openRoutePicker: () => void;
}) {
  const config = node.config as TriggerConfig;
  const paths = selectedPaths(config);
  const mode = config.targetMode ?? (paths.length ? "selected" : "all");
  const update = (next: TriggerConfig) => updateNode(node.id, { config: next });

  return (
    <div className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Cuándo mostrarla</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Define la aparición antes de que el visitante entre al recorrido.</p>
      </div>
      <label className="block text-xs font-medium text-slate-600">
        Mostrar después de
        <div className="mt-1.5 flex items-center gap-2">
          <input type="number" min={1} value={Math.max(1, Number(config.visitCount ?? 3))} onChange={(event) => update({ ...config, visitCount: Math.max(1, Number(event.target.value)) })} className="h-9 w-20 rounded border border-slate-200 bg-white px-2 text-sm" />
          <span className="text-sm font-normal text-slate-500">visitas</span>
        </div>
      </label>
      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-slate-600">Dónde mostrarla</legend>
        <label className={`block cursor-pointer rounded-lg border p-3 ${mode === "all" ? "border-slate-900 bg-white" : "border-slate-200 bg-white"}`}>
          <input className="sr-only" type="radio" name={`target-${node.id}`} checked={mode === "all"} onChange={() => update({ visitCount: config.visitCount, targetMode: "all" })} />
          <span className="block text-xs font-semibold text-slate-800">Cualquier página pública</span>
        </label>
        <label className={`block cursor-pointer rounded-lg border p-3 ${mode === "selected" ? "border-slate-900 bg-white" : "border-slate-200 bg-white"}`}>
          <input className="sr-only" type="radio" name={`target-${node.id}`} checked={mode === "selected"} onChange={() => paths.length ? update({ visitCount: config.visitCount, targetMode: "selected", pagePaths: paths }) : openRoutePicker()} />
          <span className="block text-xs font-semibold text-slate-800">Sólo páginas específicas</span>
          <span className="mt-1 block text-xs text-slate-500">{paths.length ? `${paths.length} ${paths.length === 1 ? "página elegida" : "páginas elegidas"}` : "Elige las rutas donde debe aparecer"}</span>
        </label>
      </fieldset>
      {mode === "selected" && <button type="button" onClick={openRoutePicker} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"><SlidersHorizontal className="size-3.5" /> Elegir páginas</button>}
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
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-800">
          Define la condición
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Si la señal cumple, sigue la rama Cumple; si no, No cumple.
        </p>
      </div>
      <div className="space-y-3">
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
                config.kind === "cooldown"
                  ? config.value / 60_000
                  : config.value
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
          Conecta sólo las salidas que deben continuar. Una salida sin conexión termina el recorrido sin mostrar la encuesta.
        </p>
      </div>
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

function TestingPanel({
  flow,
  serverId,
  result,
  signals,
  setSignals,
  previewNow,
  refreshNow,
}: {
  flow: SurveyFlow | null;
  serverId: string | null;
  result: ReturnType<typeof evaluateFlow> | null;
  signals: VisitorSignals;
  setSignals: (signals: VisitorSignals) => void;
  previewNow: number;
  refreshNow: () => void;
}) {
  if (!flow) {
    return (
      <div className="mx-auto w-full max-w-3xl p-5 sm:p-8">
        <PanelMessage>Selecciona una encuesta para probarla.</PanelMessage>
      </div>
    );
  }

  const validation = validateFlow(flow);
  const validationErrors = validation.success
    ? []
    : validation.error.issues.map((issue) => describeValidationError(issue.message));
  const diagnostics = result?.reasons.map(describeDiagnostic) ?? [];
  const errors = validationErrors.length ? validationErrors : (result?.errors ?? []);
  const flowState = signals.flows?.[flow.id];

  return (
    <div className="mx-auto w-full max-w-3xl p-5 sm:p-8">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-lg font-semibold">Probar</h2>
            <p className="mt-1 text-sm text-slate-500">
              Simulación aislada: no usa ni modifica señales o respuestas reales.
            </p>
          </div>
          {serverId && (
            <button
              type="button"
              onClick={() => window.open(`/?preview=${serverId}`, "_blank")}
              className="shrink-0 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Probar última versión guardada
            </button>
          )}
        </div>
        {serverId && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            Abrir <code>/?preview={serverId}</code> prueba la última versión
            guardada, no los cambios sin guardar de este editor.
          </p>
        )}
        <div className="mt-5 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Señales de simulación</h3>
        <button
          type="button"
          onClick={refreshNow}
          className="rounded border border-slate-200 px-2 py-1 text-xs"
        >
          Actualizar hora
        </button>
        </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
        <CatalogSelect
          label="Página que visita"
          value={signals.pathname}
          onChange={(pathname) => setSignals({ ...signals, pathname })}
          options={PUBLIC_ROUTES.map((route) => ({ value: route.path, label: route.label }))}
        />
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
        <label className="grid gap-1 text-xs font-medium text-slate-600 sm:col-span-2">
          Estado previo y cooldown de esta encuesta
          <select
            value={
              flowState?.completedAt
                ? "completed"
                : flowState?.dismissedAt
                  ? "dismissed"
                  : flowState?.shownAt
                    ? "shown"
                    : "new"
            }
            onChange={(event) => {
              const status = event.target.value;
              const flows = { ...signals.flows };
                if (status === "new") delete flows[flow.id];
                else {
                  flows[flow.id] =
                  status === "shown"
                    ? { shownAt: previewNow }
                    : status === "dismissed"
                      ? { dismissedAt: previewNow }
                      : { completedAt: previewNow };
              }
              setSignals({
                ...signals,
                flows: Object.keys(flows).length ? flows : undefined,
              });
            }}
            className="h-9 rounded border border-slate-200 bg-white px-2 text-sm text-slate-900"
          >
            <option value="new">Aún no se muestra</option>
            <option value="shown">Ya se mostró</option>
            <option value="dismissed">La cerró</option>
            <option value="completed">La completó</option>
          </select>
          <span className="font-normal text-slate-500">
            Úsalo para probar el cooldown en esta simulación.
          </span>
        </label>
      </div>
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
          Elegibilidad
        </p>
        <p className={`mt-2 text-sm font-semibold ${result?.matched ? "text-emerald-700" : "text-amber-800"}`}>
          {result?.matched
            ? "Elegible: la encuesta se mostraría con estas señales."
            : "No elegible con estas señales."}
        </p>
        {result?.survey && (
          <p className="mt-2 text-xs text-slate-600">
            Encuesta activa: {result.survey.label}
          </p>
        )}
        <p className="mt-3 text-xs text-slate-600">
          Ruta: {result?.path.join(" → ") || "Aún no se puede recorrer el flujo."}
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Diagnóstico: {diagnostics.join(". ") || "Sin decisiones todavía."}
        </p>
      </div>
      {errors.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-semibold">Corrige estos errores antes de publicar</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            {errors.map((error, index) => (
              <li key={`${error}-${index}`}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      </div>
    </div>
  );
}

function describeDiagnostic(reason: string) {
  const descriptions: Record<string, string> = {
    "flow:invalid": "El flujo no es válido todavía",
    "trigger:missing": "Falta el paso Inicio",
    "trigger:match": "El inicio coincide con las señales",
    "trigger:visitCount:fail": "No alcanza el mínimo de visitas",
    "trigger:pagePath:fail": "La ruta no está entre las páginas objetivo",
    "trigger:pagePaths:fail": "La ruta no está entre las páginas objetivo",
    "edge:next": "Se siguió la conexión principal",
    "edge:match": "Se siguió la rama Cumple",
    "edge:else": "Se siguió la rama No cumple",
    "condition:visitCount:match": "La condición de visitas se cumple",
    "condition:visitCount:else": "La condición de visitas no se cumple",
    "condition:pagePath:match": "La condición de página se cumple",
    "condition:pagePath:else": "La condición de página no se cumple",
    "condition:selectedServiceId:match": "El servicio seleccionado coincide",
    "condition:selectedServiceId:else": "El servicio seleccionado no coincide",
    "condition:selectedBranchId:match": "La sucursal seleccionada coincide",
    "condition:selectedBranchId:else": "La sucursal seleccionada no coincide",
    "condition:whatsappBookingIntent:match": "La intención de WhatsApp está vigente",
    "condition:whatsappBookingIntent:else": "No hay intención de WhatsApp vigente",
    "condition:cooldown:match": "El cooldown ya terminó",
    "condition:cooldown:else": "El cooldown aún está activo",
  };
  return descriptions[reason] ?? reason;
}

function describeValidationError(error: string) {
  if (error === "A flow must have exactly one trigger")
    return "Añade exactamente un paso Inicio.";
  if (error === "Every edge must reference existing nodes")
    return "Elimina o vuelve a conectar una conexión que apunta a un paso inexistente.";
  if (error.includes("requires one or two distinct conditional edges"))
    return "Conecta al menos una salida de la condición, sin repetir Cumple o No cumple.";
  if (error.includes("cannot have outgoing edges"))
    return "El paso Final no puede tener conexiones de salida.";
  if (error.includes("requires one next edge"))
    return "Conecta la salida principal de este paso.";
  if (error === "Flow contains a cycle")
    return "Elimina el ciclo: un paso no puede volver a un paso anterior.";
  if (error === "Flow contains unreachable nodes")
    return "Conecta o elimina los pasos que no se pueden alcanzar desde Inicio.";
  if (error === "Flow must have a reachable survey")
    return "Conecta al menos una Encuesta alcanzable desde Inicio.";
  if (error === "Flow must have a reachable survey with an answerable field")
    return "Añade una pregunta respondible a una Encuesta alcanzable.";
  if (error === "Flow must have a reachable terminal action")
    return "Conecta un paso Final alcanzable desde Inicio.";
  return error;
}
