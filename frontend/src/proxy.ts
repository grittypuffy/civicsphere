import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token');

  if (token) {
    return NextResponse.next();
  }

  const redirectUrl = new URL('/', request.url);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/home/:path*'],
};
