export interface NoteData {
  id: string;
  x: number;        // pixel x position (left)
  y: number;        // pixel y position (top)
  width: number;    // pixel width
  height: number;   // pixel height
  contentHtml: string;
  colorKey: string;
  collapsed: boolean;
  pinned?: boolean;
  zIndex?: number;
}

export interface BoardState {
  notes: Record<string, NoteData>;
  collapsedSize: { width: number; height: number };
  darkMode: boolean;
  searchQuery: string;
  colorFilter: string | null;
  maxZIndex: number;
}

