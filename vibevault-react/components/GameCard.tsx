import React, { useMemo } from 'react';
import { Play, Trash2, Calendar } from 'lucide-react';
import { Game } from '../types';
import { formatGameName } from '../utils';

interface GameCardProps {
  game: Game;
  onLaunch: (game: Game) => void;
  onDelete: (id: string) => void;
  onDragStart?: (e: React.DragEvent) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onLaunch, onDelete, onDragStart }) => {
  
  const theme = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < game.name.length; i++) {
      hash = game.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return {
      background: `linear-gradient(135deg, hsl(${hue}, 70%, 20%) 0%, hsl(${(hue + 40) % 360}, 70%, 25%) 100%)`,
    };
  }, [game.name]);

  const handleDelete = (e: React.MouseEvent) => {
    // Strict event handling to prevent bubbling
    e.preventDefault();
    e.stopPropagation();
    onDelete(game.id);
  };

  return (
    <div 
      draggable
      onDragStart={onDragStart}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-[#1b2838] border border-white/10 hover:border-[#66c0f4] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(102,192,244,0.2)] transition-all duration-300 w-full min-h-96 flex-shrink-0 cursor-grab active:cursor-grabbing"
    >
      
      {/* --- DELETE BUTTON (Absolute Overlay - Highest Z-Index) --- */}
      <button 
        type="button"
        onClick={handleDelete}
        className="absolute top-2 right-2 z-50 bg-black/80 hover:bg-red-600 text-white/70 hover:text-white p-2 rounded-full transition-all duration-200 shadow-lg border border-white/10 hover:border-white/40 hover:scale-110"
        title="Delete Game"
      >
        <Trash2 size={16} />
      </button>

      {/* --- THUMBNAIL SECTION (Clickable) --- */}
      <div 
        className="relative w-full flex-1 bg-black overflow-hidden cursor-pointer group/thumbnail"
        onClick={() => onLaunch(game)}
      >
        {/* Background Visuals */}
        <div className="absolute inset-0 pointer-events-none select-none">
             <div className="absolute inset-0" style={theme} />
             <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
                <div style={{ 
                  width: '800px', 
                  height: '600px',
                  transformOrigin: 'top center',
                  transform: 'scale(0.75)',
                  position: 'relative'
                }}>
                  <iframe 
                      srcDoc={game.content}
                      className="border-none pointer-events-none absolute inset-0" 
                      tabIndex={-1}
                      title="preview"
                      style={{ 
                        pointerEvents: 'none',
                        width: '100%',
                        height: '100%'
                      }}
                  />
                </div>
            </div>
        </div>

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-[#66c0f4] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-[0_0_15px_#66c0f4] scale-0 group-hover:scale-100 transition-transform duration-300">
                <Play className="ml-1 w-6 h-6 fill-current" />
            </div>
        </div>
      </div>

      {/* --- INFO SECTION (Clickable) --- */}
      <div 
        className="flex-1 bg-gradient-to-b from-[#171a21] to-[#0f1419] border-t border-white/10 flex flex-col justify-center px-4 py-3 cursor-pointer relative z-10"
        onClick={() => onLaunch(game)}
      >
        <h3 className="font-bold text-gray-200 truncate text-lg group-hover:text-[#66c0f4] transition-colors">
          {formatGameName(game.name)}
        </h3>
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 font-medium">
          <Calendar size={10} />
          <span>{new Date(game.addedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;