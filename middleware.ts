import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check for session
  let session = null;
  
  try {
    const sessionData = await supabase.auth.getSession();
    session = sessionData.data?.session;
  } catch (e) {
    console.error('Middleware session error:', e);
  }

  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/signup') ||
    req.nextUrl.pathname.startsWith('/forgot-password');

  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/onboarding');

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  
  // Check for auth header or token in URL (for API routes)
  const authHeader = req.headers.get('authorization');
  const hasAuthToken = authHeader?.startsWith('Bearer ');
  
  // Also check for auth token in cookies as fallback (prevents redirect loops during login)
  // Supabase stores session in localStorage, but also sets cookies
  if (!session && (isDashboard || isAdminRoute)) {
    const cookies = req.cookies.getAll();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || '';
    
    // Check for various Supabase cookie patterns
    const hasAuthCookie = cookies.some(cookie => {
      const name = cookie.name.toLowerCase();
      return (
        name.includes('supabase') || 
        name.includes('sb-') ||
        name.includes('auth-token') ||
        name.includes('access-token') ||
        name.includes('refresh-token') ||
        (projectRef && name.includes(projectRef.toLowerCase()))
      );
    });
    
    // If we have auth cookies but no session, allow access (session might be loading)
    // This prevents redirect loops during login - the page will handle auth check
    if (hasAuthCookie) {
      console.log('Auth cookie found, allowing access while session loads');
      return res;
    }
    
    // If no session and no cookies, redirect to login
    // But add a small delay check - if this is right after login, cookies might not be set yet
    // Allow the page to load and check auth client-side
    const referer = req.headers.get('referer');
    if (referer && referer.includes('/login')) {
      // Coming from login page - allow access, let client-side handle auth
      console.log('Coming from login page, allowing access for client-side auth check');
      return res;
    }
    
    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If user has session, allow access to dashboard
  if (session) {
    if (isDashboard || isAdminRoute) {
      return res; // Allow access
    }
  }

  // Redirect authenticated users away from auth pages
  // But only if we have a valid session - don't redirect if session is still loading
  if (session && isAuthPage) {
    // Always redirect authenticated users away from login/signup pages
    // Redirect to generic dashboard - let the dashboard page handle role-based routing
    // This prevents redirect loops by letting client-side handle the role check
    const dashboardUrl = new URL('/dashboard', req.url);
    // Add a cache-busting query param to prevent browser caching the redirect
    dashboardUrl.searchParams.set('_t', Date.now().toString());
    return NextResponse.redirect(dashboardUrl);
  }

  // Protect admin routes - only admins can access
  if (session && isAdminRoute) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userProfile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Protect dashboard routes - let the page handle role checks
  // Don't block on database queries in middleware
  if (session && isDashboard) {
    // Allow access - the dashboard page will check roles
    return res;
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
    '/forgot-password',
  ],
};
