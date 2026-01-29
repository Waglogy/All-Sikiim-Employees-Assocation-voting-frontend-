const TOKEN_KEY = 'voting_app_token';
const PHONE_KEY = 'voting_app_phone';

/**
 * Store JWT token in localStorage
 */
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Get JWT token from localStorage
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PHONE_KEY);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Store phone number (for convenience)
 */
export function setPhone(phone: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PHONE_KEY, phone);
  }
}

/**
 * Get stored phone number
 */
export function getPhone(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(PHONE_KEY);
  }
  return null;
}
