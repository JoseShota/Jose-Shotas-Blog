import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Disc } from 'lucide-react';
import playlistData from '../data/playlist.json';

export default function MusicPlayer({ playlistTitle, playlistCover, playlistDesc }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [hoveredTrack, setHoveredTrack] = useState(null); 
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const currentTrack = playlistData[currentTrackIndex];
  
  // Lógica visual: Mostrar portada de canción (hover/play) o la portada de la playlist
  const activeDisplayTrack = hoveredTrack || currentTrack;
  // Nota: Si tus tracks en el JSON no tienen portada individual, 
  // asegúrate de que 'track.cover' apunte a una imagen o fallback.
  // Si no hay imagen de track, usamos la de la playlist.
  const activeDisplayImage = activeDisplayTrack?.cover && activeDisplayTrack.cover !== "" 
                             ? activeDisplayTrack.cover 
                             : playlistCover;

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Playback error:", e));
    }
  }, [currentTrackIndex]);

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

  return (
    <div className="w-full text-gray-200 font-serif relative">
      
      {/* Elemento de Audio Invisible */}
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
            if (currentTrackIndex < playlistData.length - 1) {
                setCurrentTrackIndex(currentTrackIndex + 1);
            } else {
                setIsPlaying(false);
            }
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        
        {/* --- COLUMNA IZQUIERDA: Contexto Visual y Editorial --- */}
        <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-24 space-y-8">
                
                {/* Marco de Imagen */}
                <div className="relative aspect-square w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#0a0a0a]">
                    <img 
                        src={activeDisplayImage} 
                        alt="Album Art"
                        className="w-full h-full object-cover opacity-90 transition-opacity duration-500"
                    />
                    {/* Borde sutil interno */}
                    <div className="absolute inset-0 border border-white/5 pointer-events-none"></div>
                </div>

                {/* Info Editorial */}
                <div className="space-y-6">
                    {/* Indicador de estado */}
                    <div className="flex items-center gap-2 text-amber-600 text-xs font-mono uppercase tracking-widest">
                        <Disc size={12} className={isPlaying ? "animate-spin-slow" : ""} />
                        <span>{hoveredTrack ? "Preview" : (isPlaying ? "Now Spinning" : "Collection")}</span>
                    </div>
                    
                    {/* Título Dinámico: Muestra título de canción o título de playlist */}
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-light italic leading-tight text-white transition-all duration-300">
                            {activeDisplayTrack && (isPlaying || hoveredTrack) ? activeDisplayTrack.title : playlistTitle}
                        </h2>
                        <p className="text-lg text-gray-400 font-sans font-light mt-2">
                             {activeDisplayTrack && (isPlaying || hoveredTrack) ? activeDisplayTrack.artist : "Jose Shōta Curated"}
                        </p>
                    </div>

                    <div className="w-12 h-[1px] bg-gray-800"></div>

                    {/* Tu Descripción Original (Siempre visible si no hay canción seleccionada, o fija abajo) */}
                    <div className={`text-sm text-gray-500 font-sans leading-relaxed text-justify transition-opacity duration-500 ${isPlaying || hoveredTrack ? 'opacity-50' : 'opacity-100'}`}>
                        {playlistDesc}
                    </div>
                </div>
            </div>
        </div>

        {/* --- COLUMNA DERECHA: La Lista (Clean) --- */}
        <div className="lg:col-span-7 mt-8 lg:mt-0">
            <div className="flex flex-col space-y-1">
                {playlistData.map((track, index) => {
                    const isCurrent = currentTrack.id === track.id;
                    return (
                        <div 
                            key={track.id}
                            onClick={() => {
                                setCurrentTrackIndex(index);
                                setIsPlaying(true);
                            }}
                            onMouseEnter={() => setHoveredTrack(track)}
                            onMouseLeave={() => setHoveredTrack(null)}
                            // Clases para el efecto "Foco":
                            className={`
                                group relative py-5 px-4 cursor-pointer transition-all duration-500 border-b border-gray-900
                                ${isCurrent 
                                    ? 'bg-white/5 opacity-100 pl-6 border-l-2 border-l-amber-600' 
                                    : 'opacity-50 hover:opacity-100 hover:pl-6 hover:bg-white/[0.02] border-l-2 border-l-transparent'
                                }
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className={`text-lg font-medium tracking-wide transition-colors ${isCurrent ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                        {track.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-sans text-gray-500 uppercase tracking-wider">
                                            {track.artist}
                                        </span>
                                        {/* Mostramos el álbum solo si es la actual o hover */}
                                        <span className={`text-xs font-mono text-gray-600 transition-opacity duration-300 ${isCurrent || hoveredTrack === track ? 'opacity-100' : 'opacity-0'}`}>
                                            — {track.album}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="font-mono text-xs text-gray-600 group-hover:text-gray-400">
                                    {isCurrent && isPlaying ? <span className="text-amber-600">PLAYING</span> : (track.duration || "00:00")}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

      </div>

      {/* --- PLAYER CONTROL FOOTER (Sticky Bottom) --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#050505] border-t border-gray-900 z-50">
          
          {/* Barra de progreso */}
          <div 
            className="w-full h-[3px] bg-gray-900 cursor-pointer group hover:h-[5px] transition-all"
            onClick={handleProgressClick}
          >
              <div ref={progressBarRef} className="h-full bg-amber-600 w-0 relative"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between font-mono text-xs">
              
              {/* Track Info (Footer) */}
              <div className="flex items-center gap-4 w-1/3">
                 <div className="hidden sm:block w-2 h-2 rounded-full bg-amber-600 animate-pulse"></div>
                 <div className="flex flex-col">
                    <span className="text-gray-200 uppercase tracking-widest truncate max-w-[150px]">{currentTrack.title}</span>
                    <span className="text-gray-600 truncate max-w-[150px]">{currentTrack.artist}</span>
                 </div>
              </div>

              {/* Controles */}
              <div className="flex items-center justify-center gap-6 w-1/3">
                  <button onClick={() => setCurrentTrackIndex((c) => c > 0 ? c - 1 : playlistData.length - 1)} className="hover:text-white text-gray-600 transition-colors"><SkipBack size={18} /></button>
                  <button onClick={togglePlay} className="hover:scale-110 transition-transform text-white">
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <button onClick={() => setCurrentTrackIndex((c) => c < playlistData.length - 1 ? c + 1 : 0)} className="hover:text-white text-gray-600 transition-colors"><SkipForward size={18} /></button>
              </div>

              {/* Volumen */}
              <div className="flex items-center justify-end gap-3 w-1/3">
                  <Volume2 size={14} className="text-gray-600" />
                  <input 
                      type="range" min="0" max="1" step="0.05" value={volume}
                      onChange={(e) => { setVolume(e.target.value); audioRef.current.volume = e.target.value; }}
                      className="w-20 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <span className="w-10 text-right text-gray-600">
                    {audioRef.current && !isNaN(audioRef.current.duration) ? formatTime(audioRef.current.currentTime) : "0:00"}
                  </span>
              </div>
          </div>
      </div>
    </div>
  );
}