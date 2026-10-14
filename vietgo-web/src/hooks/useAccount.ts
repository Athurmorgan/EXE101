import { useAuth } from './useAuth';
import { useMutation } from './useMutation';
import { changePassword, logoutAll, updateProfile, type ProfilePayload } from '@/lib/api/auth';

/** Saves the profile and refreshes the signed-in user everywhere in the app. */
export function useUpdateProfile() {
  const { setUser } = useAuth();
  return useMutation(async (payload: ProfilePayload) => {
    setUser(await updateProfile(payload));
  }, 'Could not save your profile.');
}

/** The BE revokes every session on success, this one included. */
export function useChangePassword() {
  const { clearSession } = useAuth();
  return useMutation(async (current: string, next: string) => {
    await changePassword(current, next);
    clearSession();
  }, 'Could not change your password.');
}

export function useSignOutEverywhere() {
  const { clearSession } = useAuth();
  return useMutation(async () => {
    await logoutAll();
    clearSession();
  });
}
