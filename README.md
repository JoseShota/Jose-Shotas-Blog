# Nuestra Cueva Virtual 洞窟

Archivo personal de **Jose Shōta** — [www.joseshota.net](https://www.joseshota.net)

Escritos, curaduría musical, museo de videos, cinemateca, biblioteca, estudios y recomendaciones. Bilingüe (español `/` e inglés `/en/`), sin anuncios, sin rastreadores.

Hecho con [Astro](https://astro.build), [Keystatic](https://keystatic.com) (editor) y alojado en [Vercel](https://vercel.com). La música vive en Cloudflare R2.

---

## ✍️ Cómo escribir

### Desde el sitio (lo normal)

1. Entra a **https://www.joseshota.net/keystatic** e inicia sesión con GitHub.
2. Elige una sala (Bitácora, Cinemateca, Biblioteca…) y pulsa **+**.
3. Escribe. Mientras la casilla **Borrador** esté marcada, nadie lo ve.
4. Desmarca *Borrador* y pulsa **Save**. En ~1 minuto está publicado.

Cada guardado es un *commit* en GitHub: tienes historial completo de todo lo que escribes.

### En tu computadora (sin internet, para previsualizar)

```bash
npm install
npm run dev
```

Abre http://localhost:4321/keystatic. Aquí **sí ves los borradores** en el sitio para revisarlos antes de publicar. Los cambios se guardan como archivos; súbelos con `git commit` + `git push`.

### Formatos que acepta el editor

Además de texto con formato (pegar desde Word/Google Docs funciona), en cualquier texto puedes insertar con el botón **+**:

| Formato | Para qué |
|---|---|
| Imagen | Se optimiza sola al publicar |
| Video de YouTube | Carga solo al hacer clic (rápido y sin cookies) |
| **Canción de la curaduría** | Una pista de tus colecciones que suena en el reproductor global |
| Epígrafe / cita | Cita alineada a la derecha con autor |
| Nota al margen | Recuadro para digresiones |
| Spoiler | Texto oculto hasta hacer clic (ideal para reseñas) |
| Ventana de terminal | Texto estilo consola |
| Galería | Varias imágenes en cuadrícula |
| Nota de voz | Audio corto (mp3/m4a) |
| Archivo adjunto | PDF u otros |

El borrador **"Manual de formatos"** en la Bitácora muestra todos en acción.

### Calificación lunar 🌑🌗🌕

Películas y libros se califican de 0 a 5 en medias lunas. Cada medio punto tiene nombre: *Eclipse total, Un destello, Luna tímida, Media sombra, Creciente, Media luna, Gibosa, Casi plena, Resplandor, Marea alta, Luna llena.*

### Idiomas

Escribe cada texto en el idioma que quieras (o mezclados) y márcalo en el campo *Idioma*. Ambas versiones del sitio lo muestran con su etiqueta. Si traduces un escrito de la Bitácora, crea una nueva entrada y enlázala en **"Es la traducción de…"**: cada versión del sitio mostrará la suya, y el botón [ES]/[EN] salta entre ellas.

---

## 🛠️ Configuración única (pendiente)

### 1. Conectar el editor a GitHub (≈10 min, una sola vez)

En tu computadora, con el repositorio clonado:

```bash
npm install
PUBLIC_KEYSTATIC_STORAGE=github npm run dev
```

En **Windows (PowerShell)**:

```powershell
npm install
$env:PUBLIC_KEYSTATIC_STORAGE="github"; npm run dev
```

> ⚠️ En este modo el editor guarda directamente en GitHub. Durante la configuración **no guardes ninguna entrada**.

1. Abre http://127.0.0.1:4321/keystatic y sigue el asistente: crea una **GitHub App** para el repositorio `JoseShota/Jose-Shotas-Blog`. Al terminar, se crea un archivo `.env` con 4 claves (nunca lo subas a GitHub; ya está en `.gitignore`).
2. En GitHub → Settings → Developer settings → GitHub Apps → tu app → **Callback URL**, añade:
   `https://www.joseshota.net/api/keystatic/github/oauth/callback`
3. En **Vercel** → tu proyecto → Settings → Environment Variables, copia las 4 claves del `.env`:
   `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
4. Vuelve a desplegar. Listo: `www.joseshota.net/keystatic` funciona desde cualquier dispositivo.

### 2. Correo de contacto y derechos

El sitio muestra `cueva@joseshota.net` en *Sobre la cueva*. Créalo gratis con **Cloudflare → joseshota.net → Email → Email Routing**: regla `cueva@` → reenviar a tu correo personal. (Puedes cambiar la dirección en el editor: *Ajustes del sitio*.)

### 3. Dominio para la música (recomendado)

Las direcciones `r2.dev` tienen límites de uso y no son para sitios públicos.

1. Cloudflare → R2 → bucket `josesmusic` → Settings → **Custom Domains** → añade `media.joseshota.net`.
2. En Vercel añade la variable `PUBLIC_MEDIA_BASE=https://media.joseshota.net` y vuelve a desplegar. Todas las canciones cambian de dirección automáticamente.
3. Opcional, en Cloudflare para `media.joseshota.net`:
   - **Hotlink Protection** (Scrape Shield) o una regla WAF que solo permita peticiones con `Referer` de `joseshota.net`: evita que otros sitios incrusten tus archivos.
   - **Transform Rule** de respuesta que añada `X-Robots-Tag: noindex`: los mp3 no aparecen como resultados en buscadores.

### 4. Vercel y GitHub

- Vercel → Domains → `joseshota.net` → redirección a `www` como **308 (permanente)** en vez de 307.
- GitHub → Settings → **Pages** → desactivar (la copia en `github.io` ya no se actualiza y competía con tu dominio).

---

## 🎵 Curaduría

- **El reproductor no se corta al navegar**: la música sigue mientras recorres la cueva (mini-reproductor abajo).
- Controles en pantalla de bloqueo y auriculares, aleatorio, repetir, volumen, y continúa donde lo dejaste.
- Atajos: `K` reproducir/pausa · `J`/`L` ±10 s · `N`/`P` siguiente/anterior · `M` silencio.
- Cada pista tiene un **expediente**: tu nota, datos del artista y álbum, historia (Wikipedia) y canales oficiales.
- Enlaces compartibles a una canción: `/musica?vol=vol2&pista=12`.

**Notas por canción**: en el editor → *Curaduría* → la colección → *Notas por canción* (número de pista + texto).

**Nueva colección**: genera el JSON con `node generate-playlist-vol2.js` (ajusta rutas), sube los archivos con `node upload-to-r2.js` → `run-upload.ps1`, añade el volumen en `src/lib/player.js` y en `keystatic.config.ts` (`VOLUMENES`), y crea la entrada en *Curaduría*.

**Actualizar expedientes** (tras añadir canciones):

```bash
npm run enrich
```

Consulta MusicBrainz (datos abiertos, CC0) y Wikipedia (CC BY-SA) y escribe `public/data/music-meta.json`.

### Postura de derechos

La cueva presenta la música con fines expresivos y educativos, y trata de ser un buen vecino:

- Sin anuncios, sin ventas, sin ingresos; sin botón de descarga.
- Crédito completo y enlaces a los canales oficiales de cada artista.
- Contexto curatorial (notas editoriales y por canción).
- Página pública de derechos con procedimiento de retiro en 48 h (*Sobre la cueva*). **Responder rápido a cualquier solicitud es la mejor protección**: retira la pista del JSON y del bucket.

---

## 📁 Estructura

```
keystatic.config.ts      → qué campos tiene cada sala en el editor
src/content/             → todo lo que escribes (lo gestiona el editor)
src/pages/[...path].astro→ tabla de rutas (ES y EN)
src/views/               → diseño de cada sala
src/components/          → reproductor, curaduría, museo 3D, lunas, formatos
src/lib/                 → idiomas (i18n.ts), reproductor (player.js), lunas
src/data/                → listas de pistas de cada colección
scripts/enrich-music.mjs → investigador musical
```

| Comando | Acción |
|---|---|
| `npm run dev` | Sitio + editor en `localhost:4321` |
| `npm run build` | Construye el sitio |
| `npm run enrich` | Actualiza expedientes musicales |
