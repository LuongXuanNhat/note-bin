"use client";

import { useCallback, useRef, useState } from "react";
import { NoteData } from "@/types/note";
import { NOTE_COLORS } from "@/lib/colors";
import { MIN_NOTE_WIDTH, MIN_NOTE_HEIGHT } from "@/lib/grid-utils";
import { useBoardStore } from "@/lib/store";
import NoteHeader from "./NoteHeader";
import NoteToolbar from "./NoteToolbar";
import ColorPickerPopover from "./ColorPickerPopover";
import DeleteConfirmPopover from "./DeleteConfirmPopover";
import TiptapEditor from "./TiptapEditor";
import { Editor } from "@tiptap/react";

interface NoteCardProps {
  note: NoteData;
  isDragging: boolean;
  dragOffset: { x: number; y: number } | null;
  onDragStart: (e: React.PointerEvent, note: NoteData) => void;
}

export default function NoteCard({
  note,
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
  const togglePinNote = useBoardStore((s) => s.togglePinNote);
  const bringToFront = useBoardStore((s) => s.bringToFront);
  const darkMode = useBoardStore((s) => s.darkMode);

  const [isResizing, setIsResizing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);

  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const colorPreset = NOTE_COLORS[note.colorKey] ?? NOTE_COLORS.white;
  const color = darkMode
    ? { bg: colorPreset.darkBg, text: colorPreset.darkText }
    : { bg: colorPreset.bg, text: colorPreset.text };

  // During drag, apply offset directly to left/top
  const posX = isDragging && dragOffset ? note.x + dragOffset.x : note.x;
  const posY = isDragging && dragOffset ? note.y + dragOffset.y : note.y;
  const noteWidth = note.collapsed ? collapsedSize.width : note.width;
  const noteHeight = note.collapsed ? collapsedSize.height : note.height;

  // Sticker note Z-Index logic:
  // Dragging note gets 9999
  // Pinned notes sit above unpinned notes (1000 + zIndex)
  // Regular active notes sit at their assigned zIndex
  const baseZ = note.zIndex ?? 10;
  const computedZIndex = isDragging ? 9999 : note.pinned ? 1000 + baseZ : baseZ;

  const handleCardClick = useCallback(() => {
    bringToFront(note.id);
  }, [bringToFront, note.id]);

  // Resize with pixel precision
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
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
        startWidth: note.width,
        startHeight: note.height,
      };
      setIsResizing(true);
    },
    [note.collapsed, note.width, note.height],
  );

  const handleResizeMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeRef.current) return;
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;

      const newWidth = Math.max(
        MIN_NOTE_WIDTH,
        resizeRef.current.startWidth + dx,
      );
      const newHeight = Math.max(
        MIN_NOTE_HEIGHT,
        resizeRef.current.startHeight + dy,
      );

      resizeNote(note.id, newWidth, newHeight);
    },
    [resizeNote, note.id],
  );

  const handleResizeEnd = useCallback(() => {
    resizeRef.current = null;
    setIsResizing(false);
  }, []);

  return (
    <div
      className={`absolute flex flex-col rounded-lg border shadow-md transition-shadow dark:border-zinc-700/60 ${
        isDragging ? "shadow-xl" : "hover:shadow-lg"
      }`}
      onPointerDown={handleCardClick}
      style={{
        left: posX,
        top: posY,
        width: noteWidth,
        height: noteHeight,
        zIndex: computedZIndex,
        backgroundColor: color.bg,
        color: color.text,
        transition:
          isDragging || isResizing
            ? "none"
            : "left 200ms ease-out, top 200ms ease-out, width 200ms ease-out, height 200ms ease-out, shadow 150ms",
        touchAction: "none",
      }}
    >
      {/* Header + Color picker area */}
      <div ref={headerWrapperRef} className="relative shrink-0">
        <NoteHeader
          note={note}
          isDragging={isDragging}
          onColorPickerToggle={() => setShowColorPicker((v) => !v)}
          onDeleteConfirmToggle={() => {
            const isEmpty =
              !note.contentHtml ||
              note.contentHtml.trim() === "" ||
              note.contentHtml === "<br>" ||
              note.contentHtml === "<p></p>";
            if (isEmpty) {
              deleteNote(note.id);
            } else {
              setShowDeleteConfirm(true);
            }
          }}
          onToggleCollapse={() => toggleCollapse(note.id)}
          onDuplicate={() => duplicateNote(note.id)}
          onTogglePin={() => togglePinNote(note.id)}
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
          className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-black/10 backdrop-blur-[1px]"
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
          <TiptapEditor
            contentHtml={note.contentHtml}
            onChange={(html) => updateContent(note.id, html)}
            textColor={color.text}
            onEditorReady={setEditor}
          />
          <NoteToolbar
            contentHtml={note.contentHtml}
            onContentChange={(html) => updateContent(note.id, html)}
            editor={editor}
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

