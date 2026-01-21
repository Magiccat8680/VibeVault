import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Game } from './types';
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
  clearDB
} from './services/gameService';
import { HardDrive, Loader2, Ghost } from 'lucide-react';

const App: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [playingGame, setPlayingGame] = useState<Game | null>(null);
  
  // Hidden inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Initial Load from DB
  useEffect(() => {
    const init = async () => {
      try {
        const storedGames = await loadGamesFromDB();
        setGames(storedGames);
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
        ) : games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {games
              .sort((a, b) => b.addedAt - a.addedAt)
              .map(game => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  onLaunch={handleLaunch} 
                  onDelete={deleteGame}
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