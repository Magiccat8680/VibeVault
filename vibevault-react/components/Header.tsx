import React from 'react';
import { Gamepad2, Plus, Download, Upload, Bug } from 'lucide-react';

interface HeaderProps {
  gameCount: number;
  onAddClick: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
  onDebugClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  gameCount, 
  onAddClick, 
  onImportClick, 
  onExportClick,
  onDebugClick
}) => {
  return (
    <header className="bg-[#171a21] border-b border-gray-800 shadow-xl sticky top-0 z-40">
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Logo Area */}
        <div className="flex items-center gap-4 select-none">
          <Gamepad2 className="text-[#66c0f4] w-10 h-10" />
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white leading-none">
              VibeVault
            </h1>
            <span className="text-xs text-gray-500 font-mono tracking-wide">
              LOCAL LIBRARY v4.7 • {gameCount} ITEMS
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 bg-gradient-to-r from-[#47bfff] to-[#1a44c2] hover:brightness-110 text-white px-4 py-2 rounded-sm text-sm font-bold shadow-lg transition-all whitespace-nowrap"
          >
            <Plus size={16} /> ADD GAME
          </button>
          
          <div className="h-8 w-px bg-gray-700 mx-1 hidden md:block"></div>

          <button 
            onClick={onExportClick}
            className="flex items-center gap-2 bg-[#2a475e] hover:bg-[#3d5a77] text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Download size={16} /> EXPORT
          </button>

          <button 
            onClick={onImportClick}
            className="flex items-center gap-2 bg-[#2a475e] hover:bg-[#3d5a77] text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Upload size={16} /> IMPORT
          </button>

          <button 
            onClick={onDebugClick}
            className="p-2 text-gray-500 hover:text-red-400 transition-colors"
            title="Debug"
          >
            <Bug size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;