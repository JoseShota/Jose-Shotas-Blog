import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Disc, ArrowLeft, Clock, Music } from 'lucide-react';
import playlistData from '../data/playlist.json';

// Simulamos que tienes una colección de playlists. 
// Por ahora solo hay una, pero la estructura está lista para más.
const COLLECTIONS = [
  {
    id: 'vol1',
    title: "Canciones para cuando muera y transcienda",
    description: "Imagina levitar en medio de una calle transitada. De inmediato reconoces que partirás sin regresar ¿Qué canción elegirías de fondo? Una selección de Jose Shōta.",
    cover: "/images/playlist-cover-v1.jpg", // Aquí irá tu imagen de Downloads
    year: "2025",
    tracks: playlistData, // Usamos el JSON que ya tienes
    totalDuration: "1h 14m", // Puedes calcular esto dinámicamente si prefieres
    trackCount: playlistData.length
  },
  // En el futuro añadirás más objetos aquí...
];

export default function MusicGallery() {
  const [activePlaylist, setActivePlaylist] = useState(null); // null = Vista Galería
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

  // --- VISTA 1: GALERÍA (PORTADAS) ---
  if (!activePlaylist) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-fade-in">
        {COLLECTIONS.map((playlist) => (
          <div 
            key={playlist.id} 
            onClick={() => setActivePlaylist(playlist)}
            className="group cursor-pointer flex flex-col gap-6"
          >
            {/* Contenedor estilo Vinilo/CD */}
            <div className="relative aspect-square bg-neutral-900 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
              {/* Disco saliendo (Efecto visual) */}
              <div className="absolute top-2 right-2 bottom-2 left-2 bg-neutral-800 rounded-full flex items-center justify-center transition-transform duration-700 group-hover:translate-x-12 group-hover:rotate-180">
                 <div className="w-1/3 h-1/3 bg-black rounded-full border-4 border-neutral-700"></div>
              </div>
              
              {/* Portada (Z-Index superior para tapar el disco) */}
              <div className="absolute inset-0 bg-neutral-800 border border-white/5 overflow-hidden">
                <img 
                    src={playlist.cover} 
                    alt={playlist.title} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/400x400/1a1a1a/ffffff?text=NO+IMAGE'}} // Fallback temporal
                />
              </div>
            </div>

            {/* Info de la Playlist */}
            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-gray-100 leading-tight group-hover:text-amber-500 transition-colors">
                {playlist.title}
              </h3>
              <div className="flex gap-4 text-xs font-mono text-gray-500 uppercase tracking-widest border-t border-gray-800 pt-3">
                <span className="flex items-center gap-1"><Music size={12}/> {playlist.trackCount} Tracks</span>
                <span className="flex items-center gap-1"><Clock size={12}/> {playlist.totalDuration}</span>
                <span>{playlist.year}</span>
              </div>
              <p className="text-sm text-gray-400 font-sans line-clamp-3 leading-relaxed">
                {playlist.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- VISTA 2: LISTENING STATION (REPRODUCTOR) ---
  return (
    <div className="relative animate-fade-in">
      
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
            if (currentTrackIndex < activePlaylist.tracks.length - 1) {
                setCurrentTrackIndex(currentTrackIndex + 1);
            } else {
                setIsPlaying(false);
            }
        }}
      />

      {/* Botón Volver */}
      <button 
        onClick={() => { setIsPlaying(false); setActivePlaylist(null); }}
        className="mb-8 flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-amber-500 transition-colors uppercase tracking-widest"
      >
        <ArrowLeft size={14} /> Volver a la Colección
      </button>

      <div className="lg:flex lg:gap-16 items-start">
        
        {/* --- COLUMNA IZQUIERDA: TRACKLIST (SCROLLABLE) --- */}
        <div className="flex-1 order-2 lg:order-1">
            <div className="flex flex-col border-t border-gray-800">
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
                                group py-5 px-2 cursor-pointer transition-all duration-300 border-b border-gray-800/50 flex justify-between items-center
                                ${isCurrent ? 'bg-white/5 pl-4' : 'hover:bg-white/5 hover:pl-4 opacity-70 hover:opacity-100'}
                            `}
                        >
                            <div className="flex flex-col gap-1">
                                <span className={`text-base font-medium ${isCurrent ? 'text-amber-500' : 'text-gray-200'}`}>
                                    {track.title}
                                </span>
                                <span className="text-xs font-sans text-gray-500 uppercase tracking-wider">
                                    {track.artist}
                                </span>
                            </div>
                            <span className="text-xs font-mono text-gray-600">
                                {isCurrent && isPlaying ? <span className="animate-pulse text-amber-600">PLAYING</span> : (track.duration || "00:00")}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* --- COLUMNA DERECHA: REPRODUCTOR FIJO (STICKY) --- */}
        {/* Aquí está la solución: sticky top-8 hace que se quede fijo mientras scrolleas la izquierda */}
        <div className="lg:w-[400px] flex-shrink-0 order-1 lg:order-2 lg:sticky lg:top-8 mb-12 lg:mb-0">
            
            <div className="bg-[#0f0f0f] border border-gray-800 p-6 rounded-sm shadow-2xl">
                
                {/* Portada Activa */}
                <div className="aspect-square w-full bg-black mb-6 relative overflow-hidden group">
                    <img 
                        src={activePlaylist.cover} 
                        alt="Now Playing Cover"
                        className={`w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-100' : 'opacity-60'}`}
                    />
                    {/* Indicador visual de estado */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 text-xs font-mono text-amber-500 border border-amber-500/30 rounded-full flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-amber-500 ${isPlaying ? 'animate-pulse' : ''}`}></div>
                        {isPlaying ? 'PLAYING' : 'PAUSED'}
                    </div>
                </div>

                {/* Info Track Actual */}
                <div className="text-center mb-8 space-y-2">
                    <h2 className="text-2xl font-serif text-white leading-tight">
                        {currentTrack.title}
                    </h2>
                    <p className="text-sm font-sans text-gray-400 uppercase tracking-widest">
                        {currentTrack.artist}
                    </p>
                    <p className="text-xs font-mono text-gray-600 mt-2">
                        {activePlaylist.title}
                    </p>
                </div>

                {/* Controles */}
                <div className="space-y-6">
                    {/* Barra de Progreso */}
                    <div 
                        className="w-full h-1 bg-gray-800 cursor-pointer group py-2"
                        onClick={handleProgressClick}
                    >
                        <div className="h-1 bg-gray-700 w-full relative overflow-hidden rounded-full">
                            <div ref={progressBarRef} className="h-full bg-amber-600 w-0 absolute top-0 left-0"></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-1">
                            <span>{audioRef.current && formatTime(audioRef.current.currentTime)}</span>
                            <span>{audioRef.current && !isNaN(audioRef.current.duration) ? formatTime(audioRef.current.duration) : "--:--"}</span>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex items-center justify-center gap-8">
                        <button onClick={() => setCurrentTrackIndex((c) => c > 0 ? c - 1 : activePlaylist.tracks.length - 1)} className="text-gray-500 hover:text-white transition-colors">
                            <SkipBack size={24} />
                        </button>
                        
                        <button 
                            onClick={togglePlay} 
                            className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            {isPlaying ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" className="ml-1" />}
                        </button>
                        
                        <button onClick={() => setCurrentTrackIndex((c) => c < activePlaylist.tracks.length - 1 ? c + 1 : 0)} className="text-gray-500 hover:text-white transition-colors">
                            <SkipForward size={24} />
                        </button>
                    </div>

                    {/* Volumen */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg border border-white/5">
                        <Volume2 size={16} className="text-gray-500" />
                        <input 
                            type="range" min="0" max="1" step="0.05" value={volume}
                            onChange={(e) => { setVolume(e.target.value); audioRef.current.volume = e.target.value; }}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
}