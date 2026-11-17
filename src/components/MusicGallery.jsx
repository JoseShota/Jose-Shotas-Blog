// =====================================================================
//  CURADURÍA — galería de colecciones, lista de pistas y expedientes.
//  Controla el reproductor global (src/lib/player.js), así que la música
//  sigue sonando aunque el visitante se vaya a otra sala de la cueva.
// =====================================================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/music.css';
import { player, TRACKS, mediaUrl, formatTime } from '../lib/player.js';
import { usePlayer } from './player/usePlayer.js';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, VolumeX,
  Share2, Search, Info, ChevronLeft, ExternalLink, X, Loader2,
} from './player/Icons.jsx';

const T = {
  es: {
    tracks: 'pistas', back: 'Volver a colecciones', note: 'Nota editorial', playAll: 'Reproducir', shuffleAll: 'Aleatorio',
    share: 'Compartir', copied: 'Enlace copiado', search: 'Buscar título, artista o álbum…', noResults: 'Nada coincide con la búsqueda.',
    title: 'Título', artist: 'Artista', album: 'Álbum', time: 'Dur.', dossier: 'Expediente', file: 'EXPEDIENTE',
    josesNote: 'Nota de Jose', year: 'Año', duration: 'Duración', from: 'Desde', genres: 'Géneros',
    aboutArtist: 'Sobre el artista', aboutAlbum: 'Sobre el álbum', officialLinks: 'Canales oficiales',
    support: 'Si esta canción te mueve, búscala en sus canales oficiales: compra el disco, ve al concierto, sigue al artista.',
    noData: 'Aún no hay datos públicos sobre esta pista.', loading: 'Consultando archivos…', source: 'Fuentes',
    play: 'Reproducir', pause: 'Pausa', prev: 'Anterior', next: 'Siguiente', volume: 'Volumen', seek: 'Posición',
    shuffle: 'Aleatorio', repeat: { off: 'Repetir: no', all: 'Repetir: colección', one: 'Repetir: canción' },
    mute: 'Silenciar', select: 'Elige una canción', open: 'Abrir colección', shortcuts: 'Atajos: K reproducir/pausa · J/L ±10 s · N/P siguiente/anterior · M silencio',
    hasNote: 'Tiene nota de Jose', close: 'Cerrar', inOtherLang: 'en inglés',
    links: { official: 'Sitio oficial', bandcamp: 'Bandcamp', instagram: 'Instagram', x: 'X / Twitter', facebook: 'Facebook', youtube: 'YouTube', soundcloud: 'SoundCloud', tiktok: 'TikTok', wikipedia: 'Wikipedia', musicbrainz: 'MusicBrainz' },
    types: { Person: 'Solista', Group: 'Grupo', Orchestra: 'Orquesta', Choir: 'Coro', Character: 'Personaje', Other: 'Otro' },
  },
  en: {
    tracks: 'tracks', back: 'Back to collections', note: 'Editorial note', playAll: 'Play', shuffleAll: 'Shuffle',
    share: 'Share', copied: 'Link copied', search: 'Search title, artist or album…', noResults: 'Nothing matches your search.',
    title: 'Title', artist: 'Artist', album: 'Album', time: 'Time', dossier: 'Dossier', file: 'FILE',
    josesNote: "Jose's note", year: 'Year', duration: 'Duration', from: 'Since', genres: 'Genres',
    aboutArtist: 'About the artist', aboutAlbum: 'About the album', officialLinks: 'Official channels',
    support: 'If this song moves you, find it on its official channels: buy the record, go to the show, follow the artist.',
    noData: 'No public data about this track yet.', loading: 'Searching the archives…', source: 'Sources',
    play: 'Play', pause: 'Pause', prev: 'Previous', next: 'Next', volume: 'Volume', seek: 'Position',
    shuffle: 'Shuffle', repeat: { off: 'Repeat: off', all: 'Repeat: collection', one: 'Repeat: song' },
    mute: 'Mute', select: 'Pick a song', open: 'Open collection', shortcuts: 'Shortcuts: K play/pause · J/L ±10 s · N/P next/previous · M mute',
    hasNote: "Has a note from Jose", close: 'Close', inOtherLang: 'in Spanish',
    links: { official: 'Official site', bandcamp: 'Bandcamp', instagram: 'Instagram', x: 'X / Twitter', facebook: 'Facebook', youtube: 'YouTube', soundcloud: 'SoundCloud', tiktok: 'TikTok', wikipedia: 'Wikipedia', musicbrainz: 'MusicBrainz' },
    types: { Person: 'Solo artist', Group: 'Group', Orchestra: 'Orchestra', Choir: 'Choir', Character: 'Character', Other: 'Other' },
  },
};

