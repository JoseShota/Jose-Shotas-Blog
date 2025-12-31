import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Search } from 'lucide-react';
import playlistData from '../data/playlist.json'; // Asegúrate de que la ruta sea correcta

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const filteredPlaylist = playlistData.filter(track => 
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentTrack = playlistData[currentTrackIndex];

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Error playback:", e));
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playTrack = (originalIndex) => {
    setCurrentTrackIndex(originalIndex);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    setProgress((current / duration) * 100);
  };

  const handleSeek = (e) => {
    const width = e.target.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    const duration = audioRef.current.duration;
    audioRef.current.currentTime = (clickX / width) * duration;
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#1C1C1C] text-gray-300 font-sans border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
      
      {/* 1. CABECERA (Estilo MusicBee Hero) */}
      <div className="relative h-48 bg-gradient-to-b from-gray-800 to-[#1C1C1C] p-6 flex items-end">
        {/* Fondo decorativo difuminado */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
           <img src="/images/default-cover.jpg" className="w-full h-full object-cover blur-xl" />
        </div>
        
        <div className="relative z-10 flex items-center w-full gap-6">
          <div className="w-32 h-32 bg-black shadow-lg flex-shrink-0">
             {/* Aquí iría la portada real si la tuviéramos */}
             <div className="w-full h-full bg-gray-700 flex items-center justify-center text-4xl text-gray-500">♪</div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{currentTrack.title}</h1>
            <p className="text-xl text-amber-500 mt-1">{currentTrack.artist}</p>
            <p className="text-sm text-gray-400 mt-1">{currentTrack.album}</p>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE HERRAMIENTAS Y BUSCADOR */}
      <div className="px-4 py-2 border-b border-gray-800 bg-[#252525] flex justify-between items-center">
        <div className="flex items-center bg-[#1C1C1C] border border-gray-700 rounded px-2 py-1 w-64">
            <Search size={16} className="text-gray-500 mr-2" />
            <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full text-white"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="text-xs text-gray-500">
            {filteredPlaylist.length} tracks
        </div>
      </div>

      {/* 3. LISTA DE CANCIONES (Scrollable) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#252525] text-gray-500 sticky top-0 z-10">
            <tr>
              <th className="p-2 w-10 text-center">#</th>
              <th className="p-2">Title</th>
              <th className="p-2">Artist</th>
              <th className="p-2">Album</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlaylist.map((track, i) => {
               // Encontramos el índice real en la lista completa para poder reproducirla
               const originalIndex = playlistData.findIndex(t => t.id === track.id);
               const isCurrent = currentTrack.id === track.id;
               
               return (
                <tr 
                    key={track.id} 
                    onClick={() => playTrack(originalIndex)}
                    className={`border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${isCurrent ? 'bg-gray-800 text-amber-500 font-medium' : 'text-gray-400'}`}
                >
                    <td className="p-2 text-center">
                        {isCurrent && isPlaying ? '▶' : originalIndex + 1}
                    </td>
                    <td className="p-2 truncate max-w-[200px]">{track.title}</td>
                    <td className="p-2 truncate max-w-[150px]">{track.artist}</td>
                    <td className="p-2 truncate max-w-[150px] opacity-70">{track.album}</td>
                </tr>
               );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. REPRODUCTOR (Bottom Bar) */}
      <div className="h-20 bg-[#151515] border-t border-gray-800 flex flex-col justify-center px-4 relative">
        {/* Barra de Progreso */}
        <div 
            className="absolute top-0 left-0 w-full h-1 bg-gray-800 cursor-pointer group"
            onClick={handleSeek}
        >
            <div 
                className="h-full bg-amber-600 transition-all duration-100 relative" 
                style={{ width: `${progress}%` }}
            >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
            </div>
        </div>

        <div className="flex items-center justify-between mt-2">
            {/* Controles Izquierda */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => playTrack((currentTrackIndex - 1 + playlistData.length) % playlistData.length)}
                    className="text-gray-400 hover:text-white"
                >
                    <SkipBack size={20} />
                </button>
                <button 
                    onClick={togglePlay} 
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 text-black rounded-full hover:scale-105 transition"
                >
                    {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1"/>}
                </button>
                <button 
                    onClick={() => playTrack((currentTrackIndex + 1) % playlistData.length)}
                    className="text-gray-400 hover:text-white"
                >
                    <SkipForward size={20} />
                </button>
                
                <span className="text-xs font-mono text-gray-500 ml-2">
                    {audioRef.current && formatTime(audioRef.current.currentTime)} / {audioRef.current && !isNaN(audioRef.current.duration) ? formatTime(audioRef.current.duration) : "--:--"}
                </span>
            </div>

            {/* Info Central (Mini) */}
            <div className="hidden md:flex flex-col items-center">
                <span className="text-sm text-gray-300">{currentTrack.title}</span>
            </div>

            {/* Volumen Derecha */}
            <div className="flex items-center gap-2 w-32">
                <Volume2 size={16} className="text-gray-500" />
                <input 
                    type="range" 
                    min="0" max="1" step="0.05" 
                    value={volume}
                    onChange={(e) => {
                        setVolume(e.target.value);
                        audioRef.current.volume = e.target.value;
                    }}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>

        <audio 
          ref={audioRef} 
          src={currentTrack.src} 
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => playTrack((currentTrackIndex + 1) % playlistData.length)}
        />
      </div>
    </div>
  );
}