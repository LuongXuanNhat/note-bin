"use client";

import { NOTE_COLORS } from "@/lib/colors";

interface ColorPickerPopoverProps {
  currentKey: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}

export default function ColorPickerPopover({
  currentKey,
  onSelect,
  onClose,
}: ColorPickerPopoverProps) {
  return (
    <div
      className="absolute right-0 z-50 mt-1 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl"
      style={{ top: "100%" }}
      role="dialog"
      aria-label="Chọn màu"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[-1]"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="presentation"
      />
      <div className="mb-2 text-xs font-medium text-zinc-500">Chọn màu nền</div>
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(NOTE_COLORS).map(([key, preset]) => (
          <button
            key={key}
            type="button"
            title={preset.label}
            aria-label={preset.label}
            className={`h-9 w-9 rounded-lg border-2 transition-transform hover:scale-110 ${
              currentKey === key
                ? "border-zinc-800 ring-2 ring-zinc-400"
                : "border-transparent"
            }`}
            style={{ backgroundColor: preset.bg }}
            onClick={() => {
              onSelect(key);
              onClose();
            }}
          />
        ))}
      </div>
    </div>
  );
}
