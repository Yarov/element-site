export const QUESTION_TYPE_LABELS = {
  text: "Texto abierto",
  rating: "Calificación 1–5",
  choice: "Opción única",
  singleChoice: "Opción única",
  cta: "Llamada a la acción",
} as const;

export const BRANCH_LABELS = {
  next: "Siguiente",
  match: "Cumple",
  else: "No cumple",
} as const;

export const STATUS_LABELS = {
  draft: { noun: "Borrador", action: "Publicar" },
  published: { noun: "Publicada", action: "Pausar" },
  paused: { noun: "Pausada", action: "Reactivar" },
} as const;

export const NODE_LABELS = {
  trigger: "Distribución",
  condition: "Condición",
  survey: "Encuesta",
  action: "Cierre",
} as const;

export function humanizeKind(kind: keyof typeof QUESTION_TYPE_LABELS) {
  return QUESTION_TYPE_LABELS[kind] ?? kind;
}