import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import videoData from '../data/videos.json';

// --- Card Component ---
const Card = ({ video, index, total, onSwipe, isFront }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]); 
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]); 

  const handleDragEnd = (event, info) => {
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
      onDragEnd={handleDragEnd}
      animate={{
        scale: 1 - index * 0.05,
        y: index * 15,
        zIndex: total - index,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      // USE YOUR GLOBAL CLASSES HERE:
      className="cueva-card deck-card"
    >
      <div className="card-inner">
        <div className="card-header">
           <span className="cueva-mono cueva-accent text-xs">ITEM NO. 0{index + 1}</span>
           <div className="holo-sticker animate-spin-slow"></div>
        </div>

        <div className="video-container">
            {/* Interaction layer controls clickability vs draggability */}
            <div className="video-interaction-layer">
                 <iframe 
                    src={`https://www.youtube.com/embed/${video.id}`} 
                    title={video.title} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    style={{ width: '100%', height: '100%', pointerEvents: isFront ? 'auto' : 'none' }}
                 ></iframe>
            </div>
            {/* Drag Handle: Invisible border to grab the card without clicking the iframe */}
            <div className="drag-handle"></div>
        </div>

        <div className="card-content">
          <h3 className="cueva-mono cueva-text text-lg mb-2">{video.title}</h3>
          
          {/* Using your specific clamp class */}
          <p className="cueva-muted cueva-mono text-sm cueva-clamp-4">
            {video.desc}
          </p>
        </div>
        
        <div className="card-footer">
            <span className="cueva-mono cueva-accent text-xs blink-text">
                {isFront ? '< SWIPE TO ARCHIVE >' : 'LOCKED'}
            </span>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Deck Container ---
export default function VideoDeck() {
  const [cards, setCards] = useState(videoData);

  const moveToEnd = (fromIndex) => {
    setCards((currentCards) => {
      const newCards = [...currentCards];
      const item = newCards.shift(); 
      newCards.push(item);
      return newCards;
    });
  };

  return (
    <div className="deck-wrapper">
        <div className="deck-container">
            {cards.map((video, index) => {
                if (index > 2) return null; // Only render top 3 for performance
                return (
                    <Card 
                        key={video.id} 
                        video={video} 
                        index={index} 
                        total={cards.length}
                        isFront={index === 0}
                        onSwipe={() => moveToEnd(index)}
                    />
                );
            })}
        </div>
        
        {/* Only custom layout CSS here. Colors/Fonts come from global.css now. */}
        <style>{`
            .deck-wrapper {
                width: 100%;
                height: 75vh; 
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                position: relative;
            }
            .deck-container {
                position: relative;
                width: 85%;      /* Responsive width */
                max-width: 320px; 
                height: 500px;
            }
            .deck-card {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 12px;
                overflow: hidden;
                /* Note: background/border are handled by .cueva-card */
            }
            
            .card-inner {
                display: flex;
                flex-direction: column;
                height: 100%;
                padding: 15px;
                /* A subtle gradient on top of your base card color */
                background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.2) 100%);
            }

            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .holo-sticker {
                width: 16px;
                height: 16px;
                background: linear-gradient(45deg, var(--color-highlight), magenta, cyan);
                border-radius: 50%;
                opacity: 0.8;
                box-shadow: 0 0 5px var(--color-highlight);
            }

            .video-container {
                position: relative;
                width: 100%;
                padding-bottom: 56.25%; 
                background: #000;
                margin-bottom: 15px;
                border: 1px solid #333;
            }
            .video-interaction-layer {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
            }
            .drag-handle {
                position: absolute;
                top: -15px; bottom: -15px; left: -15px; right: -15px;
                z-index: -1;
            }

            .card-footer {
                margin-top: auto;
                text-align: center;
                padding-top: 10px;
                border-top: 1px dashed var(--color-text-accent);
            }
            
            .blink-text {
                animation: blink 2s infinite;
            }
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `}</style>
    </div>
  );
}