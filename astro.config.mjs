import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// Mantenemos la lógica de detección, es la mejor forma
const isGitHub = process.env.GITHUB_ACTIONS === 'true';
import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  site: 'https://JoseShota.github.io',
  base: isGitHub ? '/Jose-Shotas-Blog' : '/',
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: {
        prefixDefaultLocale: false
    }
  },
  build: {
    format: 'directory'
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});