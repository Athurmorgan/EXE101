# vivivu — Web (VietGo)

Frontend của vivivu: nền tảng du lịch Việt Nam cho khách nước ngoài tự túc. Gồm **landing page**
(`/`) và **ứng dụng** (`/app/*`): khám phá địa điểm local chưa có trên Google Maps, lên lịch trình bằng AI,
cộng đồng đăng bài, và trang quản trị.

Backend ở repo riêng: `EXE101-be` (nhánh `be`, NestJS). Repo này làm việc trên nhánh `fe`.

---

## Stack

React 19 · TypeScript · Vite 8 · Tailwind v4 (design tokens: cream/white/ink/muted/gold/forest/red) ·
React Router · Leaflet 1.9 trên tile OpenStreetMap (không cần API key) · lucide-react ·
GSAP + Lenis (chỉ cho landing) · ESLint + Prettier.

## Chạy local

```bash
npm install
npm run dev        # http://localhost:5173
```

Dev server proxy `/api` → `http://localhost:3000` (xem `vite.config.ts`), nên cần backend chạy trước
(`npm run dev` ở repo `EXE101-be`). Không cần file `.env`. Khi API không trả về được, Discover/Place
rơi về dữ liệu mock trong `src/data/mockPlaces.ts`.

| Script              | Làm gì                              |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Vite dev server                     |
| `npm run build`     | Typecheck rồi build ra `dist/`      |
| `npm run preview`   | Xem bản build                       |
| `npm run typecheck` | `tsc --noEmit`                      |
| `npm run lint`      | ESLint                              |
| `npm run format`    | Prettier toàn repo                  |

Tài khoản seed (từ backend): `admin@vivivu.vn` · `manager@vivivu.vn` · `user@vivivu.vn`, mật khẩu
`Vivivu@2026`.

---

## Routes

| Route | Trang | Guard |
|---|---|---|
| `/` | Landing page editorial | |
| `/app/login`, `/app/register`, `/auth/callback` | Đăng nhập email hoặc Google | |
| `/app/discover` | Danh sách + bản đồ địa điểm, lọc vùng/loại/local pick, tìm kiếm | |
| `/app/places/:id` | Chi tiết địa điểm, bản đồ, giờ mở cửa, comment, reaction, lưu shortlist | |
| `/app/places/new` | Gợi ý địa điểm mới (form đầy đủ, nút "I'm there right now" lưu check-in) | login |
| `/app/admin/places/:id/edit` | Sửa địa điểm | admin |
| `/app/community` | Feed bài cộng đồng đã duyệt | |
| `/app/community/new` | Viết bài, **kèm vị trí hiện tại** (xem bên dưới) | login |
| `/app/community/:id` | Chi tiết bài | |
| `/app/trips`, `/app/trips/new`, `/app/trips/:id` | Lịch trình: form planner (vùng, ngày, styles, dietary, số người, điểm xuất phát, must-include) → AI/heuristic xếp lịch → bản đồ theo ngày | login |
| `/app/shortlist` | Danh sách đã lưu, kéo sắp xếp | login |
| `/app/account` | Hồ sơ, đổi mật khẩu, bài của tôi | login |
| `/app/admin` | Moderation (posts/places), Users, Places | admin/manager |

## Cấu trúc

```
src/
├── sections/, components/{ui,layout,motion,brand}   Landing page (GSAP/Lenis, CSS Modules)
├── pages/app/              Các trang /app/*  (admin/ chứa 3 panel quản trị)
├── components/app-layout/  AppShell, nav, header của app
├── components/app-ui/      Primitives của app (Button, Chip, Select, Alert, PlaceMap, LocationPicker, PlaceForm, ...)
├── hooks/                  usePlaces, usePlace, usePosts, useTrips, useAuth, useModeration, useSubmitPlace (useGeolocation), useMutation, ...
├── lib/api/                client.ts (fetch + refresh token) và 1 file / resource: places, community, itineraries, auth, admin, regions, shortlist
├── lib/                    validation, placeDraft, itinerary, geo (haversine + formatDistance), format, cn
├── types/api.ts            Kiểu dữ liệu trả về từ BE
├── data/                   images.ts (landing), mockPlaces.ts (fallback khi API lỗi)
└── styles/                 global.css (landing), app.css (tokens Tailwind + .vv-pin/.vv-dot cho map)
```

Quy ước: alias `@/`; chạy `npm run lint && npm run typecheck` trước khi commit; landing dùng CSS
Modules + biến trong `global.css`, app dùng Tailwind tokens trong `app.css`; chỉ animate `transform`/`opacity`.

---

## Đã làm (tính đến 2026-11-16)

- **Landing page** editorial: hero slideshow ink-bleed, stacked sections, curtain reveal, reduced-motion fallback.
- **Auth**: đăng ký/đăng nhập email, Google sign-in, refresh token tự động, guard theo role.
- **Discover + Place detail**: tìm kiếm, lọc, nhãn LOCAL PICK cho chỗ chưa có trên Google, bản đồ Leaflet, comment/reaction/shortlist.
- **Planner**: form input đầy đủ → gọi BE sinh lịch → xem theo ngày trên bản đồ (pin đánh số, nối đường theo ngày), áp dụng/xóa lịch.
- **Cộng đồng**: feed, chi tiết, viết bài (ảnh bằng link), bài của tôi.
- **Đăng bài kèm vị trí hiện tại (demo "chỗ chưa có trên Google")**: trong Write a story bật *Pin the place* →
  *Use my location* lấy GPS (lưu làm check-in, hiện độ chính xác) → kéo ghim/chạm bản đồ để chỉnh →
  app hỏi *Is it one of these?* với các chỗ trong 300 m (có khoảng cách) → chọn chỗ có sẵn hoặc
  *It's not listed — add it* (tên, loại, địa chỉ, checkbox Local secret) → gửi: tạo place PENDING rồi tạo bài.
- **Admin**: Moderation hiện bản đồ ghim + chấm GPS lúc đăng, dòng "Submitted by … · GPS at posting was N m from the pin"
  (đỏ nếu > 500 m), bài liên kết tới place đang chờ được đánh dấu; quản lý users (role/suspend/xóa) và places (sửa/xóa).
- **Mock fallback** khi BE không chạy; typecheck/lint/build sạch.

## Còn thiếu

- **Upload ảnh**: chỉ dán link; chưa có upload file, chưa đọc EXIF GPS từ ảnh để xác thực vị trí.
- **Dữ liệu thật**: toàn bộ địa điểm/bài viết là seed giả (ảnh picsum); chưa import Google Places.
- **"Find from reels"**: dán link TikTok/Instagram → tìm ra địa điểm (bước tiếp theo đã chốt, làm BE trước).
- **Quota / gói trả phí**: chưa giới hạn lượt lên lịch, chưa có thanh toán.
- **AI thật**: BE chưa có key LLM nên planner chạy heuristic; chưa có thời tiết/giao thông.
- **Thiết kế lại trang khách hàng + admin** theo phong cách landing (mới làm `/app` shell và Discover).
- **i18n** (vi/en) chưa có; mobile app chưa có.
- **Deploy** chưa có; nút App Store/Google Play ở landing chưa trỏ link thật; ảnh landing vẫn từ Wikimedia Commons (xem `public/images/CREDITS.md`).
