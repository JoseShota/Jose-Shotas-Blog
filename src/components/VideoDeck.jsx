import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import videoData from '../data/videos.json';

// --- The Expanded Modal (Glass Layer) ---
const ExpandedCard = ({ video, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="expanded-overlay"
      onClick={onClose} // Clicking background closes it
    >
      <div className="expanded-card cueva-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="expanded-header">
           <span className="cueva-mono cueva-accent text-xs">ARCHIVE ITEM: {video.title}</span>
           <button onClick={onClose} className="close-btn">X</button>
        </div>

        {/* Video Area - LOADS IFRAME NOW (Performance win) */}
        <div className="expanded-video">
           <iframe 
               src={`https://www.youtube.com/embed/${video.id}?autoplay=1`} 
               title={video.title} 
               frameBorder="0" 
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
               allowFullScreen
               style={{ width: '100%', height: '100%' }}
            ></iframe>
        </div>

        {/* Scrollable Content */}
        <div className="expanded-content">
           <h2 className="cueva-mono cueva-text text-xl mb-3">{video.title}</h2>
           <p className="cueva-muted cueva-mono text-sm leading-relaxed">
             {video.desc}
             <br/><br/>
             <span className="cueva-accent">>> END OF RECORD.</span>
           </p>
        </div>
      </div>
    </motion.div>
  );
};

// --- The Swipeable Card ---
const Card = ({ video, index, total, onSwipe, isFront, onExpand }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]); 
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]); 

  const handleDragEnd = (event, info) => {
    // If dragged far enough, swipe.
    if (Math.abs(info.offset.x) > 100) {
      onSwipe();
    }
  };

  return (
    <motion.div
      style={{
        zIndex: total - index,
        x: isFront ? x : 0,
        rotate: isFront ? rotate : 0,
        opacity: isFront ? opacity : 1 - index * 0.1, 
        scale: 1 - index * 0.05,
        y: index * 15,
        cursor: 'grab',
      }}
      drag={isFront ? 'x' : false} 
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1} // Makes it feel "tighter" and smoother
      onDragEnd={handleDragEnd}
      // If clicked (and not dragged), trigger expand
      onTap={() => { if(isFront) onExpand(); }} 
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="cueva-card deck-card"
    >
      <div className="card-inner">
        <div className="card-header">
           <span className="cueva-mono cueva-accent text-xs">ITEM NO. 0{index + 1}</span>
           {/* SPINNER REMOVED HERE */}
        </div>

        <div className="video-container">
            {/* THUMBNAIL ONLY - Massive speed boost */}
            <img 
                src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                alt="Video Thumbnail"
                className="video-thumb"
            />
            <div className="play-overlay">▶</div>
        </div>

        <div className="card-content">
          <h3 className="cueva-mono cueva-text text-lg mb-2 truncate">{video.title}</h3>
          {/* Clamp still useful for preview, full text is in expanded view */}
          <p className="cueva-muted cueva-mono text-sm cueva-clamp-4">
            {video.desc}
          </p>
        </div>
        
        <div className="card-footer">
            <span className="cueva-mono cueva-accent text-xs">
                {isFront ? '[ TAP TO INSPECT / SWIPE >> ]' : 'LOCKED'}
            </span>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Container ---
export default function VideoDeck() {
  const [cards, setCards] = useState(videoData);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const moveToEnd = (fromIndex) => {
    setCards((currentCards) => {
      const newCards = [...currentCards];
      const item = newCards.shift(); 
      newCards.push(item);
      return newCards;
    });
  };

  return (
    <>
    <div className="deck-wrapper">
        <div className="deck-container">
            {cards.map((video, index) => {
                if (index > 2) return null; 
                return (
                    <Card 
                        key={video.id} 
                        video={video} 
                        index={index} 
                        total={cards.length}
                        isFront={index === 0}
                        onSwipe={() => moveToEnd(index)}
                        onExpand={() => setSelectedVideo(video)}
                    />
                );
            })}
        </div>
        
        {/* Expanded View Modal */}
        <AnimatePresence>
            {selectedVideo && (
                <ExpandedCard 
                    video={selectedVideo} 
                    onClose={() => setSelectedVideo(null)} 
                />
            )}
        </AnimatePresence>

        <style>{`
            .deck-wrapper {
                width: 100%;
                height: 80vh; 
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            .deck-container {
                position: relative;
                width: 85%;
                max-width: 340px; 
                height: 520px;
            }
            .deck-card {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }
            /* Solid background as requested (No Transparency) */
            .card-inner {
                display: flex;
                flex-direction: column;
                height: 100%;
                padding: 15px;
                background: #080808; 
            }

            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                height: 20px;
            }

            .video-container {
                position: relative;
                width: 100%;
                aspect-ratio: 16/9;
                background: #000;
                margin-bottom: 15px;
                border: 1px solid #333;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            .video-thumb {
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: 0.8;
            }
            .play-overlay {
                position: absolute;
                font-size: 2rem;
                color: var(--color-highlight);
                text-shadow: 0 0 10px rgba(0,0,0,0.8);
            }

            .card-content {
                flex-grow: 1;
                overflow: hidden;
            }

            .card-footer {
                margin-top: auto;
                text-align: center;
                padding-top: 10px;
                border-top: 1px dashed var(--color-text-accent);
            }

            /* --- EXPANDED MODAL STYLES --- */
            .expanded-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.85); /* Glass darken effect */
                backdrop-filter: blur(5px);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .expanded-card {
                width: 100%;
                max-width: 500px;
                max-height: 90vh; /* Don't overflow screen */
                background: #050505;
                border: 1px solid var(--color-highlight);
                display: flex;
                flex-direction: column;
                border-radius: 8px;
                box-shadow: 0 0 30px rgba(35, 144, 158, 0.2);
            }
            .expanded-header {
                padding: 15px;
                border-bottom: 1px solid #333;
                display: flex;
                justify-content: space-between;
            }
            .close-btn {
                background: none;
                border: 1px solid var(--color-text-accent);
                color: var(--color-text-light);
                width: 30px; height: 30px;
                border-radius: 50%;
                cursor: pointer;
            }
            .expanded-video {
                width: 100%;
                aspect-ratio: 16/9;
                background: #000;
                flex-shrink: 0; /* Keep video visible */
            }
            .expanded-content {
                padding: 20px;
                overflow-y: auto; /* ENABLE SCROLLING */
                -webkit-overflow-scrolling: touch;
            }
        `}</style>
    </div>
    </>
  );
}