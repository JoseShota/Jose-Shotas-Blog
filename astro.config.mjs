// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config

export default defineConfig({
  i18n: {
    defaultLocale: "es", // Tu idioma principal
    locales: ["es", "en"], // Los idiomas disponibles
    routing: {
        prefixDefaultLocale: false // 'es' estará en la raíz (/), 'en' estará en (/en)
    }
  }
});
