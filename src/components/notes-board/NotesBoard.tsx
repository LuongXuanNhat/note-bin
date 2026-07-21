"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useBoardStore } from "@/lib/store";
import { NoteData } from "@/types/note";
import NoteCard from "./NoteCard";
import EmptyState from "./EmptyState";

export default function NotesBoard() {
  const notes = useBoardStore((s) => s.notes);
  const addNoteGlobal = useBoardStore((s) => s.addNoteGlobal);
  const moveNote = useBoardStore((s) => s.moveNote);

  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Drag state
  const dragStateRef = useRef<{
    note: NoteData;
    startX: number;
    startY: number;
    pointerStartX: number;
    pointerStartY: number;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Hydrate Zustand persist on mount
  // We track hydration completion via state + useCallback to
  // satisfy the react-hooks/set-state-in-effect rule.
  const handleHydrated = useCallback(() => {
    setMounted(true);
  }, [setMounted]);

  useEffect(() => {
    const unsub = useBoardStore.persist.onFinishHydration(() => {
      handleHydrated();
    });
    useBoardStore.persist.rehydrate();
    return unsub;
  }, [handleHydrated]);

  const notesList = Object.values(notes);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.PointerEvent, note: NoteData) => {
      if (note.collapsed) return;
      e.preventDefault();

      dragStateRef.current = {
        note,
        startX: note.x,
        startY: note.y,
        pointerStartX: e.clientX,
        pointerStartY: e.clientY,
      };

      setDraggingId(note.id);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragStateRef.current || !boardRef.current) return;

    const state = dragStateRef.current;
    const dx = e.clientX - state.pointerStartX;
    const dy = e.clientY - state.pointerStartY;
    setDragOffset({ x: dx, y: dy });
  }, []);

  const handleDragEnd = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStateRef.current || !boardRef.current) return;

      const state = dragStateRef.current;
      const dx = e.clientX - state.pointerStartX;
      const dy = e.clientY - state.pointerStartY;
      const newX = state.startX + dx;
      const newY = state.startY + dy;

      if (newX !== state.startX || newY !== state.startY) {
        moveNote(state.note.id, newX, newY);
      }

      dragStateRef.current = null;
      setDraggingId(null);
      setDragOffset(null);
    },
    [moveNote],
  );

  // Board height based on max note bottom
  const maxBottom = notesList.reduce(
    (max, n) => Math.max(max, n.y + n.height),
    0,
  );
  const boardHeight = Math.max(maxBottom + 60, 500);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="flex flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-6 py-3">
        <h1 className="text-lg font-bold text-zinc-800">Note Board</h1>
        <button
          type="button"
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          onClick={addNoteGlobal}
        >
          + Thêm note
        </button>
        <span className="ml-auto text-xs text-zinc-400">
          {notesList.length} note(s)
        </span>
      </div>

      {/* Board area */}
      {notesList.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState onAddNote={addNoteGlobal} />
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-white">
          <div
            ref={boardRef}
            className="relative mx-auto"
            style={{
              width: "100%",
              height: boardHeight,
              minHeight: "100%",
            }}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
          >
            {notesList.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isDragging={draggingId === note.id}
                dragOffset={draggingId === note.id ? dragOffset : null}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
