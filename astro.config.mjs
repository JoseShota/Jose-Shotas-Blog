import { defineConfig } from 'astro/config';

// ESTRATEGIA INVERTIDA:
// En lugar de preguntar si es Vercel, preguntamos si es GitHub Actions.
// Esta variable SIEMPRE existe automáticamente cuando GitHub construye tu página.
const isGitHub = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  site: 'https://JoseShota.github.io',
  
  // Si es GitHub, usa el nombre del repo.
  // Si NO es GitHub (es decir, es Vercel o Local), usa la raíz '/'.
  base: isGitHub ? '/jose.shota' : '/',
  
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: {
        prefixDefaultLocale: false
    }
  },
  
  // Mantenemos esto para evitar problemas de carpetas
  build: {
    format: 'directory'
  }
});