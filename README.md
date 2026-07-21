# 📌 NoteBin - Infinite Sticky Note Canvas

<p align="center">
  <b>Một ứng dụng ghi chú Sticker Note trực quan, mượt mà trên không gian vô hạn (Infinite Canvas).</b>
  <br />
  Xây dựng trên nền tảng Next.js 16 (App Router), React 19, Tailwind CSS v4, Zustand 5 và Tiptap Rich Text Editor.
</p>

---

## ✨ Tính năng nổi bật (Key Features)

- **📝 Trình soạn thảo Tiptap (Rich Text)**:
  - Soạn thảo văn bản với định dạng in đậm, in nghiêng, gạch chân, gạch ngang mượt mà.
  - Hỗ trợ **Format JSON Pretty** thông minh tự động thụt lề dữ liệu JSON.
- **🖐️ Di chuyển không gian 360° (Canvas Panning)**:
  - Nhấn giữ `Shift` + **Chuột phải (hoặc Chuột trái / Nút cuộn giữa)** kéo rê để trượt xem góc nhìn không gian vô hạn (Pan Canvas 60 FPS).
  - Chặn triệt để menu chuột phải trình duyệt khi đang thao tác.
  - Nút `⟲ Reset View` đưa camera về lại trung tâm `(0, 0)` nhanh chóng.
- **📌 Ghim Note (Pin/Lock) & Sticker Z-Index**:
  - Ghim note quan trọng lên trên cùng (`z-index: 1000+`) bằng icon Pin.
  - Tự động đẩy note đang active/focus lên trên cùng giúp dễ dàng làm việc như bảng ghi chú thật.
- **🔍 Tìm kiếm & Lọc màu (Search & Color Filter)**:
  - Lọc note theo từ khóa thời gian thực.
  - Lọc nhanh danh sách note theo 8 màu preset sắc nét.
- **⚡ Sắp xếp tự động (Auto Align Grid)**:
  - 1-click tự động xếp lại toàn bộ note ngổn ngang thành hàng cột lưới đều đặn.
- **📊 Bộ đếm từ & Ký tự (Word & Character Counter)**:
  - Hiển thị nhỏ gọn số lượng từ (`w`) và ký tự (`c`) theo thời gian thực dưới mỗi note.
- **🌙 Giao diện Tối/Sáng (Dark Mode / Light Mode)**:
  - Chuyển đổi giao diện Tối/Sáng gãy gọn, tùy chỉnh màu sắc thẻ note hài hòa theo từng chế độ.
- **💾 Lưu trữ tự động (LocalStorage Sync)**:
  - Tự động lưu mọi thay đổi vào `localStorage` mà không cần tài khoản hay backend.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand 5](https://zustand-demo.pmnd.rs/) (với middleware `persist`)
- **Rich Text Editor**: [Tiptap Editor](https://tiptap.dev/) (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`)
- **Language**: TypeScript

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy (Getting Started)

### 1. Cài đặt phụ thuộc:
```bash
npm install
```

### 2. Chạy môi trường phát triển (Development):
```bash
npm run dev
```
Mở trình duyệt truy cập: [http://localhost:3004](http://localhost:3004)

### 3. Kiểm tra build sản phẩm (Production Build):
```bash
npm run build
```

---

## 🎮 Thao tác Chuột & Phím tắt (Controls & Shortcuts)

| Thao tác | Phím / Chuột | Mô tả |
|---|---|---|
| **Di chuyển Bảng (Pan Canvas)** | `Shift` + Chuột phải (hoặc Shift + Chuột trái / Cuộn giữa) | Kéo không gian làm việc qua lại 360° |
| **Kéo Thẻ Note** | Chuột trái trên thanh Header Note | Kéo rê thẻ note đến vị trí tùy ý |
| **In đậm (Bold)** | `Ctrl` + `B` | Định dạng chữ đậm |
| **In nghiêng (Italic)** | `Ctrl` + `I` | Định dạng chữ nghiêng |
| **Gạch chân (Underline)** | `Ctrl` + `U` | Gạch chân văn bản |
| **Gạch ngang (Strikethrough)** | `Ctrl` + `Alt` + `H` | Gạch ngang văn bản |
| **Format JSON** | Nút `⋯` (More) -> Format JSON | Định dạng dữ liệu JSON thành khối đẹp mắt |

---

## 📁 Cấu trúc thư mục (Folder Structure)

```
note-bin/
├── src/
│   ├── app/
│   │   ├── globals.css         # Tailwind v4 theme & custom-variant dark
│   │   ├── layout.tsx
│   │   └── page.tsx            # Render <NotesBoard />
│   ├── components/
│   │   └── notes-board/
│   │       ├── NotesBoard.tsx  # Canvas container & Header toolbar chính
│   │       ├── NoteCard.tsx    # Thẻ Note sticky
│   │       ├── NoteHeader.tsx  # Thanh điều khiển 5 nút (Pin, Color, Collapse, Duplicate, Delete)
│   │       ├── NoteToolbar.tsx # Thanh định dạng text & bộ đếm từ/ký tự
│   │       ├── TiptapEditor.tsx# Component soạn thảo Tiptap SSR-safe
│   │       ├── ColorPickerPopover.tsx
│   │       ├── DeleteConfirmPopover.tsx
│   │       └── MoreMenu.tsx
│   ├── lib/
│   │   ├── colors.ts           # 8 Bảng màu preset (Light / Dark mode)
│   │   ├── grid-utils.ts
│   │   ├── json-utils.ts
│   │   └── store.ts            # Zustand store (State & Actions)
│   └── types/
│       └── note.ts             # Data models & interfaces
```

---

<p align="center">Made with ❤️ for NoteBin</p>
<p align="center">Let gift a Star ⭐ for Note Bin</p>
