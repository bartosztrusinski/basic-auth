import { authMiddleware } from '@/auth/middleware';
import { isAuthRoute, isProtectedRoute } from '@/auth/util';

export default authMiddleware(async (auth, request) => {
  const { isAuthenticated, redirectToLogin, redirectToDefault } = await auth();

  if (isAuthRoute(request) && isAuthenticated) {
    return redirectToDefault({ syncAuth: true });
  }

  if (isProtectedRoute(request) && !isAuthenticated) {
    return redirectToLogin({ syncAuth: true });
  }

  // Request auth sync on all public routes
  // if (!isApiAuthRoute(request)) {
  //   const response = NextResponse.next();
  //   await setAuthSyncCookie(response);
  //   return response;
  // }

  // Refresh user session if compatible with edge
  // await refreshUserSession(request);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
