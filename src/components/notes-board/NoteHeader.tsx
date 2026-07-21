"use client";

import { NoteData } from "@/types/note";

interface NoteHeaderProps {
  note: NoteData;
  isDragging: boolean;
  onColorPickerToggle: () => void;
  onDeleteConfirmToggle: () => void;
  onToggleCollapse: () => void;
  onDuplicate: () => void;
  onTogglePin: () => void;
  onDragStart: (e: React.PointerEvent) => void;
}

export default function NoteHeader({
  note,
  isDragging,
  onColorPickerToggle,
  onDeleteConfirmToggle,
  onToggleCollapse,
  onDuplicate,
  onTogglePin,
  onDragStart,
}: NoteHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between px-2 py-1 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } select-none`}
      onPointerDown={onDragStart}
    >
      {/* Drag handle area (left side) */}
      <div className="flex items-center gap-1">
        <DragHandleIcon />
        {note.pinned && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded">
            Pinned
          </span>
        )}
      </div>

      {/* Action buttons (right side) */}
      <div
        className="flex items-center gap-0.5"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Pin note */}
        <HeaderButton
          label={note.pinned ? "Bỏ ghim" : "Ghim note"}
          isActive={note.pinned}
          onClick={onTogglePin}
        >
          <PinIcon pinned={note.pinned} />
        </HeaderButton>

        {/* Color picker */}
        <HeaderButton label="Đổi màu" onClick={onColorPickerToggle}>
          <PaletteIcon />
        </HeaderButton>

        {/* Collapse */}
        <HeaderButton
          label={note.collapsed ? "Mở rộng" : "Thu gọn"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
        >
          <CollapseIcon collapsed={note.collapsed} />
        </HeaderButton>

        {/* Duplicate */}
        <HeaderButton label="Nhân bản" onClick={onDuplicate}>
          <DuplicateIcon />
        </HeaderButton>

        {/* Delete */}
        <HeaderButton label="Xóa" onClick={onDeleteConfirmToggle}>
          <TrashIcon />
        </HeaderButton>
      </div>
    </div>
  );
}

function HeaderButton({
  label,
  isActive,
  onClick,
  children,
}: {
  label: string;
  isActive?: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
        isActive
          ? "bg-amber-400/30 text-amber-700 dark:text-amber-300 font-bold"
          : "text-zinc-500 hover:bg-black/10 hover:text-zinc-700"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function PinIcon({ pinned }: { pinned?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={pinned ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14l-1.5-6H6.5L5 17z" />
      <path d="M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-zinc-400"
    >
      <circle cx="9" cy="5" r="1.5" />
      <circle cx="15" cy="5" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="15" cy="19" r="1.5" />
    </svg>
  );
}

function PaletteIcon() {
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
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.5-4.5-10-10-10z" />
    </svg>
  );
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {collapsed ? (
        <>
          <polyline points="9 18 15 12 9 6" />
        </>
      ) : (
        <>
          <polyline points="15 18 9 12 15 6" />
        </>
      )}
    </svg>
  );
}

function DuplicateIcon() {
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
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TrashIcon() {
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
