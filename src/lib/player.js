// =====================================================================
//  Motor del reproductor de la cueva
//  Un único elemento <audio> que vive en memoria mientras navegas: gracias
//  al router de Astro (ClientRouter) la música no se corta al cambiar de
//  página. Todas las vistas (mini-reproductor, Curaduría, canciones dentro
//  de un escrito) leen y controlan este mismo estado.
// =====================================================================
import vol1 from '../data/playlist.json';
import vol2 from '../data/playlist-vol2.json';

export const TRACKS = { vol1, vol2 };

// Cuando conectes un dominio propio a R2 (p. ej. https://media.joseshota.net),
// define PUBLIC_MEDIA_BASE en Vercel y todas las URLs cambiarán solas.
const R2_DEV = 'https://pub-aaf3924643cd497aa862a84aa6eaadb0.r2.dev';
const MEDIA_BASE = (import.meta.env.PUBLIC_MEDIA_BASE || '').replace(/\/$/, '');
export const mediaUrl = (url) => (url && MEDIA_BASE ? url.replace(R2_DEV, MEDIA_BASE) : url);

const STORAGE_KEY = 'cueva-player-v2';
const isBrowser = typeof window !== 'undefined';

const initialState = {
  collectionId: null,
  index: 0,
  isPlaying: false,
  isLoading: false,
  time: 0,
  duration: 0,
  volume: 1,
  muted: false,
  shuffle: false,
  repeat: 'off', // 'off' | 'all' | 'one'
  error: null,
};

