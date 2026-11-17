// Mini-reproductor fijo: aparece en todas las páginas cuando hay música
// cargada y sigue sonando mientras navegas por la cueva.
import React from 'react';
import { player, mediaUrl, formatTime } from '../../lib/player.js';
import { usePlayer } from './usePlayer.js';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, VolumeX, X, FileText, Loader2 } from './Icons.jsx';

const T = {
  es: {
    play: 'Reproducir', pause: 'Pausa', prev: 'Anterior', next: 'Siguiente', close: 'Cerrar reproductor',
    shuffle: 'Aleatorio', repeat: { off: 'Repetir: no', all: 'Repetir: colección', one: 'Repetir: canción' },
    mute: 'Silenciar', unmute: 'Activar sonido', volume: 'Volumen', seek: 'Posición en la canción',
    dossier: 'Expediente', error: 'No se pudo cargar esta pista', region: 'Reproductor de música',
    resume: 'Continuar donde lo dejaste',
  },
  en: {
    play: 'Play', pause: 'Pause', prev: 'Previous', next: 'Next', close: 'Close player',
    shuffle: 'Shuffle', repeat: { off: 'Repeat: off', all: 'Repeat: collection', one: 'Repeat: song' },
    mute: 'Mute', unmute: 'Unmute', volume: 'Volume', seek: 'Song position',
    dossier: 'Dossier', error: 'This track could not be loaded', region: 'Music player',
    resume: 'Resume where you left off',
  },
};

export default function GlobalPlayer({ lang = 'es', collections = {} }) {
  const s = usePlayer();
  const t = T[lang] || T.es;
  const track = s.collectionId ? player.currentTrack() : null;
  if (!track) return null;

  const meta = collections[s.collectionId] || {};
  const cover = mediaUrl(track.cover) || meta.cover;
  const musicPath = lang === 'en' ? '/en/musica' : '/musica';
  const dossierHref = `${musicPath}?vol=${s.collectionId}&pista=${track.id}`;
  const RepeatIcon = s.repeat === 'one' ? Repeat1 : Repeat;
  const isFresh = !s.isPlaying && s.time > 0 && s.duration === 0;

  return (
    <>
      {/* espaciador para que la barra no tape el final de la página */}
      <div aria-hidden="true" style={{ height: 76 }} />
      <section className="gp" role="region" aria-label={t.region}>
        <input
          className="gp-progress"
          type="range"
          min={0}
          max={s.duration || 0}
          step={1}
          value={Math.min(s.time, s.duration || s.time)}
          onChange={(e) => player.seek(Number(e.target.value))}
          aria-label={t.seek}
          aria-valuetext={`${formatTime(s.time)} / ${formatTime(s.duration)}`}
          style={{ '--pct': `${s.duration ? (s.time / s.duration) * 100 : 0}%` }}
        />

        <div className="gp-row">
          <a href={dossierHref} className="gp-info" title={t.dossier}>
            {cover && <img src={cover} alt="" width="44" height="44" className={s.isPlaying ? '' : 'is-paused'} />}
            <span className="gp-text">
              <span className="gp-title">{track.title}</span>
              <span className="gp-artist">
                {s.error ? <span className="gp-error">{t.error}</span> : isFresh ? t.resume : track.artist}
              </span>
            </span>
          </a>

          <div className="gp-controls">
            <button type="button" className="gp-btn gp-desk" onClick={player.toggleShuffle}
              aria-pressed={s.shuffle} aria-label={t.shuffle} title={t.shuffle}>
              <Shuffle size={15} />
            </button>
            <button type="button" className="gp-btn" onClick={player.prev} aria-label={t.prev} title={t.prev}>
              <SkipBack size={17} />
            </button>
            <button type="button" className="gp-btn gp-main" onClick={player.toggle}
              aria-label={s.isPlaying ? t.pause : t.play} title={`${s.isPlaying ? t.pause : t.play} (K)`}>
              {s.isLoading ? <Loader2 size={18} className="gp-spin" /> : s.isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button type="button" className="gp-btn" onClick={player.next} aria-label={t.next} title={t.next}>
              <SkipForward size={17} />
            </button>
            <button type="button" className="gp-btn gp-desk" onClick={player.cycleRepeat}
              aria-pressed={s.repeat !== 'off'} aria-label={t.repeat[s.repeat]} title={t.repeat[s.repeat]}>
              <RepeatIcon size={15} />
            </button>
          </div>

          <div className="gp-side">
            <span className="gp-time gp-desk">{formatTime(s.time)} / {formatTime(s.duration)}</span>
            <button type="button" className="gp-btn gp-desk" onClick={player.toggleMute}
              aria-label={s.muted ? t.unmute : t.mute} title={s.muted ? t.unmute : t.mute}>
              {s.muted || s.volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input className="gp-volume gp-desk" type="range" min={0} max={1} step={0.05}
              value={s.muted ? 0 : s.volume} onChange={(e) => player.setVolume(Number(e.target.value))} aria-label={t.volume} />
            <a href={dossierHref} className="gp-btn gp-desk" aria-label={t.dossier} title={t.dossier}>
              <FileText size={15} />
            </a>
            <button type="button" className="gp-btn" onClick={player.stop} aria-label={t.close} title={t.close}>
              <X size={16} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