// ---------- Datos de expedientes: se descargan solo la primera vez que se abren ----------
let metaPromise = null;
function loadMeta() {
  metaPromise ||= fetch('/data/music-meta.json').then((r) => (r.ok ? r.json() : null)).catch(() => null);
  return metaPromise;
}
function useMeta(enabled) {
  const [meta, setMeta] = useState(undefined);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadMeta().then((m) => alive && setMeta(m));
    return () => { alive = false; };
  }, [enabled]);
  return meta;
}

const hideBrokenImage = (e) => { e.currentTarget.style.visibility = 'hidden'; };

function setUrl(params) {
  const url = new URL(window.location.href);
  url.search = '';
  for (const [k, v] of Object.entries(params)) if (v != null) url.searchParams.set(k, v);
  history.replaceState(history.state, '', url);
}

// =====================================================================
export default function MusicGallery({ collections = [], lang = 'es' }) {
  const t = T[lang] || T.es;
  const [activeId, setActiveId] = useState(null);
  const [focusTrackId, setFocusTrackId] = useState(null);

  // Enlaces profundos: /musica?vol=vol2&pista=12
  useEffect(() => {
    const read = () => {
      const p = new URLSearchParams(window.location.search);
      const vol = p.get('vol');
      if (vol && collections.some((c) => c.id === vol)) {
        setActiveId(vol);
        const pista = Number(p.get('pista'));
        setFocusTrackId(pista || null);
      }
    };
    read();
  }, []);

  const active = collections.find((c) => c.id === activeId);

  const open = (id) => { setActiveId(id); setFocusTrackId(null); setUrl({ vol: id }); window.scrollTo({ top: 0 }); };
  const close = () => { setActiveId(null); setFocusTrackId(null); setUrl({}); };

  if (!active) return <Gallery collections={collections} t={t} onOpen={open} />;
  return <Playlist key={active.id} collection={active} t={t} lang={lang} onBack={close} initialTrackId={focusTrackId} />;
}

