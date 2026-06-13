import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This route auto-confirms users using the database function
// Only call this when password is correct but email not confirmed

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Use service role key if available, otherwise use regular client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = serviceRoleKey 
      ? createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })
      : createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    // If we have service role key, use admin API directly (most reliable)
    if (serviceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // Get user by email - use pagination to find the user
      let user = null;
      let page = 0;
      const perPage = 1000;
      
      while (!user && page < 10) { // Limit to 10 pages (10k users max)
        const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page: page,
          perPage: perPage
        });
        
        if (listError) {
          throw listError;
        }

        user = usersData?.users.find(u => u.email === email);
        
        if (user || !usersData?.users || usersData.users.length === 0) {
          break;
        }
        
        page++;
      }

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Confirm the email using admin API
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirm: true
      });

      if (updateError) {
        console.error('Update user error:', updateError);
        throw updateError;
      }
      
      console.log('User email confirmed:', updatedUser?.user?.email);

      return NextResponse.json({ success: true, message: 'Email confirmed successfully' });
    } else {
      // Fallback to RPC function if no service role key
      const { error: confirmError } = await supabase.rpc('auto_confirm_user', {
        user_email: email
      });

      if (confirmError) {
        throw confirmError;
      }

      return NextResponse.json({ success: true, message: 'Email confirmed via RPC' });
    }

  } catch (error: any) {
    console.error('Auto-confirm error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to auto-confirm' },
      { status: 500 }
    );
  }
}

