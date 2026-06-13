'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import { useAuth } from '@/lib/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Section } from '@/components/ui/section';

export default function SettingsPage() {
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const [activeTab, setActiveTab] = useState('workspace');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [frequency, setFrequency] = useState('immediate');
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'notifications' || t === 'profile' || t === 'booking' || t === 'workspace') {
      setActiveTab(t);
    }
  }, [searchParams]);

  const loadPrefs = useCallback(async () => {
    if (!user?.id || !supabase) return;
    setPrefsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('email_enabled, sms_enabled, push_enabled, frequency')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setEmailEnabled(data.email_enabled);
        setSmsEnabled(data.sms_enabled);
        setPushEnabled(data.push_enabled);
        setFrequency(data.frequency);
      } else {
        setEmailEnabled(true);
        setSmsEnabled(true);
        setPushEnabled(false);
        setFrequency('immediate');
      }
    } catch (e) {
      console.warn('[settings] notification prefs', e);
    } finally {
      setPrefsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === 'notifications') void loadPrefs();
  }, [activeTab, loadPrefs]);

  const persistPrefs = async (next: {
    email_enabled?: boolean;
    sms_enabled?: boolean;
    push_enabled?: boolean;
    frequency?: string;
  }) => {
    if (!user?.id || !supabase) return;
    setPrefsSaving(true);
    const email = next.email_enabled ?? emailEnabled;
    const sms = next.sms_enabled ?? smsEnabled;
    const push = next.push_enabled ?? pushEnabled;
    const freq = next.frequency ?? frequency;
    const { error } = await supabase.from('notification_preferences').upsert(
      {
        user_id: user.id,
        email_enabled: email,
        sms_enabled: sms,
        push_enabled: push,
        frequency: freq,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    setPrefsSaving(false);
    if (error) {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
      return;
    }
    setEmailEnabled(email);
    setSmsEnabled(sms);
    setPushEnabled(push);
    setFrequency(freq);
  };

  const onTabChange = (v: string) => {
    setActiveTab(v);
    router.replace(`/dashboard/settings?tab=${v}`, { scroll: false });
  };

  const bookingUrl = workspace ? `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${workspace.slug}` : '';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Booking URL copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Header title="Settings" />
      <Section className="py-ds-4">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="workspace">Workspace</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="booking">Booking Page</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="workspace" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Workspace Settings</CardTitle>
                <CardDescription>Manage your workspace information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Workspace Name</Label>
                  <Input value={workspace?.name || ''} disabled />
                </div>
                <div>
                  <Label>Workspace Slug</Label>
                  <Input value={workspace?.slug || ''} disabled />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-ds-3">
            <Card className="rounded-ds-lg shadow-ds-md">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                </div>
                <div>
                  <Label>User ID</Label>
                  <Input value={user?.id || ''} disabled />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="booking" className="mt-ds-3">
            <Card className="rounded-ds-lg shadow-ds-md">
              <CardHeader>
                <CardTitle>Public Booking Page</CardTitle>
                <CardDescription>Share this URL with clients to allow them to book appointments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Your Booking URL</Label>
                  <div className="flex gap-2 mt-2">
                    <Input value={bookingUrl} readOnly />
                    <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Clients can visit this link to book appointments with your team
                  </p>
                </div>
                <div>
                  <Button asChild variant="outline">
                    <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                      Preview Booking Page
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-ds-3">
            <Card className="rounded-ds-lg shadow-ds-md">
              <CardHeader>
                <CardTitle>Notification channels</CardTitle>
                <CardDescription>
                  Control how Inboker reaches you. In-app alerts always appear in your Alerts menu when sent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {prefsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading preferences…</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <Label htmlFor="email-notif">Email</Label>
                        <p className="text-xs text-muted-foreground">Booking and account messages</p>
                      </div>
                      <Switch
                        id="email-notif"
                        checked={emailEnabled}
                        disabled={prefsSaving}
                        onCheckedChange={(c) => void persistPrefs({ email_enabled: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <Label htmlFor="sms-notif">SMS</Label>
                        <p className="text-xs text-muted-foreground">Requires phone on your profile and GHL configured</p>
                      </div>
                      <Switch
                        id="sms-notif"
                        checked={smsEnabled}
                        disabled={prefsSaving}
                        onCheckedChange={(c) => void persistPrefs({ sms_enabled: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <Label htmlFor="push-notif">Push (browser / device)</Label>
                        <p className="text-xs text-muted-foreground">
                          Preference only for now; device push delivery can be enabled in a future update.
                        </p>
                      </div>
                      <Switch
                        id="push-notif"
                        checked={pushEnabled}
                        disabled={prefsSaving}
                        onCheckedChange={(c) => void persistPrefs({ push_enabled: c })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Delivery</Label>
                      <Select
                        value={frequency}
                        disabled={prefsSaving}
                        onValueChange={(v) => void persistPrefs({ frequency: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="daily">Daily digest (reserved)</SelectItem>
                          <SelectItem value="weekly">Weekly digest (reserved)</SelectItem>
                          <SelectItem value="never">Off</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        &quot;Off&quot; stops automated email and SMS from this pipeline. In-app rows may still be created for security events.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Section>
    </div>
  );
}
