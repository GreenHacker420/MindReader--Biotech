import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  response.headers.set('x-pathname', pathname);
  return response;
}

export const config = {
  matcher: ['/:path*'],
};
