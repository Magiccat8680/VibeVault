import React, { useState, useEffect, useRef, useCallback } from "react";
import { Game, GameFolder } from './types';
import Header from './components/Header';
import GameCard from './components/GameCard';
import ExportModal from './components/ExportModal';
import PlayOverlay from './components/PlayOverlay';
import { 
  extractTitleFromHtml, 
  downloadJson, 
  exportToZip, 
  readZipFile, 
  wrapReactCode,
  loadGamesFromDB,
  saveGameToDB,
  deleteGameFromDB,
  clearDB,
  loadFoldersFromDB,
  saveFolderToDB,
  deleteFolderFromDB
} from './services/gameService';
import { HardDrive, Loader2, Ghost, Plus, Folder, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [folders, setFolders] = useState<GameFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [playingGame, setPlayingGame] = useState<Game | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  
  // Hidden inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Initial Load from DB
  useEffect(() => {
    const init = async () => {
      try {
        const storedGames = await loadGamesFromDB();
        const storedFolders = await loadFoldersFromDB();
        setGames(storedGames);
        setFolders(storedFolders);
      } catch (e) {
        console.error("Failed to load games from DB", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // --- Handlers ---

  const handleLaunch = useCallback((game: Game) => {
    setPlayingGame(game);
  }, []);

  const updateGame = useCallback(async (id: string, updates: Partial<Game>) => {
    // 1. Optimistic Update UI
    setGames(prev => {
        const updatedList = prev.map(g => g.id === id ? { ...g, ...updates } : g);
        return updatedList;
    });
    
    // 2. Update DB
    try {
        const gameToUpdate = games.find(g => g.id === id);
        if (gameToUpdate) {
            const newItem = { ...gameToUpdate, ...updates };
            await saveGameToDB(newItem);
        }
    } catch(e) { console.error("Update failed", e); }

    setPlayingGame(prev => {
        if (prev && prev.id === id) {
            return { ...prev, ...updates };
        }
        return prev;
    });
  }, [games]);

  const generateId = () => {
    try {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return `local_${crypto.randomUUID()}`;
        }
    } catch (e) {}
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const createFolder = async (name: string) => {
    if (!name.trim()) return;
    const newFolder: GameFolder = {
      id: generateId(),
      name: name.trim(),
      createdAt: Date.now()
    };
    try {
      await saveFolderToDB(newFolder);
      setFolders(prev => [...prev, newFolder]);
      setNewFolderName('');
      setShowNewFolderInput(false);
    } catch (e) {
      console.error("Failed to create folder", e);
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (window.confirm("Delete this folder? Games inside will be moved to the library root.")) {
      try {
        // Move games from this folder to root
        const gamesInFolder = games.filter(g => g.folderId === folderId);
        for (const game of gamesInFolder) {
          const updatedGame = { ...game, folderId: undefined };
          await saveGameToDB(updatedGame);
        }
        setGames(prev => prev.map(g => g.folderId === folderId ? { ...g, folderId: undefined } : g));
        
        // Delete folder
        await deleteFolderFromDB(folderId);
        setFolders(prev => prev.filter(f => f.id !== folderId));
        if (selectedFolder === folderId) {
          setSelectedFolder(null);
        }
      } catch (e) {
        console.error("Failed to delete folder", e);
      }
    }
  };

  const handleGameDragStart = (gameId: string) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('gameId', gameId);
  };

  const handleFolderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleFolderDrop = (folderId: string | null) => async (e: React.DragEvent) => {
    e.preventDefault();
    const gameId = e.dataTransfer.getData('gameId');
    if (!gameId) return;

    try {
      const gameToUpdate = games.find(g => g.id === gameId);
      if (gameToUpdate) {
        const updatedGame = { ...gameToUpdate, folderId: folderId || undefined };
        await saveGameToDB(updatedGame);
        setGames(prev => prev.map(g => g.id === gameId ? updatedGame : g));
      }
    } catch (e) {
      console.error("Failed to move game", e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setProcessing(true);
    const files = Array.from(e.target.files) as File[];
    
    for (const file of files) {
      try {
        const text = await file.text();
        let content = text;
        let title = file.name;

        if (file.name.match(/\.(jsx?|tsx|js)$/i)) {
             content = wrapReactCode(text, file.name);
             title = file.name.replace(/\.(jsx?|tsx|js)$/i, '');
        } else {
             title = extractTitleFromHtml(text, file.name);
        }
        
        const newGame: Game = {
          id: generateId(),
          name: title,
          content: content,
          addedAt: Date.now()
        };

        // Save individually to DB to be safe
        await saveGameToDB(newGame);
        setGames(prev => [newGame, ...prev]);

      } catch (err) {
        console.error(`Failed to read file ${file.name}`, err);
      }
    }

    setProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      let importedGames: Game[] = [];

      if (file.name.endsWith('.zip')) {
          importedGames = await readZipFile(file);
      } else {
          const text = await file.text();
          const json = JSON.parse(text);
          if (Array.isArray(json)) importedGames = json;
          else if (json.games && Array.isArray(json.games)) importedGames = json.games;
      }

      const validGames = importedGames.filter(g => g.name && g.content);

      if (validGames.length > 0) {
        if (window.confirm(`Found ${validGames.length} valid games in ${file.name}. Import them?`)) {
          const cleaned = validGames.map(g => ({
            ...g,
            id: generateId(),
            addedAt: g.addedAt || Date.now()
          }));
          
          // Save all to DB
          for (const g of cleaned) {
            await saveGameToDB(g);
          }
          
          setGames(prev => [...prev, ...cleaned]);
        }
      } else {
        alert("No valid HTML games found in import file.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to import file. Ensure it is a valid JSON backup or ZIP archive.");
    } finally {
      setProcessing(false);
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const deleteGame = useCallback(async (id: string) => {
    // Bypass window.confirm to ensure it works in all environments
    console.log("Deleting game:", id);
    
    // 1. Optimistic UI update
    setGames(prev => prev.filter(g => g.id !== id));

    try {
        // 2. DB update
        await deleteGameFromDB(id);
        console.log("Successfully deleted from DB");
    } catch(e) {
        console.error("Failed to delete game from DB", e);
        // Optional: rollback state if needed, but for local apps, failure is rare unless storage is broken
    }
  }, []);

  const handleDebug = async () => {
    const msg = `
      Storage Diagnostics:
      - System: IndexedDB (Unlimited Storage)
      - Items: ${games.length}
      
      Click OK to keep current data.
      Click Cancel to WIPE ALL DATA (Factory Reset).
    `;
    if (!window.confirm(msg)) {
      if (window.confirm("FINAL WARNING: This will delete all your stored games. Continue?")) {
        await clearDB();
        setGames([]);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1b2838] text-gray-300 font-sans">
      
      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".html,.htm,.jsx,.tsx,.js" 
        multiple 
        onChange={handleFileUpload} 
      />
      <input 
        type="file" 
        ref={importInputRef} 
        className="hidden" 
        accept=".json,.zip" 
        onChange={handleImport} 
      />

      <Header 
        gameCount={games.length}
        onAddClick={() => fileInputRef.current?.click()}
        onImportClick={() => importInputRef.current?.click()}
        onExportClick={() => setShowExportModal(true)}
        onDebugClick={handleDebug}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        
        <div className="flex items-center justify-between mb-8 text-sm text-gray-500">
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-600/50 rounded text-green-500 font-bold uppercase tracking-wider text-xs">
              <HardDrive size={12} /> IndexedDB Active
             </span>
             {processing && (
               <span className="flex items-center gap-2 text-[#66c0f4] animate-pulse">
                 <Loader2 size={14} className="animate-spin" /> PROCESSING DATA...
               </span>
             )}
          </div>
        </div>

        {loading ? (
           <div className="flex justify-center mt-20">
              <Loader2 className="animate-spin text-[#66c0f4]" size={40} />
           </div>
        ) : (
          <>
            {/* Folder Management */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Folder size={18} /> Organization
                </h3>
                {!showNewFolderInput && (
                  <button
                    onClick={() => setShowNewFolderInput(true)}
                    className="flex items-center gap-2 bg-[#2a475e] hover:bg-[#3d5a77] text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    <Plus size={14} /> New Folder
                  </button>
                )}
              </div>

              {showNewFolderInput && (
                <div className="flex gap-2 mb-4 p-3 bg-[#2a475e] rounded">
                  <input
                    type="text"
                    placeholder="Folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        createFolder(newFolderName);
                      } else if (e.key === 'Escape') {
                        setShowNewFolderInput(false);
                        setNewFolderName('');
                      }
                    }}
                    className="flex-1 bg-[#1b2838] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#66c0f4]"
                    autoFocus
                  />
                  <button
                    onClick={() => createFolder(newFolderName)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowNewFolderInput(false);
                      setNewFolderName('');
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {folders.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setSelectedFolder(null)}
                    onDragOver={handleFolderDragOver}
                    onDrop={handleFolderDrop(null)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      selectedFolder === null
                        ? 'bg-[#66c0f4] text-white'
                        : 'bg-[#2a475e] text-gray-300 hover:bg-[#3d5a77]'
                    }`}
                  >
                    All Games ({games.length})
                  </button>
                  {folders.map(folder => (
                    <div key={folder.id} className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedFolder(folder.id)}
                        onDragOver={handleFolderDragOver}
                        onDrop={handleFolderDrop(folder.id)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          selectedFolder === folder.id
                            ? 'bg-[#66c0f4] text-white'
                            : 'bg-[#2a475e] text-gray-300 hover:bg-[#3d5a77]'
                        }`}
                      >
                        {folder.name} ({games.filter(g => g.folderId === folder.id).length})
                      </button>
                      <button
                        onClick={() => deleteFolder(folder.id)}
                        className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                        title="Delete folder"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Games Display */}
            {games.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {games
                  .filter(g => selectedFolder === null ? !g.folderId : g.folderId === selectedFolder)
                  .sort((a, b) => b.addedAt - a.addedAt)
                  .map(game => (
                    <GameCard 
                      key={game.id} 
                      game={game} 
                      onLaunch={handleLaunch} 
                      onDelete={deleteGame}
                      onDragStart={handleGameDragStart(game.id)}
                    />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-600">
                <Ghost size={64} className="mb-4 opacity-50" />
                <h2 className="text-xl font-bold mb-2">Library Empty</h2>
                <p className="max-w-xs text-center">
                  Your vault is empty. Click <span className="text-[#66c0f4] font-bold">ADD GAME</span> to upload HTML files or React components (.jsx/.tsx).
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {playingGame && (
          <PlayOverlay 
            game={playingGame} 
            onClose={() => setPlayingGame(null)} 
            onUpdateGame={updateGame}
          />
      )}

      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportJson={() => downloadJson(`VibeVault_Backup_${Date.now()}.json`, { v: "react-1.0", games })}
        onExportZip={() => exportToZip(games)}
      />
    </div>
  );
};

export default App;