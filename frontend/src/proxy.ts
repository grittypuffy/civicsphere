import { NextResponse, type NextRequest } from 'next/server';
import { isAuthenticated } from './lib/utils';

export async function proxy(req: NextRequest) {
  /* Using the following logic temporarily */
  return NextResponse.next();

  const auth = await isAuthenticated(req);
  if (!auth) {
    const redirectUrl = new URL('/auth', req.url);
    return NextResponse.redirect(redirectUrl);
  } else {
    if (req.nextUrl.pathname === '/auth') {
      const redirectUrl = new URL('/home', req.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/u/:path*'],
};
