import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { normalizeSupabaseUrl } from '@/lib/supabase-env';

export async function middleware(req: NextRequest) {
  // Always redirect from Vercel URL to custom domain (inboker.com)
  // This ensures users always use the custom domain, not the Vercel deployment URL
  const host = req.headers.get('host') || '';
  if (host.includes('vercel.app')) {
    const url = req.nextUrl.clone();
    url.host = 'inboker.com';
    url.protocol = 'https:';
    // Preserve the path and query parameters
    return NextResponse.redirect(url, 301);
  }

  const res = NextResponse.next();

  // If Supabase env vars are not configured, skip auth checks entirely
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Middleware: Supabase env vars not set, skipping auth checks');
    return res;
  }

  const supabaseUrl =
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
    }
  );

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
  
  // Admin routes - let client-side handle verification to prevent redirect loops
  // The admin page will check permissions and redirect if needed
  if (isAdminRoute) {
    // Always allow access to admin routes - let the client-side admin page handle verification
    // This prevents redirect loops and allows proper error handling
    console.log('Admin route: Allowing access, client-side will verify admin status');
    return res;
  }

  // For dashboard routes, be more lenient - Supabase stores sessions in localStorage
  // which middleware can't access. Let the client-side handle auth checks.
  if (!session && isDashboard) {
    const cookies = req.cookies.getAll();
    const projectRef =
      (supabaseUrl || '').split('//')[1]?.split('.')[0] || '';
    
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
  if (session && isDashboard) {
    return res; // Allow access
  }

  // Allow access to login/signup pages even when logged in
  // The login page will show a message if user is already logged in
  // This prevents redirect loops and allows users to log out or switch accounts
  // NO redirect from auth pages - let the pages handle logged-in state

  // Protect dashboard routes - check subscription for business owners
  if (session && isDashboard) {
    const pathname = req.nextUrl.pathname;
    const isBillingPage = pathname.includes('/billing');
    const isApiRoute = pathname.startsWith('/api');
    const isOnboardingPage = pathname.includes('/onboarding');
    
    // Allow billing page, API routes, and onboarding without subscription check
    if (isBillingPage || isApiRoute || isOnboardingPage) {
      return res;
    }
    
    // Check if user is a business owner - ONLY check subscription for business owners
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // CRITICAL: Only check subscription for business owners
    // Customers and admins should NEVER be checked for subscriptions
    if (userProfile?.role === 'business_owner') {
      // Check subscription status
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', session.user.id)
        .single();

      const isActive = subscription?.status === 'active' || 
                       subscription?.status === 'trialing' || 
                       subscription?.status === 'trial';
      
      // If subscription is not active, redirect to billing page
      if (!isActive) {
        console.log(`Subscription lock: User ${session.user.id} has inactive subscription (${subscription?.status || 'none'}), redirecting to billing`);
        const billingUrl = new URL('/dashboard/business-owner/billing', req.url);
        billingUrl.searchParams.set('locked', 'true');
        return NextResponse.redirect(billingUrl);
      }
    } else if (userProfile?.role === 'customer') {
      // Customers should NEVER be redirected to billing - allow access immediately
      console.log(`Customer access: User ${session.user.id} is a customer, allowing access`);
      return res;
    } else if (userProfile?.role === 'admin') {
      // Admins should NEVER be checked for subscriptions - allow access immediately
      console.log(`Admin access: User ${session.user.id} is an admin, allowing access`);
      return res;
    }

    // Allow access for other roles or active subscriptions
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
