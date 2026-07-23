"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useBoardStore } from "@/lib/store";
import { NoteData } from "@/types/note";
import { NOTE_COLORS } from "@/lib/colors";
import NoteCard from "./NoteCard";
import EmptyState from "./EmptyState";

export default function NotesBoard() {
  const notes = useBoardStore((s) => s.notes);
  const addNoteGlobal = useBoardStore((s) => s.addNoteGlobal);
  const moveNote = useBoardStore((s) => s.moveNote);
  const darkMode = useBoardStore((s) => s.darkMode);
  const toggleDarkMode = useBoardStore((s) => s.toggleDarkMode);
  const searchQuery = useBoardStore((s) => s.searchQuery);
  const setSearchQuery = useBoardStore((s) => s.setSearchQuery);
  const colorFilter = useBoardStore((s) => s.colorFilter);
  const setColorFilter = useBoardStore((s) => s.setColorFilter);
  const autoAlignNotes = useBoardStore((s) => s.autoAlignNotes);

  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useBoardStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync Dark Mode class on <html> & <body>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  // Shift key & Canvas Pan State
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const panOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);

  // Sync panOffsetRef with state
  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  // Native Window Event Listeners for Canvas Panning (Shift + Right-Click / Middle-Click / Shift + Left-Click)
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let initialPanX = 0;
    let initialPanY = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(false);
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (e.shiftKey || isPanningRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Trigger panning on:
      // 1. Shift + Right Click (button === 2)
      // 2. Shift + Left Click (button === 0) on board area
      // 3. Middle Click (button === 1)
      const isRightClickWithShift = e.button === 2 && e.shiftKey;
      const isLeftClickWithShift = e.button === 0 && e.shiftKey;
      const isMiddleClick = e.button === 1;

      const target = e.target as HTMLElement | null;
      const isInsideBoardArea =
        scrollContainerRef.current?.contains(target) ||
        boardRef.current?.contains(target);

      if (
        isInsideBoardArea &&
        (isRightClickWithShift || isLeftClickWithShift || isMiddleClick)
      ) {
        e.preventDefault();
        e.stopPropagation();

        isPanningRef.current = true;
        setIsPanning(true);

        startX = e.clientX;
        startY = e.clientY;
        initialPanX = panOffsetRef.current.x;
        initialPanY = panOffsetRef.current.y;

        if (boardRef.current) {
          boardRef.current.style.transition = "none";
        }

        const handleWindowMouseMove = (moveEv: MouseEvent) => {
          if (!isPanningRef.current) return;
          moveEv.preventDefault();
          moveEv.stopPropagation();

          const dx = moveEv.clientX - startX;
          const dy = moveEv.clientY - startY;

          const currentX = initialPanX + dx;
          const currentY = initialPanY + dy;

          panOffsetRef.current = { x: currentX, y: currentY };

          if (boardRef.current) {
            boardRef.current.style.transform = `translate(${currentX}px, ${currentY}px)`;
          }
        };

        const handleWindowMouseUp = (upEv: MouseEvent) => {
          if (isPanningRef.current) {
            upEv.preventDefault();
            upEv.stopPropagation();

            isPanningRef.current = false;
            setIsPanning(false);

            setPanOffset({ ...panOffsetRef.current });

            if (boardRef.current) {
              boardRef.current.style.transition = "transform 150ms ease-out";
            }

            window.removeEventListener(
              "mousemove",
              handleWindowMouseMove,
              true,
            );
            window.removeEventListener("mouseup", handleWindowMouseUp, true);
          }
        };

        window.addEventListener("mousemove", handleWindowMouseMove, true);
        window.addEventListener("mouseup", handleWindowMouseUp, true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown, true);
    window.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown, true);
      window.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, []);

  // Drag state for notes
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
  const notesList = Object.values(notes);

  // Filter notes
  const filteredNotes = notesList.filter((note) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const plainText = (note.contentHtml || "")
        .replace(/<[^>]*>/g, "")
        .toLowerCase();
      if (!plainText.includes(q)) return false;
    }
    if (colorFilter && note.colorKey !== colorFilter) {
      return false;
    }
    return true;
  });

  // Note Drag handlers (Left Click only)
  const handleDragStart = useCallback(
    (e: React.PointerEvent, note: NoteData) => {
      if (note.collapsed || e.button !== 0 || e.shiftKey) return;
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
    // Handle Note Dragging
    if (!dragStateRef.current || !boardRef.current) return;
    const state = dragStateRef.current;
    const dx = e.clientX - state.pointerStartX;
    const dy = e.clientY - state.pointerStartY;
    setDragOffset({ x: dx, y: dy });
  }, []);

  const handleDragEnd = useCallback(
    (e: React.PointerEvent) => {
      // Handle Note Drag End
      if (!dragStateRef.current || !boardRef.current) return;
      const state = dragStateRef.current;
      const dx = e.clientX - state.pointerStartX;
      const dy = e.clientY - state.pointerStartY;
      const newX = Math.max(10, state.startX + dx);
      const newY = Math.max(10, state.startY + dy);

      if (newX !== state.startX || newY !== state.startY) {
        moveNote(state.note.id, newX, newY);
      }

      dragStateRef.current = null;
      setDraggingId(null);
      setDragOffset(null);
    },
    [moveNote],
  );

  // Board width & height based on max note boundaries + padding for smooth panning
  const maxRight = notesList.reduce(
    (max, n) => Math.max(max, n.x + n.width),
    0,
  );
  const maxBottom = notesList.reduce(
    (max, n) => Math.max(max, n.y + n.height),
    0,
  );
  const boardWidth = Math.max(maxRight + 600, 2400);
  const boardHeight = Math.max(maxBottom + 600, 1600);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors"
    >
      {/* Board Header Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-6 py-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors z-20">
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mr-2">
            Sổ tay ghi chú
          </h1>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            onClick={addNoteGlobal}
          >
            <span>+</span> Thêm note
          </button>
          <button
            type="button"
            title="Sắp xếp các note theo lưới đều đặn"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            onClick={autoAlignNotes}
          >
            <GridAlignIcon /> Sắp xếp tự động
          </button>
        </div>

        {/* Search & Filter (Center) */}
        <div className="flex flex-1 items-center justify-center gap-2 max-w-xl mx-auto">
          {/* Search Input */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm kiếm note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-9 pr-8 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:bg-zinc-900 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Color Filter Swatches */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              title="Tất cả màu"
              onClick={() => setColorFilter(null)}
              className={`px-2 py-1 text-xs font-semibold rounded ${
                colorFilter === null
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              All
            </button>
            {Object.entries(NOTE_COLORS).map(([key, color]) => (
              <button
                key={key}
                type="button"
                title={`Lọc: ${color.label}`}
                onClick={() => setColorFilter(key === colorFilter ? null : key)}
                className={`h-5 w-5 rounded-full border transition-transform ${
                  colorFilter === key
                    ? "scale-125 ring-2 ring-zinc-800 dark:ring-zinc-200"
                    : "hover:scale-110"
                }`}
                style={{
                  backgroundColor: color.bg,
                  borderColor: key === "white" ? "#d1d5db" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Actions: Dark Mode & Counter */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            {filteredNotes.length}{" "}
            {notesList.length !== filteredNotes.length &&
              `/ ${notesList.length}`}{" "}
            note(s)
          </span>

          {(panOffset.x !== 0 || panOffset.y !== 0) && (
            <button
              type="button"
              title="Đặt lại vị trí góc nhìn trung tâm"
              onClick={() => setPanOffset({ x: 0, y: 0 })}
              className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60 transition-colors"
            >
              ⟲ Reset View
            </button>
          )}

          <button
            type="button"
            title={
              darkMode ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"
            }
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      {/* Board area */}
      {notesList.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState onAddNote={addNoteGlobal} />
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-hidden bg-zinc-100/50 dark:bg-zinc-950 transition-colors select-none ${
            isPanning
              ? "cursor-grabbing"
              : isShiftPressed
                ? "cursor-grab"
                : "cursor-default"
          }`}
        >
          <div
            ref={boardRef}
            className="relative"
            style={{
              width: boardWidth,
              height: boardHeight,
              minWidth: "100%",
              minHeight: "100%",
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              transition: isPanning ? "none" : "transform 150ms ease-out",
            }}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
          >
            {filteredNotes.map((note) => (
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

function GridAlignIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-amber-400"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-600"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
