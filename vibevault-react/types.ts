export interface Game {
  id: string;
  name: string;
  content: string; // The raw HTML content
  addedAt: number;
  lastPlayed?: number;
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