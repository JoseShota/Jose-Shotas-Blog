// Textos de la interfaz y rutas en ambos idiomas.
// El contenido (escritos, reseñas…) vive en el idioma en que fue escrito;
// la interfaz se traduce completa.
export type Lang = 'es' | 'en';
export const LANGS: Lang[] = ['es', 'en'];

export const SITE = {
  es: { name: 'Nuestra Cueva Virtual', by: 'por Jose Shōta' },
  en: { name: 'Our Virtual Cave', by: 'by Jose Shōta' },
  // Juego de idiomas: la cueva también tiene nombre japonés (dōkutsu)
  ja: '洞窟',
};

export const SECTIONS = {
  lobby: { path: '/', es: 'Lobby', en: 'Lobby' },
  bitacora: { path: '/bitacora', es: 'Bitácora', en: 'Logbook' },
  musica: { path: '/musica', es: 'Curaduría', en: 'Curation' },
  videos: { path: '/videos', es: 'Museo', en: 'Museum' },
  cine: { path: '/cine', es: 'Cinemateca', en: 'Cinematheque' },
  libros: { path: '/libros', es: 'Biblioteca', en: 'Library' },
  estudio: { path: '/estudio', es: 'Estudio', en: 'Study' },
  recomendaciones: { path: '/recomendaciones', es: 'Recomendaciones', en: 'Recs' },
  sobre: { path: '/sobre', es: 'Sobre la cueva', en: 'About the cave' },
} as const;
export type SectionKey = keyof typeof SECTIONS;

export const NAV_GROUPS: { es: string; en: string; items: SectionKey[] }[] = [
  { es: '', en: '', items: ['lobby'] },
  { es: 'escritos', en: 'writings', items: ['bitacora'] },
  { es: 'archivo', en: 'archive', items: ['musica', 'videos'] },
  { es: 'registros', en: 'records', items: ['cine', 'libros', 'estudio', 'recomendaciones'] },
  { es: '', en: '', items: ['sobre'] },
];

/** Prefija una ruta con el idioma: '/cine' -> '/en/cine' */
export function localize(path: string, lang: Lang) {
  if (lang === 'es') return path;
  return path === '/' ? '/en/' : `/en${path}`;
}

/** Quita el prefijo de idioma: '/en/cine/' -> '/cine' */
export function unlocalize(pathname: string) {
  const p = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return p.length > 1 ? p.replace(/\/$/, '') : p;
}

export function formatDate(date: Date | null | undefined, lang: Lang, opts: Intl.DateTimeFormatOptions = {}) {
  if (!date) return '';
  return date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
    ...opts,
  });
}

export const LANG_TAG: Record<string, { es: string; en: string }> = {
  es: { es: 'ES', en: 'ES' },
  en: { es: 'EN', en: 'EN' },
  mix: { es: 'ES/EN', en: 'ES/EN' },
};

