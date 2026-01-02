import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Disc, Clock, Music, ChevronLeft } from 'lucide-react';
import playlistData from '../data/playlist.json';

// TUS COLECCIONES
const COLLECTIONS = [
  {
    id: 'vol1',
    title: "Canciones para cuando muera y transcienda",
    description:
      "Imagina levitar en medio de una calle transitada. De inmediato reconoces que partirás sin regresar. ¿Qué canción elegirías de fondo? Una selección de Jose Shōta",
    cover: "/images/playlist-cover-v1.jpg",
    tracks: playlistData,
    totalDuration: "1h 14m",
    trackCount: playlistData.length
  },
];

const ACCENT = 'var(--color-highlight)';

export default function MusicGallery() {
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const currentTrack = activePlaylist ? activePlaylist.tracks[currentTrackIndex] : null;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;

    if (isPlaying) el.play().catch(e => console.error("Playback error:", e));
    else el.pause();
  }, [isPlaying, currentTrackIndex, activePlaylist, volume]);

  const togglePlay = () => setIsPlaying(p => !p);

  const handleTimeUpdate = () => {
    if (audioRef.current && progressBarRef.current) {
      const ct = audioRef.current.currentTime || 0;
      const dur = audioRef.current.duration || 0;
      setCurrentTime(ct);
      setDuration(dur);
      const progress = dur ? (ct / dur) * 100 : 0;
      progressBarRef.current.style.width = `${progress}%`;
    }
  };

  const handleProgressClick = (e) => {
    const timeline = e.currentTarget;
    const clickPosition = (e.clientX - timeline.getBoundingClientRect().left) / timeline.offsetWidth;
    audioRef.current.currentTime = clickPosition * audioRef.current.duration;
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- VISTA 1: GALERÍA (Grid de "Expedientes") ---
  if (!activePlaylist) {
    return (
      <div className="cueva-mono grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in pb-24">
        {COLLECTIONS.map((playlist) => (
          <div
            key={playlist.id}
            role="button"
            tabIndex={0}
            onClick={() => setActivePlaylist(playlist)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setActivePlaylist(playlist);
            }}
            className="group cursor-pointer cueva-card p-4 transition-colors duration-300 outline-none"
          >
            {/* Contenedor de Imagen */}
            <div className="relative aspect-square bg-black mb-6 overflow-hidden border"
                 style={{ borderColor: 'var(--color-text-accent)' }}
            >
              <img
                src={playlist.cover}
                alt={playlist.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400/1a1a1a/ffffff?text=NO+IMAGE'; }}
              />

              {/* Hover: overlay con descripción */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-black/70" />
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
                  <div className="text-[10px] uppercase tracking-widest cueva-muted mb-2">
                    Descripción
                  </div>
                  <p className="text-[11px] leading-relaxed cueva-text opacity-90 cueva-clamp-4">
                    {playlist.description}
                  </p>
                </div>
              </div>

              <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 text-[10px] uppercase tracking-widest border border-white/10 backdrop-blur-sm cueva-muted">
                VOL. {playlist.id === 'vol1' ? '01' : '02'}
              </div>
            </div>

            {/* Info Minimalista */}
            <div className="space-y-3">
              <h3 className="cueva-title text-xl leading-tight cueva-text transition-colors">
                {playlist.title}
              </h3>

              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest border-t pt-3"
                   style={{ borderColor: 'var(--color-text-accent)' }}
              >
                <span className="flex items-center gap-2 cueva-muted">
                  <Music size={10} /> {playlist.trackCount} Tracks
                </span>
                <span className="flex items-center gap-2 cueva-muted">
                  <Clock size={10} /> {playlist.totalDuration}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- VISTA 2: INTERIOR DE LA PLAYLIST (Split View) ---
  return (
    <div className="cueva-mono animate-fade-in relative">

      <audio
        ref={audioRef}
        src={currentTrack?.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          const dur = audioRef.current?.duration || 0;
          setDuration(dur);
          setCurrentTime(0);
          if (progressBarRef.current) progressBarRef.current.style.width = `0%`;
        }}
        onEnded={() => {
          setCurrentTrackIndex((i) => {
            const last = activePlaylist.tracks.length - 1;
            if (i < last) return i + 1;
            setIsPlaying(false);
            return i;
          });
        }}
      />

      {/* Botón Volver */}
      <button
        onClick={() => { setIsPlaying(false); setActivePlaylist(null); }}
        className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest cueva-muted hover:cueva-text transition-colors pl-2"
      >
        <ChevronLeft size={14} /> Volver a Colecciones
      </button>

      {/* ✅ Descripción al inicio de la playlist (cuando ya la abriste) */}
      <div className="cueva-card p-4 mb-8">
        <div className="text-[10px] uppercase tracking-widest cueva-muted mb-2">
          Expediente / Nota editorial
        </div>
        <p className="text-sm leading-relaxed cueva-text opacity-90">
          {activePlaylist.description}
        </p>
      </div>

      {/* LAYOUT PRINCIPAL: Dos Columnas */}
      {/* En móvil es columna (y añadimos padding bottom para que el player fijo no tape la última canción). En desktop es fila. */}
      <div className="flex flex-col lg:flex-row gap-8 items-start relative pb-32 lg:pb-0">

        {/* COLUMNA 1: LISTA DE CANCIONES */}
        <div className="flex-1 w-full min-w-0">
          <div className="overflow-x-hidden"> {/* Cambiado a hidden para evitar scroll lateral en móvil */}
            <div className="w-full lg:min-w-[860px]"> {/* En móvil usa el 100% del ancho, en desktop fuerza el ancho mínimo */}

              {/* Encabezado: Oculto en Móvil (hidden), Visible en Desktop (md:grid) */}
              <div
                className="hidden md:grid grid-cols-[35px_minmax(0,4fr)_minmax(0,3fr)_minmax(0,3fr)_50px] gap-4 px-4 pb-2 mb-2 border-b text-[10px] uppercase tracking-widest"
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  borderColor: 'var(--color-text-accent)',
                  color: 'var(--color-text-accent)'
                }}
              >
                <div className="text-center">#</div>
                <div>Title</div>
                <div>Artist</div>
                <div>Album</div>
                <div className="text-right">Time</div>
              </div>

              <div className="flex flex-col">
                {activePlaylist.tracks.map((track, index) => {
                  const isCurrent = currentTrackIndex === index;

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        setCurrentTrackIndex(index);
                        setIsPlaying(true);
                      }}
                      className={`
                        group grid 
                        grid-cols-[1fr_auto] md:grid-cols-[35px_minmax(0,4fr)_minmax(0,3fr)_minmax(0,3fr)_50px]
                        gap-2 md:gap-4 items-center py-3 md:py-4 px-3 md:px-4 cursor-pointer transition-all duration-200 border-b
                        hover:bg-white/5
                        ${isCurrent ? 'bg-white/5 pl-[14px]' : ''}
                      `}
                      style={{
                        borderBottomColor: 'rgba(255,255,255,0.06)',
                        borderLeftWidth: '2px',
                        borderLeftStyle: 'solid',
                        borderLeftColor: isCurrent ? ACCENT : 'transparent'
                      }}
                      >
                      {/* # (Solo Desktop) */}
                      <div className="hidden md:flex text-[10px] text-center cueva-muted justify-center">
                      {isCurrent
                          ? <Disc size={12} className={isPlaying ? "animate-spin-slow" : ""} style={{ color: ACCENT }} />
                          : (index + 1).toString().padStart(2, '0')
                        }
                      </div>
                      {/* INFO BLOCK: En móvil, agrupa Título y Artista. En desktop, el grid los separa visualmente */}
                      {/* Este div wrapper extra ayuda a controlar layout móvil vs desktop si fuera necesario, 
                        pero para mantener tu grid desktop, usaremos 'contents' o clases condicionales. 
                        MÉTODO SIMPLIFICADO: Renderizamos diferente para móvil/desktop en este bloque.
                      */}
                
                      {/* VERSIÓN MOVIL: Título + Artista apilados */}
                      <div className="flex flex-col md:hidden overflow-hidden">
                        <span className={`text-sm leading-tight ${isCurrent ? '' : 'cueva-text'}`} style={isCurrent ? { color: ACCENT } : undefined}>
                          {track.title}
                        </span>
                        <span className="text-xs cueva-muted mt-1">
                          {track.artist}
                        </span>
                      </div>

                      {/* VERSIÓN DESKTOP: Celdas individuales (hidden on mobile, block on md) */}
                
                      {/* Title Desktop */}
                      <div
                        className="hidden md:block text-sm truncate group-hover:whitespace-normal group-hover:overflow-visible"
                        style={isCurrent ? { color: ACCENT } : undefined}

                      >
                        {track.title}
                      </div>
                      
                      {/* Artist Desktop */}
                      <div className="hidden md:block text-xs cueva-muted group-hover:opacity-90 truncate group-hover:whitespace-normal">
                        {track.artist}
                      </div>

                      {/* Album (Solo Desktop) */}
                      <div className="hidden md:block text-xs cueva-muted opacity-80 truncate group-hover:whitespace-normal">
                        {track.album}
                      </div>

                      {/* Duration */}
                      <div className="text-[10px] text-right cueva-muted whitespace-nowrap">
                        {track.duration || "--:--"}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        {/* COLUMNA 2: REPRODUCTOR (STICKY DESKTOP) */}
        {/* Este es el reproductor GRANDE original. Lo ocultaremos en móvil (hidden) y mostraremos en desktop (lg:block) */}
        <div className="hidden lg:block w-[clamp(260px,35vw,380px)] flex-shrink-0 sticky top-8 cueva-card p-6 shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">

          {/* Portada */}
          <div className="aspect-square w-full bg-black mb-6 relative overflow-hidden border"
               style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <img
              src={activePlaylist.cover}
              alt="Now Playing Cover"
              className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-100 opacity-100 grayscale-0' : 'scale-105 opacity-60 grayscale'}`}
            />
          </div>

          {/* Info del Track */}
          <div className="text-center mb-8 overflow-x-auto">
            <h2 className="text-lg cueva-text leading-tight mb-1 whitespace-nowrap w-max mx-auto">
              {currentTrack ? currentTrack.title : "Selecciona un track"}
            </h2>
            <p
              className="text-xs uppercase tracking-widest whitespace-nowrap w-max mx-auto"
              style={{ color: ACCENT }}
            >
              {currentTrack ? currentTrack.artist : "Waiting..."}
            </p>
          </div>

          {/* Controles */}
          <div className={`space-y-6 transition-opacity duration-500 ${currentTrack ? 'opacity-100 pointer-events-auto' : 'opacity-50 pointer-events-none'}`}>

            {/* Timeline */}
            <div className="w-full cursor-pointer group py-2" onClick={handleProgressClick}>
              <div className="h-[2px] w-full relative" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <div ref={progressBarRef} className="h-full w-0 absolute top-0 left-0 cueva-progress">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"></div>
                </div>
              </div>
              <div className="flex justify-between text-[10px] cueva-muted mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{duration ? formatTime(duration) : "00:00"}</span>
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={() => setCurrentTrackIndex((c) => c > 0 ? c - 1 : activePlaylist.tracks.length - 1)}
                className="cueva-muted hover:text-white transition-colors"
              >
                <SkipBack size={20} />
              </button>

              <button
                onClick={togglePlay}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 text-black hover:scale-105 hover:bg-white transition-all"
              >
                {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
              </button>

              <button
                onClick={() => setCurrentTrackIndex((c) => c < activePlaylist.tracks.length - 1 ? c + 1 : 0)}
                className="cueva-muted hover:text-white transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </div>

            {/* Volumen */}
            <div className="flex items-center gap-3 pt-4 border-t"
                 style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <Volume2 size={14} className="cueva-muted" />
              <input
                type="range" min="0" max="1" step="0.05" value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="cueva-range w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

        </div>
      </div>
      {/* --- REPRODUCTOR MÓVIL (FIXED BOTTOM) --- */}
      {/* Visible solo en pantallas pequeñas (lg:hidden) */}
      {currentTrack && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 p-3 z-50 animate-fade-in">
          {/* Barra de progreso fina arriba */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10" onClick={handleProgressClick}>
            <div 
              className="h-full cueva-progress transition-all duration-100" 
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Info Izquierda */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img 
                src={activePlaylist.cover} 
                alt="cover" 
                className={`w-10 h-10 object-cover border border-white/10 ${isPlaying ? 'grayscale-0' : 'grayscale'}`} 
              />
              <div className="overflow-hidden">
                <div className="text-sm text-white truncate leading-tight">
                  {currentTrack.title}
                </div>
                <div className="text-[10px] cueva-muted truncate uppercase tracking-wider">
                  {currentTrack.artist}
                </div>
              </div>
            </div>

            {/* Controles Derecha */}
            <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black"
              >
                {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-1" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
