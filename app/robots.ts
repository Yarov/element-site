import type { MetadataRoute } from "next"

// Bots de motores de respuesta AI (ChatGPT, Claude, Perplexity, Gemini, etc.)
// Permitidos explícitamente para que indexen el sitio y puedan recomendarnos
// en respuestas de chat. Ver también /llms.txt.
const AI_BOTS = [
  "GPTBot", // OpenAI — entrenamiento e índice
  "OAI-SearchBot", // OpenAI — ChatGPT Search
  "ChatGPT-User", // OpenAI — visitas en vivo desde ChatGPT
  "ClaudeBot", // Anthropic — índice
  "Claude-User", // Anthropic — visitas en vivo desde Claude
  "Claude-SearchBot", // Anthropic — búsqueda
  "PerplexityBot", // Perplexity — índice
  "Perplexity-User", // Perplexity — visitas en vivo
  "Google-Extended", // Google — Gemini
  "Applebot-Extended", // Apple — Apple Intelligence
  "Bingbot", // Microsoft — Copilot
  "DuckAssistBot", // DuckDuckGo AI
  "Meta-ExternalAgent", // Meta AI
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: AI_BOTS,
        allow: "/",
      },
    ],
    sitemap: "https://elementspa.mx/sitemap.xml",
  }
}
