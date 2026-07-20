export interface NoteColorPreset {
  bg: string;
  text: string;
  label: string;
}

export const NOTE_COLORS: Record<string, NoteColorPreset> = {
  yellow: { bg: "#FEF3C7", text: "#78350F", label: "Vàng nhạt" },
  green: { bg: "#D1FAE5", text: "#065F46", label: "Xanh lá nhạt" },
  blue: { bg: "#DBEAFE", text: "#1E3A8A", label: "Xanh dương nhạt" },
  pink: { bg: "#FCE7F3", text: "#831843", label: "Hồng nhạt" },
  purple: { bg: "#EDE9FE", text: "#4C1D95", label: "Tím nhạt" },
  orange: { bg: "#FFEDD5", text: "#7C2D12", label: "Cam nhạt" },
  gray: { bg: "#374151", text: "#F9FAFB", label: "Xám đậm" },
  white: { bg: "#FFFFFF", text: "#111827", label: "Trắng (mặc định)" },
};

export const DEFAULT_COLOR_KEY = "white";
