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
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';

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
  const [processingPlan, setProcessingPlan] = useState<SubscriptionPlan | null>(null);
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
      setError(null); // Don't show error — show friendly message in the card below instead
    }
    if (searchParams.get('locked') === 'true') {
      setError('Your subscription is inactive. Please add a payment method below to access the dashboard.');
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
      setProcessingPlan(plan);
      setError(null);

      // New/inactive users get 14-day trial (no charge now). Active users use normal checkout to switch plan.
      const hasActive = subscription && (subscription.status === 'active' || subscription.status === 'trialing' || subscription.status === 'trial');
      const endpoint = !hasActive ? '/api/stripe/create-trial-subscription' : '/api/stripe/create-checkout';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Error creating checkout:', err);
      setError('Failed to start checkout process');
    } finally {
      setProcessingPlan(null);
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

  // For "no subscription" state: trial end date (today + 14 days) for copy
  const trialEndDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + TRIAL_PERIOD_DAYS);
    return d;
  })();
  const showNoSubscriptionState = !subscription || !isActive;
  const cameFromCanceled = searchParams.get('canceled') === 'true';

  return (
    <Section className="py-ds-4">
      <Container size="narrow">
      <div className="mb-ds-4">
        <h1 className="ds-heading-2 mb-ds-1">Billing & Subscription</h1>
        <p className="text-muted-foreground ds-body">
          {showNoSubscriptionState
            ? 'Enter your card details below. No money will be taken now. Your subscription starts after your 14-day trial.'
            : 'Manage your subscription and billing information'}
        </p>
        {showNoSubscriptionState && (
          <p className="mt-ds-1 ds-body-sm font-medium text-green-700 dark:text-green-400">
            No charge at checkout. Your card is only saved; the first payment will be on {trialEndDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.
          </p>
        )}
      </div>

      {success && (
        <Alert className="mb-ds-3 rounded-ds-lg border-green-500 bg-green-50 dark:bg-green-950">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-ds-3 rounded-ds-lg border-amber-500 bg-amber-50 dark:bg-amber-950">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {subscription && isActive ? (
        <Card className="mb-ds-4 rounded-ds-lg shadow-ds-md">
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
          <CardContent className="space-y-ds-2">
            {isTrialing && trialDaysRemaining !== null && trialDaysRemaining > 0 && (
              <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <Calendar className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900 dark:text-blue-100">
                  <strong>Free Trial Active:</strong> You have {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining in your free trial. 
                  Your subscription will automatically start after the trial ends.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-2">
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
        <Card className="mb-ds-4 rounded-ds-lg shadow-ds-md border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="ds-heading-3">Get started, no charge now</CardTitle>
            <CardDescription className="text-base">
              You only need to enter your card details. <strong>No money will be deducted now.</strong> Your subscription starts after your {TRIAL_PERIOD_DAYS}-day trial, on <strong>{trialEndDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>. Choose a plan below.
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-2">
              In Stripe checkout you will only add your card; the first charge is on {trialEndDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}.
            </p>
            {cameFromCanceled && (
              <p className="text-sm text-muted-foreground mt-1">
                You left checkout earlier. No problem. Complete the steps below when you&apos;re ready.
              </p>
            )}
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-3">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
          const planKey = key as SubscriptionPlan;
          const isCurrentPlan = false; // Will be determined by subscription status
          const isSelected = !subscription || (!isActive && planKey === 'monthly');
          const isAnnual = planKey === 'annually';
          const isThisPlanProcessing = processingPlan === planKey;
          const monthlyEquivalent = isAnnual ? (plan.amount / 12).toFixed(2) : null;

          return (
            <Card key={key} className={`rounded-ds-lg shadow-ds-md ${isCurrentPlan ? 'border-blue-500 border-2' : ''}`}>
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

                {showNoSubscriptionState && (
                  <p className="text-xs text-center text-green-600 dark:text-green-400 font-medium">
                    No charge for {TRIAL_PERIOD_DAYS} days. First payment {trialEndDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
                {isCurrentPlan ? (
                  <Button disabled className="w-full" variant="outline">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(planKey)}
                    disabled={processingPlan !== null}
                    className="w-full"
                    variant={isSelected ? 'default' : 'outline'}
                  >
                    {isThisPlanProcessing ? (
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
      </Container>
    </Section>
  );
}

