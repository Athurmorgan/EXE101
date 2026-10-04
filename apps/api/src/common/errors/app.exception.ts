/**
 * Ma loi nghiep vu dung chung.
 *
 * Client dua `code` vao thong bao loi thay vi parse `message` — de doi cau
 * chu tieng Viet/Anh tren FE ma khong can doi backend.
 */
export const ErrorCode = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  FORBIDDEN: 'FORBIDDEN',
  REGION_OUT_OF_SCOPE: 'REGION_OUT_OF_SCOPE',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_PENDING: 'ACCOUNT_PENDING',
  ACCOUNT_DELETED: 'ACCOUNT_DELETED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  EMAIL_ALREADY_VERIFIED: 'EMAIL_ALREADY_VERIFIED',
  INVALID_VERIFICATION_CODE: 'INVALID_VERIFICATION_CODE',
  VERIFICATION_CODE_EXPIRED: 'VERIFICATION_CODE_EXPIRED',
  INVALID_GOOGLE_TOKEN: 'INVALID_GOOGLE_TOKEN',
  GOOGLE_EMAIL_NOT_VERIFIED: 'GOOGLE_EMAIL_NOT_VERIFIED',
  CANNOT_MODIFY_SELF: 'CANNOT_MODIFY_SELF',
  CANNOT_MODIFY_LAST_ADMIN: 'CANNOT_MODIFY_LAST_ADMIN',
  RATE_LIMITED: 'RATE_LIMITED',
  UPSTREAM_UNAVAILABLE: 'UPSTREAM_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Loi nghiep vu — dung de nem loi co ma rieng thay vi `InternalServerErrorException`. */
export class AppException extends Error {
  constructor(
    readonly code: ErrorCodeValue,
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppException';
  }

  static notFound(resource: string): AppException {
    return new AppException(ErrorCode.NOT_FOUND, 404, `${resource} not found`);
  }

  static conflict(message: string, details?: unknown): AppException {
    return new AppException(ErrorCode.CONFLICT, 409, message, details);
  }

  static forbidden(message: string, code: ErrorCodeValue = ErrorCode.FORBIDDEN): AppException {
    return new AppException(code, 403, message);
  }

  static unauthorized(message: string, code: ErrorCodeValue = ErrorCode.UNAUTHORIZED): AppException {
    return new AppException(code, 401, message);
  }
}
