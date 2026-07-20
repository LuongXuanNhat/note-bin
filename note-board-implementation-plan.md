# Kế hoạch triển khai: Note Board App

**Stack:** Next.js (App Router, TypeScript) + Tailwind v4 + Vercel
**Loại app:** Single-page, client-side only, không backend, lưu trữ `localStorage`.

---

## 1. Tổng quan

Web app 1 trang duy nhất, hiển thị một "bảng trắng" (board) chứa danh sách note dạng lưới (grid). Mỗi note có thể:
- Nhập/edit text trực tiếp (rich text: bold, italic, underline, strikethrough)
- Format JSON pretty nếu nội dung là JSON hợp lệ
- Đổi màu nền (8 màu preset, tự động chọn màu chữ phù hợp)
- Collapse/Expand
- Xóa (có confirm)
- Nhân bản (duplicate) sang ô lân cận
- Kéo thả để đổi vị trí
- Resize (áp dụng đồng bộ cho toàn bộ note trên board)

Không có tài khoản, không có API — toàn bộ state lưu ở `localStorage` để dùng tạm trước.

---

## 2. Các giả định / quyết định kỹ thuật (phần chưa được mô tả rõ)

Vì đây là các điểm chưa được chỉ rõ trong yêu cầu gốc, dưới đây là các lựa chọn mặc định — agent cứ theo đây triển khai, có thể điều chỉnh sau nếu owner phản hồi khác:

| Vấn đề | Quyết định |
|---|---|
| Kiến trúc bố cục | **Grid (lưới row/col)**, không phải canvas tự do. Lý do: yêu cầu "thêm note sang phải/trái/trên/dưới nếu ô trống" và "resize toàn bộ note cùng tỉ lệ" chỉ hợp lý khi note nằm trên lưới ô đều nhau. |
| Kích thước note | Toàn bộ note trên board dùng **chung 1 kích thước** (width/height) khi expanded, và **chung 1 kích thước cố định khác** khi collapsed. Resize 1 note = cập nhật kích thước dùng chung cho tất cả. |
| Lưu trữ dữ liệu | `localStorage`, key `note-board-v1`, auto-save (debounce ~300ms) mỗi khi state đổi. |
| Rich text | `contentEditable` + `document.execCommand` (đơn giản, đủ dùng cho MVP). Có ghi chú hướng nâng cấp ở mục 13. |
| Kéo note vào ô đã có note khác | **Hoán đổi vị trí (swap)** giữa 2 note. |
| Nút "Thêm note" chính (toolbar trên cùng) | Thêm note trống vào ô trống đầu tiên theo thứ tự quét trái→phải, trên→dưới; nếu hết chỗ thì mở rộng grid. |
| Nhân bản khi cả 2 bên trái/phải đều bận | Mặc định **chèn hàng mới bên dưới** note hiện tại (agent có thể đổi thành "bên trên" nếu owner muốn, chỉ là 1 dòng logic). |
| Xác nhận xóa | Popover/alert nhỏ **neo bên trong note đó** (không phải modal toàn màn hình). |
| Responsive | Board có thể scroll ngang/dọc (`overflow: auto`) khi nội dung vượt viewport. Chưa tối ưu riêng cho mobile ở bản đầu (out of scope MVP). |

---

## 3. Tech stack chi tiết

- **Next.js App Router**, component board là **Client Component** (`"use client"`) vì cần `localStorage`, DOM events, drag/resize.
- **Tailwind v4**: dùng `@theme` trong `globals.css` để khai báo các CSS variable cho 8 màu note (dễ maintain hơn hardcode hex rải rác).
- **State management**: Zustand (đơn giản, có middleware `persist` để tự sync `localStorage`, phù hợp với 1 store duy nhất cho toàn bộ board).
- **Drag & drop**: tự viết bằng Pointer Events (`onPointerDown/Move/Up`), không cần thư viện ngoài — vì logic đặt vị trí (swap theo ô lưới) khá đặc thù, dùng lib ngoài (dnd-kit) sẽ phải "vá" thêm nhiều hơn là tự control.
- **Animation**: CSS `transition: transform, width, height` (150–250ms ease-out) trên từng note để đảm bảo di chuyển/resize mượt.
- Không cần server actions, route handler, hay database.
- Deploy: Vercel (mặc định, không cần cấu hình gì thêm vì không có phần server).

