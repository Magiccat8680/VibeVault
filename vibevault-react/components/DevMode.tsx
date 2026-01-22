import React, { useState } from 'react';
import { X, Lock, Upload } from 'lucide-react';

interface DevModeProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onUploadGame: (uploaderName: string, gameFile: File) => void;
}

const DevMode: React.FC<DevModeProps> = ({ isOpen, onClose, onSuccess, onUploadGame }) => {
  const [code, setCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploaderName, setUploaderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    const devCode = import.meta.env.VITE_DEV_CODE || '';
    if (code === devCode) {
      setIsAuthenticated(true);
      setMessage('');
    } else {
      setMessage('Invalid dev code');
    }
    setCode('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMessage('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploaderName.trim()) {
      setMessage('Please select a file and enter your name');
      return;
    }

    setLoading(true);
    try {
      onUploadGame(uploaderName.trim(), selectedFile);
      setMessage('Game uploaded successfully! 🎮');
      setSelectedFile(null);
      setUploaderName('');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      setMessage('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#171a21] border border-gray-700 rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-[#171a21]">
          <div className="flex items-center gap-2">
            <Lock className="text-yellow-500" size={20} />
            <h2 className="text-lg font-bold text-white">Developer Mode</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!isAuthenticated ? (
            <form onSubmit={handleSubmitCode} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Enter Dev Code
                </label>
                <input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {message && (
                <div className="text-sm text-red-400 text-center">{message}</div>
              )}

              <button
                type="submit"
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Authenticate
              </button>
            </form>
          ) : (
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded p-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-300 font-semibold">Authenticated</span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Game File (HTML, React, or ZIP)
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".html,.jsx,.js,.tsx,.ts,.zip"
                  className="w-full text-sm text-gray-400 file:mr-3 file:bg-blue-600 file:hover:bg-blue-700 file:text-white file:px-3 file:py-1 file:rounded file:cursor-pointer file:font-semibold"
                />
                {selectedFile && (
                  <div className="text-xs text-gray-400 mt-1 truncate">
                    Selected: {selectedFile.name}
                  </div>
                )}
              </div>

              {message && (
                <div className={`text-sm text-center ${message.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthenticated(false);
                    setMessage('');
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedFile || !uploaderName.trim()}
                  className="flex-1 bg-gradient-to-r from-[#47bfff] to-[#1a44c2] hover:brightness-110 disabled:brightness-75 text-white font-bold py-2 px-4 rounded transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevMode;
