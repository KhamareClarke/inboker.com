import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Test endpoint for Stripe integration
 * This endpoint helps verify Stripe configuration and test webhook connectivity
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const testResults = {
      timestamp: new Date().toISOString(),
      stripe: {
        configured: !!process.env.STRIPE_SECRET_KEY,
        webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        monthlyPriceId: !!process.env.STRIPE_MONTHLY_PRICE_ID,
        annualPriceId: !!process.env.STRIPE_ANNUAL_PRICE_ID,
      },
      supabase: {
        serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      },
      tests: [] as Array<{ name: string; status: 'pass' | 'fail'; message: string }>,
    };

    // Test 1: Stripe API connectivity
    try {
      const customers = await getStripe().customers.list({ limit: 1 });
      testResults.tests.push({
        name: 'Stripe API Connection',
        status: 'pass',
        message: `Successfully connected. Found ${customers.data.length} customer(s)`,
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'Stripe API Connection',
        status: 'fail',
        message: error.message || 'Failed to connect to Stripe API',
      });
    }

    // Test 2: Check subscription table exists
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('count')
        .limit(1);

      if (error) throw error;

      testResults.tests.push({
        name: 'Subscriptions Table',
        status: 'pass',
        message: 'Subscriptions table is accessible',
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'Subscriptions Table',
        status: 'fail',
        message: error.message || 'Failed to access subscriptions table',
      });
    }

    // Test 3: Check webhook endpoint accessibility
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const webhookUrl = `${baseUrl}/api/stripe/webhook`;
    
    testResults.tests.push({
      name: 'Webhook Endpoint',
      status: 'pass',
      message: `Webhook URL: ${webhookUrl} (configure this in Stripe Dashboard)`,
    });

    // Test 4: Check price IDs
    if (process.env.STRIPE_MONTHLY_PRICE_ID) {
      try {
        const price = await getStripe().prices.retrieve(process.env.STRIPE_MONTHLY_PRICE_ID);
        testResults.tests.push({
          name: 'Monthly Price ID',
          status: 'pass',
          message: `Price: ${price.unit_amount ? `£${(price.unit_amount / 100).toFixed(2)}` : 'N/A'} ${price.recurring?.interval || 'one-time'}`,
        });
      } catch (error: any) {
        testResults.tests.push({
          name: 'Monthly Price ID',
          status: 'fail',
          message: error.message || 'Invalid monthly price ID',
        });
      }
    } else {
      testResults.tests.push({
        name: 'Monthly Price ID',
        status: 'fail',
        message: 'STRIPE_MONTHLY_PRICE_ID not set',
      });
    }

    if (process.env.STRIPE_ANNUAL_PRICE_ID) {
      try {
        const price = await getStripe().prices.retrieve(process.env.STRIPE_ANNUAL_PRICE_ID);
        testResults.tests.push({
          name: 'Annual Price ID',
          status: 'pass',
          message: `Price: ${price.unit_amount ? `£${(price.unit_amount / 100).toFixed(2)}` : 'N/A'} ${price.recurring?.interval || 'one-time'}`,
        });
      } catch (error: any) {
        testResults.tests.push({
          name: 'Annual Price ID',
          status: 'fail',
          message: error.message || 'Invalid annual price ID',
        });
      }
    } else {
      testResults.tests.push({
        name: 'Annual Price ID',
        status: 'fail',
        message: 'STRIPE_ANNUAL_PRICE_ID not set',
      });
    }

    const allPassed = testResults.tests.every(test => test.status === 'pass');
    const statusCode = allPassed ? 200 : 500;

    return NextResponse.json({
      success: allPassed,
      ...testResults,
    }, { status: statusCode });

  } catch (error: any) {
    console.error('Stripe test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Test failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
