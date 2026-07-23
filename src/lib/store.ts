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
  toggleDarkMode: () => void;
  setSearchQuery: (query: string) => void;
  setColorFilter: (colorKey: string | null) => void;
  togglePinNote: (id: string) => void;
  bringToFront: (id: string) => void;
  autoAlignNotes: () => void;
}

export type BoardStore = BoardState & BoardActions;

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      // State
      notes: {},
      collapsedSize: DEFAULT_COLLAPSED_SIZE,
      darkMode: false,
      searchQuery: "",
      colorFilter: null,
      maxZIndex: 10,

      // Actions
      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }));
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setColorFilter: (colorKey: string | null) => {
        set({ colorFilter: colorKey });
      },

      togglePinNote: (id: string) => {
        const state = get();
        const note = state.notes[id];
        if (!note) return;
        set({
          notes: {
            ...state.notes,
            [id]: { ...note, pinned: !note.pinned },
          },
        });
      },

      bringToFront: (id: string) => {
        const state = get();
        const note = state.notes[id];
        if (!note) return;
        const nextZ = state.maxZIndex + 1;
        set({
          maxZIndex: nextZ,
          notes: {
            ...state.notes,
            [id]: { ...note, zIndex: nextZ },
          },
        });
      },

      autoAlignNotes: () => {
        const state = get();
        const notesArray = Object.values(state.notes);
        if (notesArray.length === 0) return;

        const baseX = 30;
        const baseY = 30;
        const gapX = 24;
        const gapY = 24;
        const cols = 3;

        const newNotes: Record<string, NoteData> = {};

        notesArray.forEach((note, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;

          const width = note.collapsed ? state.collapsedSize.width : note.width;
          const height = note.collapsed
            ? state.collapsedSize.height
            : note.height;

          const x = baseX + col * (width + gapX);
          const y = baseY + row * (height + gapY);

          newNotes[note.id] = {
            ...note,
            x,
            y,
          };
        });

        set({ notes: newNotes });
      },

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

        const nextZ = state.maxZIndex + 1;

        const newNote: NoteData = {
          id: generateId(),
          x: baseX + offsetX,
          y: baseY + offsetY,
          width: DEFAULT_NOTE_WIDTH,
          height: DEFAULT_NOTE_HEIGHT,
          contentHtml: "",
          colorKey: DEFAULT_COLOR_KEY,
          collapsed: false,
          pinned: false,
          zIndex: nextZ,
        };

        set({
          maxZIndex: nextZ,
          notes: { ...state.notes, [newNote.id]: newNote },
        });
      },

      duplicateNote: (id: string) => {
        const state = get();
        const note = state.notes[id];
        if (!note) return;

        const nextZ = state.maxZIndex + 1;
        const gap = 24;
        const existingNotes = Object.values(state.notes);

        // Try placing to the right first, then below
        let newX = note.x + note.width + gap;
        let newY = note.y;
        const rightRect = { x: newX, y: newY, w: note.width, h: note.height };
        const hasCollision = existingNotes.some((n) => {
          if (n.id === id) return false;
          const nW = n.collapsed ? state.collapsedSize.width : n.width;
          const nH = n.collapsed ? state.collapsedSize.height : n.height;
          return !(
            rightRect.x + rightRect.w <= n.x ||
            rightRect.x >= n.x + nW ||
            rightRect.y + rightRect.h <= n.y ||
            rightRect.y >= n.y + nH
          );
        });

        if (hasCollision) {
          // Place below the note
          newX = note.x;
          newY = note.y + note.height + gap;
        }

        const newNote: NoteData = {
          id: generateId(),
          x: newX,
          y: newY,
          width: note.width,
          height: note.height,
          contentHtml: "",
          colorKey: note.colorKey,
          collapsed: false,
          pinned: false,
          zIndex: nextZ,
        };

        set({
          maxZIndex: nextZ,
          notes: { ...state.notes, [newNote.id]: newNote },
        });
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
