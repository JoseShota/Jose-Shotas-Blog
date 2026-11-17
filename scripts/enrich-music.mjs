// =====================================================================
//  Investigador musical de la cueva
//  Para cada canción de la curaduría busca en MusicBrainz (datos abiertos)
//  el artista, año, álbum, géneros y enlaces oficiales; y en Wikipedia la
//  historia del artista y del álbum (ES/EN).
//
//  Uso:  node scripts/enrich-music.mjs
//  Salida: public/data/music-meta.json  (se carga solo al abrir un expediente)
//  Usa caché en scripts/.cache para poder reanudar o re-ejecutar rápido.
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'CuevaMetadataBot/0.1 (personal non-commercial music archive)';
const CACHE_PATH = path.join(ROOT, 'scripts/.cache/music-meta-cache.json');
const OUT_PATH = path.join(ROOT, 'public/data/music-meta.json');
const PLAYLISTS = {
  vol1: JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/playlist.json'), 'utf8')),
  vol2: JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/playlist-vol2.json'), 'utf8')),
};

fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')) : {};
const saveCache = () => fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastMb = 0;

async function getJson(url, { mb = false, tries = 4 } = {}) {
  if (cache[url] !== undefined) return cache[url];
  for (let attempt = 1; attempt <= tries; attempt++) {
    if (mb) {
      const wait = 1100 - (Date.now() - lastMb);
      if (wait > 0) await sleep(wait);
      lastMb = Date.now();
    }
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
      if (res.status === 404) { cache[url] = null; return null; }
      if (res.status === 503 || res.status === 429) { await sleep(2000 * attempt); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      cache[url] = json;
      return json;
    } catch (err) {
      if (attempt === tries) { console.warn(`   ! ${err.message} ${url}`); return null; }
      await sleep(1500 * attempt);
    }
  }
  return null;
}

const norm = (s = '') =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const cleanTitle = (t) =>
  t.replace(/\s*[([][^)\]]*\b(feat|ft|with|live|en vivo|remaster(ed)?|demo|version|versión|mix|instrumental|edit|mono|stereo)\b[^)\]]*[)\]]/gi, '')
   .replace(/\s+-\s+(\d{4}\s+)?(remaster(ed)?|live|en vivo|single version|radio edit).*$/i, '')
   .trim();
const firstArtist = (a) => a.split(/,|;|\s+feat\.?\s+|\s+ft\.?\s+|\s+x\s+/i)[0].trim();
const luceneEscape = (s) => s.replace(/([+\-&|!(){}[\]^"~*?:\\/])/g, '\\$1');

const MB = 'https://musicbrainz.org/ws/2';

async function findRecording(title, artist) {
  const q = `recording:"${luceneEscape(cleanTitle(title))}" AND artist:"${luceneEscape(artist)}"`;
  const data = await getJson(`${MB}/recording/?query=${encodeURIComponent(q)}&fmt=json&limit=10`, { mb: true });
  const recs = data?.recordings || [];
  const target = norm(artist);
  const match = recs.find((r) =>
    (r['artist-credit'] || []).some((c) => {
      const n = norm(c.name || c.artist?.name);
      return n === target || (n && (n.includes(target) || target.includes(n)));
    }) && norm(r.title).startsWith(norm(cleanTitle(title)).slice(0, 12))
  );
  return match || null;
}

async function findArtistByName(name) {
  const q = `artist:"${luceneEscape(name)}"`;
  const data = await getJson(`${MB}/artist/?query=${encodeURIComponent(q)}&fmt=json&limit=5`, { mb: true });
  const target = norm(name);
  // acepta el nombre principal o cualquier alias (p. ej. 高中正義 = Masayoshi Takanaka)
  const matches = (a) => norm(a.name) === target || norm(a['sort-name']) === target
    || (a.aliases || []).some((al) => norm(al.name) === target || norm(al['sort-name']) === target);
  return (data?.artists || []).find((a) => a.score >= 90 && matches(a)) || null;
}

function classifyUrl(type, url) {
  const host = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } })();
  if (type === 'official homepage') return 'official';
  if (type === 'bandcamp' || host.endsWith('bandcamp.com')) return 'bandcamp';
  if (type === 'soundcloud') return 'soundcloud';
  if (type === 'wikidata') return 'wikidata';
  if (type === 'youtube' || host === 'youtube.com') return 'youtube';
  if (host.includes('instagram.com')) return 'instagram';
  if (host === 'twitter.com' || host === 'x.com') return 'x';
  if (host.includes('facebook.com')) return 'facebook';
  if (host.includes('tiktok.com')) return 'tiktok';
  return null; // ignoramos plataformas de streaming y tiendas genéricas
}

function extractLinks(relations = []) {
  const links = {};
  let wikidata = null;
  for (const r of relations) {
    const url = r.url?.resource;
    if (!url || r.ended) continue;
    const kind = classifyUrl(r.type, url);
    if (!kind) continue;
    if (kind === 'wikidata') { wikidata = url.split('/').pop(); continue; }
    if (!links[kind]) links[kind] = url;
  }
  return { links, wikidata };
}