> Lưu ý: vì không có logic server, có thể cân nhắc `output: "export"` trong `next.config` để build hoàn toàn static nếu owner muốn host như static site thuần túy. Không bắt buộc — deploy Next.js mặc định lên Vercel vẫn chạy tốt.

---

## 4. Cấu trúc thư mục đề xuất

```
app/
  layout.tsx
  page.tsx                  -> render <NotesBoard />
  globals.css                -> @import "tailwindcss"; + @theme (màu note)

components/
  notes-board/
    NotesBoard.tsx           -> container chính, toolbar "Add note", render grid
    NoteCard.tsx              -> 1 note: header + content + footer toolbar
    NoteHeader.tsx             -> 5 nút: color/collapse/delete/duplicate/drag-handle
    NoteToolbar.tsx             -> bold/italic/underline/strikethrough + menu 3 chấm
    ColorPickerPopover.tsx
    DeleteConfirmPopover.tsx
    MoreMenu.tsx               -> item "Format JSON pretty"
    EmptyState.tsx              -> hiển thị khi board chưa có note nào

lib/
  store.ts                   -> Zustand store (state + actions)
  colors.ts                  -> 8 preset {bg, text}
  json-utils.ts                -> isValidJson(), prettyPrintJson()
  grid-utils.ts                -> tìm ô trống, tính toạ độ pixel từ (row,col), v.v.

types/
  note.ts                    -> NoteData, BoardState, CellSize
```

---

## 5. Data model

```ts
// types/note.ts

export interface CellSize {
  width: number;
  height: number;
}

export interface NoteData {
  id: string;
  row: number;
  col: number;
  contentHtml: string;      // innerHTML của contentEditable (giữ bold/italic/underline/strike)
  colorKey: string;         // key trỏ tới preset trong colors.ts
  collapsed: boolean;
}

export interface BoardState {
  notes: Record<string, NoteData>;
  expandedSize: CellSize;   // dùng chung cho mọi note khi expanded
  collapsedSize: CellSize;  // hằng số cố định, không cho resize khi collapsed
}
```

---

## 6. Nguyên lý hệ thống Grid

- Mỗi note có toạ độ nguyên `(row, col)`, có thể mở rộng vô hạn theo cả 2 chiều dương (không cần âm cho MVP).
- Render: container `position: relative`, mỗi `NoteCard` dùng `position: absolute; transform: translate(x, y)` với:
  ```
  x = col * (expandedSize.width + GAP)
  y = row * (expandedSize.height + GAP)
  ```
  (nếu `collapsed = true` thì dùng `collapsedSize` thay vì `expandedSize` cho width/height, nhưng vị trí `x, y` vẫn tính theo lưới `expandedSize` để tránh chồng lấn — đơn giản nhất là giữ nguyên kích thước ô lưới = `expandedSize` luôn, note collapsed chỉ co nhỏ hình ảnh bên trong ô, căn góc trên-trái).
- Container tổng có `width/height` = `maxCol+1` × cellWidth, `maxRow+1` × cellHeight, cộng thêm buffer 1 hàng/cột để luôn có chỗ trống hiển thị nút thêm.
- Toàn bộ thay đổi vị trí/kích thước chỉ cần đổi `row/col` hoặc `expandedSize` trong store → CSS transition tự lo phần animation.

---

## 7. Chi tiết hành vi từng chức năng

### 7.1 Nút "Thêm note" chính (trên toolbar của board)

```
function addNoteGlobal():
  cell = findFirstEmptyCell()   // quét row=0..maxRow, col=0..maxCol theo thứ tự
  if not found:
    cell = { row: 0, col: maxCol + 1 }   // mở rộng thêm 1 cột
  createNote(cell.row, cell.col, defaultColor, contentHtml: "")
```

### 7.2 Note Header — 5 nút

**(1) Đổi màu nền**
- Click mở `ColorPickerPopover` với 8 ô màu (xem bảng màu mục 8).
- Chọn màu → set `colorKey`; text color luôn lấy từ cặp preset tương ứng (không tính luminance runtime, vì chỉ có 8 giá trị cố định nên hardcode cặp bg/text đảm bảo tương phản tốt hơn).

