'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/providers/auth-provider';
import {
  parseCustomerPreferences,
  type CustomerBookingPreferencesShape,
} from '@/lib/customer-preferences';
import { Section } from '@/components/ui/section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type BusinessOption = { id: string; business_name: string };

export default function CustomerBookingPreferencesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [staff, setStaff] = useState<{ id: string; full_name: string; role: string | null }[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    favoriteStaffId: string;
    preferredTimes: string;
    serviceNotes: string;
    allergies: string;
    specialRequests: string;
  }>({
    favoriteStaffId: '',
    preferredTimes: '',
    serviceNotes: '',
    allergies: '',
    specialRequests: '',
  });

  const loadBusinesses = useCallback(async () => {
    if (!user?.email) {
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    try {
      const { data, error } = await supabase
        .from('business_profile_bookings')
        .select(
          `
          business_profile_id,
          business_profiles ( id, business_name )
        `
        )
        .eq('client_email', user.email);

      if (error) throw error;

      const map = new Map<string, string>();
      for (const row of data || []) {
        const bp = (row as { business_profiles?: { id: string; business_name: string } | null })
          .business_profiles;
        if (bp?.id) map.set(bp.id, bp.business_name || 'Business');
      }
      const opts = Array.from(map.entries()).map(([id, business_name]) => ({ id, business_name }));
      setBusinesses(opts);
      if (opts.length) {
        setSelectedBusinessId((prev) => prev || opts[0].id);
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'Could not load businesses',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoadingList(false);
    }
  }, [user?.email, toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoadingList(false);
      return;
    }
    loadBusinesses();
  }, [user, authLoading, loadBusinesses]);

  const loadStaff = useCallback(
    async (businessId: string) => {
      if (!businessId) {
        setStaff([]);
        return;
      }
      const { data, error } = await supabase
        .from('business_profile_staff')
        .select('id, full_name, role')
        .eq('business_profile_id', businessId)
        .eq('is_active', true)
        .order('full_name');

      if (error) {
        console.error(error);
        setStaff([]);
        return;
      }
      setStaff(data || []);
    },
    []
  );

  const loadPrefsForBusiness = useCallback(
    async (businessId: string) => {
      if (!user?.id || !businessId) return;
      setLoadingPrefs(true);
      try {
        await loadStaff(businessId);
        const { data, error } = await supabase
          .from('customer_booking_preferences')
          .select('id, preferences')
          .eq('user_id', user.id)
          .eq('business_profile_id', businessId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const p = parseCustomerPreferences(data.preferences);
          applyPrefsToForm(p);
        } else {
          setForm({
            favoriteStaffId: '',
            preferredTimes: '',
            serviceNotes: '',
            allergies: '',
            specialRequests: '',
          });
        }
      } catch (e) {
        console.error(e);
        toast({
          title: 'Could not load preferences',
          description: e instanceof Error ? e.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setLoadingPrefs(false);
      }
    },
    [user?.id, loadStaff, toast]
  );

  function applyPrefsToForm(p: CustomerBookingPreferencesShape) {
    setForm({
      favoriteStaffId: p.favoriteStaffId || '',
      preferredTimes: (p.preferredTimes || []).join(', '),
      serviceNotes: p.serviceNotes || '',
      allergies: (p.allergies || []).join(', '),
      specialRequests: p.specialRequests || '',
    });
  }

  useEffect(() => {
    if (!selectedBusinessId || !user?.id) return;
    loadPrefsForBusiness(selectedBusinessId);
  }, [selectedBusinessId, user?.id, loadPrefsForBusiness]);

  const handleSave = async () => {
    if (!user?.id || !selectedBusinessId) {
      toast({ title: 'Select a business', variant: 'destructive' });
      return;
    }
    const preferredTimes = form.preferredTimes
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const allergies = form.allergies
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const preferences: CustomerBookingPreferencesShape = {
      favoriteStaffId: form.favoriteStaffId || null,
      preferredTimes,
      serviceNotes: form.serviceNotes.trim() || undefined,
      allergies: allergies.length ? allergies : undefined,
      specialRequests: form.specialRequests.trim() || undefined,
    };

    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        business_profile_id: selectedBusinessId,
        preferences,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('customer_booking_preferences').upsert(payload, {
        onConflict: 'user_id,business_profile_id',
      });

      if (error) throw error;

      toast({ title: 'Preferences saved', description: 'We will pre-fill these on your next booking.' });
      await loadPrefsForBusiness(selectedBusinessId);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Save failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || (loadingList && !user)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Section>
        <p className="text-muted-foreground">Sign in to manage booking preferences.</p>
        <Button className="mt-4" onClick={() => router.push('/login')}>
          Log in
        </Button>
      </Section>
    );
  }

  return (
    <Section className="space-y-6 max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Booking preferences
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Saved per business. Used to pre-fill notes and staff on the booking page.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/customer')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {loadingList ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading businesses…
        </div>
      ) : businesses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No businesses yet</CardTitle>
            <CardDescription>
              After you book with a business, you can save preferences for that business here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push('/dashboard/customer')}>
              Browse services
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your defaults</CardTitle>
            <CardDescription>Choose a business, then update how you like to book with them.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business</Label>
              <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.business_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loadingPrefs ? (
              <div className="flex items-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading preferences…
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Favorite staff</Label>
                  <Select
                    value={form.favoriteStaffId || '__none__'}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, favoriteStaffId: v === '__none__' ? '' : v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No preference</SelectItem>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.full_name}
                          {s.role ? ` — ${s.role}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred times</Label>
                  <Input
                    placeholder="e.g. 10:00, 14:00, Friday afternoon"
                    value={form.preferredTimes}
                    onChange={(e) => setForm((f) => ({ ...f, preferredTimes: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated hints for usual times.</p>
                </div>

                <div className="space-y-2">
                  <Label>Service notes</Label>
                  <Textarea
                    rows={3}
                    placeholder="e.g. sensitive scalp, color tone preferences…"
                    value={form.serviceNotes}
                    onChange={(e) => setForm((f) => ({ ...f, serviceNotes: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Allergies / sensitivities</Label>
                  <Input
                    placeholder="latex, tree nuts (comma-separated)"
                    value={form.allergies}
                    onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Special requests</Label>
                  <Textarea
                    rows={2}
                    placeholder="e.g. quiet chair, music preference…"
                    value={form.specialRequests}
                    onChange={(e) => setForm((f) => ({ ...f, specialRequests: e.target.value }))}
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save preferences
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Section>
  );
}
