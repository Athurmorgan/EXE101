# vivivu — Backend

API cho vivivu: nền tảng du lịch Việt Nam cho khách nước ngoài tự túc. Hai giá trị cốt lõi là
**địa điểm local chưa có trên Google Maps** (cộng đồng gửi, admin duyệt) và **AI lên lịch trình**
1–n ngày theo vùng, phong cách đi, ăn uống, số người và điểm xuất phát.

Frontend ở repo riêng: `EXE101/vietgo-web` (nhánh `fe`). Repo này làm việc trên nhánh `be`.

> Tài liệu chi tiết hơn (lịch sử, quyết định kiến trúc, bảng endpoint): [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)
> và [Plan.md](Plan.md). Hai file đó cũ hơn README này, README là nguồn cập nhật nhất.

---

## Stack

| Phần | Công nghệ |
|---|---|
| API | NestJS 11, TypeScript, prefix `api/v1`, Swagger tại `/api/docs` |
| DB | PostgreSQL 16 + Prisma 6 (`apps/api/prisma/schema.prisma`) |
| Cache | Redis 7 (cache search/list, invalidate khi ghi) |
| Auth | JWT access + refresh token httpOnly cookie, Google OAuth |
| AI | Claude / Gemini qua REST (tùy chọn, không có key thì chạy heuristic) |
| Hạ tầng dev | Docker Compose (postgres + redis), npm workspaces (`apps/api`, `packages/shared`) |

---

## Chạy local

```bash
# 1. Hạ tầng
npm install
npm run infra:up              # docker compose up -d postgres redis

# 2. Cấu hình
cp apps/api/.env.example apps/api/.env   # nếu chưa có; xem bảng biến bên dưới

# 3. DB
npm run prisma:migrate        # tạo bảng
npm run prisma:seed           # tài khoản + regions + places + bài cộng đồng mẫu

# 4. API (build rồi chạy dist, KHÔNG watch — sửa code thì chạy lại)
npm run dev                   # http://localhost:3000/api/v1  ·  Swagger: /api/docs
```

Lưu ý khi dev trên Windows:

- Dừng API trước khi `prisma generate` / `prisma migrate`, nếu không engine DLL bị khóa (`EPERM rename query_engine-windows.dll.node`).
- Sau khi đổi dữ liệu trực tiếp trong DB, xóa cache: `docker exec vivivu-redis redis-cli FLUSHALL`.
- Cổng Postgres trong Docker mặc định không phải 5432 (máy dev đang có Postgres của Windows), xem `POSTGRES_PORT` trong `.env`.

### Biến môi trường chính (`apps/api/.env`)

