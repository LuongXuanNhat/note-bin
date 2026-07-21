export interface NoteData {
  id: string;
  x: number;        // pixel x position (left)
  y: number;        // pixel y position (top)
  width: number;    // pixel width
  height: number;   // pixel height
  contentHtml: string;
  colorKey: string;
  collapsed: boolean;
}

export interface BoardState {
  notes: Record<string, NoteData>;
  collapsedSize: { width: number; height: number };
}
