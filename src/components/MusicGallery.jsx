import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Disc, ChevronLeft } from 'lucide-react';
import playlistData from '../data/playlist.json';

// --- TUS DATOS ---
const COLLECTIONS = [
  {
    id: 'vol1',
    title: "Canciones para cuando muera y transcienda",
    description: "Imagina levitar en medio de una calle transitada. De inmediato reconoces que partirás sin regresar. ¿Qué canción elegirías de fondo?",
    cover: "/images/playlist-cover-v1.jpg", 
    tracks: playlistData, 
    trackCount: playlistData.length
  },
  // Más colecciones...
];

export default function MusicGallery() {
  const [activePlaylist, setActivePlaylist] = useState(null); 
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  
  // Estados para el tiempo (Arreglo del bug de duración)
  const [duration, setDuration] = useState(0); 
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const currentTrack = activePlaylist ? activePlaylist.tracks[currentTrackIndex] : null;

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.error(e));
    }
  }, [currentTrackIndex, activePlaylist]);

  const togglePlay = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (progressBarRef.current && duration > 0) {
        const progress = (audioRef.current.currentTime / duration) * 100;
        progressBarRef.current.style.width = `${progress}%`;
      }
    }
  };

  // --- CRÍTICO: Leer metadatos del audio para obtener duración real ---
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    const timeline = e.currentTarget;
    const clickPosition = (e.clientX - timeline.getBoundingClientRect().left) / timeline.offsetWidth;
    if (audioRef.current) {
        audioRef.current.currentTime = clickPosition * audioRef.current.duration;
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- VISTA 1: GRID (Sin cambios) ---
  if (!activePlaylist) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in pb-24 font-mono">
        {COLLECTIONS.map((playlist) => (
          <div 
            key={playlist.id} 
            onClick={() => setActivePlaylist(playlist)}
            className="group cursor-pointer border border-gray-800 p-3 hover:border-amber-600 transition-colors"
          >
            <div className="aspect-square bg-black mb-3 overflow-hidden">
                <img src={playlist.cover} alt={playlist.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all" />
            </div>
            <h3 className="text-sm text-gray-200 font-bold group-hover:text-amber-500">{playlist.title}</h3>
          </div>
        ))}
      </div>
    );
  }

  // --- VISTA 2: LISTA + REPRODUCTOR ---
  return (
    <div className="animate-fade-in font-mono text-sm relative">
      
      {/* Audio Element con onLoadedMetadata */}
      <audio 
        ref={audioRef} 
        src={currentTrack?.src} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata} 
        onEnded={() => {
            if (currentTrackIndex < activePlaylist.tracks.length - 1) {
                setCurrentTrackIndex(currentTrackIndex + 1);
            } else {
                setIsPlaying(false);
            }
        }}
      />

      <button 
        onClick={() => { setIsPlaying(false); setActivePlaylist(null); }}
        className="mb-6 flex items-center gap-2 text-xs text-gray-500 hover:text-amber-500 uppercase tracking-widest"
      >
        <ChevronLeft size={14} /> Volver
      </button>

      {/* LAYOUT PRINCIPAL CORREGIDO PARA 800PX:
         1. md:flex-row -> Se activa a los 768px (antes de llegar al límite de 800px).
         2. items-start -> Obligatorio para sticky.
      */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* --- COLUMNA 1: LISTA --- */}
        <div className="flex-1 w-full min-w-0">
            <div className="grid grid-cols-[20px_1fr_40px] gap-2 px-2 pb-2 border-b border-gray-800 text-[10px] text-gray-500 uppercase sticky top-0 bg-[#111] z-10">
                <div className="text-center">#</div>
                <div>Track</div>
                <div className="text-right">Time</div>
            </div>

            <div className="flex flex-col">
                {activePlaylist.tracks.map((track, index) => {
                    const isCurrent = currentTrackIndex === index;
                    return (
                        <div 
                            key={track.id}
                            onClick={() => { setCurrentTrackIndex(index); setIsPlaying(true); }}
                            className={`
                                grid grid-cols-[20px_1fr_40px] gap-2 items-center py-3 px-2 cursor-pointer border-b border-gray-900/40 hover:bg-white/5 transition-colors
                                ${isCurrent ? 'text-amber-500' : 'text-gray-400'}
                            `}
                        >
                            <div className="text-[10px] text-center">
                                {isCurrent ? <Disc size={10} className={isPlaying ? "animate-spin-slow" : ""}/> : (index + 1).toString().padStart(2, '0')}
                            </div>
                            <div className="truncate flex flex-col">
                                <span className="truncate font-medium">{track.title}</span>
                                <span className="text-[10px] text-gray-600 truncate">{track.artist}</span>
                            </div>
                            <div className="text-[10px] text-right">
                                {track.duration || "--:--"}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Espacio extra al final */}
            <div className="h-20"></div>
        </div>

        {/* --- COLUMNA 2: REPRODUCTOR STICKY --- 
           1. md:w-[250px] -> Ancho reducido para que quepa junto a la lista.
           2. sticky top-4 -> Se queda fijo al hacer scroll.
        */}
        <div className="w-full md:w-[250px] flex-shrink-0 sticky top-4 bg-[#0a0a0a] border border-gray-800 p-4 z-20">
            
            <div className="aspect-square w-full bg-black mb-4 border border-gray-900 grayscale">
                <img 
                    src={activePlaylist.cover} 
                    className={`w-full h-full object-cover transition-all duration-1000 ${isPlaying ? 'opacity-100 grayscale-0' : 'opacity-60'}`}
                />
            </div>

            <div className="mb-4 text-center">
                <h2 className="text-sm text-white italic truncate px-2">
                    {currentTrack ? currentTrack.title : "Selecciona"}
                </h2>
                <p className="text-[10px] text-amber-600 uppercase mt-1 truncate">
                    {currentTrack ? currentTrack.artist : "..."}
                </p>
            </div>

            <div className={`space-y-3 ${!currentTrack && 'opacity-50 pointer-events-none'}`}>
                {/* Timeline */}
                <div className="w-full h-2 bg-gray-900 cursor-pointer group rounded-full overflow-hidden" onClick={handleProgressClick}>
                    <div ref={progressBarRef} className="h-full bg-amber-600 w-0"></div>
                </div>
                
                {/* TIEMPOS CORREGIDOS (Justify Between) */}
                <div className="flex justify-between text-[10px] text-gray-500 font-mono w-full">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>

                {/* Controles */}
                <div className="flex items-center justify-center gap-4">
                    <button onClick={() => setCurrentTrackIndex(c => c > 0 ? c - 1 : 0)} className="text-gray-500 hover:text-white"><SkipBack size={16}/></button>
                    <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-black hover:scale-105 transition-transform">
                        {isPlaying ? <Pause size={14} fill="black"/> : <Play size={14} fill="black" className="ml-0.5"/>}
                    </button>
                    <button onClick={() => setCurrentTrackIndex(c => c < activePlaylist.tracks.length - 1 ? c + 1 : 0)} className="text-gray-500 hover:text-white"><SkipForward size={16}/></button>
                </div>

                {/* Volumen */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-900/50">
                    <Volume2 size={12} className="text-gray-600" />
                    <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => { setVolume(e.target.value); if(audioRef.current) audioRef.current.volume = e.target.value; }} className="w-full h-1 accent-amber-600" />
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}