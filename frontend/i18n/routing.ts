import {createNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'pt', 'es', 'fr', 'el'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  // Cookie-based locale detection for better UX
  localeCookie: {
    name: 'NEXT_LOCALE',
    // 1 year expiration
    maxAge: 31536000,
    // Secure cookies in production
    sameSite: 'lax'
  }
});

export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);
