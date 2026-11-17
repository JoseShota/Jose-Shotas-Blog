// Cómo se muestran en el sitio los formatos especiales del editor.
import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

const c = (name) => component(`./src/components/markdoc/${name}.astro`);

export default defineMarkdocConfig({
  tags: {
    YouTube: { render: c('YouTube'), selfClosing: true, attributes: { id: { type: String }, pie: { type: String } } },
    Cancion: { render: c('Cancion'), selfClosing: true, attributes: { volumen: { type: String }, pista: { type: Number } } },
    Epigrafe: { render: c('Epigrafe'), attributes: { autor: { type: String } } },
    NotaAlMargen: { render: c('NotaAlMargen'), attributes: { titulo: { type: String } } },
    Spoiler: { render: c('Spoiler'), attributes: { aviso: { type: String } } },
    Terminal: { render: c('Terminal'), selfClosing: true, attributes: { texto: { type: String } } },
    Galeria: { render: c('Galeria'), selfClosing: true, attributes: { imagenes: { type: Array } } },
    NotaDeVoz: { render: c('NotaDeVoz'), selfClosing: true, attributes: { archivo: { type: String }, titulo: { type: String } } },
    Adjunto: { render: c('Adjunto'), selfClosing: true, attributes: { archivo: { type: String }, titulo: { type: String } } },
  },
});
