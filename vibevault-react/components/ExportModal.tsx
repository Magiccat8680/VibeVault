import React from 'react';
import { Database, FileCode, X } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportJson: () => void;
  onExportZip: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExportJson, onExportZip }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-[#171a21] border border-gray-700 w-full max-w-md rounded-lg shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Database className="text-[#66c0f4]" /> 
            EXPORT LIBRARY
          </h2>
          <p className="text-gray-400 text-sm mb-6">Choose how you want to save your collection.</p>

          <div className="space-y-4">
            <button 
              onClick={() => { onExportJson(); onClose(); }}
              className="w-full text-left bg-[#2a475e] hover:bg-[#3d5a77] hover:translate-x-1 transition-all p-4 rounded border border-transparent hover:border-[#66c0f4] group"
            >
              <div className="flex items-center gap-4">
                <Database className="text-green-400 w-8 h-8" />
                <div>
                  <h3 className="font-bold text-white group-hover:text-[#66c0f4]">VibeVault Backup (.json)</h3>
                  <p className="text-xs text-gray-400">Complete backup. Best for restoring later.</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => { onExportZip(); onClose(); }}
              className="w-full text-left bg-[#2a475e] hover:bg-[#3d5a77] hover:translate-x-1 transition-all p-4 rounded border border-transparent hover:border-[#66c0f4] group"
            >
              <div className="flex items-center gap-4">
                <FileCode className="text-yellow-400 w-8 h-8" />
                <div>
                  <h3 className="font-bold text-white group-hover:text-[#66c0f4]">Source Files (.zip)</h3>
                  <p className="text-xs text-gray-400">Download individual HTML files.</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;