**(2) Collapse / Expand**
- Toggle `collapsed` riêng cho từng note (không ảnh hưởng note khác).
- Khi `collapsed = true`: áp dụng `collapsedSize` cố định (hằng số, ví dụ 220×48px — chỉ đủ hiện header + 1 dòng title/preview text), ẩn content + footer toolbar.
- Resize handle **bị ẩn/disable** khi note đang collapsed (vì kích thước collapsed là cố định, không cho chỉnh).

**(3) Xóa note**
- Click mở `DeleteConfirmPopover` **neo giữa note đó** (absolute, `top/left: 50%`, `transform: translate(-50%,-50%)`, z-index cao, có backdrop mờ chỉ trong phạm vi note).
- Nội dung: "Xóa note này?" + 2 nút Hủy / Xóa.
- Xác nhận xóa → remove khỏi store, note biến mất (không cần animate thêm, không cần dồn lại vị trí các note khác — giữ nguyên ô trống).

**(4) Nhân bản (duplicate) sang ô lân cận**

```
function duplicateNote(note):
  right = getNoteAt(note.row, note.col + 1)
  left  = getNoteAt(note.row, note.col - 1)

  if right == null:
    createNote(row: note.row, col: note.col + 1, color: note.colorKey, contentHtml: "")
  else if left == null:
    createNote(row: note.row, col: note.col - 1, color: note.colorKey, contentHtml: "")
  else:
    // cả 2 bên đều bận -> chèn thêm 1 hàng mới bên dưới note hiện tại
    insertRowAfter(note.row)   // mọi note có row > note.row bị +1
    createNote(row: note.row + 1, col: note.col, color: note.colorKey, contentHtml: "")
```
- Note mới: **trống nội dung**, cùng `colorKey` và kích thước với note gốc (kích thước vốn đã dùng chung toàn board nên tự động khớp).

**(5) Kéo thả đổi vị trí (drag handle trên thanh header)**

```
onPointerDown(note, event):
  startCell = { row: note.row, col: note.col }
  offset = pointer - noteScreenPosition
  note.zIndex = high; note.dragging = true

onPointerMove(event):
  note.style.transform = translate(pointer - offset)   // theo con trỏ, không snap khi đang kéo
  hoveredCell = round((pointer - boardOrigin) / cellSize)
  highlight ô hoveredCell nếu hợp lệ

onPointerUp(hoveredCell):
  if hoveredCell == startCell: no-op
  else:
    target = getNoteAt(hoveredCell)
    if target == null:
      note.row, note.col = hoveredCell
    else:
      // hoán đổi vị trí 2 note
      target.row, target.col = startCell
      note.row, note.col = hoveredCell
  note.dragging = false
  // CSS transition đảm bảo cả 2 note trượt mượt về vị trí mới
```
- Chỉ header (trừ vùng chứa 4 nút kia) mới bắt sự kiện kéo, để không xung đột với click nút.

### 7.3 Resize (đồng bộ toàn bộ note)

- Resize handle ở góc dưới-phải note (chỉ hiện khi `expanded`).
- Kéo handle → tính delta theo pointer → cập nhật trực tiếp `expandedSize.width/height` trong store (clamp min ví dụ 180×120, max ví dụ 560×480).
- Vì mọi `NoteCard` đều đọc `expandedSize` từ store, cập nhật 1 lần khiến **toàn bộ note khác tự động resize theo cùng kích thước** — đúng yêu cầu "các note còn lại xử lý co lại đúng tỉ lệ cùng nhau".
- CSS transition trên `width/height` (trừ lúc đang kéo chủ động — nên tắt transition trong lúc kéo để tránh lag, chỉ bật lại khi thả tay).

### 7.4 Bottom Toolbar (định dạng text)

