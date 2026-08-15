/** @type {import('next').NextConfig} */

/**
 * Cabeceras de seguridad.
 *
 * No se incluye Content-Security-Policy todavía: el sitio carga GTM, el pixel
 * de Meta y fuentes de Google, así que una CSP mal calibrada rompería el
 * tracking. Requiere probarse primero en modo Report-Only.
 */
const securityHeaders = [
  // Fuerza HTTPS en visitas posteriores. Sin `preload` a propósito: esa lista
  // es difícil de revertir.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Evita que el navegador adivine el tipo de archivo (MIME sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Impide que el sitio se embeba en iframes ajenos (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Al salir del sitio solo se envía el dominio, no la URL completa.
  // Relevante para un negocio que vende discreción.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No usamos estas APIs; se desactivan explícitamente.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
]

const nextConfig = {
  // Las imágenes se optimizan (AVIF/WebP + srcset responsivo). Antes estaba en
  // `unoptimized: true`, lo que hacía que un teléfono descargara la imagen
  // completa de escritorio en JPEG. Con ~89% de tráfico móvil, era caro.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
