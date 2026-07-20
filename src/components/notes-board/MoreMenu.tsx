"use client";

interface MoreMenuProps {
  isJsonEnabled: boolean;
  onFormatJson: () => void;
  onClose: () => void;
}

export default function MoreMenu({
  isJsonEnabled,
  onFormatJson,
  onClose,
}: MoreMenuProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="presentation"
      />
      {/* Menu */}
      <div
        className="absolute bottom-full right-0 z-50 mb-1 min-w-[180px] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
        role="menu"
        aria-label="Thêm tùy chọn"
      >
        <button
          type="button"
          className={`flex w-full items-center px-3 py-1.5 text-left text-sm ${
            isJsonEnabled
              ? "text-zinc-700 hover:bg-zinc-100"
              : "cursor-not-allowed text-zinc-300"
          }`}
          disabled={!isJsonEnabled}
          onClick={() => {
            if (isJsonEnabled) {
              onFormatJson();
              onClose();
            }
          }}
          role="menuitem"
        >
          Format JSON pretty
        </button>
      </div>
    </>
  );
}
