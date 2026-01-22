export interface Game {
  id: string;
  name: string;
  content: string; // The raw HTML content
  addedAt: number;
  lastPlayed?: number;
  folderId?: string; // Reference to parent folder
}

export interface GameFolder {
  id: string;
  name: string;
  createdAt: number;
}

export interface ArcadeGame extends Game {
  uploaderName: string;
  uploadedAt: number;
  likes?: number;
}

export interface StorageStats {
  count: number;
  totalSize: string;
}

// Declaration for JSZip loaded via CDN
declare global {
  interface Window {
    JSZip: any;
  }
}