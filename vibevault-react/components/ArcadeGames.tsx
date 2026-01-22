import React from 'react';
import { Gamepad2, Trash2, User, Calendar } from 'lucide-react';
import { ArcadeGame } from '../types';

interface ArcadeGamesProps {
  games: ArcadeGame[];
  onPlay: (game: ArcadeGame) => void;
  onDelete: (gameId: string) => void;
}

const ArcadeGames: React.FC<ArcadeGamesProps> = ({ games, onPlay, onDelete }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-400 mb-1">No Arcade Games Yet</h3>
        <p className="text-sm text-gray-500">
          Unlock Developer Mode to upload the first game to the arcade!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {games.map((game) => (
        <div
          key={game.id}
          className="group bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] border border-gray-700 hover:border-blue-500 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#47bfff] to-[#1a44c2] p-3 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-white truncate text-sm">{game.name}</h3>
              <div className="flex items-center gap-1 text-xs text-blue-100 mt-1">
                <User size={12} />
                <span>{game.uploaderName}</span>
              </div>
            </div>
            <Gamepad2 className="text-white w-5 h-5 flex-shrink-0" />
          </div>

          {/* Card Body */}
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar size={12} />
              <span>{formatDate(game.uploadedAt)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onPlay(game)}
                className="flex-1 bg-gradient-to-r from-[#47bfff] to-[#1a44c2] hover:brightness-110 text-white font-bold py-2 px-3 rounded text-xs transition-all"
              >
                Play
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${game.name}"?`)) {
                    onDelete(game.id);
                  }
                }}
                className="flex-none bg-red-900 hover:bg-red-800 text-white p-2 rounded transition-colors"
                title="Delete game"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArcadeGames;