| Biến | Ghi chú |
|---|---|
| `DATABASE_URL`, `POSTGRES_PORT`, `REDIS_URL` | Kết nối hạ tầng |
| `PORT`, `NODE_ENV`, `DEFAULT_LOCALE`, `FRONTEND_URL`, `CORS_ORIGINS` | Dev để `CORS_ORIGINS` trống và dùng Vite proxy |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_*_EXPIRES_IN`, `COOKIE_*` | Auth |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Đăng nhập Google |
| `MAIL_ENABLED`, `SMTP_URL`, `SMTP_FROM` | Chưa bật: mã xác thực in ra console |
| `ANTHROPIC_API_KEY` / `GEMINI_API_KEY_1..N` (+ `ANTHROPIC_MODEL`, `GEMINI_MODEL`) | **Chưa có key** → planner chạy heuristic |
| `OPENWEATHER_API_KEY`, `GOOGLE_MAPS_API_KEY` | Chưa dùng |

### Tài khoản seed

| Email | Vai trò | Mật khẩu |
|---|---|---|
| `admin@vivivu.vn` | ADMIN | `Vivivu@2026` |
| `manager@vivivu.vn` | MANAGER | `Vivivu@2026` |
| `user@vivivu.vn` | USER | `Vivivu@2026` |

Seed còn tạo 62 regions (34 tỉnh/TP + các thành phố), ~108 địa điểm mẫu ở 11 vùng (ảnh placeholder picsum)
và một số bài cộng đồng đã duyệt. Seed idempotent, chạy lại không tạo trùng.

### Script khác

`npm run build` · `npm run typecheck` · `npm run lint` · `npm run test` / `test:unit` / `test:e2e` ·
`npm run prisma:generate` · `npm run prisma:deploy` · `npm run db:reset`

---

## Đã làm (tính đến 2026-11-16)

### Nền tảng
- Monorepo npm workspaces, Docker Compose cho postgres/redis, Prisma migrations (8 migration, mới nhất `20261116093445_place_checkin`).
- Global ValidationPipe (whitelist), `JwtAuthGuard` + `RolesGuard`, decorator `@Public`, `@Roles`, `@CurrentUser`.
- Redis cache cho search/list với invalidate theo prefix; gzip; Cache-Control; composite index.
- Audit log cho các hành động admin/moderation.

### Module và endpoint

| Module | Endpoint chính | Ghi chú |
|---|---|---|
| `auth` | `POST auth/register`, `login`, `refresh`, `logout`, `logout-all`, `GET auth/me`, `verify-email`, `resend-verification`, `update-profile`, `change-password`, `GET auth/google` + `google/callback`, `POST auth/google` | Google sign-in redirect về `FRONTEND_URL/auth/callback` |
| `users` (admin) | `GET admin/users`, `GET :id`, `PATCH :id/role`, `POST :id/suspend` / `unsuspend` / `restore` / `force-logout`, `DELETE :id` | ADMIN only |
| `regions` | `GET regions`, `regions/cities`, `regions/:id`, `regions/:id/children` | |
| `places` | `GET places` (search: `q`, `regionId`, `category`, `isHiddenPlace`, `status`, phân trang, **`lat`/`lng`/`radiusKm` → trả `distanceM`, gần nhất trước**), `GET places/:id`, `POST places` (USER gửi, lưu `submittedById` + `checkinLat/Lng`, status PENDING), `PUT/DELETE places/:id` (admin/manager), `POST places/schedule/build` | `isHiddenPlace` = chỗ chưa có trên Google |
| `community` | `GET community/posts`, `community/posts/me`, `community/posts/:id`, `POST community/posts` (kèm `placeId`, link ảnh), `DELETE` | Bài mới ở trạng thái PENDING |
| `comments`, `reactions` | Comment/reaction trên place và post | |
| `shortlist` | CRUD + `reorder` | |
| `moderation` | `GET moderation/queue/:type` (`posts` \| `places`), `POST moderation/posts/:id/approve` / `reject`, `places/:id/approve` / `reject` | Queue places include `region` + `submittedBy {id, fullName, email}` |
| `ai` | `POST ai/itinerary/generate` | Planner grounded: lọc ứng viên theo vùng/bán kính → LLM chọn (nếu có key) hoặc heuristic → xếp lịch theo giờ mở cửa, khoảng cách |
| `itinerary` | `GET itineraries`, `:id`, `POST itineraries`, `:id/generate`, `:id/apply`, `DELETE :id` | Input: ngày, styles, dietary, số người, điểm xuất phát, must-include |

### Tính năng demo "chỗ chưa có trên Google" (mới nhất)
Người dùng đứng tại quán → viết bài kèm vị trí GPS → API tìm chỗ trong bán kính 300 m
(`GET places?lat&lng&radiusKm=0.3`); nếu không có thì tạo place mới inline với `checkinLat/Lng`
và `submittedById`. Admin duyệt thấy ghim, điểm GPS lúc đăng, khoảng cách và người gửi, rồi approve
cả place và bài.

---

## Còn thiếu

- **Key LLM** (`ANTHROPIC_API_KEY` hoặc `GEMINI_API_KEY_*`) để planner chạy bằng AI thay vì heuristic; chưa gọi thời tiết (`OPENWEATHER_API_KEY`) và giao thông.
- **Dữ liệu thật**: chưa import Google Places; toàn bộ places/bài viết hiện là seed giả. Chưa có pipeline xác minh địa điểm ngoài check-in GPS.
- **Upload ảnh**: bài viết và place chỉ nhận link ảnh; chưa có storage (S3/Cloudinary), chưa đọc EXIF GPS từ ảnh.
- **"Find from reels"**: nhận link chia sẻ TikTok/Instagram → trích xuất địa điểm → khớp DB (bước tiếp theo đã chốt).
- **Quota / gói trả phí**: giới hạn lượt lên lịch trình và tính phí (Stripe) chưa làm.
- **Email**: chưa có SMTP, mã xác thực đang in ra console.
- **Deploy**: chưa có môi trường production, CI chỉ chạy lint/test.
- **i18n**: schema có `DEFAULT_LOCALE` nhưng nội dung chưa song ngữ.
- **Mobile app**: chưa có.
