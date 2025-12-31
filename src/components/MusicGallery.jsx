import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Disc, ArrowLeft, Clock, Music, ChevronLeft } from 'lucide-react';
import playlistData from '../data/playlist.json';

// TUS COLECCIONES
const COLLECTIONS = [
  {
    id: 'vol1',
    title: "Canciones para cuando muera y transcienda",
    description: "Imagina levitar en medio de una calle transitada. De inmediato reconoces que partirás sin regresar. ¿Qué canción elegirías de fondo? Una selección de Jose Shota",
    cover: "/images/playlist-cover-v1.jpg", 
    tracks: playlistData, 
    totalDuration: "1h 14m", 
    trackCount: playlistData.length
  },
  // Aquí añadirás más objetos {} en el futuro...
];

export default function MusicGallery() {
  const [activePlaylist, setActivePlaylist] = useState(null); 
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  // --- LOGICA DE AUDIO ---
  const currentTrack = activePlaylist ? activePlaylist.tracks[currentTrackIndex] : null;

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Playback error:", e));
    }
  }, [currentTrackIndex, activePlaylist]);

  const togglePlay = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && progressBarRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in pb-24">
        {COLLECTIONS.map((playlist) => (
          <div 
            key={playlist.id} 
            onClick={() => setActivePlaylist(playlist)}
            className="group cursor-pointer bg-[#0a0a0a] border border-gray-800 p-4 hover:border-amber-600/50 transition-colors duration-300"
          >
            {/* Contenedor de Imagen */}
            <div className="relative aspect-square bg-black mb-6 overflow-hidden">
                <img 
                    src={playlist.cover} 
                    alt={playlist.title} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0"
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/400x400/1a1a1a/ffffff?text=NO+IMAGE'}} 
                />
                <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 text-[10px] font-mono text-white border border-white/10 backdrop-blur-sm">
                    VOL. {playlist.id === 'vol1' ? '01' : '02'}
                </div>
            </div>

            {/* Info Minimalista */}
            <div className="space-y-3">
              <h3 className="text-xl font-serif text-gray-200 leading-tight group-hover:text-amber-500 transition-colors">
                {playlist.title}
              </h3>
              
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest border-t border-gray-800 pt-3">
                <span className="flex items-center gap-2">
                   <Music size={10}/> {playlist.trackCount} Tracks
                </span>
                <span className="flex items-center gap-2">
                   <Clock size={10}/> {playlist.totalDuration}
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
    <div className="animate-fade-in relative">
      
      <audio 
        ref={audioRef} 
        src={currentTrack?.src} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
            if (currentTrackIndex < activePlaylist.tracks.length - 1) {
                setCurrentTrackIndex(currentTrackIndex + 1);
            } else {
                setIsPlaying(false);
            }
        }}
      />

      {/* Botón Volver Limpio */}
      <button 
        onClick={() => { setIsPlaying(false); setActivePlaylist(null); }}
        className="mb-8 flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors uppercase tracking-widest pl-2"
      >
        <ChevronLeft size={14} /> Volver a Colecciones
      </button>

      {/* LAYOUT PRINCIPAL: Dos Columnas */}
      <div className="flex flex-col lg:flex-row gap-12 items-start relative">
        
        {/* COLUMNA 1: LISTA DE CANCIONES (TABLA ORGANIZADA) */}
        <div className="flex-1 w-full order-2 lg:order-1">
            
            {/* Encabezado de la Tabla (Headers) */}
            <div className="grid grid-cols-[30px_1.5fr_1fr_1fr_40px] gap-4 px-4 pb-2 mb-2 border-b border-gray-800 text-[10px] font-mono text-gray-600 uppercase tracking-widest sticky top-0 bg-[#050505] z-10">
                <div className="text-center">#</div>
                <div>Title</div>
                <div>Artist</div>
                <div className="hidden md:block">Album</div>
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
                            // Grid alineado exactamente igual que el header
                            className={`
                                group grid grid-cols-[30px_1.5fr_1fr_1fr_40px] gap-4 items-center py-4 px-4 cursor-pointer transition-all duration-200 border-b border-gray-900/50 hover:bg-white/5
                                ${isCurrent ? 'bg-white/5 border-l-2 border-l-amber-500 pl-[14px]' : 'border-l-2 border-l-transparent'}
                            `}
                        >
                            {/* # Numero */}
                            <div className="text-[10px] font-mono text-gray-600 text-center group-hover:text-white">
                                {isCurrent ? <Disc size={12} className={isPlaying ? "animate-spin-slow text-amber-500" : "text-amber-500"}/> : (index + 1).toString().padStart(2, '0')}
                            </div>
                            
                            {/* Title */}
                            <div className={`text-sm font-medium truncate ${isCurrent ? 'text-amber-500' : 'text-gray-200 group-hover:text-white'}`}>
                                {track.title}
                            </div>
                            
                            {/* Artist */}
                            <div className="text-xs text-gray-500 truncate group-hover:text-gray-400">
                                {track.artist}
                            </div>
                            
                            {/* Album (Oculto en móvil) */}
                            <div className="hidden md:block text-xs text-gray-600 truncate group-hover:text-gray-500">
                                {track.album}
                            </div>
                            
                            {/* Duration */}
                            <div className="text-[10px] font-mono text-gray-600 text-right">
                                {track.duration || "--:--"}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* COLUMNA 2: REPRODUCTOR FIJO (STICKY SIDEBAR) */}
        {/* El truco del sticky: width fijo + h-fit + sticky + top */}
        <div className="w-full lg:w-[380px] flex-shrink-0 order-1 lg:order-2 lg:sticky lg:top-8 bg-[#0a0a0a] border border-gray-800 p-6 shadow-2xl">
            
            {/* Portada Activa */}
            <div className="aspect-square w-full bg-black mb-6 relative overflow-hidden border border-gray-900">
                <img 
                    src={activePlaylist.cover} 
                    alt="Now Playing Cover"
                    className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-100 opacity-100 grayscale-0' : 'scale-105 opacity-60 grayscale'}`}
                />
            </div>

            {/* Info del Track Sonando */}
            <div className="text-center mb-8">
                <h2 className="text-xl font-serif text-white leading-tight mb-1">
                    {currentTrack ? currentTrack.title : "Selecciona un track"}
                </h2>
                <p className="text-xs font-mono text-amber-600 uppercase tracking-widest">
                    {currentTrack ? currentTrack.artist : "Waiting..."}
                </p>
            </div>

            {/* Controles */}
            <div className={`space-y-6 transition-opacity duration-500 ${currentTrack ? 'opacity-100 pointer-events-auto' : 'opacity-50 pointer-events-none'}`}>
                
                {/* Timeline */}
                <div 
                    className="w-full h-1 bg-gray-800 cursor-pointer group py-2"
                    onClick={handleProgressClick}
                >
                    <div className="h-[2px] bg-gray-700 w-full relative">
                        <div ref={progressBarRef} className="h-full bg-amber-600 w-0 absolute top-0 left-0">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-gray-600 mt-2">
                        <span>{audioRef.current && formatTime(audioRef.current.currentTime)}</span>
                        <span>{audioRef.current && !isNaN(audioRef.current.duration) ? formatTime(audioRef.current.duration) : "00:00"}</span>
                    </div>
                </div>

                {/* Botones de Reproducción */}
                <div className="flex items-center justify-center gap-8">
                    <button onClick={() => setCurrentTrackIndex((c) => c > 0 ? c - 1 : activePlaylist.tracks.length - 1)} className="text-gray-500 hover:text-white transition-colors">
                        <SkipBack size={20} />
                    </button>
                    
                    <button 
                        onClick={togglePlay} 
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 text-black hover:scale-105 hover:bg-white transition-all"
                    >
                        {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                    </button>
                    
                    <button onClick={() => setCurrentTrackIndex((c) => c < activePlaylist.tracks.length - 1 ? c + 1 : 0)} className="text-gray-500 hover:text-white transition-colors">
                        <SkipForward size={20} />
                    </button>
                </div>

                {/* Volumen */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-900">
                    <Volume2 size={14} className="text-gray-600" />
                    <input 
                        type="range" min="0" max="1" step="0.05" value={volume}
                        onChange={(e) => { setVolume(e.target.value); audioRef.current.volume = e.target.value; }}
                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}