async function wikipediaTitles(qids) {
  const out = {};
  const ids = [...new Set(qids.filter(Boolean))];
  for (let i = 0; i < ids.length; i += 60) {
    const chunk = ids.slice(i, i + 60);
    const sparql = `SELECT ?item ?article ?lang WHERE {
      VALUES ?item { ${chunk.map((q) => `wd:${q}`).join(' ')} }
      ?article schema:about ?item ; schema:inLanguage ?lang ; schema:isPartOf ?site .
      FILTER(?lang IN ("es","en")) FILTER(CONTAINS(STR(?site), "wikipedia.org"))
    }`;
    const data = await getJson(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`);
    for (const b of data?.results?.bindings || []) {
      const qid = b.item.value.split('/').pop();
      out[qid] ||= {};
      out[qid][b.lang.value] = decodeURIComponent(b.article.value.split('/wiki/')[1]);
    }
  }
  return out;
}

async function wikiSummary(lang, title) {
  if (!title) return null;
  const data = await getJson(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
  if (!data?.extract || data.type === 'disambiguation') return null;
  await sleep(120);
  return { extract: data.extract, url: data.content_urls?.desktop?.page };
}

async function main() {
  const artists = {};      // mbid -> datos del artista
  const tracks = {};       // "vol1:12" -> datos de la pista
  const releaseGroups = {}; // id -> { wikidata }
  const all = Object.entries(PLAYLISTS).flatMap(([vol, list]) => list.map((t) => ({ vol, t })));

  let n = 0;
  for (const { vol, t } of all) {
    n++;
    const artistName = firstArtist(t.artist);
    const rec = await findRecording(t.title, artistName);
    let artistMbid = null;
    let year = null;
    let rgId = null;
    if (rec) {
      const credit = (rec['artist-credit'] || []).find((c) => norm(c.name || c.artist?.name) === norm(artistName))
        || rec['artist-credit']?.[0];
      artistMbid = credit?.artist?.id || null;
      year = (rec['first-release-date'] || '').slice(0, 4) || null;
      const albumNorm = norm(t.album).slice(0, 10);
      const release = (rec.releases || []).find((r) => norm(r.title).startsWith(albumNorm)) || rec.releases?.[0];
      rgId = release?.['release-group']?.id || null;
    } else {
      const a = await findArtistByName(artistName);
      artistMbid = a?.id || null;
    }
    tracks[`${vol}:${t.id}`] = { artist: artistMbid, year, releaseGroup: rgId, recording: rec?.id || null };
    if (artistMbid && !artists[artistMbid]) artists[artistMbid] = null;
    if (rgId && !releaseGroups[rgId]) releaseGroups[rgId] = null;
    console.log(`[${n}/${all.length}] ${rec ? '✓' : artistMbid ? '~' : '✗'} ${t.artist} — ${t.title}${year ? ` (${year})` : ''}`);
    if (n % 10 === 0) saveCache();
  }

  console.log(`\nArtistas: ${Object.keys(artists).length} · Álbumes: ${Object.keys(releaseGroups).length}`);
  for (const mbid of Object.keys(artists)) {
    const a = await getJson(`${MB}/artist/${mbid}?inc=url-rels+genres&fmt=json`, { mb: true });
    if (!a) continue;
    const { links, wikidata } = extractLinks(a.relations);
    artists[mbid] = {
      name: a.name,
      type: a.type || null,
      country: a.country || null,
      area: a.area?.name || null,
      begin: a['life-span']?.begin?.slice(0, 4) || null,
      end: a['life-span']?.end?.slice(0, 4) || null,
      disambiguation: a.disambiguation || null,
      genres: (a.genres || []).sort((x, y) => y.count - x.count).slice(0, 4).map((g) => g.name),
      links,
      wikidata,
      musicbrainz: `https://musicbrainz.org/artist/${mbid}`,
    };
  }
  saveCache();
  for (const id of Object.keys(releaseGroups)) {
    const rg = await getJson(`${MB}/release-group/${id}?inc=url-rels&fmt=json`, { mb: true });
    releaseGroups[id] = rg ? { title: rg.title, year: rg['first-release-date']?.slice(0, 4) || null, wikidata: extractLinks(rg.relations).wikidata } : null;
  }
  saveCache();

  const qids = [
    ...Object.values(artists).map((a) => a?.wikidata),
    ...Object.values(releaseGroups).map((r) => r?.wikidata),
  ];
  const titles = await wikipediaTitles(qids);
  for (const a of Object.values(artists)) {
    if (!a?.wikidata) continue;
    const t = titles[a.wikidata] || {};
    a.bio = { es: await wikiSummary('es', t.es), en: await wikiSummary('en', t.en) };
  }
  for (const r of Object.values(releaseGroups)) {
    if (!r?.wikidata) continue;
    const t = titles[r.wikidata] || {};
    r.about = { es: await wikiSummary('es', t.es), en: await wikiSummary('en', t.en) };
  }
  saveCache();

  const out = { generatedAt: new Date().toISOString(), source: 'MusicBrainz (CC0) · Wikipedia (CC BY-SA 4.0)', artists, releaseGroups, tracks };
  fs.writeFileSync(OUT_PATH, JSON.stringify(out));
  const found = Object.values(tracks).filter((t) => t.artist).length;
  console.log(`\nListo: ${found}/${all.length} pistas con artista identificado -> ${path.relative(ROOT, OUT_PATH)}`);
}

main();