| Nút | Hành động | Phím tắt | Tooltip |
|---|---|---|---|
| Bold | `document.execCommand('bold')` | Ctrl+B | "In đậm (Ctrl+B)" |
| Italic | `document.execCommand('italic')` | Ctrl+I | "In nghiêng (Ctrl+I)" |
| Underline | `document.execCommand('underline')` | Ctrl+U | "Gạch chân (Ctrl+U)" |
| Strikethrough | `document.execCommand('strikeThrough')` | Ctrl+Alt+H | "Gạch ngang (Ctrl+Alt+H)" |
| ⋯ (More) | mở `MoreMenu` | — | "Thêm tùy chọn" |

- Bắt các phím tắt bằng `onKeyDown` ngay trên vùng contentEditable của note đó (không global listener, để tránh ảnh hưởng note khác), luôn `event.preventDefault()` trước khi gọi execCommand.

**Menu 3 chấm → "Format JSON pretty"**
```
function isJsonEnabled(note):
  text = getPlainText(note.contentHtml).trim()   // dùng textContent, KHÔNG dùng HTML
  try { JSON.parse(text); return true } catch { return false }

function formatJsonPretty(note):
  text = getPlainText(note.contentHtml).trim()
  obj = JSON.parse(text)
  pretty = JSON.stringify(obj, null, 2)
  note.contentHtml = `<pre style="white-space:pre-wrap;font-family:monospace">${escapeHtml(pretty)}</pre>`
```
- Trạng thái enable/disable của menu item được tính lại mỗi khi nội dung note thay đổi (debounce ~300ms trên sự kiện `input`), không tính lại theo mỗi keystroke để tránh giật.
- Lưu ý: format JSON sẽ **thay thế toàn bộ định dạng bold/italic hiện có** bằng khối `<pre>` monospace — đây là đánh đổi hợp lý vì mục tiêu là hiển thị JSON rõ ràng.

---

## 8. Bảng 8 màu preset (bg + text đã tính sẵn để đảm bảo tương phản)

| # | Tên | Màu nền (bg) | Màu chữ (text) |
|---|---|---|---|
| 1 | Vàng nhạt | `#FEF3C7` | `#78350F` |
| 2 | Xanh lá nhạt | `#D1FAE5` | `#065F46` |
| 3 | Xanh dương nhạt | `#DBEAFE` | `#1E3A8A` |
| 4 | Hồng nhạt | `#FCE7F3` | `#831843` |
| 5 | Tím nhạt | `#EDE9FE` | `#4C1D95` |
| 6 | Cam nhạt | `#FFEDD5` | `#7C2D12` |
| 7 | Xám đậm | `#374151` | `#F9FAFB` |
| 8 | Trắng (mặc định) | `#FFFFFF` | `#111827` |

Khai báo trong `lib/colors.ts` dạng `Record<string, { bg: string; text: string; label: string }>`, và có thể đồng bộ sang Tailwind v4 `@theme` nếu muốn dùng class thay vì inline style.

---

## 9. Zustand store — danh sách actions cần có

```ts
// lib/store.ts (chữ ký hàm, không viết full implementation ở đây)

addNoteGlobal(): void
duplicateNote(id: string): void
deleteNote(id: string): void
updateContent(id: string, html: string): void
setColor(id: string, colorKey: string): void
toggleCollapse(id: string): void
setExpandedSize(size: CellSize): void
moveNote(id: string, targetRow: number, targetCol: number): void
```

- Dùng middleware `persist` (zustand/middleware) với key `"note-board-v1"`, `storage: createJSONStorage(() => localStorage)`.
- Vì `localStorage` chỉ tồn tại ở client, cần đảm bảo store chỉ hydrate sau khi mount (tránh lỗi hydration mismatch giữa SSR và client) — dùng `persist` với `skipHydration: true` rồi gọi `useStore.persist.rehydrate()` trong `useEffect` ở `NotesBoard`, hoặc đơn giản là chấp nhận toàn bộ `NotesBoard` chỉ render sau `useEffect` (`mounted` state) để tránh mismatch.

---

## 10. UI/UX chi tiết

