import { NoteData } from "@/types/note";

export const GRID_GAP = 8;
export const COLUMNS = 72;
export const ROW_HEIGHT_PX = 72;
export const DEFAULT_COL_SPAN = 10;
export const DEFAULT_ROW_SPAN = 3;
export const MAX_COL_SPAN = 45;
export const MAX_ROW_SPAN = 14;

/**
 * Get the width of a single column in pixels.
 */
export function getColumnWidth(boardWidth: number): number {
  return boardWidth / COLUMNS;
}

/**
 * Convert grid position + size to pixel values.
 */
export function gridToPixel(
  row: number,
  col: number,
  colSpan: number,
  rowSpan: number,
  boardWidth: number
): { left: number; top: number; width: number; height: number } {
  const colWidth = getColumnWidth(boardWidth);
  return {
    left: col * colWidth + GRID_GAP / 2,
    top: row * ROW_HEIGHT_PX + GRID_GAP / 2,
    width: colSpan * colWidth - GRID_GAP,
    height: rowSpan * ROW_HEIGHT_PX - GRID_GAP,
  };
}

/**
 * Snap a pixel x-coordinate to the nearest column index.
 */
export function snapCol(px: number, boardWidth: number): number {
  const colWidth = getColumnWidth(boardWidth);
  return Math.max(0, Math.round(px / colWidth));
}

/**
 * Snap a pixel y-coordinate to the nearest row index.
 */
export function snapRow(py: number): number {
  return Math.max(0, Math.round(py / ROW_HEIGHT_PX));
}

/**
 * Snap a pixel width to the nearest column span (clamped 1..MAX_COL_SPAN).
 */
export function snapColSpan(px: number, boardWidth: number): number {
  const colWidth = getColumnWidth(boardWidth);
  return Math.max(1, Math.min(MAX_COL_SPAN, Math.round(px / colWidth)));
}

/**
 * Snap a pixel height to the nearest row span (clamped 1..MAX_ROW_SPAN).
 */
export function snapRowSpan(py: number): number {
  return Math.max(1, Math.min(MAX_ROW_SPAN, Math.round(py / ROW_HEIGHT_PX)));
}

/**
 * Find the first empty cell scanning left-to-right, top-to-bottom.
 */
export function findFirstEmptyCell(
  notes: NoteData[],
  maxRow: number
): { row: number; col: number } | null {
  const occupied = new Set(notes.map((n) => `${n.row},${n.col}`));

  for (let row = 0; row <= maxRow + 1; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      if (!occupied.has(`${row},${col}`)) {
        return { row, col };
      }
    }
  }
  return { row: maxRow + 2, col: 0 };
}

/**
 * Get the max row from notes.
 */
export function getGridBounds(notes: NoteData[]): { maxRow: number } {
  let maxRow = -1;
  for (const note of notes) {
    if (note.row > maxRow) maxRow = note.row;
  }
  return { maxRow };
}

/**
 * Shift all notes with row > row down by 1.
 */
export function insertRowAfter(notes: NoteData[], row: number): NoteData[] {
  return notes.map((note) => {
    if (note.row > row) {
      return { ...note, row: note.row + 1 };
    }
    return note;
  });
}

