import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { bitacoraFor } from './content';
import { SITE, SECTIONS, ui, localize, type Lang } from './i18n';

export async function bitacoraFeed(context: APIContext, lang: Lang) {
  const posts = await bitacoraFor(lang);
  return rss({
    title: `${SECTIONS.bitacora[lang]} — ${SITE[lang].name}`,
    description: ui[lang].bitacoraIntro,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.titulo,
      pubDate: p.data.fecha,
      description: p.data.resumen,
      link: localize(`/bitacora/${p.id}/`, lang),
    })),
    customData: `<language>${lang}</language>`,
  });
}
