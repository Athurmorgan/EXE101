/**
 * Hang so va enum dung chung giua NestJS API va FastAPI AI service.
 *
 * Gia tri trong string enum phai khop 1-1 voi bien `str` trong Python
 * (`apps/ai-service/app/core/enums.py`) va voi enum trong `prisma/schema.prisma`.
 * Do do chi sua o day roi, khong tao ban sao o tung module.
 */

/** Ngon ngu hien thi. `vi` la mac dinh khi khong ro. */
export const SUPPORTED_LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'vi';

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Ba vai tro cua he thong. */
export const ROLES = ['ADMIN', 'MANAGER', 'USER'] as const;
export type Role = (typeof ROLES)[number];

/**
 * Trang thai tai khoan.
 *
 * `PENDING` chua xac thuc email, `SUSPENDED` bi Admin khoa, `DELETED` la xoa
 * mem — dong ban ghi van con de giu duong dan tinh cua bai viet / don hang.
 */
export const USER_STATUSES = ['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

/** Chi `PENDING` va `SUSPENDED` bi chan dang nhap. `DELETED` cung bi chan. */
export const BLOCKED_USER_STATUSES: readonly UserStatus[] = [
  'PENDING',
  'SUSPENDED',
  'DELETED',
];

/** Cach tai khoan duoc tao. `GOOGLE` thi khong co `passwordHash`. */
export const AUTH_PROVIDERS = ['LOCAL', 'GOOGLE'] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

/** Loai khu vuc quan tri. M1 chi dung `PROVINCE` (63 tinh thanh). */
export const REGION_TYPES = ['PROVINCE', 'CITY', 'DISTRICT'] as const;
export type RegionType = (typeof REGION_TYPES)[number];

/** Nguon cua mot dia diem. */
export const PLACE_SOURCES = ['GOOGLE', 'VERIFIED_LOCAL', 'USER_SUBMITTED'] as const;
export type PlaceSource = (typeof PLACE_SOURCES)[number];

/**
 * `VERIFIED_LOCAL` + `isHiddenPlace = true` la nhom dia diem local khong co tren
 * Google Maps — chinh la gia tri can ban cua san pham.
 */
export const PLACE_CATEGORIES = [
  'FOOD',
  'ATTRACTION',
  'NATURE',
  'SHOPPING',
  'NIGHTLIFE',
  'SERVICE',
] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

/** Trang thai duyet dung chung cho `Post` va `Place`. */
export const CONTENT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/** Loai bai viet trong cong dong. */
export const POST_TYPES = ['PLACE_PROMO', 'EVENT', 'TIP'] as const;
export type PostType = (typeof POST_TYPES)[number];

/** Loai phan ung. Comment va reaction khong can duyet. */
export const REACTION_TYPES = ['LIKE', 'STAR'] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

/** Chi `APPROVED` moi duoc cong khai va duoc AI quet. */
export const PUBLIC_CONTENT_STATUS: ContentStatus = 'APPROVED';

/** So sao toi thieu khi tao bai viet. */
export const PASSWORD_MIN_LENGTH = 8;

/** Do dai toi da cua mat khau. */
export const PASSWORD_MAX_LENGTH = 72;

/** So luong ky tu cua ma xac thuc email. */
export const EMAIL_VERIFICATION_CODE_LENGTH = 6;

/** Ma xac thuc email het han sau bao lau (giay). Mac dinh 24 gio. */
export const EMAIL_VERIFICATION_TTL_SECONDS = 24 * 60 * 60;

/** So lan gui lai ma xac thuc toi da truoc khi khoa nhac. */
export const EMAIL_VERIFICATION_MAX_RESENDS = 5;

/** Han so trang mac dinh khi phan trang. */
export const PAGINATION_DEFAULT_LIMIT = 20;

/** Han so trang toi da — bao ve API khoi bi goi voi `limit=100000`. */
export const PAGINATION_MAX_LIMIT = 100;

/** Tuoi nho nhat duoc tao tai khoan. */
export const USER_MIN_AGE = 18;

/** Tuoi lon nhat duoc tao tai khoan. */
export const USER_MAX_AGE = 120;

/** Do dai toi da cua ho ten. */
export const USER_FULL_NAME_MAX_LENGTH = 100;

/** Do dai toi da cua dia chi. */
export const USER_ADDRESS_MAX_LENGTH = 500;

/** Do dai toi da cua ly do khoa tai khoan (hien thi tren trang quan tri). */
export const USER_SUSPEND_REASON_MAX_LENGTH = 500;

/**
 * Cac thao tac quan tri ghi vao `audit_logs`.
 *
 * Dung hang so thay vi chuoi rong trong service — tranh go chinh ta va lai
 * tim cho sua. Khi them thao tac moi, them o day truoc roi moi dung.
 */
export const AUDIT_ACTIONS = {
  USER_SUSPEND: 'user.suspend',
  USER_UNSUSPEND: 'user.unsuspend',
  USER_DELETE: 'user.delete',
  USER_RESTORE: 'user.restore',
  USER_HARD_DELETE: 'user.hard_delete',
  USER_UPDATE_ROLE: 'user.update_role',
  USER_UPDATE_PROFILE: 'user.update_profile',
  USER_FORCE_LOGOUT: 'user.force_logout',
  USER_CREATE_BY_ADMIN: 'user.create_by_admin',
  EMAIL_VERIFY_SENT: 'email.verify_sent',
  GOOGLE_ACCOUNT_LINKED: 'google.account_linked',
  POST_APPROVE: 'post.approve',
  POST_REJECT: 'post.reject',
  PLACE_APPROVE: 'place.approve',
  PLACE_REJECT: 'place.reject',
  ITINERARY_GENERATE: 'itinerary.generate',
  ITINERARY_APPLY: 'itinerary.apply',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

/** Ten loai tai nguyen trong audit log. */
export const AUDIT_TARGET_TYPES = {
  USER: 'User',
  POST: 'Post',
  PLACE: 'Place',
  COMMENT: 'Comment',
  ITINERARY: 'Itinerary',
} as const;
