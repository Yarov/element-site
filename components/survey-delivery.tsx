"use client";

import { Check, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type {
  ActionNode,
  SurveyField,
  SurveyFlow,
  SurveyNode,
} from "@/lib/surveys/model";
import { getVisitCount } from "@/lib/marketing/client";
import {
  getVisitorSignals,
  markShownThisSession,
  recordFlowCompleted,
  recordFlowDismissed,
  recordFlowShown,
  wasShownThisSession,
} from "@/lib/surveys/visitor-signals";
import {
  selectEligibleSurvey,
  type SelectedSurvey,
} from "@/lib/surveys/delivery";

type ActiveSurvey = { id: string; flow: SurveyFlow };

export function SurveyDelivery() {
  const pathname = usePathname();
  const [active, setActive] = useState<SelectedSurvey | null>(null);
  const [flows, setFlows] = useState<ActiveSurvey[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [showRequiredMessage, setShowRequiredMessage] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedFlowId = useRef<string | null>(null);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;
    const previewId = new URLSearchParams(window.location.search).get(
      "preview",
    );
    const isPreview = Boolean(previewId);

    function displayPreview(flows: ActiveSurvey[]) {
      const previewFlow = flows[0];
      const previewSurvey = previewFlow?.flow.nodes.find(
        (node): node is SurveyNode => node.type === "survey",
      );
      const action = previewFlow?.flow.nodes.find(
        (node): node is ActionNode => node.type === "action",
      );
      const match = previewFlow && previewSurvey
        ? { ...previewFlow, survey: previewSurvey, ...(action ? { action } : {}) }
        : null;
      if (match) {
        setActive(match);
        setPreview(true);
      }
    }

    if (isPreview) {
      void fetch(`/api/admin/surveys/${encodeURIComponent(previewId!)}/preview`)
        .then(async (response) => {
          if (!response.ok) {
            setPreviewError("No se pudo cargar esta encuesta de prueba.");
            return;
          }
          const data = (await response.json()) as { flow: ActiveSurvey };
          displayPreview([data.flow]);
        })
        .catch(() =>
          setPreviewError("No se pudo cargar esta encuesta de prueba."),
        );
      return;
    }

    void fetch("/api/surveys/active").then(async (response) => {
      if (!response.ok) return;
      setFlows(((await response.json()) as { flows: ActiveSurvey[] }).flows);
    });
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setActive(null);
      return;
    }
    if (!flows.length || preview) return;

    const match = selectEligibleSurvey(
      flows,
      getVisitorSignals(getVisitCount(), pathname),
      Date.now(),
      wasShownThisSession,
    );
    if (!match) {
      setActive(null);
      return;
    }

    // Persist before rendering so a reload or client-side navigation cannot reshow it.
    recordFlowShown(match.id);
    markShownThisSession(match.id);
    if (selectedFlowId.current !== match.id) {
      selectedFlowId.current = match.id;
      setAnswers({});
      setStep(0);
      setSubmitted(false);
      setDismissed(false);
      setPreview(false);
      setSubmissionError(null);
      setShowRequiredMessage(false);
      setIsSubmitting(false);
    }
    setActive(match);
  }, [flows, pathname, preview]);

  if (previewError)
    return (
      <div className="fixed inset-0 z-100 grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-xl border border-primary/25 bg-card p-6 text-center shadow-2xl">
          <p className="text-sm font-medium text-foreground">{previewError}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Regresa a Survey Studio, recarga la encuesta e inténtalo de nuevo.
          </p>
        </div>
      </div>
    );
  if (!active || dismissed) return null;

  const activeSurvey = active;
  const survey = activeSurvey.survey;
  const fields = (
    (survey?.config.fields as SurveyField[] | undefined) ?? []
  ).filter((field) => field.kind !== "cta");
  const field = fields[step];
  const isFinalStep = fields.length === 0 || step === fields.length - 1;
  const progress = fields.length ? ((step + 1) / fields.length) * 100 : 0;

  function hasAnswer(field: SurveyField) {
    const answer = answers[field.id];
    return answer !== undefined && answer !== "";
  }

  function validateCurrentStep() {
    if (field?.required && !hasAnswer(field)) {
      setShowRequiredMessage(true);
      return false;
    }
    setShowRequiredMessage(false);
    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    if (!isFinalStep) setStep((current) => current + 1);
  }

  function answerAndAdvance(value: string | number) {
    if (!field) return;
    setAnswers((current) => ({ ...current, [field.id]: value }));
    setShowRequiredMessage(false);
    if (!isFinalStep) setStep((current) => current + 1);
  }

  async function submit() {
    if (!validateCurrentStep() || isSubmitting) return;

    if (preview) return setSubmitted(true);

    const submittingFlowId = activeSurvey.id;
    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/surveys/${activeSurvey.id}/responses`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answers }),
        },
      );
      if (response.ok) {
        recordFlowCompleted(submittingFlowId);
        if (selectedFlowId.current !== submittingFlowId) return;
        setSubmitted(true);
        return;
      }
      if (selectedFlowId.current !== submittingFlowId) return;
      setSubmissionError("No pudimos guardar tu respuesta. Intenta de nuevo.");
    } catch {
      if (selectedFlowId.current !== submittingFlowId) return;
      setSubmissionError("No pudimos guardar tu respuesta. Intenta de nuevo.");
    } finally {
      if (selectedFlowId.current === submittingFlowId) setIsSubmitting(false);
    }
  }

  function dismiss() {
    if (!preview) recordFlowDismissed(activeSurvey.id);
    setDismissed(true);
  }

  return (
    <div
      className="fixed inset-0 z-100 grid place-items-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="survey-title"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-2xl shadow-black/50">
        <div className="h-1 bg-primary" />
        <div className="p-5 sm:p-8">
          {submitted ? (
            <div className="py-8 text-center sm:py-12">
              <div className="mx-auto grid size-14 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                <Check className="size-7" />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {preview ? "Prueba completada" : "Gracias por compartir"}
              </p>
              <h2 className="mt-3 font-serif text-3xl text-foreground">
                {preview
                  ? "Así se verá para tus visitantes"
                  : String(activeSurvey.action?.config.message ?? "Tu opinión nos ayuda a mejorar")}
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                {preview
                  ? "Esta respuesta no se guardó. Puedes volver al editor para ajustar la encuesta."
                  : "Agradecemos que nos ayudes a cuidar cada detalle de tu experiencia."}
              </p>
              <button
                type="button"
                onClick={dismiss}
                className="mt-7 rounded-full border border-primary/40 px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="size-3.5" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Tu experiencia
                    </p>
                  </div>
                  <h2
                    id="survey-title"
                    className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl"
                  >
                    {survey?.label ?? activeSurvey.flow.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={dismiss}
                  aria-label="Cerrar encuesta"
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                >
                  <X className="size-4" />
                </button>
              </div>

              {preview && (
                <p className="mt-5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2.5 text-xs leading-5 text-primary">
                  Modo prueba: tus respuestas no se guardarán.
                </p>
              )}

              <div className="mt-6 h-px bg-border" />
              <div className="mt-4 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                <span>
                  Pregunta {fields.length ? step + 1 : 0} de {fields.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {field && (
                <fieldset className="mt-7">
                  <legend className="flex w-full items-start gap-3 text-base font-medium leading-6 text-foreground">
                    <span className="mt-0.5 text-xs font-semibold text-primary">
                      {String(step + 1).padStart(2, "0")}
                    </span>
                    <span>
                      {field.label}
                      {field.required && (
                        <span className="ml-1 text-primary">*</span>
                      )}
                    </span>
                  </legend>
                  {field.kind === "rating" ? (
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => answerAndAdvance(value)}
                          aria-pressed={answers[field.id] === value}
                          className={`flex h-13 flex-col items-center justify-center rounded-lg border text-base font-medium transition ${answers[field.id] === value ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/15" : "border-border bg-secondary/40 text-foreground hover:border-primary/60 hover:bg-primary/10"}`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  ) : field.kind === "singleChoice" ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {(field.options ?? []).map((option) => {
                        const selected = answers[field.id] === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => answerAndAdvance(option)}
                            aria-pressed={selected}
                            className={`flex min-h-12 items-center justify-between rounded-lg border px-4 text-left text-sm transition ${selected ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/60 hover:text-foreground"}`}
                          >
                            {option}
                            <span
                              className={`size-4 rounded-full border ${selected ? "border-primary bg-primary" : "border-muted-foreground"}`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <textarea
                      value={String(answers[field.id] ?? "")}
                      onChange={(event) => {
                        setAnswers((current) => ({
                          ...current,
                          [field.id]: event.target.value,
                        }));
                        setShowRequiredMessage(false);
                      }}
                      placeholder="Comparte tu respuesta..."
                      className="mt-4 min-h-28 w-full resize-none rounded-lg border border-border bg-secondary/30 p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  )}
                </fieldset>
              )}

              {showRequiredMessage && (
                <p className="mt-5 text-sm text-primary" role="alert">
                  Esta pregunta es obligatoria para continuar.
                </p>
              )}
              {submissionError && (
                <p className="mt-5 text-sm text-destructive" role="alert">
                  {submissionError}
                </p>
              )}
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
                <p className="text-xs text-muted-foreground">
                  Tu respuesta es confidencial.
                </p>
                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowRequiredMessage(false);
                        setStep((current) => current - 1);
                      }}
                      disabled={isSubmitting}
                      className="rounded-full border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/60 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Anterior
                    </button>
                  )}
                  <button
                    type={isFinalStep ? "submit" : "button"}
                    onClick={isFinalStep ? undefined : goNext}
                    disabled={isSubmitting}
                    className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isFinalStep
                      ? isSubmitting
                        ? "Enviando..."
                        : "Enviar respuesta"
                      : "Siguiente"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
