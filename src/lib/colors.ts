export interface NoteColorPreset {
  bg: string;
  text: string;
  darkBg: string;
  darkText: string;
  label: string;
}

export const NOTE_COLORS: Record<string, NoteColorPreset> = {
  yellow: { bg: "#FEF3C7", text: "#78350F", darkBg: "#451A03", darkText: "#FDE68A", label: "Vàng nhạt" },
  green: { bg: "#D1FAE5", text: "#065F46", darkBg: "#064E3B", darkText: "#A7F3D0", label: "Xanh lá nhạt" },
  blue: { bg: "#DBEAFE", text: "#1E3A8A", darkBg: "#1E3A8A", darkText: "#BFDBFE", label: "Xanh dương nhạt" },
  pink: { bg: "#FCE7F3", text: "#831843", darkBg: "#831843", darkText: "#FBCFE8", label: "Hồng nhạt" },
  purple: { bg: "#EDE9FE", text: "#4C1D95", darkBg: "#4C1D95", darkText: "#DDD6FE", label: "Tím nhạt" },
  orange: { bg: "#FFEDD5", text: "#7C2D12", darkBg: "#7C2D12", darkText: "#FED7AA", label: "Cam nhạt" },
  gray: { bg: "#374151", text: "#F9FAFB", darkBg: "#1F2937", darkText: "#F9FAFB", label: "Xám đậm" },
  white: { bg: "#FFFFFF", text: "#111827", darkBg: "#27272A", darkText: "#F4F4F5", label: "Trắng (mặc định)" },
};

export const DEFAULT_COLOR_KEY = "white";
