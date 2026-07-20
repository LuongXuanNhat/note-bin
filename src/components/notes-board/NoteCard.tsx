"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { NoteData } from "@/types/note";
import { NOTE_COLORS } from "@/lib/colors";
import { GRID_GAP, snapColSpan, snapRowSpan } from "@/lib/grid-utils";
import { useBoardStore } from "@/lib/store";
import NoteHeader from "./NoteHeader";
import NoteToolbar from "./NoteToolbar";
import ColorPickerPopover from "./ColorPickerPopover";
import DeleteConfirmPopover from "./DeleteConfirmPopover";

interface NoteCardProps {
  note: NoteData;
  pixel: { left: number; top: number; width: number; height: number };
  boardWidth: number;
  isDragging: boolean;
  dragOffset: { x: number; y: number } | null;
  onDragStart: (e: React.PointerEvent, note: NoteData) => void;
}

export default function NoteCard({
  note,
  pixel,
  boardWidth,
  isDragging,
  dragOffset,
  onDragStart,
}: NoteCardProps) {
  const collapsedSize = useBoardStore((s) => s.collapsedSize);
  const deleteNote = useBoardStore((s) => s.deleteNote);
  const duplicateNote = useBoardStore((s) => s.duplicateNote);
  const updateContent = useBoardStore((s) => s.updateContent);
  const setColor = useBoardStore((s) => s.setColor);
  const toggleCollapse = useBoardStore((s) => s.toggleCollapse);
  const resizeNote = useBoardStore((s) => s.resizeNote);

  const [isResizing, setIsResizing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const color = NOTE_COLORS[note.colorKey] ?? NOTE_COLORS.white;

  const cellSize = note.collapsed
    ? collapsedSize
    : { width: pixel.width, height: pixel.height };
  const posX = note.collapsed ? pixel.left : pixel.left;
  const posY = note.collapsed ? pixel.top : pixel.top;

  // Handle contentEditable input
  const handleInput = useCallback(() => {
    if (contentRef.current) {
      updateContent(note.id, contentRef.current.innerHTML);
    }
  }, [note.id, updateContent]);

  // Initialize innerHTML when note changes
  useEffect(() => {
    if (
      contentRef.current &&
      contentRef.current.innerHTML !== note.contentHtml
    ) {
      contentRef.current.innerHTML = note.contentHtml;
    }
  }, [note.contentHtml]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const isFormat = e.key === "b" || e.key === "i" || e.key === "u";
    if ((e.ctrlKey || e.metaKey) && isFormat && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      const cmdMap: Record<string, string> = {
        b: "bold",
        i: "italic",
        u: "underline",
      };
      document.execCommand(cmdMap[e.key]);
      return;
    }
    if (e.ctrlKey && e.altKey && e.key === "h") {
      e.preventDefault();
      document.execCommand("strikeThrough");
      return;
    }
  }, []);

  // Resize logic with column/row snapping
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startColSpan: number;
    startRowSpan: number;
  } | null>(null);

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      if (note.collapsed) return;
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startColSpan: note.width,
        startRowSpan: note.height,
      };
      setIsResizing(true);
    },
    [note.collapsed, note.width, note.height],
  );

  const handleResizeMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeRef.current || !boardWidth) return;
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;

      // Compute new pixel width/height, then snap to nearest column/row span
      const newPxWidth =
        resizeRef.current.startColSpan * (boardWidth / 72) + dx;
      const newPxHeight = resizeRef.current.startRowSpan * 72 + dy;

      const colSpan = snapColSpan(newPxWidth, boardWidth);
      const rowSpan = snapRowSpan(newPxHeight);

      resizeNote(note.id, colSpan, rowSpan);
    },
    [resizeNote, note.id, boardWidth],
  );

  const handleResizeEnd = useCallback(() => {
    resizeRef.current = null;
    setIsResizing(false);
  }, []);

  // Don't render if board width isn't available
  if (!boardWidth) return null;

  return (
    <div
      className={`absolute flex flex-col rounded-lg border shadow-md ${
        isDragging ? "z-50 shadow-xl" : "z-10"
      }`}
      style={{
        left: posX,
        top: posY,
        width: cellSize.width,
        height: cellSize.height,
        transform:
          isDragging && dragOffset
            ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
            : undefined,
        backgroundColor: color.bg,
        color: color.text,
        transition:
          isDragging || isResizing
            ? "none"
            : "left 200ms ease-out, top 200ms ease-out, width 200ms ease-out, height 200ms ease-out",
        touchAction: "none",
      }}
    >
      {/* Header + Color picker area */}
      <div ref={headerWrapperRef} className="relative shrink-0">
        <NoteHeader
          note={note}
          isDragging={isDragging}
          onColorPickerToggle={() => setShowColorPicker((v) => !v)}
          onDeleteConfirmToggle={() => setShowDeleteConfirm((v) => !v)}
          onToggleCollapse={() => toggleCollapse(note.id)}
          onDuplicate={() => duplicateNote(note.id)}
          onDragStart={(e) => onDragStart(e, note)}
        />
        {showColorPicker && (
          <ColorPickerPopover
            currentKey={note.colorKey}
            onSelect={(key) => {
              setColor(note.id, key);
              setShowColorPicker(false);
            }}
            onClose={() => setShowColorPicker(false)}
          />
        )}
      </div>

      {/* Delete confirm overlay */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-black/5"
          onClick={() => setShowDeleteConfirm(false)}
          onPointerDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <DeleteConfirmPopover
            onConfirm={() => {
              deleteNote(note.id);
              setShowDeleteConfirm(false);
            }}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        </div>
      )}

      {/* Content area */}
      {!note.collapsed && (
        <>
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto px-3 py-1.5 text-sm outline-none"
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            style={{ minHeight: 0, color: color.text }}
            data-note-id={note.id}
            role="textbox"
            aria-multiline="true"
            aria-label="Nội dung note"
          />
          <NoteToolbar
            noteId={note.id}
            contentHtml={note.contentHtml}
            onContentChange={(html) => updateContent(note.id, html)}
          />
        </>
      )}

      {/* Resize handle */}
      {!note.collapsed && (
        <div
          className="absolute bottom-0 right-0 z-20 h-4 w-4 cursor-se-resize"
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
          aria-label="Kéo để resize"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className="absolute bottom-0.5 right-0.5 text-zinc-400"
          >
            <path
              d="M1 9 L9 1 M4 9 L9 4 M7 9 L9 7"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