function createPlayer() {
  let state = { ...initialState };
  let order = null; // orden aleatorio de índices cuando shuffle está activo
  const listeners = new Set();
  let audio = null;
  let lastPersist = 0;
  let pendingSeek = null;

  const emit = () => listeners.forEach((fn) => fn(state));
  const set = (patch) => {
    state = { ...state, ...patch };
    emit();
  };

  const tracks = () => (state.collectionId ? TRACKS[state.collectionId] || [] : []);
  const currentTrack = () => tracks()[state.index] || null;

  function persist(force = false) {
    const now = Date.now();
    if (!force && now - lastPersist < 2000) return;
    lastPersist = now;
    try {
      const { collectionId, index, time, volume, muted, shuffle, repeat } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ collectionId, index, time, volume, muted, shuffle, repeat }));
    } catch { /* almacenamiento no disponible: no pasa nada */ }
  }

  function getAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = 'metadata';
    audio.addEventListener('timeupdate', () => {
      set({ time: audio.currentTime || 0 });
      persist();
      updatePositionState();
    });
    audio.addEventListener('loadedmetadata', () => {
      if (pendingSeek != null) {
        audio.currentTime = Math.min(pendingSeek, audio.duration || pendingSeek);
        pendingSeek = null;
      }
      set({ duration: audio.duration || 0, isLoading: false });
    });
    audio.addEventListener('waiting', () => set({ isLoading: true }));
    audio.addEventListener('playing', () => set({ isLoading: false, isPlaying: true, error: null }));
    audio.addEventListener('play', () => set({ isPlaying: true }));
    audio.addEventListener('pause', () => { set({ isPlaying: false }); persist(true); });
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', () => {
      if (!audio.src) return;
      set({ error: 'load', isLoading: false, isPlaying: false });
    });
    return audio;
  }

  function load(collectionId, index, { autoplay = true, startAt = 0 } = {}) {
    const list = TRACKS[collectionId];
    if (!list || !list[index]) return;
    const changedCollection = collectionId !== state.collectionId;
    set({ collectionId, index, time: startAt, duration: 0, error: null, isLoading: autoplay });
    if (changedCollection && state.shuffle) order = shuffled(list.length, index);
    const a = getAudio();
    a.src = mediaUrl(list[index].src);
    a.volume = state.volume;
    a.muted = state.muted;
    pendingSeek = startAt > 0 ? startAt : null;
    updateMediaSession();
    if (autoplay) play();
    persist(true);
  }

  function play() {
    if (!state.collectionId) return;
    const a = getAudio();
    if (!a.src) { load(state.collectionId, state.index, { autoplay: true, startAt: state.time }); return; }
    // Si hay un video sonando en la página, la música le cede el paso (y viceversa).
    window.dispatchEvent(new CustomEvent('cueva:music-play'));
    a.play().catch((err) => {
      if (err?.name !== 'AbortError') set({ isPlaying: false, isLoading: false });
    });
  }

  function pause() { audio?.pause(); }
  function toggle() { state.isPlaying ? pause() : play(); }

  function shuffled(length, first) {
    const rest = [...Array(length).keys()].filter((i) => i !== first);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    return [first, ...rest];
  }

  function neighbour(step) {
    const n = tracks().length;
    if (!n) return null;
    if (state.shuffle && order) {
      const pos = order.indexOf(state.index);
      const nextPos = pos + step;
      if (nextPos < 0 || nextPos >= n) return state.repeat === 'all' ? order[(nextPos + n) % n] : null;
      return order[nextPos];
    }
    const next = state.index + step;
    if (next < 0 || next >= n) return state.repeat === 'all' || step < 0 ? (next + n) % n : null;
    return next;
  }

  function next() {
    const i = neighbour(1);
    if (i == null) { pause(); return; }
    load(state.collectionId, i, { autoplay: true });
  }

  function prev() {
    if ((audio?.currentTime || 0) > 3) { seek(0); return; }
    const i = neighbour(-1);
    if (i != null) load(state.collectionId, i, { autoplay: true });
  }

  function onEnded() {
    if (state.repeat === 'one') { seek(0); play(); return; }
    next();
  }

  function seek(seconds) {
    const a = getAudio();
    if (!isFinite(seconds)) return;
    if (a.readyState >= 1) a.currentTime = Math.max(0, Math.min(seconds, a.duration || seconds));
    else pendingSeek = seconds;
    set({ time: seconds });
  }

  function setVolume(v) {
    const volume = Math.max(0, Math.min(1, v));
    if (audio) audio.volume = volume;
    set({ volume, muted: volume === 0 ? state.muted : false });
    if (audio) audio.muted = state.muted;
    persist(true);
  }

  function toggleMute() {
    const muted = !state.muted;
    if (audio) audio.muted = muted;
    set({ muted });
    persist(true);
  }

  function toggleShuffle() {
    const shuffle = !state.shuffle;
    order = shuffle ? shuffled(tracks().length, state.index) : null;
    set({ shuffle });
    persist(true);
  }

  function cycleRepeat() {
    const repeat = { off: 'all', all: 'one', one: 'off' }[state.repeat];
    set({ repeat });
    persist(true);
  }

  function stop() {
    pause();
    if (audio) { audio.removeAttribute('src'); audio.load(); }
    set({ ...initialState, volume: state.volume, muted: state.muted });
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = null;
  }

  // ---------- Controles del sistema (pantalla de bloqueo, auriculares) ----------
  function updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const t = currentTrack();
    if (!t) return;
    const art = mediaUrl(t.cover);
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title,
      artist: t.artist,
      album: t.album,
      artwork: art ? [{ src: art, sizes: '512x512', type: 'image/jpeg' }] : [],
    });
  }

  function updatePositionState() {
    if (!('mediaSession' in navigator) || !audio?.duration || !navigator.mediaSession.setPositionState) return;
    try {
      navigator.mediaSession.setPositionState({ duration: audio.duration, position: audio.currentTime, playbackRate: 1 });
    } catch {}
  }

  function setupGlobalControls() {
    if ('mediaSession' in navigator) {
      const ms = navigator.mediaSession;
      const handlers = {
        play, pause,
        previoustrack: prev,
        nexttrack: next,
        seekbackward: () => seek(state.time - 10),
        seekforward: () => seek(state.time + 10),
        seekto: (d) => seek(d.seekTime),
      };
      for (const [action, fn] of Object.entries(handlers)) {
        try { ms.setActionHandler(action, fn); } catch {}
      }
    }

    // Atajos de teclado (estilo YouTube) — nunca interfieren con la escritura.
    window.addEventListener('keydown', (e) => {
      if (!state.collectionId || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target;
      if (el?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      const key = e.key.toLowerCase();
      const actions = {
        k: toggle,
        j: () => seek(state.time - 10),
        l: () => seek(state.time + 10),
        n: next,
        p: prev,
        m: toggleMute,
      };
      if (actions[key]) { e.preventDefault(); actions[key](); }
    });

    // Botones "reproducir esta canción" en cualquier página: <button data-cueva-play="vol2" data-index="4">
    document.addEventListener('click', (e) => {
      const btn = e.target.closest?.('[data-cueva-play]');
      if (!btn) return;
      e.preventDefault();
      const id = btn.getAttribute('data-cueva-play');
      const index = Number(btn.getAttribute('data-index') || 0);
      if (state.collectionId === id && state.index === index) toggle();
      else load(id, index, { autoplay: true });
    });

    // Un video que empieza a sonar pausa la música.
    window.addEventListener('cueva:pause-music', pause);
    window.addEventListener('pagehide', () => persist(true));
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved) return;
      set({ volume: saved.volume ?? 1, muted: !!saved.muted, shuffle: !!saved.shuffle, repeat: saved.repeat || 'off' });
      if (saved.collectionId && TRACKS[saved.collectionId]?.[saved.index]) {
        // Restauramos sin reproducir: los navegadores exigen un clic para sonar.
        set({ collectionId: saved.collectionId, index: saved.index, time: saved.time || 0 });
        if (saved.shuffle) order = shuffled(TRACKS[saved.collectionId].length, saved.index);
        updateMediaSession();
      }
    } catch {}
  }

  if (isBrowser) {
    restore();
    setupGlobalControls();
  }

  return {
    getState: () => state,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    currentTrack,
    load, play, pause, toggle, next, prev, seek, setVolume, toggleMute, toggleShuffle, cycleRepeat, stop,
  };
}

// Singleton a prueba de recargas de módulo
export const player = isBrowser
  ? (window.__cuevaPlayer ||= createPlayer())
  : createPlayer();

export function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
