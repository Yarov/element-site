import type { SurveyFlow } from "./model";

export const seedFlow: SurveyFlow = {
  id: "seed-three-visits",
  name: "Encuesta después de 3 visitas",
  description: "Conoce mejor la experiencia de los visitantes recurrentes.",
  updatedAt: new Date(0).toISOString(),
  nodes: [
    {
      id: "trigger",
      type: "trigger",
      label: "3 visitas",
      config: { visitCount: 3 },
    },
    {
      id: "survey",
      type: "survey",
      label: "Experiencia ElementSpa",
      config: {
        fields: [
          {
            id: "feedback",
            kind: "text",
            label: "¿Qué podemos mejorar?",
            required: true,
          },
          {
            id: "experience",
            kind: "rating",
            label: "¿Cómo fue tu experiencia?",
            required: true,
          },
        ],
      },
    },
    {
      id: "action",
      type: "action",
      label: "Mostrar agradecimiento",
      config: { message: "Gracias por compartir tu experiencia." },
    },
  ],
  edges: [
    { from: "trigger", to: "survey", outcome: "next" },
    { from: "survey", to: "action", outcome: "next" },
  ],
};

export const emptyFlow = (): SurveyFlow => ({
  ...seedFlow,
  id: `flow-${Date.now()}`,
  name: "Nuevo flujo",
  description: "",
  nodes: [],
  edges: [],
  updatedAt: new Date().toISOString(),
});

export function createStarterFlow(): SurveyFlow {
  const triggerId = crypto.randomUUID();
  const surveyId = crypto.randomUUID();
  const actionId = crypto.randomUUID();
  return {
    id: crypto.randomUUID(),
    name: "Nueva encuesta",
    description: "",
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: triggerId,
        type: "trigger",
        label: "Visitante recurrente",
        config: { visitCount: 3, pagePaths: ["/"] },
        position: { x: 100, y: 170 },
      },
      {
        id: surveyId,
        type: "survey",
        label: "Nueva encuesta",
        config: {
          fields: [
            {
              id: crypto.randomUUID(),
              kind: "text",
              label: "¿Cómo podemos mejorar tu experiencia?",
              required: true,
            },
          ],
        },
        position: { x: 360, y: 170 },
      },
      {
        id: actionId,
        type: "action",
        label: "Mensaje final",
        config: { message: "Gracias por tu respuesta" },
        position: { x: 620, y: 170 },
      },
    ],
    edges: [
      { from: triggerId, to: surveyId, outcome: "next" },
      { from: surveyId, to: actionId, outcome: "next" },
    ],
  };
}
