export const PUBLIC_ROUTES = [
  { path: "/", label: "Inicio", changeFrequency: "weekly", priority: 1 },
  { path: "/blog", label: "Blog", changeFrequency: "weekly", priority: 0.8 },
  {
    path: "/spa-para-hombres-roma-norte",
    label: "Spa para hombres en Roma Norte",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/spa-para-hombres-coyoacan",
    label: "Spa para hombres en Coyoacán",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/spa-para-hombres-condesa",
    label: "Spa para hombres en Condesa",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/spa-para-hombres-polanco",
    label: "Spa para hombres en Polanco",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/spa-para-hombres-del-valle",
    label: "Spa para hombres en Del Valle",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/masaje-tantrico-hombres-cdmx",
    label: "Masaje tántrico para hombres en CDMX",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/masajes-para-hombres-cdmx",
    label: "Masajes para hombres en CDMX",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/masaje-sensorial-hombres",
    label: "Masaje sensorial para hombres",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/masaje-ejecutivo-hombres-cdmx",
    label: "Masaje ejecutivo para hombres en CDMX",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/en/massage-for-men-mexico-city",
    label: "Massage for men in Mexico City",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/privacidad-seguridad-y-reservas",
    label: "Privacidad, seguridad y reservas",
    changeFrequency: "yearly",
    priority: 0.6,
  },
  {
    path: "/aviso-de-privacidad",
    label: "Aviso de privacidad",
    changeFrequency: "yearly",
    priority: 0.4,
  },
] as const;

export const PUBLIC_ROUTE_PATHS = PUBLIC_ROUTES.map((route) => route.path);
