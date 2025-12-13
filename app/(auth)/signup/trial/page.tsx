'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, CreditCard, Gift, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/providers/auth-provider';
import { SUBSCRIPTION_PLANS, TRIAL_PERIOD_DAYS, SubscriptionPlan } from '@/lib/stripe-config';

export default function TrialSignupPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const plan = searchParams.get('plan') as SubscriptionPlan;
    if (plan && (plan === 'monthly' || plan === 'annually')) {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      // If no user, redirect to login with a message
      router.replace('/login?redirect=/signup/trial&message=Please log in to start your free trial');
    }
  }, [user, authLoading, router]);

  const handleStartTrial = async () => {
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions to continue');
      return;
    }

    if (!user) {
      setError('You must be logged in to start a trial. Redirecting to login...');
      setTimeout(() => {
        router.replace('/login?redirect=/signup/trial');
      }, 2000);
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      
      const response = await fetch('/api/stripe/create-trial-subscription', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          setTimeout(() => {
            router.replace('/login?redirect=/signup/trial');
          }, 2000);
        } else {
          setError(data.error || 'Failed to start trial. Please try again.');
        }
        setProcessing(false);
      }
    } catch (err: any) {
      console.error('Error starting trial:', err);
      setError('Failed to start trial. Please try again.');
      setProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const monthlyPlan = SUBSCRIPTION_PLANS.monthly;
  const annualPlan = SUBSCRIPTION_PLANS.annually;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-indigo-950/30">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

      <Card className="w-full max-w-2xl relative border-2 shadow-2xl backdrop-blur-sm bg-background/80">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4">
            <Gift className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Start Your 14-Day Free Trial</CardTitle>
          <CardDescription className="text-lg">
            No charges for {TRIAL_PERIOD_DAYS} days. Cancel anytime during your trial.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${selectedPlan === 'monthly' ? 'border-blue-500 border-2 shadow-lg' : 'border'}`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <CardHeader>
                <CardTitle className="text-xl">{monthlyPlan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">£{monthlyPlan.amount}</span>
                  <span className="text-muted-foreground">/{monthlyPlan.interval}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    {TRIAL_PERIOD_DAYS} days free trial
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Cancel anytime
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${selectedPlan === 'annually' ? 'border-blue-500 border-2 shadow-lg' : 'border'}`}
              onClick={() => setSelectedPlan('annually')}
            >
              <CardHeader>
                <CardTitle className="text-xl">{annualPlan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">£{annualPlan.amount}</span>
                  <span className="text-muted-foreground">/{annualPlan.interval}</span>
                </div>
                <div className="text-sm text-green-600 font-medium mt-1">
                  Save £98/year
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    {TRIAL_PERIOD_DAYS} days free trial
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Cancel anytime
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Best value
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              <strong>Card required:</strong> We'll collect your payment method to start your free trial. 
              You won't be charged until your {TRIAL_PERIOD_DAYS}-day trial ends. You can cancel anytime during the trial.
            </AlertDescription>
          </Alert>

          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
            <input
              type="checkbox"
              id="agree"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="agree" className="text-sm text-muted-foreground cursor-pointer">
              I agree to the terms and conditions and understand that my card will be charged 
              £{selectedPlan === 'monthly' ? monthlyPlan.amount : annualPlan.amount} 
              {' '}{selectedPlan === 'monthly' ? 'monthly' : 'annually'} after my {TRIAL_PERIOD_DAYS}-day free trial ends, 
              unless I cancel before the trial period ends.
            </label>
          </div>

          <Button
            onClick={handleStartTrial}
            disabled={processing || !agreedToTerms}
            className="w-full h-12 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 shadow-lg"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Start Free Trial
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you'll be redirected to Stripe to securely enter your payment details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

