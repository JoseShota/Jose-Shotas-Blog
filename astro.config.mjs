import { defineConfig } from 'astro/config';

// Mantenemos la lógica de detección, es la mejor forma
const isGitHub = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  site: 'https://JoseShota.github.io', 
  
  // CORRECCIÓN AQUÍ:
  // Usa EXACTAMENTE el nombre que vimos en tu captura (respetando mayúsculas/minúsculas)
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
  }
});