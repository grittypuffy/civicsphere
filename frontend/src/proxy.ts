import { NextResponse, type NextRequest } from 'next/server';
import { clearSessionCache, isAuthenticated } from './lib/utils';

export async function proxy(req: NextRequest) {
  /* Using the following logic temporarily */
  // return NextResponse.next();

  const auth = await isAuthenticated(req);
  if (!auth) {
    // If authentication failed, clear any cached entry for this token
    const token = req.cookies.get('token');
    if (token) {
      clearSessionCache(token.value);
    }

    const redirectUrl = new URL('/auth?action=signin', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/u/:path*'],
};
