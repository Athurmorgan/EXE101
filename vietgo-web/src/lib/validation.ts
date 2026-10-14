/**
 * Client-side form rules. They mirror the BE DTOs so users see problems before
 * submitting; the BE still re-validates everything.
 */

export type FieldErrors = Record<string, string>;

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** packages/shared: PASSWORD_MIN_LENGTH = 8, must contain a letter and a digit. */
export function passwordProblem(password: string): string | null {
  if (password.length < 8) return 'Use at least 8 characters.';
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return 'Include at least one letter and one number.';
  return null;
}

export function isHttpUrl(value: string): boolean {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** Non-empty trimmed lines, e.g. one URL per line in a textarea. */
export function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

// --- Auth --------------------------------------------------------------------

export function validateRegistration(input: { fullName: string; email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.fullName.trim()) errors.fullName = 'Tell us what to call you.';
  if (!input.email) errors.email = 'Enter your email.';
  const problem = passwordProblem(input.password);
  if (problem) errors.password = problem;
  return errors;
}

export function validateProfile(input: { fullName: string }): FieldErrors {
  return input.fullName.trim().length < 2 ? { fullName: 'Your name needs at least 2 characters.' } : {};
}

export function validatePasswordChange(input: { current: string; next: string; confirm: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.current) errors.current = 'Enter your current password.';
  const problem = passwordProblem(input.next);
  if (problem) errors.next = problem;
  else if (input.next === input.current) errors.next = 'Pick a password you are not using now.';
  if (input.confirm !== input.next) errors.confirm = "Passwords don't match.";
  return errors;
}

// --- Community ---------------------------------------------------------------

/** Same limits as the BE's CreatePostDto. */
export const POST_LIMITS = { titleMin: 5, titleMax: 200, contentMin: 10, contentMax: 5000 } as const;

export function validatePost(input: { title: string; content: string; imageUrls: string[] }): FieldErrors {
  const errors: FieldErrors = {};
  if (input.title.trim().length < POST_LIMITS.titleMin) errors.title = `At least ${POST_LIMITS.titleMin} characters.`;
  if (input.content.trim().length < POST_LIMITS.contentMin) {
    errors.content = `At least ${POST_LIMITS.contentMin} characters.`;
  }
  if (input.imageUrls.some((url) => !isHttpUrl(url))) errors.images = 'One link per line, each starting with http(s)://';
  return errors;
}
