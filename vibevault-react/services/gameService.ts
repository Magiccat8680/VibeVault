import { Game, GameFolder, ArcadeGame } from '../types';

// --- IndexedDB Configuration ---
const DB_NAME = 'VibeVaultDB';
const STORE_NAME = 'games';
const FOLDERS_STORE_NAME = 'folders';
const ARCADE_STORE_NAME = 'arcadeGames';
const DB_VERSION = 3;

/**
 * Initialize the database
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(FOLDERS_STORE_NAME)) {
        db.createObjectStore(FOLDERS_STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ARCADE_STORE_NAME)) {
        db.createObjectStore(ARCADE_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Save a single game to the database
 */
export const saveGameToDB = async (game: Game): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(game);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Load all games from the database
 */
export const loadGamesFromDB = async (): Promise<Game[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Delete a game from the database
 */
export const deleteGameFromDB = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Clear the entire database (Factory Reset)
 */
export const clearDB = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// --- Game Content Preparation ---

export const prepareGameContent = (game: Game): string => {
  let content = game.content;
  const trimmed = content.trim();
  if (!trimmed.toLowerCase().startsWith('<!doctype') && !trimmed.toLowerCase().startsWith('<html')) {
     content = wrapReactCode(content, game.name);
  }
  return content;
};

export const wrapReactCode = (code: string, filename: string): string => {
  let processedCode = code;
  let componentName = 'VibeApp';
  let foundName = false;

  const exportDefaultFnRegex = /export\s+default\s+(function|class)\s+([a-zA-Z0-9_]+)/;
  const fnMatch = processedCode.match(exportDefaultFnRegex);
  
  if (fnMatch) {
      componentName = fnMatch[2];
      foundName = true;
      processedCode = processedCode.replace(exportDefaultFnRegex, '$1 $2'); 
  }

  if (!foundName) {
     const exportDefaultVarRegex = /export\s+default\s+([a-zA-Z0-9_]+)\s*;?/;
     const varMatch = processedCode.match(exportDefaultVarRegex);
     if (varMatch) {
         componentName = varMatch[1];
         foundName = true;
         processedCode = processedCode.replace(exportDefaultVarRegex, '');
     }
  }

  if (!foundName && processedCode.includes('export default')) {
    processedCode = processedCode.replace(/export\s+default/, 'const VibeApp =');
    componentName = 'VibeApp';
  }

  const hasReactDOMImport = /import\s+[\s\S]*?from\s+['"]react-dom\/client['"]/.test(processedCode);
  let preamble = '';
  const importsReactDefault = /import\s+React/.test(processedCode) || /import\s+[\s\S]*?,\s*React/.test(processedCode);
  
  if (!importsReactDefault) preamble += `import React from 'react';\n`;
  if (!hasReactDOMImport) preamble += `import { createRoot } from 'react-dom/client';\n`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <script>
    window.onerror = function(message, source, lineno, colno, error) {
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = \`<div style="color:#ef4444; background:#1a1a1a; padding:20px; font-family:monospace; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
          <h2 style="font-size:24px; margin-bottom:10px;">Runtime Error</h2>
          <div style="background:#2a0000; padding:15px; border-radius:8px; border:1px solid #ff0000; max-width:800px; text-align:left;">
             <div style="font-weight:bold; margin-bottom:5px;">\${message}</div>
             <div style="font-size:12px; opacity:0.7;">\${source} : \${lineno}:\${colno}</div>
          </div>
        </div>\`;
      }
    };
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18.3.1",
      "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
      "lucide-react": "https://esm.sh/lucide-react@0.469.0?external=react,react-dom",
      "framer-motion": "https://esm.sh/framer-motion@11.15.0?external=react,react-dom",
      "recharts": "https://esm.sh/recharts@2.15.0?external=react,react-dom",
      "clsx": "https://esm.sh/clsx@2.1.1",
      "tailwind-merge": "https://esm.sh/tailwind-merge@2.5.5",
      "date-fns": "https://esm.sh/date-fns@4.1.0"
    }
  }
  </script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { background-color: #000; color: #eee; margin: 0; }
    #root { width: 100%; min-height: 100vh; display: flex; flex-direction: column; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module">
    ${preamble}
    ${processedCode}
    const rootEl = document.getElementById('root');
    if (rootEl) {
      try {
        let ComponentToRender = null;
        try { if (typeof ${componentName} !== 'undefined') ComponentToRender = ${componentName}; } catch(e) {}
        if (!ComponentToRender) {
             if (typeof VibeApp !== 'undefined') ComponentToRender = VibeApp;
             else if (typeof App !== 'undefined') ComponentToRender = App;
             else if (typeof Game !== 'undefined') ComponentToRender = Game;
        }
        if (ComponentToRender) {
           const root = createRoot(rootEl);
           root.render(<ComponentToRender />);
        }
      } catch (e) { console.error(e); }
    }
  </script>
</body>
</html>`;
};

// --- Utilities ---

export const extractTitleFromHtml = (content: string, filename: string): string => {
  try {
    if (filename.match(/\.(jsx?|tsx|js)$/i)) return filename.replace(/\.(jsx?|tsx|js)$/i, '');
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const title = doc.title;
    if (title && title.trim() !== '' && title !== 'Document') return title;
  } catch (e) {}
  return filename.replace(/\.(html?|jsx?|tsx|js)$/i, '');
};

export const readZipFile = async (file: File): Promise<Game[]> => {
    if (!window.JSZip) throw new Error("JSZip library not loaded.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const zip = new window.JSZip();
    const loadedZip = await zip.loadAsync(file);
    const games: Game[] = [];
    const promises: Promise<void>[] = [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loadedZip.forEach((relativePath: string, zipEntry: any) => {
        if (zipEntry.dir || relativePath.includes('__MACOSX')) return;
        const isHtml = relativePath.match(/\.html?$/i);
        const isReact = relativePath.match(/\.(jsx?|tsx|js)$/i); 
        if (!isHtml && !isReact) return;

        const promise = zipEntry.async('string').then((content: string) => {
             let name = relativePath.split('/').pop() || "Unknown";
             let finalContent = content;
             if (isReact) {
                 finalContent = wrapReactCode(content, name);
                 name = name.replace(/\.(jsx?|tsx|js)$/i, '');
             } else {
                 name = extractTitleFromHtml(content, name);
             }
             games.push({
                 id: `imp_zip_${crypto.randomUUID()}`,
                 name,
                 content: finalContent,
                 addedAt: Date.now()
             });
        });
        promises.push(promise);
    });
    await Promise.all(promises);
    return games;
};

export const downloadJson = (filename: string, data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToZip = async (games: Game[]) => {
  if (!window.JSZip) {
    alert('JSZip library not loaded properly.');
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zip = new (window as any).JSZip();
  const folder = zip.folder('vibe_games');

  games.forEach((game) => {
    let filename = game.name.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    if (!filename) filename = 'game_' + game.id;
    folder.file(`${filename}.html`, game.content);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VibeVault_Source_${new Date().toISOString().split('T')[0]}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// --- Folder Operations ---

/**
 * Save a folder
 */
export const saveFolderToDB = async (folder: GameFolder): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FOLDERS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(FOLDERS_STORE_NAME);
    const request = store.put(folder);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Load all folders
 */
export const loadFoldersFromDB = async (): Promise<GameFolder[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FOLDERS_STORE_NAME, 'readonly');
    const store = tx.objectStore(FOLDERS_STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Delete a folder
 */
export const deleteFolderFromDB = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FOLDERS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(FOLDERS_STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// --- Arcade Game Storage ---

/**
 * Save an arcade game to the database
 */
export const saveArcadeGameToDB = async (game: ArcadeGame): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ARCADE_STORE_NAME, 'readwrite');
    const store = tx.objectStore(ARCADE_STORE_NAME);
    const request = store.put(game);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Load all arcade games from the database
 */
export const loadArcadeGamesFromDB = async (): Promise<ArcadeGame[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ARCADE_STORE_NAME, 'readonly');
    const store = tx.objectStore(ARCADE_STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Delete an arcade game from the database
 */
export const deleteArcadeGameFromDB = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ARCADE_STORE_NAME, 'readwrite');
    const store = tx.objectStore(ARCADE_STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};