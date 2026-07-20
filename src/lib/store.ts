"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { NoteData, BoardState } from "@/types/note";
import {
  findFirstEmptyCell,
  getGridBounds,
  insertRowAfter,
  DEFAULT_COL_SPAN,
  DEFAULT_ROW_SPAN,
  COLUMNS,
} from "@/lib/grid-utils";
import { DEFAULT_COLOR_KEY } from "@/lib/colors";

let noteCounter = 0;

function generateId(): string {
  noteCounter++;
  return `note-${Date.now()}-${noteCounter}`;
}

const DEFAULT_COLLAPSED_SIZE = { width: 260, height: 48 };

interface BoardActions {
  addNoteGlobal: () => void;
  duplicateNote: (id: string) => void;
  deleteNote: (id: string) => void;
  updateContent: (id: string, html: string) => void;
  setColor: (id: string, colorKey: string) => void;
  toggleCollapse: (id: string) => void;
  resizeNote: (id: string, colSpan: number, rowSpan: number) => void;
  moveNote: (id: string, targetRow: number, targetCol: number) => void;
}

export type BoardStore = BoardState & BoardActions;

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      // State
      notes: {},
      collapsedSize: DEFAULT_COLLAPSED_SIZE,

      // Actions
      addNoteGlobal: () => {
        const state = get();
        const notesList = Object.values(state.notes);
        const { maxRow } = getGridBounds(notesList);
        const cell = findFirstEmptyCell(notesList, Math.max(maxRow, 0));

        let targetRow: number;
        let targetCol: number;

        if (cell) {
          targetRow = cell.row;
          targetCol = cell.col;
        } else {
          targetRow = Math.max(maxRow, 0) + 1;
          targetCol = 0;
        }

        const newNote: NoteData = {
          id: generateId(),
          row: targetRow,
          col: targetCol,
          width: DEFAULT_COL_SPAN,
          height: DEFAULT_ROW_SPAN,
          contentHtml: "",
          colorKey: DEFAULT_COLOR_KEY,
          collapsed: false,
        };

        set({ notes: { ...state.notes, [newNote.id]: newNote } });
      },

      duplicateNote: (id: string) => {
        const state = get();
        const note = state.notes[id];
        if (!note) return;

        const notesList = Object.values(state.notes);
        const occupied = new Set(notesList.map((n) => `${n.row},${n.col}`));

        let newRow = note.row;
        let newCol = note.col;

        // Try right first, then left, then new row below
        for (const offset of [1, -1]) {
          const c = note.col + offset;
          if (c >= 0 && c < COLUMNS && !occupied.has(`${note.row},${c}`)) {
            newCol = c;
            newRow = note.row;
            break;
          }
        }

        if (newCol === note.col && newRow === note.row) {
          // Both sides occupied → insert row below
          const updatedNotes = insertRowAfter(notesList, note.row);
          newRow = note.row + 1;
          const updatedMap: Record<string, NoteData> = {};
          for (const n of updatedNotes) {
            updatedMap[n.id] = n;
          }
          set({ notes: { ...state.notes, ...updatedMap } });
        }

        const newNote: NoteData = {
          id: generateId(),
          row: newRow,
          col: newCol,
          width: note.width,
          height: note.height,
          contentHtml: "",
          colorKey: note.colorKey,
          collapsed: false,
        };

        set({ notes: { ...get().notes, [newNote.id]: newNote } });
      },

      deleteNote: (id: string) => {
        const state = get();
        const { [id]: removed, ...rest } = state.notes;
        set({ notes: rest });
      },

      updateContent: (id: string, html: string) => {
        const state = get();
        const note = state.notes[id];
        if (!note) return;
        set({
          notes: { ...state.notes, [id]: { ...note, contentHtml: html } },
        });
      },

      setColor: (id: string, colorKey: string) => {
        const state = get();
        const note = state.notes[id];
        if (!note) return;
        set({
          notes: { ...state.notes, [id]: { ...note, colorKey } },
        });
      },

      toggleCollapse: (id: string) => {
        const state = get();
        const note = state.notes[id];
        if (!note) return;
        set({
          notes: {
            ...state.notes,
            [id]: { ...note, collapsed: !note.collapsed },
          },
        });
      },

      resizeNote: (id: string, colSpan: number, rowSpan: number) => {
        const state = get();
        const note = state.notes[id];
        if (!note) return;
        set({
          notes: {
            ...state.notes,
            [id]: { ...note, width: colSpan, height: rowSpan },
          },
        });
      },

      moveNote: (id: string, targetRow: number, targetCol: number) => {
        const state = get();
        const note = state.notes[id];
        if (!note) return;

        const clampedRow = Math.max(0, targetRow);
        const clampedCol = Math.max(0, Math.min(COLUMNS - 1, targetCol));

        // Allow overlap — simply move the note
        set({
          notes: {
            ...state.notes,
            [id]: { ...note, row: clampedRow, col: clampedCol },
          },
        });
      },
    }),
    {
      name: "note-board-v1",
      storage: createJSONStorage(() => localStorage),
      // Don't hydrate automatically to avoid SSR mismatch
      skipHydration: true,
    }
  )
);
