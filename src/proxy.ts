import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { decodeNextAuthJwt, getNextAuthSecret } from '@/utils/nextauth-secret';

export default withAuth(
  function proxy(req) {
    return NextResponse.next();
  },
  {
    secret: getNextAuthSecret(),
    jwt: {
      decode: decodeNextAuthJwt,
    },
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        const privatePaths = ['/feed', '/business', '/connect', '/profile'];
        const isPrivatePath = privatePaths.some((path) =>
          pathname.startsWith(path)
        );

        if (isPrivatePath) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: '/signin',
    },
  }
);

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|avif)$).*)',
  ],
};
