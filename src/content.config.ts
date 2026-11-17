// Colecciones que Astro lee de los archivos que escribe el editor (Keystatic).
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const idioma = z.enum(['es', 'en', 'mix']).default('es');
const borrador = z.boolean().default(false);
const calificacion = z.coerce.number().min(0).max(5).default(0);
const fechaOpcional = z.coerce.date().optional().nullable();

const mdoc = (dir: string) => glob({ pattern: '**/*.mdoc', base: `./src/content/${dir}` });
const yaml = (dir: string) => glob({ pattern: '**/*.yaml', base: `./src/content/${dir}` });

const bitacora = defineCollection({
  loader: mdoc('bitacora'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      fecha: z.coerce.date(),
      idioma,
      borrador,
      estado: z.enum(['archivo', 'brillo', 'sombra', 'glitch']).default('archivo'),
      resumen: z.string().optional().default(''),
      portada: image().optional().nullable(),
      traduccionDe: z.string().optional().nullable(),
    }),
});

const cine = defineCollection({
  loader: mdoc('cine'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      tituloOriginal: z.string().optional().default(''),
      anio: z.number().optional().nullable(),
      direccion: z.string().optional().default(''),
      pais: z.string().optional().default(''),
      vista: z.coerce.date(),
      calificacion,
      poster: image().optional().nullable(),
      idioma,
      borrador,
    }),
});

const libros = defineCollection({
  loader: mdoc('libros'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      autor: z.string().optional().default(''),
      anio: z.number().optional().nullable(),
      estado: z.enum(['leyendo', 'terminado', 'abandonado', 'por-leer']).default('leyendo'),
      progreso: z.number().min(0).max(100).optional().nullable(),
      inicio: fechaOpcional,
      fin: fechaOpcional,
      calificacion,
      portada: image().optional().nullable(),
      citas: z.array(z.object({ cita: z.string(), pagina: z.string().optional().default('') })).default([]),
      idioma,
      borrador,
    }),
});

const estudio = defineCollection({
  loader: mdoc('estudio'),
  schema: z.object({
    tema: z.string(),
    area: z.string().optional().default(''),
    estado: z.enum(['explorando', 'en-curso', 'dominado', 'pausa']).default('en-curso'),
    progreso: z.number().min(0).max(100).optional().nullable(),
    inicio: z.coerce.date(),
    recursos: z
      .array(
        z.object({
          titulo: z.string(),
          url: z.string().optional().nullable(),
          tipo: z.enum(['libro', 'curso', 'video', 'articulo', 'otro']).default('otro'),
        })
      )
      .default([]),
    idioma,
    borrador,
  }),
});

const recomendaciones = defineCollection({
  loader: mdoc('recomendaciones'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      tipo: z.enum(['musica', 'cine', 'libro', 'lugar', 'web', 'objeto', 'otro']).default('otro'),
      creador: z.string().optional().default(''),
      enlace: z.string().optional().nullable(),
      imagen: image().optional().nullable(),
      fecha: z.coerce.date(),
      idioma,
      borrador,
    }),
});

const curaduria = defineCollection({
  loader: yaml('curaduria'),
  schema: z.object({
    titulo: z.string(),
    tituloEn: z.string().optional().default(''),
    pistas: z.enum(['vol1', 'vol2']),
    orden: z.number().default(1),
    portadaUrl: z.string().optional().default(''),
    descripcion: z.string().optional().default(''),
    descripcionEn: z.string().optional().default(''),
    notas: z.array(z.object({ pista: z.number(), nota: z.string() })).default([]),
  }),
});

const museo = defineCollection({
  loader: yaml('museo'),
  schema: z.object({
    titulo: z.string(),
    youtube: z.string(),
    orden: z.number().default(1),
    descripcion: z.string().optional().default(''),
    descripcionEn: z.string().optional().default(''),
  }),
});

const ajustes = defineCollection({
  loader: yaml('ajustes'),
  schema: z.object({
    correo: z.string().optional().default(''),
    bienvenida: z.string().optional().default(''),
    bienvenidaEn: z.string().optional().default(''),
  }),
});

const sobre = defineCollection({
  loader: mdoc('sobre'),
  schema: z.object({ titulo: z.string() }),
});

export const collections = { bitacora, cine, libros, estudio, recomendaciones, curaduria, museo, ajustes, sobre };
