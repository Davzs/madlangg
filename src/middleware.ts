import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { rateLimit } from "./middleware/rateLimit";

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    // Apply rate limiting to API routes
    if (req.nextUrl.pathname.startsWith('/api')) {
      const rateLimitResponse = await rateLimit(req);
      if (rateLimitResponse) return rateLimitResponse;
    }

    const token = await getToken({ req });
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isProtectedRoute = ['/ai', '/vocabulary', '/flashcards', '/dashboard'].some(path => 
      req.nextUrl.pathname.startsWith(path)
    );

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return null;
    }

    if (!isAuth && isProtectedRoute) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      
      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/ai/:path*',
    '/vocabulary/:path*',
    '/flashcards/:path*',
    '/auth/:path*'
  ],
};
