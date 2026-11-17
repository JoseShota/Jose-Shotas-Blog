// =====================================================================
//  EDITOR DE LA CUEVA — configuración de Keystatic
//  En local:      npm run dev  ->  http://localhost:4321/keystatic
//  En producción: https://www.joseshota.net/keystatic  (login con GitHub)
//  Cada "Guardar" crea un commit en GitHub y Vercel republica el sitio.
// =====================================================================
import { config, collection, singleton, fields } from '@keystatic/core';
import { block, wrapper } from '@keystatic/core/content-components';
import { MOON_OPTIONS } from './src/lib/moons';

// ---------- Campos reutilizables ----------
const idioma = fields.select({
  label: 'Idioma del texto',
  description: 'Se muestra en ambas versiones del sitio con su etiqueta.',
  options: [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
    { label: 'Mezcla / Mixed', value: 'mix' },
  ],
  defaultValue: 'es',
});

const borrador = fields.checkbox({
  label: 'Borrador',
  description: 'Mientras esté marcado, no aparece en el sitio público.',
  defaultValue: true,
});

const fecha = (label: string) => fields.date({ label, defaultValue: { kind: 'today' } });

const calificacion = fields.select({
  label: 'Calificación lunar (0–5)',
  description: 'Cada luna vale 1. Media luna = 0.5.',
  options: MOON_OPTIONS.map((o) => ({ label: o.editorLabel, value: o.value })),
  defaultValue: '3',
});

const portada = (dir: string, label = 'Imagen') =>
  fields.image({ label, directory: `src/assets/${dir}`, publicPath: `../../assets/${dir}/` });

// ---------- Formatos disponibles dentro del texto ----------
const VOLUMENES = [
  { label: 'Vol. 01 — Canciones para cuando muera y transcienda', value: 'vol1' },
  { label: 'Vol. 02 — Te Miré en Mí', value: 'vol2' },
];

const componentes = {
  YouTube: block({
    label: 'Video de YouTube',
    schema: {
      id: fields.text({ label: 'Enlace o ID del video', validation: { length: { min: 1 } } }),
      pie: fields.text({ label: 'Pie de video' }),
    },
  }),
  Cancion: block({
    label: 'Canción de la curaduría',
    schema: {
      volumen: fields.select({ label: 'Colección', options: VOLUMENES, defaultValue: 'vol1' }),
      pista: fields.integer({ label: 'Número de pista', defaultValue: 1 }),
    },
  }),
  Epigrafe: wrapper({
    label: 'Epígrafe / cita',
    schema: { autor: fields.text({ label: 'Autor o fuente' }) },
  }),
  NotaAlMargen: wrapper({
    label: 'Nota al margen',
    schema: { titulo: fields.text({ label: 'Título (opcional)' }) },
  }),
  Spoiler: wrapper({
    label: 'Spoiler (oculto hasta hacer clic)',
    schema: { aviso: fields.text({ label: 'Aviso', defaultValue: 'Contiene spoilers' }) },
  }),
  Terminal: block({
    label: 'Ventana de terminal',
    schema: { texto: fields.text({ label: 'Texto', multiline: true }) },
  }),
  Galeria: block({
    label: 'Galería de imágenes',
    schema: {
      imagenes: fields.array(
        fields.object({
          imagen: fields.image({ label: 'Imagen', directory: 'public/images/contenido', publicPath: '/images/contenido/' }),
          pie: fields.text({ label: 'Pie' }),
        }),
        { label: 'Imágenes', itemLabel: (p) => p.fields.pie.value || 'Imagen' }
      ),
    },
  }),
  NotaDeVoz: block({
    label: 'Nota de voz / audio corto',
    schema: {
      archivo: fields.file({ label: 'Audio (mp3, m4a, ogg)', directory: 'public/archivos/audio', publicPath: '/archivos/audio/' }),
      titulo: fields.text({ label: 'Título' }),
    },
  }),
  Adjunto: block({
    label: 'Archivo adjunto (PDF, etc.)',
    schema: {
      archivo: fields.file({ label: 'Archivo', directory: 'public/archivos', publicPath: '/archivos/' }),
      titulo: fields.text({ label: 'Nombre visible' }),
    },
  }),
};

const texto = (label: string, dir: string) =>
  fields.markdoc({
    label,
    options: { image: { directory: `src/assets/${dir}`, publicPath: `../../assets/${dir}/` } },
    components: componentes,
  });

