/**
 * User preferences management using secure cookies
 * Avoids localStorage to work properly with SSR and be more secure
 */

import { cookies } from 'next/headers';

export type UserPreferences = {
  locale: string;
  theme?: 'light' | 'dark';
  walletAddress?: string;
};

const PREFS_COOKIE_NAME = 'user_prefs';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/**
 * Get user preferences from cookie (server-side)
 */
export async function getUserPreferences(): Promise<Partial<UserPreferences>> {
  try {
    const cookieStore = await cookies();
    const prefsCookie = cookieStore.get(PREFS_COOKIE_NAME);
    
    if (!prefsCookie?.value) {
      return {};
    }

    return JSON.parse(prefsCookie.value);
  } catch (error) {
    console.error('Failed to parse user preferences:', error);
    return {};
  }
}

/**
 * Set user preferences in cookie (server-side)
 */
export async function setUserPreferences(prefs: Partial<UserPreferences>): Promise<void> {
  try {
    const cookieStore = await cookies();
    const existingPrefs = await getUserPreferences();
    const newPrefs = { ...existingPrefs, ...prefs };

    cookieStore.set(PREFS_COOKIE_NAME, JSON.stringify(newPrefs), {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      // secure: true in production
      secure: process.env.NODE_ENV === 'production',
    });
  } catch (error) {
    console.error('Failed to save user preferences:', error);
  }
}

/**
 * Client-side helper for reading preferences
 */
export function getClientPreferences(): Partial<UserPreferences> {
  if (typeof document === 'undefined') {
    return {};
  }

  try {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${PREFS_COOKIE_NAME}=`));
    
    if (!cookie) {
      return {};
    }

    const value = cookie.split('=')[1];
    return JSON.parse(decodeURIComponent(value));
  } catch (error) {
    console.error('Failed to read client preferences:', error);
    return {};
  }
}

/**
 * Client-side helper for writing preferences
 */
export function setClientPreferences(prefs: Partial<UserPreferences>): void {
  if (typeof document === 'undefined') {
    return;
  }

  try {
    const existing = getClientPreferences();
    const updated = { ...existing, ...prefs };
    
    const maxAge = COOKIE_MAX_AGE;
    const secure = window.location.protocol === 'https:';
    
    document.cookie = `${PREFS_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=${maxAge}; samesite=lax${secure ? '; secure' : ''}`;
  } catch (error) {
    console.error('Failed to save client preferences:', error);
  }
}
