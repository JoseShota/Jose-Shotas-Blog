import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Disc, Clock, Music, ChevronLeft } from 'lucide-react';
import playlistData from '../data/playlist.json';

// TUS COLECCIONES
const COLLECTIONS = [
  {
    id: 'vol1',
    title: "Canciones para cuando muera y transcienda",
    description: "Imagina levitar en medio de una calle transitada. De inmediato reconoces que partirás sin regresar. ¿Qué canción elegirías de fondo?",
    cover: "/images/playlist-cover-v1.jpg", 
    tracks: playlistData, 
    totalDuration: "1h 14m", 
    trackCount: playlistData.length
  },
  // Más colecciones...
];

export default function MusicGallery() {
  const [activePlaylist, setActivePlaylist] = useState(null); 
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0); // Estado para la duración real
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

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
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (progressBarRef.current && duration > 0) {
        const progress = (audioRef.current.currentTime / duration) * 100;
        progressBarRef.current.style.width = `${progress}%`;
      }
    }
  };

  // Esta función arregla el problema del tiempo
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
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- VISTA 1: GALERÍA (Grid de "Expedientes") ---
  if (!activePlaylist) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in pb-24 font-mono">
        {COLLECTIONS.map((playlist) => (
          <div 
            key={playlist.id} 
            onClick={() => setActivePlaylist(playlist)}
            className="group cursor-pointer border border-gray-800 p-4 hover:border-amber-600/50 transition-colors duration-300"
          >
            <div className="relative aspect-square bg-black mb-4 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                <img 
                    src={playlist.cover} 
                    alt={playlist.title} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100"
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/400x400/1a1a1a/ffffff?text=NO+IMAGE'}} 
                />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg text-gray-200 leading-tight group-hover:text-amber-500 transition-colors">
                {playlist.title}
              </h3>
              <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest pt-2 border-t border-gray-800">
                <span className="flex items-center gap-1"><Music size={10}/> {playlist.trackCount} Tracks</span>
                <span className="flex items-center gap-1"><Clock size={10}/> {playlist.totalDuration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- VISTA 2: LISTA + REPRODUCTOR LATERAL ---
  return (
    <div className="animate-fade-in relative font-mono text-sm">
      
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
        className="mb-6 flex items-center gap-2 text-xs text-gray-500 hover:text-amber-500 transition-colors uppercase tracking-widest"
      >
        <ChevronLeft size={14} /> Volver
      </button>

      {/* LAYOUT PRINCIPAL 
         - md:flex-row: A partir de tablet/desktop se pone al lado.
         - items-start: INDISPENSABLE para que el sticky funcione.
      */}
      <div className="flex flex-col md:flex-row gap-8 items-start relative">
        
        {/* --- COLUMNA 1: LISTA (Flexible) --- */}
        <div className="flex-1 w-full min-w-0">
            {/* Header de tabla */}
            <div className="grid grid-cols-[20px_1fr_40px] md:grid-cols-[25px_1.5fr_1fr_40px] gap-2 px-2 pb-2 border-b border-gray-800 text-[10px] text-gray-500 uppercase tracking-widest sticky top-0 bg-[#111] z-10">
                <div className="text-center">#</div>
                <div>Title</div>
                <div className="hidden md:block">Artist</div>
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
                                group grid grid-cols-[20px_1fr_40px] md:grid-cols-[25px_1.5fr_1fr_40px] gap-2 items-center py-3 px-2 cursor-pointer border-b border-gray-900/40 hover:bg-white/5 transition-colors
                                ${isCurrent ? 'text-amber-500' : 'text-gray-400'}
                            `}
                        >
                            <div className="text-[10px] text-center">
                                {isCurrent ? <Disc size={10} className={isPlaying ? "animate-spin-slow" : ""}/> : (index + 1).toString().padStart(2, '0')}
                            </div>
                            
                            <div className="truncate font-medium">
                                {track.title}
                                {/* En movil mostramos artista abajo del titulo */}
                                <div className="block md:hidden text-[10px] text-gray-600 mt-0.5">{track.artist}</div>
                            </div>
                            
                            <div className="hidden md:block text-xs text-gray-600 truncate group-hover:text-gray-500">
                                {track.artist}
                            </div>
                            
                            <div className="text-[10px] text-right">
                                {track.duration || "--:--"}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Espacio extra al final */}
            <div className="h-12"></div>
        </div>

        {/* --- COLUMNA 2: REPRODUCTOR (Sticky Sidebar) --- 
            - w-full md:w-[280px]: Ancho controlado para que quepa en tu layout de 800px.
            - sticky top-4: Se pega al techo al scrollear.
        */}
        <div className="w-full md:w-[280px] flex-shrink-0 sticky top-4 self-start">
            
            <div className="border border-gray-800 bg-[#0a0a0a] p-4">
                {/* Portada */}
                <div className="aspect-square w-full bg-black mb-4 border border-gray-900 overflow-hidden">
                    <img 
                        src={activePlaylist.cover} 
                        alt="Now Playing"
                        className={`w-full h-full object-cover transition-all duration-1000 ${isPlaying ? 'opacity-100 grayscale-0' : 'opacity-60 grayscale'}`}
                    />
                </div>

                {/* Info Track */}
                <div className="mb-6 text-center">
                    <h2 className="text-base text-white leading-tight line-clamp-2 min-h-[2.5rem] flex items-center justify-center font-serif italic">
                        {currentTrack ? currentTrack.title : "Selecciona un track"}
                    </h2>
                    <p className="text-[10px] text-amber-600 uppercase tracking-widest mt-1 truncate">
                        {currentTrack ? currentTrack.artist : "..."}
                    </p>
                </div>

                {/* Timeline & Controls */}
                <div className={`space-y-4 ${!currentTrack && 'opacity-50 pointer-events-none'}`}>
                    
                    {/* Barra de progreso */}
                    <div 
                        className="w-full h-3 flex items-center cursor-pointer group"
                        onClick={handleProgressClick}
                    >
                        <div className="h-[2px] bg-gray-800 w-full relative group-hover:h-[4px] transition-all">
                            <div ref={progressBarRef} className="h-full bg-amber-600 w-0 absolute top-0 left-0"></div>
                        </div>
                    </div>
                    
                    {/* Tiempo Real (Arreglado) */}
                    <div className="flex justify-between text-[10px] text-gray-600 -mt-2 font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>

                    {/* Botones */}
                    <div className="flex items-center justify-center gap-6">
                        <button onClick={() => setCurrentTrackIndex((c) => c > 0 ? c - 1 : activePlaylist.tracks.length - 1)} className="text-gray-500 hover:text-white">
                            <SkipBack size={16} />
                        </button>
                        
                        <button 
                            onClick={togglePlay} 
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-black hover:scale-105 transition-transform"
                        >
                            {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-0.5" />}
                        </button>
                        
                        <button onClick={() => setCurrentTrackIndex((c) => c < activePlaylist.tracks.length - 1 ? c + 1 : 0)} className="text-gray-500 hover:text-white">
                            <SkipForward size={16} />
                        </button>
                    </div>

                    {/* Volumen */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-900/50">
                        <Volume2 size={12} className="text-gray-600" />
                        <input 
                            type="range" min="0" max="1" step="0.05" value={volume}
                            onChange={(e) => { setVolume(e.target.value); if(audioRef.current) audioRef.current.volume = e.target.value; }}
                            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                    </div>
                </div>
            </div>
            
            {/* Descripción (Más pequeña para ahorrar espacio) */}
            <div className="mt-4 text-[10px] text-gray-600 leading-relaxed text-justify px-1">
                <p>"{activePlaylist.description}"</p>
            </div>

        </div>

      </div>
    </div>
  );
}