export const ui = {
  es: {
    menu: 'Menú',
    skip: 'Saltar al contenido',
    footer: 'Sin anuncios · sin rastreadores · sin algoritmos',
    readingTime: (m: number) => `${m} min de lectura`,
    empty: 'Esta sala todavía está vacía. Vuelve pronto.',
    back: 'Volver',
    viewAll: 'Ver todo',
    // Lobby
    status: 'ESTADO_DEL_SISTEMA',
    online: 'EN LÍNEA',
    lastUpdate: 'ÚLTIMA_ACTUALIZACIÓN',
    location: 'UBICACIÓN',
    nowReading: 'LEYENDO_AHORA',
    lastFilm: 'ÚLTIMA_FUNCIÓN',
    studying: 'ESTUDIANDO',
    lastEntry: 'ÚLTIMA_ENTRADA',
    nowPlaying: 'SONANDO',
    nothing: '—',
    // Bitácora
    bitacoraIntro: 'Notas mentales, ensayos y otras huellas escritas.',
    moods: { archivo: 'archivo', brillo: 'brillo', sombra: 'sombra', glitch: 'glitch' },
    translationAvailable: 'También disponible en español',
    // Cine
    cineIntro: 'Películas vistas y calificadas en escala lunar.',
    directedBy: 'Dirección',
    watched: 'Vista el',
    sortBy: 'Ordenar',
    sortRecent: 'recientes',
    sortRating: 'luna',
    sortYear: 'año',
    // Libros
    librosIntro: 'Lo que leo, lo que dejé y lo que me espera.',
    bookStatus: { leyendo: 'Leyendo', terminado: 'Terminados', abandonado: 'Abandonados', 'por-leer': 'Por leer' },
    quotes: 'Citas',
    page: 'p.',
    // Estudio
    estudioIntro: 'Lo que estoy aprendiendo, con mis apuntes y recursos.',
    studyStatus: { explorando: 'Explorando', 'en-curso': 'En curso', dominado: 'Dominado', pausa: 'En pausa' },
    resources: 'Recursos',
    since: 'desde',
    // Recs
    recsIntro: 'Cosas que te recomiendo, con sus porqués.',
    recKinds: { musica: 'Música', cine: 'Cine', libro: 'Libro', lugar: 'Lugar', web: 'Web', objeto: 'Objeto', otro: 'Otro' },
    all: 'Todo',
    visit: 'Visitar',
    // Sobre
    rightsTitle: 'Derechos y retiro de contenido',
    rightsBody:
      'Si eres titular de derechos de alguna obra presente en esta cueva y prefieres que no esté aquí, escríbeme. Incluye qué obra es, dónde aparece en el sitio y cómo te vinculas con ella. La retiro en un plazo máximo de 48 horas, sin discusión.',
    contact: 'Contacto',
    noCommercial: 'Este sitio no tiene anuncios, no vende nada y no genera ingresos.',
    // 404
    notFoundTitle: 'Señal perdida',
    notFoundBody: 'Esta parte de la cueva no existe (o se derrumbó).',
    goLobby: 'Volver al lobby',
  },
  en: {
    menu: 'Menu',
    skip: 'Skip to content',
    footer: 'No ads · no trackers · no algorithms',
    readingTime: (m: number) => `${m} min read`,
    empty: 'This room is still empty. Come back soon.',
    back: 'Back',
    viewAll: 'View all',
    status: 'SYSTEM_STATUS',
    online: 'ONLINE',
    lastUpdate: 'LAST_UPDATE',
    location: 'LOCATION',
    nowReading: 'NOW_READING',
    lastFilm: 'LAST_SCREENING',
    studying: 'STUDYING',
    lastEntry: 'LAST_ENTRY',
    nowPlaying: 'NOW_PLAYING',
    nothing: '—',
    bitacoraIntro: 'Mental notes, essays and other written traces.',
    moods: { archivo: 'archive', brillo: 'glow', sombra: 'shadow', glitch: 'glitch' },
    translationAvailable: 'Also available in English',
    cineIntro: 'Films watched and rated on a lunar scale.',
    directedBy: 'Directed by',
    watched: 'Watched on',
    sortBy: 'Sort',
    sortRecent: 'recent',
    sortRating: 'moon',
    sortYear: 'year',
    librosIntro: 'What I read, what I dropped and what awaits me.',
    bookStatus: { leyendo: 'Reading', terminado: 'Finished', abandonado: 'Abandoned', 'por-leer': 'To read' },
    quotes: 'Quotes',
    page: 'p.',
    estudioIntro: 'What I am learning, with my notes and resources.',
    studyStatus: { explorando: 'Exploring', 'en-curso': 'In progress', dominado: 'Mastered', pausa: 'Paused' },
    resources: 'Resources',
    since: 'since',
    recsIntro: 'Things I recommend to you, and why.',
    recKinds: { musica: 'Music', cine: 'Film', libro: 'Book', lugar: 'Place', web: 'Web', objeto: 'Object', otro: 'Other' },
    all: 'All',
    visit: 'Visit',
    rightsTitle: 'Rights and takedown',
    rightsBody:
      'If you hold the rights to any work in this cave and would rather it not be here, write to me. Include which work it is, where it appears on the site and how you are connected to it. I will remove it within 48 hours, no questions asked.',
    contact: 'Contact',
    noCommercial: 'This site has no ads, sells nothing and makes no money.',
    notFoundTitle: 'Signal lost',
    notFoundBody: 'This part of the cave does not exist (or it caved in).',
    goLobby: 'Back to the lobby',
  },
};

/** Minutos de lectura aproximados a partir del texto crudo */
export function readingMinutes(body: string | undefined) {
  const words = (body || '').replace(/\{%[^%]*%\}/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
