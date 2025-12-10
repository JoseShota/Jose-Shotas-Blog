// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Reemplaza esto con la URL real de tu GitHub Pages si es diferente
  site: 'https://JoseShota.github.io', 
  // OJO: Aquí va el nombre de tu repositorio con una barra al inicio
  base: '/Jose-Shotas-Blog', 
  
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: {
        prefixDefaultLocale: false
    }
  }
});