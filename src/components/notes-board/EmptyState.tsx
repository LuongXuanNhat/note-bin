"use client";

interface EmptyStateProps {
  onAddNote: () => void;
}

export default function EmptyState({ onAddNote }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-zinc-100 p-4">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-400"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-zinc-700">Chưa có note nào</h2>
      <p className="max-w-xs text-sm text-zinc-500">
        Nhấn nút bên dưới để tạo note đầu tiên. Bạn có thể kéo thả, đổi màu, và
        định dạng văn bản.
      </p>
      <button
        type="button"
        className="rounded-lg bg-zinc-800 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        onClick={onAddNote}
      >
        + Thêm note
      </button>
    </div>
  );
}
