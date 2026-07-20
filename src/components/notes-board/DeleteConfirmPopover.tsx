"use client";

interface DeleteConfirmPopoverProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmPopover({
  onConfirm,
  onCancel,
}: DeleteConfirmPopoverProps) {
  return (
    <div
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-lg"
      role="alertdialog"
      aria-label="Xác nhận xóa"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <p className="mb-3 whitespace-nowrap text-sm font-medium text-zinc-800">
        Xóa note này?
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200"
          onClick={onCancel}
        >
          Hủy
        </button>
        <button
          type="button"
          className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
          onClick={onConfirm}
        >
          Xóa
        </button>
      </div>
    </div>
  );
}
