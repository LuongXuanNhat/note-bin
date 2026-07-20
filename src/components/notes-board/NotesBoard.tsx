"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useBoardStore } from "@/lib/store";
import { NoteData } from "@/types/note";
import {
  GRID_GAP,
  COLUMNS,
  getGridBounds,
  snapCol,
  snapRow,
  gridToPixel,
  DEFAULT_COL_SPAN,
  DEFAULT_ROW_SPAN,
} from "@/lib/grid-utils";
import NoteCard from "./NoteCard";
import EmptyState from "./EmptyState";

export default function NotesBoard() {
  const notes = useBoardStore((s) => s.notes);
  const addNoteGlobal = useBoardStore((s) => s.addNoteGlobal);
  const moveNote = useBoardStore((s) => s.moveNote);

  const [mounted, setMounted] = useState(false);
  const [boardWidth, setBoardWidth] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Drag state
  const dragStateRef = useRef<{
    note: NoteData;
    startRow: number;
    startCol: number;
    pointerStartX: number;
    pointerStartY: number;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Hydrate Zustand persist on mount
  useEffect(() => {
    useBoardStore.persist.rehydrate();
    setMounted(true);
  }, []);

  // Track board width via ResizeObserver
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBoardWidth(entry.contentRect.width);
      }
    });
    ro.observe(board);
    return () => ro.disconnect();
  }, [mounted]);

  const notesList = Object.values(notes);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.PointerEvent, note: NoteData) => {
      if (note.collapsed) return;
      e.preventDefault();

      dragStateRef.current = {
        note,
        startRow: note.row,
        startCol: note.col,
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
      const boardRect = boardRef.current.getBoundingClientRect();
      const px = e.clientX - boardRect.left;
      const py = e.clientY - boardRect.top;
      const targetCol = snapCol(px, boardWidth);
      const targetRow = snapRow(py);

      if (targetRow !== state.startRow || targetCol !== state.startCol) {
        moveNote(state.note.id, targetRow, targetCol);
      }

      dragStateRef.current = null;
      setDraggingId(null);
      setDragOffset(null);
    },
    [boardWidth, moveNote],
  );

  // Board height
  const { maxRow } = getGridBounds(notesList);
  const effectiveRows = Math.max(maxRow + 3, 5);
  const boardHeight = effectiveRows * (72 + GRID_GAP) + GRID_GAP;

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
          72 cột &middot; {notesList.length} note(s)
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
            {notesList.map((note) => {
              const pixel = gridToPixel(
                note.row,
                note.col,
                note.width,
                note.height,
                boardWidth,
              );
              return (
                <NoteCard
                  key={note.id}
                  note={note}
                  pixel={pixel}
                  boardWidth={boardWidth}
                  isDragging={draggingId === note.id}
                  dragOffset={draggingId === note.id ? dragOffset : null}
                  onDragStart={handleDragStart}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
