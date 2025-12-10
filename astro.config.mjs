import { defineConfig } from 'astro/config';

// Detectamos si estamos en Vercel
const isVercel = process.env.VERCEL === '1';

export default defineConfig({
  // Tu dominio de GitHub Pages
  site: 'https://JoseShota.github.io', 
  
  // LOGICA IMPORTANTE:
  // 1. En Vercel: usa la raíz '/' (sin nombre de carpeta).
  // 2. En GitHub: usa '/jose.shota' (el nombre de tu repo).
  base: isVercel ? '/' : '/jose.shota', 
  
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: {
        prefixDefaultLocale: false
    }
  }
});