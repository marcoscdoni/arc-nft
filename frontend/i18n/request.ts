import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
 
type AppLocale = (typeof routing.locales)[number];

function isSupportedLocale(locale: string | undefined | null): locale is AppLocale {
  if (!locale) return false;
  return routing.locales.includes(locale as AppLocale);
}
 
export default getRequestConfig(async ({requestLocale}) => {
  // Determine locale (falls back to default if unsupported)
  const requestedLocale = await requestLocale;
  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});

