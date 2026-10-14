import { api, setAccessToken } from './client';
import type { AuthSession, User } from '@/types/api';

export async function login(email: string, password: string): Promise<AuthSession> {
  const session = await api.post<AuthSession>('/auth/login', { email, password });
  setAccessToken(session.accessToken);
  return session;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth?: string;
  address?: string;
}

export interface RegisterResult {
  user: User;
  verificationRequired: boolean;
  devVerificationCode: string | null;
}

export function register(payload: RegisterPayload): Promise<RegisterResult> {
  return api.post<RegisterResult>('/auth/register', payload);
}

export function verifyEmail(email: string, code: string): Promise<{ verified: boolean; user: User }> {
  return api.post('/auth/verify-email', { email, code });
}

export function resendVerification(
  email: string,
): Promise<{ sent: boolean; devVerificationCode: string | null }> {
  return api.post('/auth/resend-verification', { email });
}

export function me(): Promise<User> {
  return api.get<User>('/auth/me');
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
  setAccessToken(null);
}

/** Signs out every device, including this one. */
export function logoutAll(): Promise<{ revokedSessions: number }> {
  return api.post('/auth/logout-all');
}

export interface ProfilePayload {
  fullName?: string;
  /** `YYYY-MM-DD` */
  dateOfBirth?: string;
  address?: string;
}

export function updateProfile(payload: ProfilePayload): Promise<User> {
  return api.post<User>('/auth/update-profile', payload);
}

/** On success the BE revokes every session — the caller must sign in again. */
export function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return api.post('/auth/change-password', { currentPassword, newPassword });
}