// ---------- Vista 1: galería de colecciones ----------
function Gallery({ collections, t, onOpen }) {
  const s = usePlayer();
  return (
    <div className="mg-gallery animate-fade-in">
      {collections.map((c, i) => {
        const isCurrent = s.collectionId === c.id;
        return (
          <article key={c.id} className="mg-card group">
            <button type="button" className="mg-card-open" onClick={() => onOpen(c.id)} aria-label={`${t.open}: ${c.title}`}>
              <div className="mg-cover">
                <img src={c.cover} alt="" loading={i < 3 ? 'eager' : 'lazy'} onError={hideBrokenImage} />
                <div className="mg-cover-desc">
                  <span>{t.note}</span>
                  <p className="cueva-clamp-4">{c.description}</p>
                </div>
                <span className="mg-vol">VOL. {String(i + 1).padStart(2, '0')}</span>
                {isCurrent && s.isPlaying && <span className="mg-live">● ON AIR</span>}
              </div>
              <h3 className="mg-card-title">{c.title}</h3>
              <div className="mg-card-stats">
                <span>{c.trackCount} {t.tracks}</span>
                <span>{c.totalDuration}</span>
              </div>
            </button>
            <button
              type="button"
              className="mg-card-play"
              aria-label={`${isCurrent && s.isPlaying ? t.pause : t.play}: ${c.title}`}
              onClick={() => (isCurrent ? player.toggle() : player.load(c.id, 0))}
            >
              {isCurrent && s.isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
          </article>
        );
      })}
    </div>
  );
}

// ---------- Vista 2: interior de una colección ----------
function Playlist({ collection, t, lang, onBack, initialTrackId }) {
  const s = usePlayer();
  const tracks = TRACKS[collection.id] || [];
  const isThis = s.collectionId === collection.id;
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(initialTrackId || (isThis ? tracks[s.index]?.id : tracks[0]?.id));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState('');
  const listRef = useRef(null);
  const meta = useMeta(true);

  // El expediente sigue a la canción que suena
  const playingId = isThis ? tracks[s.index]?.id : null;
  const firstRun = useRef(true);
  useEffect(() => {
    // con un enlace compartido, respetamos la pista del enlace al entrar
    if (firstRun.current) { firstRun.current = false; if (initialTrackId) return; }
    if (playingId) setSelectedId(playingId);
  }, [playingId]);

  // Enlace profundo: llevar la pista a la vista
  useEffect(() => {
    if (!initialTrackId) return;
    const el = listRef.current?.querySelector(`[data-track="${initialTrackId}"]`);
    el?.scrollIntoView({ block: 'center' });
    if (window.matchMedia('(max-width: 1023px)').matches) setSheetOpen(true);
  }, [initialTrackId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (!q) return tracks.map((tr, i) => ({ tr, i }));
    return tracks
      .map((tr, i) => ({ tr, i }))
      .filter(({ tr }) => `${tr.title} ${tr.artist} ${tr.album}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q));
  }, [query, tracks]);

  const selectedIndex = Math.max(0, tracks.findIndex((tr) => tr.id === selectedId));
  const selected = tracks[selectedIndex];

  const playAt = (i) => {
    if (isThis && s.index === i) player.toggle();
    else player.load(collection.id, i);
  };
  const playAll = (shuffle) => {
    if (shuffle !== s.shuffle) player.toggleShuffle();
    const start = shuffle ? Math.floor(Math.random() * tracks.length) : 0;
    player.load(collection.id, start);
  };

  const share = async (track) => {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('vol', collection.id);
    if (track) url.searchParams.set('pista', track.id);
    const text = track ? `${track.title} — ${track.artist}` : collection.title;
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) await navigator.share({ title: text, url: url.href });
      else { await navigator.clipboard.writeText(url.href); setToast(t.copied); setTimeout(() => setToast(''), 2000); }
    } catch {}
  };

  const openDossier = (tr) => {
    setSelectedId(tr.id);
    setUrl({ vol: collection.id, pista: tr.id });
    if (window.matchMedia('(max-width: 1023px)').matches) setSheetOpen(true);
  };

  return (
    <div className="mg-playlist animate-fade-in">
      <button type="button" className="mg-back" onClick={onBack}><ChevronLeft size={14} /> {t.back}</button>

      <header className="mg-head">
        <img src={collection.cover} alt="" className="mg-head-cover" onError={hideBrokenImage} />
        <div className="mg-head-text">
          <h2>{collection.title}</h2>
          <p className="mg-head-note">{collection.description}</p>
          <p className="mg-head-stats">{collection.trackCount} {t.tracks} · {collection.totalDuration}</p>
          <div className="mg-head-actions">
            <button type="button" className="mg-btn mg-btn-primary" onClick={() => (isThis ? player.toggle() : playAll(false))}>
              {isThis && s.isPlaying ? <Pause size={14} /> : <Play size={14} />} {isThis && s.isPlaying ? t.pause : t.playAll}
            </button>
            <button type="button" className="mg-btn" onClick={() => playAll(true)}><Shuffle size={14} /> {t.shuffleAll}</button>
            <button type="button" className="mg-btn" onClick={() => share(null)}><Share2 size={14} /> {t.share}</button>
          </div>
        </div>
      </header>

      <div className="mg-layout">
        <div className="mg-list-col">
          <label className="mg-search">
            <Search size={14} aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search} />
          </label>

          <div className="mg-list-head" aria-hidden="true">
            <span>#</span><span>{t.title}</span><span>{t.artist}</span><span>{t.album}</span><span>{t.time}</span><span></span>
          </div>

          <ol className="mg-list" ref={listRef}>
            {filtered.length === 0 && <li className="mg-empty">{t.noResults}</li>}
            {filtered.map(({ tr, i }) => {
              const current = isThis && s.index === i;
              const hasNote = !!collection.notes[tr.id];
              return (
                <li key={tr.id} data-track={tr.id}
                  className={`mg-row ${current ? 'is-current' : ''} ${selectedId === tr.id ? 'is-selected' : ''}`}>
                  <button type="button" className="mg-row-play" onClick={() => playAt(i)}
                    aria-label={`${current && s.isPlaying ? t.pause : t.play}: ${tr.title} — ${tr.artist}`} aria-current={current ? 'true' : undefined}>
                    <span className="mg-num">
                      {current
                        ? (s.isLoading ? <Loader2 size={12} className="gp-spin" /> : <span className={`mg-eq ${s.isPlaying ? 'on' : ''}`} aria-hidden="true"><i /><i /><i /></span>)
                        : String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="mg-title">{tr.title}{hasNote && <span className="mg-note-mark" title={t.hasNote}> ✎</span>}</span>
                    <span className="mg-artist">{tr.artist}</span>
                    <span className="mg-album">{tr.album}</span>
                    <span className="mg-time">{tr.duration || '--:--'}</span>
                  </button>
                  <button type="button" className="mg-row-info" onClick={() => openDossier(tr)} aria-label={`${t.dossier}: ${tr.title}`} title={t.dossier}>
                    <Info size={14} />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <aside className="mg-side" aria-label={t.dossier}>
          <NowPlayingPanel collection={collection} selected={selected} selectedIndex={selectedIndex} t={t} />
          <Dossier collection={collection} track={selected} meta={meta} t={t} lang={lang} onShare={share} />
        </aside>
      </div>

      {sheetOpen && selected && (
        <div className="mg-sheet-backdrop" onClick={() => setSheetOpen(false)}>
          <div className="mg-sheet" role="dialog" aria-modal="true" aria-label={t.dossier} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="mg-sheet-close" onClick={() => setSheetOpen(false)} aria-label={t.close}><X size={16} /></button>
            <div className="mg-sheet-top">
              <img src={mediaUrl(selected.cover) || collection.cover} alt="" onError={hideBrokenImage} />
              <button type="button" className="mg-btn mg-btn-primary" onClick={() => playAt(selectedIndex)}>
                {isThis && s.index === selectedIndex && s.isPlaying ? <><Pause size={14} /> {t.pause}</> : <><Play size={14} /> {t.play}</>}
              </button>
            </div>
            <Dossier collection={collection} track={selected} meta={meta} t={t} lang={lang} onShare={share} />
          </div>
        </div>
      )}

      {toast && <div className="mg-toast" role="status">{toast}</div>}
    </div>
  );
}

// ---------- Panel "sonando ahora" (escritorio) ----------
function NowPlayingPanel({ collection, selected, selectedIndex, t }) {
  const s = usePlayer();
  const isThis = s.collectionId === collection.id;
  const track = isThis ? TRACKS[collection.id][s.index] : selected;
  if (!track) return null;
  const cover = mediaUrl(track.cover) || collection.cover;
  const active = isThis;
  const RepeatIcon = s.repeat === 'one' ? Repeat1 : Repeat;

  return (
    <div className="mg-np">
      <div className="mg-np-cover">
        <img src={cover} alt="" className={active && s.isPlaying ? 'is-playing' : ''} onError={hideBrokenImage} />
      </div>
      <div className="mg-np-text">
        <h3>{track.title}</h3>
        <p>{track.artist}</p>
      </div>
      <input
        type="range" className="mg-np-progress" min={0} max={(active && s.duration) || 0} step={1}
        value={active ? Math.min(s.time, s.duration || s.time) : 0}
        onChange={(e) => player.seek(Number(e.target.value))} disabled={!active} aria-label={t.seek}
        style={{ '--pct': `${active && s.duration ? (s.time / s.duration) * 100 : 0}%` }}
      />
      <div className="mg-np-times"><span>{formatTime(active ? s.time : 0)}</span><span>{active ? formatTime(s.duration) : track.duration}</span></div>
      <div className="mg-np-controls">
        <button type="button" onClick={player.toggleShuffle} aria-pressed={s.shuffle} aria-label={t.shuffle} title={t.shuffle} className="mg-icon"><Shuffle size={15} /></button>
        <button type="button" onClick={() => (active ? player.prev() : player.load(collection.id, Math.max(0, selectedIndex - 1)))} aria-label={t.prev} className="mg-icon"><SkipBack size={18} /></button>
        <button type="button" className="mg-np-main" aria-label={active && s.isPlaying ? t.pause : t.play}
          onClick={() => (active ? player.toggle() : player.load(collection.id, selectedIndex))}>
          {active && s.isLoading ? <Loader2 size={22} className="gp-spin" /> : active && s.isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <button type="button" onClick={() => (active ? player.next() : player.load(collection.id, selectedIndex + 1))} aria-label={t.next} className="mg-icon"><SkipForward size={18} /></button>
        <button type="button" onClick={player.cycleRepeat} aria-pressed={s.repeat !== 'off'} aria-label={t.repeat[s.repeat]} title={t.repeat[s.repeat]} className="mg-icon"><RepeatIcon size={15} /></button>
      </div>
      <div className="mg-np-volume">
        <button type="button" onClick={player.toggleMute} aria-label={t.mute} className="mg-icon">{s.muted || s.volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}</button>
        <input type="range" min={0} max={1} step={0.05} value={s.muted ? 0 : s.volume} onChange={(e) => player.setVolume(Number(e.target.value))} aria-label={t.volume} />
      </div>
      <p className="mg-np-shortcuts">{t.shortcuts}</p>
    </div>
  );
}

// ---------- Expediente de la pista ----------
function Dossier({ collection, track, meta, t, lang, onShare }) {
  if (!track) return null;
  const info = meta?.tracks?.[`${collection.id}:${track.id}`];
  const artist = info?.artist ? meta.artists[info.artist] : null;
  const album = info?.releaseGroup ? meta.releaseGroups[info.releaseGroup] : null;
  const year = album?.year || info?.year;
  const note = collection.notes[track.id];
  const other = lang === 'es' ? 'en' : 'es';
  const bio = artist?.bio?.[lang] || artist?.bio?.[other];
  const bioOther = !artist?.bio?.[lang] && !!artist?.bio?.[other];
  const about = album?.about?.[lang] || album?.about?.[other];
  const links = artist?.links || {};
  const fileNo = `${collection.id.toUpperCase()}-${String(track.id).padStart(3, '0')}`;
  const life = artist ? [artist.begin, artist.end].filter(Boolean).join('–') : '';

  return (
    <section className="mg-dossier" aria-live="polite">
      <div className="mg-dossier-head">
        <span>{t.file} No. {fileNo}</span>
        <button type="button" className="mg-icon" onClick={() => onShare(track)} aria-label={`${t.share}: ${track.title}`} title={t.share}><Share2 size={14} /></button>
      </div>

      <h3 className="mg-dossier-title">{track.title}</h3>
      <dl className="mg-facts">
        <dt>{t.artist}</dt><dd>{track.artist}</dd>
        <dt>{t.album}</dt><dd>{track.album}{year && <span className="mg-muted"> ({year})</span>}</dd>
        <dt>{t.duration}</dt><dd>{track.duration}</dd>
      </dl>

      {note && (
        <div className="mg-josenote">
          <span>{t.josesNote}</span>
          <p>{note}</p>
        </div>
      )}

      {meta === undefined && <p className="mg-muted">{t.loading}</p>}
      {meta !== undefined && !artist && <p className="mg-muted">{t.noData}</p>}

      {artist && (
        <div className="mg-block">
          <h4>{t.aboutArtist}</h4>
          <p className="mg-artist-line">
            <strong>{artist.name}</strong>
            {[artist.type && (t.types[artist.type] || artist.type), artist.area || artist.country, life].filter(Boolean).map((x) => <span key={x}> · {x}</span>)}
          </p>
          {artist.genres?.length > 0 && <p className="mg-genres">{artist.genres.map((g) => <span key={g} className="tag">{g}</span>)}</p>}
          {bio && <p className="mg-bio">{bio.extract}{bioOther && <em> ({t.inOtherLang})</em>}</p>}
        </div>
      )}

      {about && (
        <div className="mg-block">
          <h4>{t.aboutAlbum}{album?.title ? ` — ${album.title}` : ''}</h4>
          <p className="mg-bio">{about.extract}</p>
        </div>
      )}

      {artist && (
        <div className="mg-block">
          <h4>{t.officialLinks}</h4>
          <ul className="mg-links">
            {Object.entries(links).map(([k, url]) => (
              <li key={k}><a href={url} target="_blank" rel="noopener">{t.links[k] || k} <ExternalLink size={11} /></a></li>
            ))}
            {bio?.url && <li><a href={bio.url} target="_blank" rel="noopener">{t.links.wikipedia} <ExternalLink size={11} /></a></li>}
            <li><a href={artist.musicbrainz} target="_blank" rel="noopener">{t.links.musicbrainz} <ExternalLink size={11} /></a></li>
          </ul>
          <p className="mg-support">{t.support}</p>
        </div>
      )}

      {(bio || about) && (
        <p className="mg-sources">
          {t.source}: <a href="https://musicbrainz.org" target="_blank" rel="noopener">MusicBrainz</a> (CC0) ·{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">Wikipedia (CC BY-SA 4.0)</a>
        </p>
      )}
    </section>
  );
}
