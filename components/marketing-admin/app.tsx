"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Check,
  CircleAlert,
  Copy,
  Eye,
  FilePlus2,
  ImageIcon,
  LayoutDashboard,
  Megaphone,
  Pause,
  Save,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { CampaignFlow } from "@/components/marketing-admin/campaign-flow";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useUnsavedChangesWarning } from "@/lib/use-unsaved-changes-warning";
import { toast } from "sonner";
import { campaignExamples, newCampaign } from "@/lib/marketing/fixtures";
import {
  componentKinds,
  type Campaign,
  type ComponentKind,
  type MarketingComponent,
} from "@/lib/marketing/model";

type StoredCampaign = { id: string; name: string; definition: Campaign };

const labels: Record<ComponentKind, string> = {
  banner: "Banner promocional",
  hero: "Hero / Header",
  block: "Bloque de página",
  survey: "Encuesta",
  cta: "Redirección / CTA",
};

const slots: MarketingComponent["slot"][] = [
  "home.banner",
  "home.hero",
  "home.promo",
  "service.cta",
];

type MarketingQuestionKind = "text" | "rating" | "choice";
export type MarketingQuestion = {
  id: string;
  label: string;
  kind: MarketingQuestionKind;
  required?: boolean;
  options?: string[];
};

export function ensureQuestion(question: MarketingQuestion): MarketingQuestion {
  return {
    ...question,
    options:
      question.kind === "choice"
        ? Array.from(
            new Set(
              (question.options ?? []).map((option) => option.trim()).filter(
                Boolean,
              ),
            ),
          )
        : undefined,
  };
}

export function defaultQuestion(kind: MarketingQuestionKind): MarketingQuestion {
  return {
    id: crypto.randomUUID(),
    label:
      kind === "rating"
        ? "¿Qué tan probable es que reserves?"
        : kind === "choice"
          ? "¿Qué te interesa explorar?"
          : "¿Qué te gustaría compartir?",
    kind,
    ...(kind === "choice" ? { options: ["Relajación", "Sensorial"] } : {}),
  };
}

