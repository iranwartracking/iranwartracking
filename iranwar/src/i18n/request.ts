import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['en', 'fr', 'es', 'fa', 'ar', 'zh'];
export const defaultLocale = 'en';

export default getRequestConfig(async () => {
    // Use cookies if user selected a language
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;

    let locale = defaultLocale;

    if (localeCookie && locales.includes(localeCookie)) {
        locale = localeCookie;
    } else {
        // Check accept-language header
        const headersList = await headers();
        const acceptLanguage = headersList.get('accept-language');
        if (acceptLanguage) {
            const preferred = acceptLanguage.split(',')[0].split('-')[0];
            if (locales.includes(preferred)) {
                locale = preferred;
            }
        }
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
