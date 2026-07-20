"use client";

import { useCallback, useEffect, useState } from "react";
import MoreMenu from "./MoreMenu";
import { isValidJson, prettyPrintJson } from "@/lib/json-utils";

interface NoteToolbarProps {
  noteId: string;
  contentHtml: string;
  onContentChange: (html: string) => void;
}

export default function NoteToolbar({
  noteId,
  contentHtml,
  onContentChange,
}: NoteToolbarProps) {
  const [showMore, setShowMore] = useState(false);
  const [isJson, setIsJson] = useState(false);

  // Debounced JSON detection
  useEffect(() => {
    const timer = setTimeout(() => {
      const text = getPlainText(contentHtml);
      setIsJson(isValidJson(text));
    }, 300);
    return () => clearTimeout(timer);
  }, [contentHtml]);

  const execCmd = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    // Focus stays on contentEditable since we prevent mousedown on toolbar
  }, []);

  const handleFormatJson = useCallback(() => {
    const text = getPlainText(contentHtml).trim();
    if (!isValidJson(text)) return;
    const pretty = prettyPrintJson(text);
    const escaped = escapeHtml(pretty);
    const formatted = `<pre style="white-space:pre-wrap;font-family:monospace;margin:0">${escaped}</pre>`;
    onContentChange(formatted);
  }, [contentHtml, onContentChange]);

  return (
    <div
      className="flex items-center gap-1 border-t border-black/10 px-2 py-1"
      onMouseDown={(e) => e.preventDefault()}
    >
      <ToolbarButton
        label="In đậm"
        shortcut="Ctrl+B"
        icon={<BoldIcon />}
        onClick={() => execCmd("bold")}
      />
      <ToolbarButton
        label="In nghiêng"
        shortcut="Ctrl+I"
        icon={<ItalicIcon />}
        onClick={() => execCmd("italic")}
      />
      <ToolbarButton
        label="Gạch chân"
        shortcut="Ctrl+U"
        icon={<UnderlineIcon />}
        onClick={() => execCmd("underline")}
      />
      <ToolbarButton
        label="Gạch ngang"
        shortcut="Ctrl+Alt+H"
        icon={<StrikethroughIcon />}
        onClick={() => execCmd("strikeThrough")}
      />
      <div className="relative ml-auto">
        <ToolbarButton
          label="Thêm tùy chọn"
          shortcut=""
          icon={<MoreIcon />}
          onClick={() => setShowMore((v) => !v)}
        />
        {showMore && (
          <MoreMenu
            isJsonEnabled={isJson}
            onFormatJson={handleFormatJson}
            onClose={() => setShowMore(false)}
          />
        )}
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  shortcut,
  icon,
  onClick,
}: {
  label: string;
  shortcut: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-700"
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

function BoldIcon() {
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
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

function ItalicIcon() {
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
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function UnderlineIcon() {
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
      <path d="M6 4v6a6 6 0 0 0 12 0V4" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  );
}

function StrikethroughIcon() {
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
      <path d="M17.3 4.9c-1.2-.6-3.2-1-5.3-1-3.5 0-6 1.6-6 4.2 0 1.5.8 2.6 2.4 3.4" />
      <path d="M8.7 19.1c1.2.6 3.2 1 5.3 1 3.5 0 6-1.6 6-4.2 0-1.5-.8-2.6-2.4-3.4" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

// Helpers
function getPlainText(html: string): string {
  if (typeof document !== "undefined") {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  }
  return html.replace(/<[^>]*>/g, "");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
