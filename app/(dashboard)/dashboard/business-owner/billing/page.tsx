'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, CreditCard, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/providers/auth-provider';
import { SUBSCRIPTION_PLANS, SubscriptionPlan, TRIAL_PERIOD_DAYS } from '@/lib/stripe-config';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: 'active' | 'inactive' | 'trial' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  useEffect(() => {
    // Check for success/cancel messages from Stripe redirect
    if (searchParams.get('success') === 'true') {
      setSuccess('Subscription activated successfully!');
      loadSubscription();
    }
    if (searchParams.get('canceled') === 'true') {
      setError('Subscription checkout was canceled.');
    }
  }, [searchParams]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/subscription');
      const data = await response.json();
      
      if (response.ok) {
        setSubscription(data.subscription);
      } else {
        setError(data.error || 'Failed to load subscription');
      }
    } catch (err: any) {
      console.error('Error loading subscription:', err);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      setProcessing(true);
      setError(null);
      
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Error creating checkout:', err);
      setError('Failed to start checkout process');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access at the end of the current billing period.')) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      
      const response = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Subscription will be cancelled at the end of the billing period');
        loadSubscription();
      } else {
        setError(data.error || 'Failed to cancel subscription');
      }
    } catch (err: any) {
      console.error('Error cancelling subscription:', err);
      setError('Failed to cancel subscription');
    } finally {
      setProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      const response = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reactivate' }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Subscription reactivated');
        loadSubscription();
      } else {
        setError(data.error || 'Failed to reactivate subscription');
      }
    } catch (err: any) {
      console.error('Error reactivating subscription:', err);
      setError('Failed to reactivate subscription');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      trialing: { variant: 'default', label: 'Trial' },
      trial: { variant: 'default', label: 'Trial' },
      past_due: { variant: 'destructive', label: 'Past Due' },
      cancelled: { variant: 'secondary', label: 'Cancelled' },
      inactive: { variant: 'outline', label: 'Inactive' },
    };

    const config = variants[status] || variants.inactive;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing' || subscription?.status === 'trial';
  const isTrialing = subscription?.status === 'trialing' || subscription?.status === 'trial';
  const isCancelling = subscription?.cancel_at_period_end;
  
  // Calculate days remaining in trial
  const getTrialDaysRemaining = () => {
    if (!subscription?.trial_end) return null;
    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const diff = trialEnd.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };
  
  const trialDaysRemaining = getTrialDaysRemaining();

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {subscription && isActive ? (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>
                  {isTrialing ? `Free trial - ${trialDaysRemaining !== null ? `${trialDaysRemaining} days remaining` : 'Active'}` : 'Your active subscription details'}
                </CardDescription>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isTrialing && trialDaysRemaining !== null && trialDaysRemaining > 0 && (
              <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <Calendar className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900 dark:text-blue-100">
                  <strong>Free Trial Active:</strong> You have {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining in your free trial. 
                  Your subscription will automatically start after the trial ends.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="font-medium">{getStatusBadge(subscription.status)}</p>
              </div>
              {isTrialing && subscription.trial_end ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Trial Ends</p>
                  <p className="font-medium">
                    {new Date(subscription.trial_end).toLocaleDateString()}
                  </p>
                </div>
              ) : subscription.current_period_end ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Next Billing Date</p>
                  <p className="font-medium">
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              ) : null}
            </div>

            {isCancelling && (
              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  Your subscription will be cancelled at the end of the current billing period.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 pt-4">
              {isCancelling ? (
                <Button
                  onClick={handleReactivateSubscription}
                  disabled={processing}
                  variant="default"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reactivating...
                    </>
                  ) : (
                    'Reactivate Subscription'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleCancelSubscription}
                  disabled={processing}
                  variant="destructive"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Cancel Subscription'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle>No Active Subscription</CardTitle>
            </div>
            <CardDescription>
              You need an active subscription to access the business dashboard. Choose a plan below to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
          // Note: priceId comparison is done server-side, we just show the plan here
          const isCurrentPlan = false; // Will be determined by subscription status
          const isSelected = !subscription || (!isActive && key === 'monthly');
          const isAnnual = key === 'annually';
          const monthlyEquivalent = isAnnual ? (plan.amount / 12).toFixed(2) : null;

          return (
            <Card key={key} className={isCurrentPlan ? 'border-blue-500 border-2' : ''}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">£{plan.amount}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                  {isAnnual && monthlyEquivalent && (
                    <p className="text-sm text-muted-foreground mt-1">
                      £{monthlyEquivalent}/month billed annually
                    </p>
                  )}
                  {isAnnual && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Save £98/year
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Unlimited bookings
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Customer management
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Email notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Business dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Staff management
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Service management
                  </li>
                  {isAnnual && (
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Best value - Save 79%
                    </li>
                  )}
                </ul>

                {isCurrentPlan ? (
                  <Button disabled className="w-full" variant="outline">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(key as SubscriptionPlan)}
                    disabled={processing}
                    className="w-full"
                    variant={isSelected ? 'default' : 'outline'}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      isActive ? 'Switch Plan' : 'Subscribe'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

