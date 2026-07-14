import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { applyPublicMutationGuards } from '@/lib/security/api-guards';
import { emitEmpireActivity } from '@/lib/empire-activity';

export async function POST(request: NextRequest) {
  const blocked = applyPublicMutationGuards(request, 'auth_login', 40, 15 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // First, confirm email using service role if available
    if (serviceRoleKey) {
      try {
        const adminClient = createClient(supabaseUrl, serviceRoleKey);
        const { data: users } = await adminClient.auth.admin.listUsers();
        const user = users?.users.find(u => u.email === email.trim());
        
        if (user && !user.email_confirmed_at) {
          console.log('Confirming email for user:', email);
          await adminClient.auth.admin.updateUserById(user.id, {
            email_confirm: true
          });
        }
      } catch (confirmErr) {
        console.error('Email confirm error:', confirmErr);
        // Continue anyway
      }
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('Attempting login for:', email.trim());

    // Add timeout to Supabase call
    const loginPromise = supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase timeout')), 8000)
    );

    let result;
    try {
      result = await Promise.race([
        loginPromise,
        timeoutPromise
      ]) as any;
    } catch (raceErr: any) {
      if (raceErr.message === 'Supabase timeout') {
        console.error('Login timed out after 8 seconds');
        return NextResponse.json(
          { error: 'Login timed out. Please check your connection or try again.' },
          { status: 408 }
        );
      }
      throw raceErr;
    }

    const { data, error } = result;

    if (error) {
      await emitEmpireActivity({
        event_type: 'signin_failed',
        user_email: email,
        message: 'Invalid email or password',
        request,
      });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!data.session) {
      await emitEmpireActivity({
        event_type: 'signin_failed',
        user_email: email,
        message: 'No session created',
        request,
      });
      return NextResponse.json(
        { error: 'No session created' },
        { status: 401 }
      );
    }

    // Get user profile to include role and check if suspended
    const { data: profile } = await supabase
      .from('users')
      .select('role, full_name, suspended')
      .eq('id', data.user.id)
      .single();

    if (profile?.suspended) {
      await emitEmpireActivity({
        event_type: 'signin_failed',
        user_email: data.user.email,
        user_id: data.user.id,
        message: 'Account suspended',
        request,
      });
      return NextResponse.json(
        { error: 'Your account has been suspended by admin' },
        { status: 403 }
      );
    }

    await emitEmpireActivity({
      event_type: 'signin',
      user_email: data.user.email,
      user_id: data.user.id,
      user_name: profile?.full_name,
      metadata: { role: profile?.role || 'business_owner' },
      request,
    });

    // Get business profile if user is a business owner
    let businessSlug = null;
    if (profile?.role === 'business_owner') {
      const { data: businessProfile } = await supabase
        .from('business_profiles')
        .select('business_slug, business_name')
        .eq('user_id', data.user.id)
        .single();

      if (businessProfile) {
        // Generate slug from business name if slug is missing
        businessSlug = businessProfile.business_slug || 
          businessProfile.business_name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
      }
    }

    const fwd =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'Unknown';
    const device = (request.headers.get('user-agent') || 'Unknown').slice(0, 240);
    const when = new Date().toLocaleString('en-GB', { timeZone: 'UTC' }) + ' UTC';

    try {
      const { sendNotification } = await import('@/lib/notifications');
      if (data.user.email) {
        void sendNotification({
          type: 'login_alert',
          channels: ['email'],
          email: data.user.email,
          userId: data.user.id,
          data: {
            name: profile?.full_name || data.user.email,
            ip: fwd,
            device,
            timestamp: when,
          },
        });
      }
    } catch (e) {
      console.warn('[login] login_alert notification skipped:', e);
    }

    // Return session data with role and business slug
    return NextResponse.json({
      success: true,
      session: data.session,
      role: profile?.role || 'business_owner',
      businessSlug: businessSlug,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