// ---------- Configuración principal ----------
export default config({
  // Producción: guarda en GitHub. En tu computadora: guarda en los archivos locales.
  // Para la configuración inicial (crear la GitHub App) usa:
  //   PUBLIC_KEYSTATIC_STORAGE=github npm run dev
  storage:
    import.meta.env.PROD || import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'github'
      ? { kind: 'github', repo: { owner: 'JoseShota', name: 'Jose-Shotas-Blog' } }
      : { kind: 'local' },

  ui: {
    brand: { name: 'La Cueva · Editor' },
    navigation: {
      Escritos: ['bitacora'],
      Archivo: ['curaduria', 'museo'],
      Registros: ['cine', 'libros', 'estudio', 'recomendaciones'],
      'La cueva': ['ajustes', 'sobreEs', 'sobreEn'],
    },
  },

  collections: {
    bitacora: collection({
      label: 'Bitácora (escritos)',
      slugField: 'titulo',
      path: 'src/content/bitacora/*',
      format: { contentField: 'contenido' },
      entryLayout: 'content',
      columns: ['titulo', 'fecha'],
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        fecha: fecha('Fecha de publicación'),
        idioma,
        borrador,
        estado: fields.select({
          label: 'Estado mental',
          options: [
            { label: 'Archivo', value: 'archivo' },
            { label: 'Brillo', value: 'brillo' },
            { label: 'Sombra', value: 'sombra' },
            { label: 'Glitch', value: 'glitch' },
          ],
          defaultValue: 'archivo',
        }),
        resumen: fields.text({ label: 'Resumen (aparece en la lista y al compartir)', multiline: true }),
        portada: portada('bitacora', 'Imagen de portada (opcional)'),
        traduccionDe: fields.relationship({
          label: 'Es la traducción de…',
          description: 'Si este texto traduce otro, enlázalo y el sitio mostrará la versión correcta en cada idioma.',
          collection: 'bitacora',
        }),
        contenido: texto('Texto', 'bitacora'),
      },
    }),

    cine: collection({
      label: 'Cinemateca (películas)',
      slugField: 'titulo',
      path: 'src/content/cine/*',
      format: { contentField: 'resena' },
      entryLayout: 'content',
      columns: ['titulo', 'vista'],
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        tituloOriginal: fields.text({ label: 'Título original' }),
        anio: fields.integer({ label: 'Año' }),
        direccion: fields.text({ label: 'Dirección' }),
        pais: fields.text({ label: 'País' }),
        vista: fecha('Fecha en que la vi'),
        calificacion,
        poster: portada('cine', 'Póster'),
        idioma,
        borrador,
        resena: texto('Reseña', 'cine'),
      },
    }),

    libros: collection({
      label: 'Biblioteca (libros)',
      slugField: 'titulo',
      path: 'src/content/libros/*',
      format: { contentField: 'notas' },
      entryLayout: 'content',
      columns: ['titulo', 'autor'],
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        autor: fields.text({ label: 'Autor/a' }),
        anio: fields.integer({ label: 'Año de publicación' }),
        estado: fields.select({
          label: 'Estado de lectura',
          options: [
            { label: 'Leyendo', value: 'leyendo' },
            { label: 'Terminado', value: 'terminado' },
            { label: 'Abandonado', value: 'abandonado' },
            { label: 'Por leer', value: 'por-leer' },
          ],
          defaultValue: 'leyendo',
        }),
        progreso: fields.integer({ label: 'Progreso (%)', defaultValue: 0, validation: { min: 0, max: 100 } }),
        inicio: fields.date({ label: 'Empecé' }),
        fin: fields.date({ label: 'Terminé' }),
        calificacion,
        portada: portada('libros', 'Portada'),
        citas: fields.array(
          fields.object({
            cita: fields.text({ label: 'Cita', multiline: true }),
            pagina: fields.text({ label: 'Página' }),
          }),
          { label: 'Citas favoritas', itemLabel: (p) => p.fields.cita.value.slice(0, 60) || 'Cita' }
        ),
        idioma,
        borrador,
        notas: texto('Notas de lectura', 'libros'),
      },
    }),

    estudio: collection({
      label: 'Estudio (lo que aprendo)',
      slugField: 'tema',
      path: 'src/content/estudio/*',
      format: { contentField: 'apuntes' },
      entryLayout: 'content',
      columns: ['tema', 'estado'],
      schema: {
        tema: fields.slug({ name: { label: 'Tema' } }),
        area: fields.text({ label: 'Área (ej. filosofía, japonés, programación)' }),
        estado: fields.select({
          label: 'Estado',
          options: [
            { label: 'Explorando', value: 'explorando' },
            { label: 'En curso', value: 'en-curso' },
            { label: 'Dominado', value: 'dominado' },
            { label: 'En pausa', value: 'pausa' },
          ],
          defaultValue: 'en-curso',
        }),
        progreso: fields.integer({ label: 'Progreso (%)', defaultValue: 0, validation: { min: 0, max: 100 } }),
        inicio: fecha('Empecé'),
        recursos: fields.array(
          fields.object({
            titulo: fields.text({ label: 'Recurso' }),
            url: fields.url({ label: 'Enlace (opcional)' }),
            tipo: fields.select({
              label: 'Tipo',
              options: [
                { label: 'Libro', value: 'libro' },
                { label: 'Curso', value: 'curso' },
                { label: 'Video', value: 'video' },
                { label: 'Artículo', value: 'articulo' },
                { label: 'Otro', value: 'otro' },
              ],
              defaultValue: 'libro',
            }),
          }),
          { label: 'Recursos', itemLabel: (p) => p.fields.titulo.value || 'Recurso' }
        ),
        idioma,
        borrador,
        apuntes: texto('Apuntes', 'estudio'),
      },
    }),

    recomendaciones: collection({
      label: 'Recomendaciones',
      slugField: 'titulo',
      path: 'src/content/recomendaciones/*',
      format: { contentField: 'porque' },
      columns: ['titulo', 'tipo'],
      schema: {
        titulo: fields.slug({ name: { label: 'Qué recomiendo' } }),
        tipo: fields.select({
          label: 'Tipo',
          options: [
            { label: 'Música', value: 'musica' },
            { label: 'Película / serie', value: 'cine' },
            { label: 'Libro', value: 'libro' },
            { label: 'Lugar', value: 'lugar' },
            { label: 'Sitio web', value: 'web' },
            { label: 'Objeto', value: 'objeto' },
            { label: 'Otro', value: 'otro' },
          ],
          defaultValue: 'musica',
        }),
        creador: fields.text({ label: 'Autor / artista / creador' }),
        enlace: fields.url({ label: 'Enlace' }),
        imagen: portada('recomendaciones', 'Imagen (opcional)'),
        fecha: fecha('Fecha'),
        idioma,
        borrador,
        porque: texto('¿Por qué?', 'recomendaciones'),
      },
    }),

    curaduria: collection({
      label: 'Curaduría (colecciones musicales)',
      slugField: 'titulo',
      path: 'src/content/curaduria/*',
      format: { data: 'yaml' },
      columns: ['titulo', 'orden'],
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        tituloEn: fields.text({ label: 'Título en inglés (opcional)' }),
        pistas: fields.select({ label: 'Archivo de pistas', options: VOLUMENES, defaultValue: 'vol1' }),
        orden: fields.integer({ label: 'Orden', defaultValue: 1 }),
        portadaUrl: fields.text({ label: 'URL de la portada' }),
        descripcion: fields.text({ label: 'Nota editorial', multiline: true }),
        descripcionEn: fields.text({ label: 'Nota editorial en inglés (opcional)', multiline: true }),
        notas: fields.array(
          fields.object({
            pista: fields.integer({ label: 'Número de pista' }),
            nota: fields.text({ label: 'Por qué está aquí', multiline: true }),
          }),
          { label: 'Notas por canción', itemLabel: (p) => `#${p.fields.pista.value ?? '?'} — ${p.fields.nota.value.slice(0, 50)}` }
        ),
      },
    }),

    museo: collection({
      label: 'Museo (videos)',
      slugField: 'titulo',
      path: 'src/content/museo/*',
      format: { data: 'yaml' },
      columns: ['titulo', 'orden'],
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        youtube: fields.text({ label: 'Enlace o ID de YouTube' }),
        orden: fields.integer({ label: 'Orden', defaultValue: 1 }),
        descripcion: fields.text({ label: 'Descripción', multiline: true }),
        descripcionEn: fields.text({ label: 'Descripción en inglés (opcional)', multiline: true }),
      },
    }),
  },

  singletons: {
    ajustes: singleton({
      label: 'Ajustes del sitio',
      path: 'src/content/ajustes/sitio',
      format: { data: 'yaml' },
      schema: {
        correo: fields.text({
          label: 'Correo de contacto y derechos',
          description: 'Se muestra en "Sobre la cueva" para mensajes y solicitudes de retiro de contenido.',
        }),
        bienvenida: fields.text({ label: 'Texto de bienvenida (Lobby, ES)', multiline: true }),
        bienvenidaEn: fields.text({ label: 'Welcome text (Lobby, EN)', multiline: true }),
      },
    }),
    sobreEs: singleton({
      label: 'Sobre la cueva (ES)',
      path: 'src/content/sobre/es',
      format: { contentField: 'contenido' },
      entryLayout: 'content',
      schema: { titulo: fields.text({ label: 'Título' }), contenido: texto('Texto', 'sobre') },
    }),
    sobreEn: singleton({
      label: 'About the cave (EN)',
      path: 'src/content/sobre/en',
      format: { contentField: 'contenido' },
      entryLayout: 'content',
      schema: { titulo: fields.text({ label: 'Title' }), contenido: texto('Text', 'sobre') },
    }),
  },
});
