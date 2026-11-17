// Ayudas para leer el contenido del editor.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './i18n';

type WithDraft = 'bitacora' | 'cine' | 'libros' | 'estudio' | 'recomendaciones';

/** Entradas publicadas. En `npm run dev` también se ven los borradores (para previsualizar). */
export async function published<C extends WithDraft>(name: C): Promise<CollectionEntry<C>[]> {
  const all = (await getCollection(name)) as CollectionEntry<C>[];
  return all.filter((e) => import.meta.env.DEV || !(e.data as { borrador?: boolean }).borrador);
}

/**
 * Bitácora por idioma: si un texto tiene traducción, en cada versión del sitio
 * se muestra la del idioma correspondiente (y nunca ambas duplicadas).
 */
export async function bitacoraFor(lang: Lang) {
  const posts = await published('bitacora');
  const groups = new Map<string, CollectionEntry<'bitacora'>[]>();
  for (const p of posts) {
    const key = p.data.traduccionDe || p.id;
    groups.set(key, [...(groups.get(key) || []), p]);
  }
  const chosen = [...groups.values()].map(
    (g) => g.find((p) => p.data.idioma === lang) || g.find((p) => !p.data.traduccionDe) || g[0]
  );
  return chosen.sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
}

/** La versión de un texto en el otro idioma, si existe */
export async function translationOf(post: CollectionEntry<'bitacora'>, target: Lang) {
  if (post.data.idioma === target) return post;
  const posts = await published('bitacora');
  const key = post.data.traduccionDe || post.id;
  return posts.find((p) => (p.id === key || p.data.traduccionDe === key) && p.data.idioma === target) || null;
}

export async function settings() {
  const [s] = await getCollection('ajustes');
  return s?.data ?? { correo: '', bienvenida: '', bienvenidaEn: '' };
}
