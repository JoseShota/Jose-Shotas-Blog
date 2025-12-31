import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Disc, ArrowLeft, Clock, Music, ChevronLeft } from 'lucide-react';
import playlistData from '../data/playlist.json';

// TUS COLECCIONES (Ejemplo)
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
  // Agrega más volúmenes aquí...
];

export default function MusicGallery() {
  const [activePlaylist, setActivePlaylist] = useState(null); 
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  // --- LÓGICA DE AUDIO ---
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in pb-24 font-sans">
        {COLLECTIONS.map((playlist) => (
          <div 
            key={playlist.id} 
            onClick={() => setActivePlaylist(playlist)}
            className="group cursor-pointer bg-[#0a0a0a] border border-gray-800 p-4 hover:border-amber-600/50 transition-colors duration-300"
          >
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
            <div className="space-y-3">
              <h3 className="text-xl font-serif text-gray-200 leading-tight group-hover:text-amber-500 transition-colors">
                {playlist.title}
              </h3>
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest border-t border-gray-800 pt-3">
                <span className="flex items-center gap-2"><Music size={10}/> {playlist.trackCount} Tracks</span>
                <span className="flex items-center gap-2"><Clock size={10}/> {playlist.totalDuration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- VISTA 2: INTERIOR DE LA PLAYLIST (Split View) ---
  return (
    <div className="animate-fade-in relative min-h-screen font-sans">
      
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

      <button 
        onClick={() => { setIsPlaying(false); setActivePlaylist(null); }}
        className="mb-8 flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors uppercase tracking-widest pl-2"
      >
        <ChevronLeft size={14} /> Volver a Colecciones
      </button>

      {/* LAYOUT PRINCIPAL: Dos Columnas 
          Nota: 'items-start' es CRÍTICO para que el sticky funcione.
      */}
      <div className="flex flex-col lg:flex-row gap-12 items-start relative">
        
        {/* --- COLUMNA 1: LISTA DE CANCIONES (Scrollable) --- */}
        <div className="flex-1 w-full order-2 lg:order-1">
            
            {/* Headers Sticky dentro de la columna */}
            <div className="grid grid-cols-[30px_1.5fr_1fr_1fr_40px] gap-4 px-4 pb-4 border-b border-gray-800 text-[10px] font-mono text-gray-500 uppercase tracking-widest sticky top-0 bg-[#050505] z-10 pt-2">
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
                            className={`
                                group grid grid-cols-[30px_1.5fr_1fr_1fr_40px] gap-4 items-center py-4 px-4 cursor-pointer transition-all duration-200 border-b border-gray-900/40 hover:bg-white/5
                                ${isCurrent ? 'bg-white/5 border-l-2 border-l-amber-500 pl-[14px]' : 'border-l-2 border-l-transparent'}
                            `}
                        >
                            <div className="text-[10px] font-mono text-gray-600 text-center group-hover:text-white flex justify-center">
                                {isCurrent ? <Disc size={12} className={isPlaying ? "animate-spin-slow text-amber-500" : "text-amber-500"}/> : (index + 1).toString().padStart(2, '0')}
                            </div>
                            
                            <div className={`text-sm font-medium truncate ${isCurrent ? 'text-amber-500' : 'text-gray-300 group-hover:text-white'}`}>
                                {track.title}
                            </div>
                            
                            <div className="text-xs text-gray-500 truncate group-hover:text-gray-400">
                                {track.artist}
                            </div>
                            
                            <div className="hidden md:block text-xs text-gray-600 truncate group-hover:text-gray-500">
                                {track.album}
                            </div>
                            
                            <div className="text-[10px] font-mono text-gray-600 text-right">
                                {track.duration || "--:--"}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Espaciador final para que el último track no quede pegado al footer si hubiera */}
            <div className="h-20"></div>
        </div>

        {/* --- COLUMNA 2: REPRODUCTOR LATERAL (Sticky Sidebar) --- 
           - w-full lg:w-[350px]: Ancho fijo en desktop.
           - h-fit: Altura ajustada al contenido (necesario para sticky).
           - sticky top-8: Se queda pegado arriba con un margen.
        */}
        <div className="w-full lg:w-[380px] flex-shrink-0 order-1 lg:order-2 lg:sticky lg:top-8 h-fit">
            
            <div className="bg-[#0a0a0a] border border-gray-800 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {/* Portada Activa */}
                <div className="aspect-square w-full bg-black mb-6 relative overflow-hidden border border-gray-900 shadow-inner group">
                    <img 
                        src={activePlaylist.cover} 
                        alt="Now Playing Cover"
                        className={`w-full h-full object-cover transition-all duration-1000 ${isPlaying ? 'opacity-100 grayscale-0' : 'opacity-60 grayscale'}`}
                    />
                    {/* Efecto Vinilo Sutil */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                </div>

                {/* Info del Track */}
                <div className="text-center mb-8 space-y-2">
                    <h2 className="text-xl font-serif text-white leading-tight line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
                        {currentTrack ? currentTrack.title : "Selecciona un track"}
                    </h2>
                    <p className="text-xs font-mono text-amber-600 uppercase tracking-widest line-clamp-1">
                        {currentTrack ? currentTrack.artist : "Ready to play"}
                    </p>
                </div>

                {/* Controles */}
                <div className={`space-y-6 transition-opacity duration-500 ${currentTrack ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    
                    {/* Timeline */}
                    <div 
                        className="w-full h-4 flex items-center cursor-pointer group"
                        onClick={handleProgressClick}
                    >
                        <div className="h-[2px] bg-gray-800 w-full relative group-hover:h-[4px] transition-all rounded-full overflow-hidden">
                            <div ref={progressBarRef} className="h-full bg-amber-600 w-0 absolute top-0 left-0"></div>
                        </div>
                    </div>
                    
                    <div className="flex justify-between text-[10px] font-mono text-gray-500 -mt-4">
                        <span>{audioRef.current && formatTime(audioRef.current.currentTime)}</span>
                        <span>{audioRef.current && !isNaN(audioRef.current.duration) ? formatTime(audioRef.current.duration) : "00:00"}</span>
                    </div>

                    {/* Botones */}
                    <div className="flex items-center justify-center gap-8 pt-2">
                        <button onClick={() => setCurrentTrackIndex((c) => c > 0 ? c - 1 : activePlaylist.tracks.length - 1)} className="text-gray-500 hover:text-white transition-colors">
                            <SkipBack size={20} />
                        </button>
                        
                        <button 
                            onClick={togglePlay} 
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 text-black hover:scale-105 hover:bg-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        >
                            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
                        </button>
                        
                        <button onClick={() => setCurrentTrackIndex((c) => c < activePlaylist.tracks.length - 1 ? c + 1 : 0)} className="text-gray-500 hover:text-white transition-colors">
                            <SkipForward size={20} />
                        </button>
                    </div>

                    {/* Volumen */}
                    <div className="flex items-center gap-3 pt-6 border-t border-gray-900/50">
                        <Volume2 size={14} className="text-gray-600" />
                        <input 
                            type="range" min="0" max="1" step="0.05" value={volume}
                            onChange={(e) => { setVolume(e.target.value); audioRef.current.volume = e.target.value; }}
                            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-600 hover:accent-amber-500"
                        />
                    </div>
                </div>
            </div>

            {/* Descripción / Contexto (Opcional debajo del player) */}
            <div className="mt-8 text-xs text-gray-600 font-serif leading-relaxed text-justify px-2">
                <p>"{activePlaylist.description}"</p>
            </div>

        </div>

      </div>
    </div>
  );
}