- Note: bo góc (`rounded-lg`), đổ bóng nhẹ (`shadow-md`), border mỏng.
- Header: cursor `grab` khi hover, `grabbing` khi đang kéo; các nút action căn phải.
- Content area: `overflow-y: auto` khi expanded (phòng nội dung dài), ẩn hoàn toàn khi collapsed.
- Tooltip cho từng nút toolbar: dùng `title` attribute là đủ cho MVP, hoặc component tooltip nhỏ nếu muốn đẹp hơn.
- `EmptyState`: khi board chưa có note nào, hiện icon + text hướng dẫn + nút "Thêm note" to giữa màn hình.

---

## 11. Lộ trình triển khai theo giai đoạn (cho Agent thực thi tuần tự)

1. **Setup**: xác nhận cấu trúc thư mục, kiểm tra `globals.css` đã có `@import "tailwindcss";`, thêm `@theme` cho 8 màu.
2. **Data model + Zustand store** (chưa cần UI), viết `lib/colors.ts`, `lib/json-utils.ts`, `lib/grid-utils.ts`.
3. **Grid rendering engine**: `NotesBoard` render container + tính vị trí absolute cho từng note (dùng data giả/mock trước).
4. **NoteCard tĩnh**: dựng UI header (5 icon) + content placeholder + footer toolbar, chưa gắn logic.
5. **Rich text editing**: gắn `contentEditable`, `execCommand`, phím tắt, lưu `contentHtml` vào store khi `onInput` (debounce).
6. **Note actions**: color picker, collapse/expand, delete + confirm popover.
7. **Duplicate note**: implement thuật toán mục 7.2(4).
8. **Resize toàn cục**: resize handle + cập nhật `expandedSize` dùng chung.
9. **Drag & drop di chuyển note**: pointer events + swap logic + CSS transition mượt.
10. **Format JSON pretty**: detect + format + disable/enable menu item.
11. **Polish**: EmptyState, scroll container, tooltip, aria-label cho các nút, kiểm thử toàn bộ theo checklist mục 12.
12. **Deploy Vercel**: build thử `next build` local trước khi push, kiểm tra không còn lỗi hydration liên quan `localStorage`.

---

## 12. Checklist kiểm thử / edge case cần lưu ý

- [ ] Xóa note trong khi đang bị kéo (drag) — cần huỷ trạng thái dragging trước khi remove.
- [ ] Duplicate khi cả trái/phải/hàng dưới đều kín — kiểm tra `insertRowAfter` dồn đúng toàn bộ note phía dưới.
- [ ] Resize khi note đang collapsed — handle phải bị ẩn/disable.
- [ ] Nội dung rất dài trong note expanded — scroll nội bộ, không phá layout board.
- [ ] Detect JSON phải dùng `textContent`/`innerText`, không phải `innerHTML` (tránh thẻ `<b>`, `<i>` làm JSON.parse luôn fail).
- [ ] Load lần đầu khi `localStorage` rỗng hoặc dữ liệu lỗi (JSON.parse fail) → fallback về board rỗng, không crash app.
- [ ] Kéo note ra ngoài vùng grid hợp lệ → snap về vị trí gần nhất hợp lệ thay vì tạo toạ độ âm.
- [ ] Hai note cùng lúc có `row/col` trùng nhau (bug logic) — nên có hàm validate/log warning khi dev.

---

## 13. Giới hạn hiện tại & hướng mở rộng sau này

- `document.execCommand` đã deprecated (nhưng vẫn được hầu hết trình duyệt hỗ trợ) — nếu sau này cần rich text mạnh hơn (undo/redo tốt hơn, custom mark cho JSON syntax highlight...), nên migrate sang **Tiptap** (ProseMirror-based), giữ nguyên phần data model/grid không đổi.
- Chưa có đồng bộ đa thiết bị — nếu cần, có thể thêm Vercel KV/Supabase sau mà không cần đổi kiến trúc UI.
- Chưa có undo/redo cho các action (xóa, di chuyển, resize) — có thể thêm sau bằng cách lưu snapshot lịch sử state trong Zustand.
- Chưa tối ưu riêng cho mobile/touch (kéo thả bằng ngón tay cần thêm `touch-action: none` và test kỹ trên thiết bị thật).

---

*File này là bản kế hoạch (spec) để agent code theo, không phải code hoàn chỉnh. Các đoạn pseudocode ở trên mô tả logic, cần được agent chuyển thành TypeScript thực tế khi triển khai.*