export function MarketingAdminApp() {
  const [campaigns, setCampaigns] = useState<StoredCampaign[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [serverId, setServerId] = useState<string | null>(null);
  const [status, setStatus] = useState("Cargando campañas...");
  const [view, setView] = useState<"editor" | "preview">("editor");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  useUnsavedChangesWarning(dirty);

  useEffect(() => {
    void fetch("/api/admin/campaigns")
      .then(async (response) => {
        if (!response.ok) throw new Error("API unavailable");
        const body = (await response.json()) as { campaigns: StoredCampaign[] };
        setCampaigns(body.campaigns);
        if (body.campaigns[0]) openCampaign(body.campaigns[0]);
        else setStatus("Crea una campaña o usa un ejemplo");
      })
      .catch(() => setStatus("No se pudo conectar con PostgreSQL"));
  }, []);

  const component = campaign?.components?.[0];
  const conflicts =
    campaign && component
      ? campaigns.filter(
          (item) =>
            item.id !== serverId &&
            item.definition.status === "published" &&
            item.definition.components?.[0]?.slot === component.slot &&
            item.definition.audience.pagePath === campaign.audience.pagePath,
        )
      : [];

  function openCampaign(item: StoredCampaign) {
    setCampaign(item.definition);
    setServerId(item.id);
    setStatus(`Editando ${item.name}`);
    setView("editor");
    setDirty(false);
  }

  function update(updater: (current: Campaign) => Campaign) {
    setCampaign((current) =>
      current
        ? { ...updater(current), updatedAt: new Date().toISOString() }
        : current,
    );
    setStatus("Cambios sin guardar");
    setDirty(true);
  }

  function updateComponent(patch: Partial<MarketingComponent>) {
    update((current) => ({
      ...current,
      components: current.components.map((item, index) =>
        index === 0 ? { ...item, ...patch } : item,
      ),
    }));
  }

  function updateQuestions(next: MarketingQuestion[]) {
    updateComponent({ questions: next.map(ensureQuestion) });
  }

  function addQuestion(kind: MarketingQuestionKind) {
    const current = component?.questions ?? [];
    updateQuestions([...current, defaultQuestion(kind)]);
  }

  function patchQuestion(id: string, patch: Partial<MarketingQuestion>) {
    const current = component?.questions ?? [];
    updateQuestions(
      current.map((question) =>
        question.id === id
          ? ensureQuestion({ ...question, ...patch, kind: patch.kind ?? question.kind })
          : question,
      ),
    );
  }

  function removeQuestion(id: string) {
    const current = component?.questions ?? [];
    updateQuestions(current.filter((question) => question.id !== id));
  }

  async function create(definition = newCampaign()) {
    setStatus("Creando borrador...");
    try {
      const response = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ campaign: definition }),
      });
      if (!response.ok) throw new Error(await response.text());
      const saved = (await response.json()) as { id: string };
      const item = { id: saved.id, name: definition.name, definition };
      setCampaigns((current) => [item, ...current]);
      openCampaign(item);
      setStatus("Borrador creado");
    } catch (error) {
      setCampaign(definition);
      setServerId(null);
      setStatus(
        `No se pudo crear el borrador: ${error instanceof Error ? error.message : "error desconocido"}`,
      );
    }
  }

  async function save(nextStatus?: Campaign["status"]) {
    if (!campaign) return;
    const definition = nextStatus
      ? { ...campaign, status: nextStatus }
      : campaign;
    if (!serverId) return create(definition);
    setStatus(nextStatus === "published" ? "Publicando..." : "Guardando...");
    try {
      const response = await fetch(`/api/admin/campaigns/${serverId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ campaign: definition }),
      });
      if (!response.ok) throw new Error(await response.text());
      setCampaign(definition);
      setCampaigns((current) =>
        current.map((item) =>
          item.id === serverId
            ? { ...item, name: definition.name, definition }
            : item,
        ),
      );
      setDirty(false);
      setStatus(
        nextStatus === "published" ? "Campaña publicada" : "Borrador guardado",
      );
    } catch (error) {
      setStatus(
        `No se pudo guardar la campaña: ${error instanceof Error ? error.message : "error desconocido"}`,
      );
    }
  }

  async function remove() {
    if (!serverId) return;
    const response = await fetch(`/api/admin/campaigns/${serverId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error("No se pudo eliminar la campaña");
      return setStatus("No se pudo eliminar");
    }
    setCampaigns((current) => current.filter((item) => item.id !== serverId));
    setCampaign(null);
    setServerId(null);
    setStatus("Campaña eliminada");
    setDeleteOpen(false);
    toast.success("Campaña eliminada");
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
            <div className="grid size-8 place-items-center rounded-lg bg-slate-950 font-semibold text-white">
              E
            </div>
            <span className="text-sm font-semibold">ElementSpa Ops</span>
          </div>
          <nav className="space-y-1 p-3 text-sm">
            <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Marketing
            </p>
            <NavItem icon={<LayoutDashboard />} label="Overview" />
            <NavItem icon={<Megaphone />} label="Campañas" active />
            <NavItem icon={<ImageIcon />} label="Componentes" />
            <NavItem icon={<Users />} label="Audiencias" />
            <NavItem icon={<BarChart3 />} label="Resultados" />
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex min-h-16 flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
            <div>
              <p className="text-xs text-slate-400">Marketing Studio</p>
              <h1 className="text-sm font-semibold">
                Campañas y automatizaciones
              </h1>
            </div>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
              <span className="hidden items-center gap-1 text-xs text-slate-500 2xl:flex">
                {status.includes("No se") ? (
                  <CircleAlert className="size-3 text-amber-500" />
                ) : (
                  <Check className="size-3 text-emerald-500" />
                )}
                {status}
              </span>
              {campaign && (
                <>
                  <button
                    onClick={() => save("draft")}
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium"
                  >
                    Guardar
                  </button>
                  {campaign.status === "published" ? (
                    <button
                      onClick={() => save("paused")}
                      className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-white"
                    >
                      <Pause className="size-4" /> Pausar
                    </button>
                  ) : (
                    <button
                      onClick={() => save("published")}
                      className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white"
                    >
                      <Send className="size-4" /> Publicar
                    </button>
                  )}
                </>
              )}
              <AdminLogoutButton />
            </div>
          </header>

          <div className="grid min-h-[calc(100vh-4rem)] xl:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 bg-white p-4 xl:border-b-0 xl:border-r">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Campañas</h2>
                <button
                  onClick={() => create()}
                  className="rounded-md bg-slate-950 p-2 text-white"
                >
                  <FilePlus2 className="size-4" />
                </button>
              </div>
              <div className="mt-4 space-y-1">
                {campaigns.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openCampaign(item)}
                    className={`w-full rounded-md border px-3 py-3 text-left ${serverId === item.id ? "border-slate-900 bg-slate-50" : "border-transparent hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium">
                        {item.name}
                      </span>
                      <StatusDot status={item.definition.status} />
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {
                        labels[
                          item.definition.components?.[0]?.kind ?? "banner"
                        ]
                      }
                    </p>
                  </button>
                ))}
              </div>
              <div className="mt-8 border-t border-slate-100 pt-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Ejemplos
                </p>
                <div className="space-y-2">
                  {campaignExamples.map((example) => (
                    <button
                      key={example.id}
                      onClick={() =>
                        create({
                          ...example,
                          id: crypto.randomUUID(),
                          status: "draft",
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      className="w-full rounded-md border border-dashed border-slate-200 px-3 py-2 text-left text-xs text-slate-600 hover:border-slate-400"
                    >
                      <Copy className="mr-1 inline size-3" /> {example.name}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <section className="bg-slate-50 p-4 md:p-7">
              {!campaign || !component ? (
                <EmptyState create={create} />
              ) : (
                <div className="mx-auto max-w-6xl space-y-5">
                  <section className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-semibold">
                          Automatización
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                          El canvas decide a quién se muestra y qué módulo de
                          landing entrega.
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">
                        <StatusDot status={campaign.status} />
                        {campaign.status === "published"
                          ? "Activa"
                          : campaign.status === "paused"
                            ? "Pausada"
                            : "Borrador"}
                      </span>
                    </div>
                    <CampaignFlow
                      campaign={campaign}
                      component={component}
                      campaignId={serverId}
                      onUpdate={(patch) =>
                        update((current) => ({ ...current, ...patch }))
                      }
                    />
                    {conflicts.length > 0 && (
                      <p className="mt-3 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
                        Hay {conflicts.length} campaña
                        {conflicts.length > 1 ? "s" : ""} publicada
                        {conflicts.length > 1 ? "s" : ""} en este slot. La
                        prioridad más alta gana.
                      </p>
                    )}
                  </section>

                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="rounded-xl border border-slate-200 bg-white">
                      <div className="flex border-b border-slate-200 px-5">
                        <button
                          onClick={() => setView("editor")}
                          className={`border-b-2 px-3 py-4 text-sm font-medium ${view === "editor" ? "border-slate-950 text-slate-950" : "border-transparent text-slate-500"}`}
                        >
                          Editor
                        </button>
                        <button
                          onClick={() => setView("preview")}
                          className={`border-b-2 px-3 py-4 text-sm font-medium ${view === "preview" ? "border-slate-950 text-slate-950" : "border-transparent text-slate-500"}`}
                        >
                          <Eye className="mr-1 inline size-4" /> Preview
                        </button>
                      </div>
                      {view === "editor" ? (
                        <CampaignEditor
                          campaign={campaign}
                          component={component}
                          update={update}
                          updateComponent={updateComponent}
                          addQuestion={addQuestion}
                          patchQuestion={patchQuestion}
                          removeQuestion={removeQuestion}
                        />
                      ) : (
                        <CampaignPreview
                          campaign={campaign}
                          component={component}
                        />
                      )}
                    </section>
                    <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5">
                      <h3 className="text-sm font-semibold">Cómo funciona</h3>
                      <ol className="mt-4 space-y-4 text-sm text-slate-600">
                        <li>
                          <b>1. Audiencia:</b> {campaign.audience.minVisits}+
                          visitas en {campaign.audience.pagePath}
                        </li>
                        <li>
                          <b>2. Condición:</b> la cookie coincide con la
                          campaña.
                        </li>
                        <li>
                          <b>3. Componente:</b> {labels[component.kind]} en{" "}
                          {component.slot}.
                        </li>
                        <li>
                          <b>4. Entrega:</b>{" "}
                          {campaign.status === "published"
                            ? "activo en la landing"
                            : "publica la campaña para activarlo"}
                          .
                        </li>
                      </ol>
                      {serverId && (
                        <button
                          onClick={() => setDeleteOpen(true)}
                          className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-red-600"
                        >
                          <Trash2 className="size-3" /> Eliminar campaña
                        </button>
                      )}
                    </aside>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar esta campaña?"
        description="Esta acción no se puede deshacer."
        onConfirm={() => void remove()}
      />
    </main>
  );
}

function CampaignEditor({
  campaign,
  component,
  update,
  updateComponent,
  addQuestion,
  patchQuestion,
  removeQuestion,
}: {
  campaign: Campaign;
  component: MarketingComponent;
  update: (updater: (current: Campaign) => Campaign) => void;
  updateComponent: (patch: Partial<MarketingComponent>) => void;
  addQuestion: (kind: MarketingQuestionKind) => void;
  patchQuestion: (id: string, patch: Partial<MarketingQuestion>) => void;
  removeQuestion: (id: string) => void;
}) {
  return (
    <div className="space-y-7 p-5">
      <section>
        <h2 className="text-base font-semibold">Campaña</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <input
              value={campaign.name}
              onChange={(event) =>
                update((current) => ({ ...current, name: event.target.value }))
              }
            />
          </Field>
          <Field label="Estado">
            <select
              value={campaign.status}
              onChange={(event) =>
                update((current) => ({
                  ...current,
                  status: event.target.value as Campaign["status"],
                }))
              }
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicada</option>
              <option value="paused">Pausada</option>
            </select>
          </Field>
        </div>
        <Field label="Objetivo">
          <textarea
            value={campaign.description}
            onChange={(event) =>
              update((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </Field>
      </section>
      <section className="border-t border-slate-100 pt-6">
        <h2 className="text-base font-semibold">Nodo de audiencia</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Visitas mínimas">
            <input
              type="number"
              min={1}
              step={1}
              value={campaign.audience.minVisits}
              onChange={(event) =>
                update((current) => ({
                  ...current,
                  audience: {
                    ...current.audience,
                    minVisits: Math.max(1, Math.round(Number(event.target.value) || 1)),
                  },
                }))
              }
            />
          </Field>
          <Field label="Página">
            <select
              value={campaign.audience.pagePath}
              onChange={(event) =>
                update((current) => ({
                  ...current,
                  audience: {
                    ...current.audience,
                    pagePath: event.target.value,
                  },
                }))
              }
            >
              <option value="/">Home</option>
              <option value="/masaje-sensorial-hombres">
                Masaje sensorial
              </option>
              <option value="/masaje-tantrico-hombres-cdmx">
                Masaje tántrico
              </option>
            </select>
          </Field>
        </div>
      </section>
      <section className="border-t border-slate-100 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Nodo de componente</h2>
            <p className="mt-1 text-sm text-slate-500">
              Edita el módulo que entrega la campaña.
            </p>
          </div>
          <select
            value={component.kind}
            onChange={(event) =>
              updateComponent({
                kind: event.target.value as ComponentKind,
                slot:
                  event.target.value === "hero"
                    ? "home.hero"
                    : event.target.value === "block" ||
                        event.target.value === "survey"
                      ? "home.promo"
                      : "home.banner",
              })
            }
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            {componentKinds.map((kind) => (
              <option key={kind} value={kind}>
                {labels[kind]}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 grid gap-4">
          <Field label="Zona de landing">
            <select
              value={component.slot}
              onChange={(event) =>
                updateComponent({
                  slot: event.target.value as MarketingComponent["slot"],
                })
              }
            >
              {slots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Título">
            <input
              value={component.title}
              onChange={(event) =>
                updateComponent({ title: event.target.value })
              }
            />
          </Field>
          <Field label="Mensaje">
            <textarea
              value={component.body}
              onChange={(event) =>
                updateComponent({ body: event.target.value })
              }
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Texto CTA">
              <input
                value={component.ctaLabel}
                onChange={(event) =>
                  updateComponent({ ctaLabel: event.target.value })
                }
              />
            </Field>
            <Field label="Destino CTA">
              <input
                value={component.ctaHref}
                onChange={(event) =>
                  updateComponent({ ctaHref: event.target.value })
                }
              />
            </Field>
          </div>
          {component.kind === "hero" && (
            <Field label="Imagen">
              <input
                value={component.imageUrl ?? ""}
                placeholder="/imagen.jpg"
                onChange={(event) =>
                  updateComponent({ imageUrl: event.target.value })
                }
              />
            </Field>
          )}
          {component.kind === "survey" && (
            <SurveyQuestionEditor
              questions={(component.questions ?? []) as MarketingQuestion[]}
              onAdd={addQuestion}
              onPatch={patchQuestion}
              onRemove={removeQuestion}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function SurveyPreviewWizard({
  title,
  body,
  ctaLabel,
  questions,
}: {
  title: string;
  body: string;
  ctaLabel: string;
  questions: MarketingQuestion[];
}) {
  const [step, setStep] = useState(0);
  if (questions.length === 0) {
    return (
      <div className="p-7">
        <p className="text-xs text-slate-400">Encuesta</p>
        <h2 className="mt-2 text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{body}</p>
        <p className="mt-6 rounded border border-dashed border-slate-200 p-4 text-xs text-slate-500">
          Esta campaña aún no tiene preguntas.
        </p>
        <button
          type="button"
          className="mt-6 rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white"
        >
          {ctaLabel}
        </button>
      </div>
    );
  }
  const question = questions[step];
  const isLast = step === questions.length - 1;
  return (
    <div className="p-7">
      <p className="text-xs text-slate-400">Encuesta</p>
      <h2 className="mt-2 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{body}</p>
      <div className="mt-4 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
        <span>
          Pregunta {step + 1} de {questions.length}
        </span>
      </div>
      <div
        className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(((step + 1) / questions.length) * 100)}
        aria-label="Progreso de la encuesta"
      >
        <div
          className="h-full bg-slate-900"
          style={{ width: `${Math.round(((step + 1) / questions.length) * 100)}%` }}
        />
      </div>
      <div className="mt-5">
        <p className="text-sm font-medium">
          {question.label}
          {question.required && (
            <span className="ml-1 text-rose-500">
              * <span className="sr-only">(obligatorio)</span>
            </span>
          )}
        </p>
        {question.kind === "rating" ? (
          <div className="mt-2 flex gap-2" aria-label={question.label}>
            {[1, 2, 3, 4, 5].map((value) => (
              <span
                key={value}
                className="grid size-9 place-items-center rounded-md bg-slate-100 text-sm text-slate-700"
              >
                {value}
              </span>
            ))}
          </div>
        ) : question.kind === "choice" ? (
          <div className="mt-2 flex flex-wrap gap-2" aria-label={question.label}>
            {(question.options ?? []).map((option) => (
              <span
                key={option}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                {option}
              </span>
            ))}
          </div>
        ) : (
          <textarea
            aria-label={question.label}
            className="mt-2 min-h-20 w-full rounded-md border border-slate-200 p-3 text-sm"
            placeholder="Escribe tu respuesta"
          />
        )}
      </div>
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          className="rounded border border-slate-200 px-3 py-2 text-xs font-medium disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => setStep((current) => Math.min(questions.length - 1, current + 1))}
          className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white"
        >
          {isLast ? ctaLabel : "Siguiente"}
        </button>
      </div>
    </div>
  );
}

function CampaignPreview({
  campaign,
  component,
}: {
  campaign: Campaign;
  component: MarketingComponent;
}) {
  return (
    <div className="bg-slate-100 p-5">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex h-11 items-center justify-between border-b border-slate-100 px-4 text-xs text-slate-500">
          <span>elementspa.mx</span>
          <span>{component.slot}</span>
        </div>
        {component.kind === "hero" ? (
          <div className="min-h-72 bg-slate-950 p-9 text-white">
            <p className="text-xs uppercase tracking-[0.16em] text-amber-300">
              Experiencia personalizada
            </p>
            <h2 className="mt-4 max-w-md font-serif text-3xl">
              {component.title}
            </h2>
            <p className="mt-3 max-w-sm text-sm text-slate-300">
              {component.body}
            </p>
            <button className="mt-6 rounded bg-amber-400 px-4 py-2 text-sm font-medium text-slate-950">
              {component.ctaLabel}
            </button>
          </div>
        ) : component.kind === "survey" ? (
          <SurveyPreviewWizard
            title={component.title}
            body={component.body}
            ctaLabel={component.ctaLabel}
            questions={(component.questions ?? []) as MarketingQuestion[]}
          />
        ) : (
          <div className="p-6">
            <div
              className={`rounded-lg p-5 ${component.kind === "banner" ? "bg-violet-700 text-white" : "bg-slate-100"}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
                Campaña activa
              </p>
              <h2 className="mt-2 text-xl font-semibold">{component.title}</h2>
              <p className="mt-2 text-sm opacity-80">{component.body}</p>
              <button className="mt-4 rounded bg-white px-3 py-2 text-sm font-medium text-slate-900">
                {component.ctaLabel}
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">
        Se muestra desde {campaign.audience.minVisits} visitas al publicar.
      </p>
    </div>
  );
}

function SurveyQuestionEditor({
  questions,
  onAdd,
  onPatch,
  onRemove,
}: {
  questions: MarketingQuestion[];
  onAdd: (kind: MarketingQuestionKind) => void;
  onPatch: (id: string, patch: Partial<MarketingQuestion>) => void;
  onRemove: (id: string) => void;
}) {
  const kinds: MarketingQuestionKind[] = ["text", "rating", "choice"];
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-slate-700">Preguntas</p>
        <p className="mt-1 text-xs text-slate-500">
          Cada pregunta conserva su tipo y sus opciones aunque edites la etiqueta.
        </p>
      </div>
      {questions.length === 0 && (
        <p className="rounded-md border border-dashed border-slate-200 p-3 text-xs text-slate-500">
          Aún no agregas preguntas.
        </p>
      )}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="space-y-2 rounded-lg border border-slate-200 bg-white p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Pregunta {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onRemove(question.id)}
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
            <label className="block text-xs font-medium text-slate-600">
              Tipo
              <select
                value={question.kind}
                onChange={(event) =>
                  onPatch(question.id, {
                    kind: event.target.value as MarketingQuestionKind,
                  })
                }
                className="mt-1.5 h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm"
              >
                {kinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind === "text"
                      ? "Texto abierto"
                      : kind === "rating"
                        ? "Rating 1–5"
                        : "Opción única"}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Pregunta
              <textarea
                value={question.label}
                onChange={(event) =>
                  onPatch(question.id, { label: event.target.value })
                }
                className="mt-1.5 min-h-16 w-full rounded border border-slate-200 p-2 text-sm"
              />
            </label>
            {question.kind === "choice" && (
              <ChoiceOptionsField
                options={question.options ?? []}
                onChange={(options) => onPatch(question.id, { options })}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAdd("text")}
          className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
        >
          + Texto
        </button>
        <button
          type="button"
          onClick={() => onAdd("rating")}
          className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
        >
          + Rating
        </button>
        <button
          type="button"
          onClick={() => onAdd("choice")}
          className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
        >
          + Opción única
        </button>
      </div>
    </div>
  );
}

function ChoiceOptionsField({
  options,
  onChange,
}: {
  options: string[];
  onChange: (options: string[]) => void;
}) {
  const lines = options.join("\n");
  return (
    <label className="block text-xs font-medium text-slate-600">
      Opciones, una por línea
      <textarea
        value={lines}
        onChange={(event) =>
          onChange(
            Array.from(
              new Set(
                event.target.value
                  .split("\n")
                  .map((option) => option.trim())
                  .filter(Boolean),
              ),
            ),
          )
        }
        className="mt-1.5 min-h-20 w-full rounded border border-slate-200 p-2 text-sm"
        placeholder="Relajación&#10;Sensorial&#10;Tántrico"
      />
    </label>
  );
}

function EmptyState({ create }: { create: () => void }) {
  return (
    <div className="grid h-full place-items-center">
      <div className="max-w-sm text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-white shadow-sm">
          <Megaphone className="size-5 text-slate-500" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Crea una campaña</h2>
        <p className="mt-2 text-sm text-slate-500">
          Un borrador combina nodos de audiencia, condición, componente y
          entrega.
        </p>
        <button
          onClick={create}
          className="mt-5 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
        >
          Nueva campaña
        </button>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 ${active ? "bg-slate-950 font-medium text-white" : "text-slate-500"}`}
    >
      {icon}
      {label}
    </button>
  );
}
function StatusDot({ status }: { status: Campaign["status"] }) {
  return (
    <span
      className={`size-2 rounded-full ${status === "published" ? "bg-emerald-500" : status === "paused" ? "bg-amber-500" : "bg-slate-300"}`}
    />
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      {label}
      <div className="mt-1.5 [&_input]:h-9 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-slate-200 [&_input]:px-3 [&_input]:text-sm [&_select]:h-9 [&_select]:w-full [&_select]:rounded-md [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_textarea]:min-h-20 [&_textarea]:w-full [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:p-3 [&_textarea]:text-sm">
        {children}
      </div>
    </label>
  );
}
