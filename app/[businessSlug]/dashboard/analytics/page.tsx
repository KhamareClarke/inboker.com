'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/providers/auth-provider';
import type { BusinessProfile } from '@/lib/types';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, TrendingUp, Star } from 'lucide-react';

type BookingRow = {
  id: string;
  start_time: string;
  status: string;
  amount: number | null;
  client_email: string;
  source: string | null;
  business_profile_services: { id: string; name: string } | null;
  business_profile_staff: { id: string; full_name: string } | null;
};

export default function BusinessAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const businessSlug = params.businessSlug as string;
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [reviewRows, setReviewRows] = useState<{ rating: number; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      const checkSubscription = async () => {
        try {
          const response = await fetch('/api/stripe/subscription');
          const data = await response.json();
          if (response.ok && data.subscription) {
            const status = data.subscription.status;
            if (status !== 'active' && status !== 'trialing' && status !== 'trial') {
              router.replace('/dashboard/business-owner/billing?locked=true');
            }
          } else {
            router.replace('/dashboard/business-owner/billing?locked=true');
          }
        } catch {
          router.replace('/dashboard/business-owner/billing?locked=true');
        }
      };
      checkSubscription();
    }
  }, [user, authLoading, router]);

  const loadProfile = useCallback(async () => {
    if (!businessSlug) return;
    const { data, error: qErr } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('business_slug', businessSlug)
      .maybeSingle();

    if (qErr) throw qErr;
    return data as BusinessProfile | null;
  }, [businessSlug]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (authLoading) return;
      if (!user) {
        setLoading(false);
        setError('Sign in to view analytics.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const p = await loadProfile();
        if (cancelled) return;
        if (!p) {
          setProfile(null);
          setError('Business not found.');
          setBookings([]);
          setReviewRows([]);
          return;
        }
        if (p.user_id !== user.id) {
          setProfile(null);
          setError('You do not have access to this business.');
          setBookings([]);
          setReviewRows([]);
          return;
        }
        setProfile(p);

        const { data: rows, error: bErr } = await supabase
          .from('business_profile_bookings')
          .select(
            `
            id,
            start_time,
            status,
            amount,
            client_email,
            source,
            business_profile_services ( id, name ),
            business_profile_staff ( id, full_name )
          `
          )
          .eq('business_profile_id', p.id)
          .order('start_time', { ascending: false })
          .limit(1500);

        if (bErr) throw bErr;
        if (!cancelled) setBookings((rows as BookingRow[]) || []);

        const { data: revs, error: rErr } = await supabase
          .from('appointment_reviews')
          .select('rating, created_at')
          .eq('business_profile_id', p.id)
          .order('created_at', { ascending: true })
          .limit(800);
        if (rErr) throw rErr;
        if (!cancelled) {
          setReviewRows((revs as { rating: number; created_at: string }[]) || []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load');
          setBookings([]);
          setReviewRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [businessSlug, user, authLoading, loadProfile]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
    const revenueRows = bookings.filter(
      (b) => b.status !== 'cancelled' && typeof b.amount === 'number' && b.amount > 0
    );
    const revenue = revenueRows.reduce((s, b) => s + (b.amount || 0), 0);
    const avgValue = revenueRows.length ? revenue / revenueRows.length : 0;
    const emails = Array.from(new Set(bookings.map((b) => b.client_email.toLowerCase())));
    const repeatEmails = new Set<string>();
    const countByEmail = new Map<string, number>();
    for (const b of bookings) {
      const e = b.client_email.toLowerCase();
      countByEmail.set(e, (countByEmail.get(e) || 0) + 1);
    }
    countByEmail.forEach((c, e) => {
      if (c > 1) repeatEmails.add(e);
    });
    const repeatRate = emails.length ? repeatEmails.size / emails.length : 0;
    const byService = new Map<string, { count: number; revenue: number }>();
    for (const b of bookings) {
      const name = b.business_profile_services?.name || 'Unknown';
      const cur = byService.get(name) || { count: 0, revenue: 0 };
      cur.count += 1;
      if (b.status !== 'cancelled' && b.amount) cur.revenue += b.amount;
      byService.set(name, cur);
    }
    const byStaff = new Map<string, { count: number; revenue: number }>();
    for (const b of bookings) {
      const name = b.business_profile_staff?.full_name || 'Unassigned';
      const cur = byStaff.get(name) || { count: 0, revenue: 0 };
      cur.count += 1;
      if (b.status !== 'cancelled' && b.amount) cur.revenue += b.amount;
      byStaff.set(name, cur);
    }
    const hourBuckets = new Array(24).fill(0);
    for (const b of bookings) {
      if (b.status === 'cancelled') continue;
      const h = new Date(b.start_time).getHours();
      hourBuckets[h] += 1;
    }
    let peakHour = 0;
    let peakCount = 0;
    hourBuckets.forEach((c, h) => {
      if (c > peakCount) {
        peakCount = c;
        peakHour = h;
      }
    });
    const sources = new Map<string, number>();
    for (const b of bookings) {
      const s = b.source || 'unknown';
      sources.set(s, (sources.get(s) || 0) + 1);
    }
    return {
      cancellationRate: total ? cancelled / total : 0,
      revenue,
      avgValue,
      repeatRate,
      byService: Array.from(byService.entries()).sort((a, b) => b[1].revenue - a[1].revenue),
      byStaff: Array.from(byStaff.entries()).sort((a, b) => b[1].revenue - a[1].revenue),
      peakHour,
      peakCount,
      sources: Array.from(sources.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [bookings]);

  const reviewStats = useMemo(() => {
    const n = reviewRows.length;
    if (!n) return { avg: null as number | null, count: 0 };
    const avg = reviewRows.reduce((s, r) => s + r.rating, 0) / n;
    return { avg, count: n };
  }, [reviewRows]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Section>
        <p className="text-muted-foreground">{error || 'Not found'}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push(`/${businessSlug}/dashboard`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to dashboard
        </Button>
      </Section>
    );
  }

  const primary = profile.primary_color || '#3b82f6';

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${primary}08 0%, transparent 40%)` }}>
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" style={{ color: primary }} />
            <div>
              <h1 className="text-xl font-bold">Analytics</h1>
              <p className="text-sm text-muted-foreground">{profile.business_name}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push(`/${businessSlug}/dashboard`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </div>

      <Section className="py-6">
        <Container size="wide">
          <p className="text-sm text-muted-foreground mb-6">
            Snapshot from your most recent {bookings.length} bookings. Connect deeper reporting later as you scale.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Recorded revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg booking value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${stats.avgValue.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cancellation rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{(stats.cancellationRate * 100).toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Repeat customers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{(stats.repeatRate * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Share of customers with 2+ bookings</p>
              </CardContent>
            </Card>
            <Card className="col-span-2 sm:col-span-1 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Star className="h-4 w-4 shrink-0" />
                  Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {reviewStats.avg != null ? `${reviewStats.avg.toFixed(2)} / 5` : '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{reviewStats.count} public reviews</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {stats.byService.length === 0 ? (
                  <p className="text-muted-foreground">No data yet.</p>
                ) : (
                  stats.byService.map(([name, v]) => (
                    <div key={name} className="flex justify-between gap-4 border-b border-border/60 py-2 last:border-0">
                      <span className="truncate">{name}</span>
                      <span className="shrink-0 font-medium">
                        ${v.revenue.toFixed(2)} <span className="text-muted-foreground">({v.count})</span>
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by staff</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {stats.byStaff.length === 0 ? (
                  <p className="text-muted-foreground">No data yet.</p>
                ) : (
                  stats.byStaff.map(([name, v]) => (
                    <div key={name} className="flex justify-between gap-4 border-b border-border/60 py-2 last:border-0">
                      <span className="truncate">{name}</span>
                      <span className="shrink-0 font-medium">
                        ${v.revenue.toFixed(2)} <span className="text-muted-foreground">({v.count})</span>
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {stats.sources.map(([src, n]) => (
                  <div key={src} className="flex justify-between gap-4">
                    <span className="capitalize">{src.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{n}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak start hour</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {stats.peakCount > 0 ? `${stats.peakHour}:00 – ${stats.peakCount} bookings` : 'Not enough data'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Based on non-cancelled appointments in this sample.</p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </div>
  );
}
