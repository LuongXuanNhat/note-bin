"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { NoteData, BoardState } from "@/types/note";
import { DEFAULT_NOTE_WIDTH, DEFAULT_NOTE_HEIGHT } from "@/lib/grid-utils";
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
  resizeNote: (id: string, width: number, height: number) => void;
  moveNote: (id: string, x: number, y: number) => void;
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

        // Cascading placement to avoid overlapping
        const baseX = 30;
        const baseY = 30;
        const step = 40;
        const count = notesList.length;
        const offsetX = (count * step) % 400;
        const offsetY = (count * step) % 400;

        const newNote: NoteData = {
          id: generateId(),
          x: baseX + offsetX,
          y: baseY + offsetY,
          width: DEFAULT_NOTE_WIDTH,
          height: DEFAULT_NOTE_HEIGHT,
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

        const newNote: NoteData = {
          id: generateId(),
          x: note.x + 30,
          y: note.y + 30,
          width: note.width,
          height: note.height,
          contentHtml: "",
          colorKey: note.colorKey,
          collapsed: false,
        };

        set({ notes: { ...state.notes, [newNote.id]: newNote } });
      },

      deleteNote: (id: string) => {
        const state = get();
        const newNotes = { ...state.notes };
        delete newNotes[id];
        set({ notes: newNotes });
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

      resizeNote: (id: string, width: number, height: number) => {
        const state = get();
        const note = state.notes[id];
        if (!note) return;
        set({
          notes: {
            ...state.notes,
            [id]: { ...note, width, height },
          },
        });
      },

      moveNote: (id: string, x: number, y: number) => {
        const state = get();
        const note = state.notes[id];
        if (!note) return;

        set({
          notes: {
            ...state.notes,
            [id]: { ...note, x, y },
          },
        });
      },
    }),
    {
      name: "note-board-v2",
      storage: createJSONStorage(() => localStorage),
      // Don't hydrate automatically to avoid SSR mismatch
      skipHydration: true,
    }
  )
);
