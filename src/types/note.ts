export interface NoteData {
  id: string;
  row: number;
  col: number;
  width: number;    // column span (default 10)
  height: number;   // row span (default 3)
  contentHtml: string;
  colorKey: string;
  collapsed: boolean;
}

export interface BoardState {
  notes: Record<string, NoteData>;
  collapsedSize: { width: number; height: number };
}
