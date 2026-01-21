import React, { useEffect, useState } from 'react';
import { X, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { Game } from '../types';
import { prepareGameContent } from '../services/gameService';
import { formatGameName } from '../utils';

interface PlayOverlayProps {
  game: Game;
  onClose: () => void;
  onUpdateGame: (id: string, updates: Partial<Game>) => void;
}

const PlayOverlay: React.FC<PlayOverlayProps> = ({ game, onClose, onUpdateGame }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [srcUrl, setSrcUrl] = useState<string>('');
  
  // Initialize Game
  useEffect(() => {
    const finalHtml = prepareGameContent(game);
    const blob = new Blob([finalHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setSrcUrl(url);

    // Update last played
    onUpdateGame(game.id, { lastPlayed: Date.now() });

    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err));
    } else {
        document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-in fade-in duration-200 font-sans">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#171a21] border-b border-gray-800 text-gray-300 select-none h-14 shrink-0">
            <h2 className="font-bold truncate max-w-md flex items-center gap-2 text-sm md:text-base">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {formatGameName(game.name)}
            </h2>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => {
                        if(window.confirm("Restart game?")) {
                            setSrcUrl('');
                            setTimeout(() => {
                                const html = prepareGameContent(game);
                                setSrcUrl(URL.createObjectURL(new Blob([html], {type: 'text/html'})));
                            }, 50);
                        }
                    }}
                    className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                    title="Restart"
                >
                    <RotateCcw size={18} />
                </button>

                <button 
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                    title="Fullscreen"
                >
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                
                <button 
                    onClick={onClose}
                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded transition-colors ml-2"
                >
                    <X size={18} />
                </button>
            </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 bg-black relative w-full overflow-hidden">
             {srcUrl ? (
                 <iframe 
                    src={srcUrl}
                    className="w-full h-full border-none block"
                    sandbox="allow-scripts allow-same-origin allow-modals allow-popups allow-pointer-lock allow-forms"
                    allowFullScreen
                 />
             ) : (
                 <div className="w-full h-full flex items-center justify-center text-[#66c0f4]">
                     Loading...
                 </div>
             )}
        </div>
    </div>
  );
};

export default PlayOverlay;