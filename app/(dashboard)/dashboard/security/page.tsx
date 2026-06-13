'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Section } from '@/components/ui/section';
import { useToast } from '@/hooks/use-toast';
import { Shield, Download, Trash2, KeyRound } from 'lucide-react';

const DELETE_CONFIRM = 'DELETE MY ACCOUNT';

export default function SecurityPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [factorsLoading, setFactorsLoading] = useState(true);
  const [totpFactors, setTotpFactors] = useState<{ id: string; friendly_name?: string; status: string }[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [deletePhrase, setDeletePhrase] = useState('');
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadFactors = useCallback(async () => {
    if (!supabase || !user) {
      setFactorsLoading(false);
      return;
    }
    setFactorsLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      toast({ title: 'Could not load MFA', description: error.message, variant: 'destructive' });
      setTotpFactors([]);
    } else {
      setTotpFactors(data?.totp ?? []);
    }
    setFactorsLoading(false);
  }, [user, toast]);

  useEffect(() => {
    void loadFactors();
  }, [loadFactors]);

  const startTotpEnroll = async () => {
    if (!supabase) return;
    setEnrolling(true);
    setQrData(null);
    setPendingFactorId(null);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Authenticator app',
    });
    setEnrolling(false);
    if (error) {
      toast({
        title: 'Enrollment failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    const totp = (data as { totp?: { qr_code?: string }; id?: string })?.totp;
    const id = (data as { id?: string })?.id;
    if (totp?.qr_code && id) {
      setQrData(totp.qr_code);
      setPendingFactorId(id);
    } else {
      toast({ title: 'Unexpected response', description: 'No QR payload from server.', variant: 'destructive' });
    }
  };

  const confirmTotpEnroll = async () => {
    if (!supabase || !pendingFactorId || verifyCode.length < 6) return;
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: pendingFactorId,
      code: verifyCode.replace(/\s/g, ''),
    });
    if (error) {
      toast({ title: 'Invalid code', description: error.message, variant: 'destructive' });
      return;
    }
    if (data?.access_token && data?.refresh_token) {
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
    }
    toast({ title: 'Authenticator enabled' });
    setQrData(null);
    setPendingFactorId(null);
    setVerifyCode('');
    void loadFactors();
  };

  const removeFactor = async (factorId: string) => {
    if (!supabase) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      toast({ title: 'Could not remove', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Authenticator removed' });
    void loadFactors();
  };

  const downloadExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/account/data-export', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inboker-export-${user?.id?.slice(0, 8) ?? 'data'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Export downloaded' });
    } catch (e: unknown) {
      toast({
        title: 'Export failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async () => {
    if (deletePhrase !== DELETE_CONFIRM) {
      toast({ title: 'Type the confirmation phrase exactly', variant: 'destructive' });
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: DELETE_CONFIRM }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || 'Delete failed');
      }
      toast({ title: 'Account deleted', description: 'You will be signed out.' });
      await signOut();
    } catch (e: unknown) {
      toast({
        title: 'Deletion failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <Section className="py-8">
        <p className="text-muted-foreground">Sign in to manage security settings.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Login</Link>
        </Button>
      </Section>
    );
  }

  return (
    <Section className="py-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Security & privacy</h1>
          <p className="text-sm text-muted-foreground">
            Two-factor authentication, GDPR export/erasure, and session hardening notes.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Two-factor authentication (TOTP)
          </CardTitle>
          <CardDescription>
            Enable MFA in your{' '}
            <a
              href="https://supabase.com/docs/guides/auth/auth-mfa"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              Supabase project
            </a>{' '}
            (Auth → Multi-factor) if enrollment fails here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {factorsLoading ? (
            <p className="text-sm text-muted-foreground">Loading factors…</p>
          ) : (
            <ul className="space-y-2">
              {totpFactors.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="text-sm">
                    {f.friendly_name || 'Authenticator'}: <span className="capitalize">{f.status}</span>
                  </span>
                  {f.status === 'verified' && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeFactor(f.id)}>
                      Remove
                    </Button>
                  )}
                </li>
              ))}
              {totpFactors.length === 0 && <p className="text-sm text-muted-foreground">No authenticator apps yet.</p>}
            </ul>
          )}

          {!pendingFactorId && (
            <Button type="button" onClick={startTotpEnroll} disabled={enrolling}>
              {enrolling ? 'Starting…' : 'Add authenticator app'}
            </Button>
          )}

          {qrData && pendingFactorId && (
            <div className="space-y-3 rounded-md border p-4">
              <p className="text-sm">Scan this QR in your authenticator app, then enter the 6-digit code.</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrData} alt="TOTP QR code" className="mx-auto h-44 w-44" />
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="totp-code">Verification code</Label>
                <Input
                  id="totp-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                />
                <Button type="button" onClick={confirmTotpEnroll} disabled={verifyCode.length < 6}>
                  Confirm & enable
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => { setQrData(null); setPendingFactorId(null); setVerifyCode(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            GDPR: export your data
          </CardTitle>
          <CardDescription>
            Download a JSON snapshot of profile, bookings, subscriptions, and preferences visible to your account
            under database rules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="secondary" onClick={downloadExport} disabled={exporting}>
            {exporting ? 'Preparing…' : 'Download JSON export'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            GDPR: delete account
          </CardTitle>
          <CardDescription>
            Permanently deletes your login and linked profile data where the database cascades. Active Stripe
            subscriptions are cancelled when possible. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-mono bg-muted px-2 py-1 rounded w-fit">{DELETE_CONFIRM}</p>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="del-confirm">Type the phrase above</Label>
            <Input
              id="del-confirm"
              value={deletePhrase}
              onChange={(e) => setDeletePhrase(e.target.value)}
              autoComplete="off"
            />
          </div>
          <Button type="button" variant="destructive" onClick={deleteAccount} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete my account'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Infrastructure & compliance notes</CardTitle>
          <CardDescription>Operational guidance (not legal advice).</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong className="text-foreground">PCI:</strong> card payments use Stripe Checkout; we do not store PAN
            or CVC in the app database.
          </p>
          <p>
            <strong className="text-foreground">DDoS / edge:</strong> use Vercel / Cloudflare WAF and bot protection in
            front of production traffic.
          </p>
          <p>
            <strong className="text-foreground">Encryption:</strong> data at rest in Postgres is handled by Supabase;
            traffic uses HTTPS (enforce HSTS in production).
          </p>
          <p>
            <strong className="text-foreground">Session timeout:</strong> idle auto sign-out runs in the app (see
            env <code className="text-xs">NEXT_PUBLIC_SESSION_IDLE_MS</code>).
          </p>
        </CardContent>
      </Card>

      <Button variant="outline" asChild>
        <Link href="/dashboard/customer">Back to dashboard</Link>
      </Button>
    </Section>
  );
}
