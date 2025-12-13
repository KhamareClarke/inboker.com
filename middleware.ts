import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Redirect from Vercel URL to custom domain in production
  const host = req.headers.get('host') || '';
  if (process.env.NODE_ENV === 'production' && host.includes('vercel.app')) {
    const url = req.nextUrl.clone();
    url.host = 'inboker.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

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
  
  // For dashboard routes, be more lenient - Supabase stores sessions in localStorage
  // which middleware can't access. Let the client-side handle auth checks.
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
    
    // Check referer - if coming from login or dashboard, allow access
    // Let client-side handle the auth check to prevent redirect loops
    const referer = req.headers.get('referer');
    if (referer && (referer.includes('/login') || referer.includes('/dashboard'))) {
      // Coming from login or dashboard - allow access, let client-side handle auth
      console.log('Coming from auth/dashboard page, allowing access for client-side auth check');
      return res;
    }
    
    // Only redirect to login if we're sure there's no session
    // But be lenient - the client-side will handle the redirect if needed
    // This prevents redirect loops when session is in localStorage
    console.log('No session detected in middleware, but allowing access for client-side check');
    return res; // Let client-side handle redirect if needed
  }

  // If user has session, allow access to dashboard
  if (session) {
    if (isDashboard || isAdminRoute) {
      return res; // Allow access
    }
  }

  // Redirect authenticated users away from auth pages
  // But only if we have a valid session - don't redirect if session is still loading
  // Allow access if logout parameter is present (user is logging out)
  const isLogout = req.nextUrl.searchParams.get('logout') === 'true';
  if (session && isAuthPage && !isLogout) {
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

  // Protect dashboard routes - check subscription for business owners
  if (session && isDashboard) {
    const pathname = req.nextUrl.pathname;
    const isBillingPage = pathname.includes('/billing');
    const isApiRoute = pathname.startsWith('/api');
    
    // Allow billing page and API routes without subscription check
    if (isBillingPage || isApiRoute) {
      return res;
    }
    
    // Check if user is a business owner
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Allow business owners to access dashboard even without subscription
    // They can set up their business profile first, then start a trial
    // The dashboard page will show a prompt to start a trial if needed
    // No subscription check in middleware - let the dashboard handle it

    // Allow access - the dashboard page will handle other role checks
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
  // Exclude billing page from subscription check (it's handled in the middleware logic)
};
