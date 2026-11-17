import type { APIContext } from 'astro';
import { bitacoraFeed } from '../../lib/rss';
export const GET = (context: APIContext) => bitacoraFeed(context, 'en');
