import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './lib/i18n/routing';
import { clearSessionCache, isAuthenticated } from './lib/utils';

// Create the i18n middleware
const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
    // Handle i18n routing first
    const response = intlMiddleware(req);

    // Check if this is a protected route (starts with /u/)
    const pathname = req.nextUrl.pathname;

    // Extract locale from pathname - it should be in format: /[locale]/u/...
    const isProtectedRoute = pathname.match(/^\/[^\/]+\/u\//);

    if (isProtectedRoute) {
        const auth = await isAuthenticated(req);
        if (!auth) {
            // If authentication failed, clear any cached entry for this token
            const token = req.cookies.get('token');
            if (token) {
                clearSessionCache(token.value);
            }

            // Redirect to auth page, preserving the locale
            const localeMatch = pathname.match(/^\/([^\/]+)\//);
            const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
            const redirectUrl = new URL(`/${locale}/auth?action=signin`, req.url);
            return NextResponse.redirect(redirectUrl);
        }
    }

    return response;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
