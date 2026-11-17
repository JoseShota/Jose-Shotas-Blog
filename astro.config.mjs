import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// El sitio vive en Vercel con dominio propio. Todas las páginas se generan
// estáticas; solo el editor (/keystatic) corre como función en Vercel.
export default defineConfig({
  site: 'https://www.joseshota.net',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  adapter: vercel(),
  integrations: [
    react(),
    markdoc(),
    keystatic(),
    sitemap({
      filter: (page) => !page.includes('/keystatic'),
      i18n: { defaultLocale: 'es', locales: { es: 'es', en: 'en' } },
    }),
  ],
  redirects: {
    '/cv': '/bitacora',
    '/en/cv': '/en/bitacora',
  },
  vite: {
    plugins: [tailwindcss()],
    // el API del editor usa módulos virtuales de Astro: no pre-empaquetar
    optimizeDeps: { exclude: ['@keystatic/astro'] },
  },
});
