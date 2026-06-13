'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { postAdminResetPassword } from '@/lib/admin/post-reset-password';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Loader2, Shield, KeyRound, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  suspended: boolean;
  created_at: string;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resultDialog, setResultDialog] = useState<{
    open: boolean;
    email: string;
    temporaryPassword: string;
    emailSent: boolean;
  } | null>(null);

  const checkAdminStatus = useCallback(async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        if (userEmail === 'admin@inboker.com') {
          setIsAdmin(true);
          return true;
        }
        setIsAdmin(false);
        return false;
      }
      const ok = data?.role === 'admin';
      setIsAdmin(ok);
      return ok;
    } catch {
      if (userEmail === 'admin@inboker.com') {
        setIsAdmin(true);
        return true;
      }
      setIsAdmin(false);
      return false;
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/admin-login');
      return;
    }
    const run = async () => {
      if (profile?.role === 'admin') {
        setIsAdmin(true);
        return;
      }
      if (user.email === 'admin@inboker.com') {
        setIsAdmin(true);
        return;
      }
      await checkAdminStatus(user.id, user.email);
    };
    void run();
  }, [user, profile, authLoading, router, checkAdminStatus]);

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, suspended, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers((data as UserRow[]) || []);
    } catch (e) {
      console.error('Admin users load error:', e);
      toast({
        variant: 'destructive',
        title: 'Failed to load users',
        description: e instanceof Error ? e.message : 'Unknown error',
      });
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAdmin !== true) return;
    void loadUsers();
  }, [isAdmin, loadUsers]);

  useEffect(() => {
    if (isAdmin === false) {
      router.push('/admin-login');
    }
  }, [isAdmin, router]);

  const handleResetPassword = async (row: UserRow) => {
    if (row.role === 'admin') {
      toast({
        variant: 'destructive',
        title: 'Not allowed',
        description: 'Administrator accounts cannot be reset from this screen.',
      });
      return;
    }
    if (row.suspended) {
      toast({
        variant: 'destructive',
        title: 'Suspended',
        description: 'Unsuspend the account before resetting the password.',
      });
      return;
    }
    setResettingId(row.id);
    try {
      const res = await postAdminResetPassword(supabase, { userId: row.id });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Reset failed');
      }
      setResultDialog({
        open: true,
        email: row.email,
        temporaryPassword: data.temporaryPassword as string,
        emailSent: Boolean(data.emailSent),
      });
      toast({
        title: 'Password reset',
        description: data.emailSent
          ? 'A notice was sent by email (without the password). Copy the temporary password from the dialog.'
          : 'Email could not be sent (check server mail config). Copy the temporary password from the dialog.',
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Reset failed',
        description: e instanceof Error ? e.message : 'Unknown error',
      });
    } finally {
      setResettingId(null);
    }
  };

  if (authLoading && isAdmin !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-purple-300" />
      </div>
    );
  }

  if (!user || isAdmin === false) {
    return null;
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center text-purple-300">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
          Verifying admin access…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-slate-900/50 border-b border-purple-500/20">
        <Container size="wide" className="py-ds-2">
          <div className="flex flex-wrap items-center justify-between gap-ds-2">
            <div className="flex items-center gap-ds-2">
              <Shield className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="ds-heading-2 text-white">All users</h1>
                <p className="ds-body-sm text-purple-300">
                  Reset passwords for support (temporary password shown only here)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                asChild
                className="border-purple-500/20 text-purple-300 hover:bg-purple-500/10"
              >
                <Link href="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => void signOut()}
                className="border-purple-500/20 text-purple-300 hover:bg-purple-500/10"
              >
                Logout
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Section className="py-ds-4">
        <Container size="wide">
          <div className="rounded-ds-lg border border-purple-500/20 bg-slate-800/50 overflow-hidden">
            {loadingUsers ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-purple-300" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-500/20 hover:bg-transparent">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Role</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Registered</TableHead>
                    <TableHead className="text-right text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-purple-500/20 text-gray-200"
                    >
                      <TableCell>
                        <div className="font-medium text-white">
                          {row.full_name || row.email}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">{row.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {row.role?.replace('_', ' ') || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.suspended ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : (
                          <Badge variant="outline" className="border-green-500/40 text-green-400">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {row.created_at
                          ? format(new Date(row.created_at), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-500/30"
                          disabled={
                            resettingId === row.id ||
                            row.role === 'admin' ||
                            row.suspended
                          }
                          onClick={() => void handleResetPassword(row)}
                        >
                          {resettingId === row.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <KeyRound className="h-4 w-4 mr-1.5" />
                              Reset password
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Container>
      </Section>

      <Dialog
        open={Boolean(resultDialog?.open)}
        onOpenChange={(open) => {
          if (!open) setResultDialog(null);
        }}
      >
        <DialogContent className="bg-slate-800 border-purple-500/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Temporary password</DialogTitle>
            <DialogDescription className="text-gray-400">
              Share this with {resultDialog?.email} through a secure channel. It is not
              included in the email notice.
            </DialogDescription>
          </DialogHeader>
          {resultDialog && (
            <div className="space-y-3">
              <div className="rounded-ds bg-slate-900/80 border border-purple-500/30 p-3 font-mono text-sm text-white break-all">
                {resultDialog.temporaryPassword}
              </div>
              <p className="text-xs text-gray-500">
                Email notice sent: {resultDialog.emailSent ? 'yes' : 'no (check SMTP env)'}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="border-purple-500/20"
              onClick={() => {
                if (resultDialog?.temporaryPassword) {
                  void navigator.clipboard.writeText(resultDialog.temporaryPassword);
                  toast({ title: 'Copied', description: 'Temporary password copied.' });
                }
              }}
            >
              Copy password
            </Button>
            <Button
              onClick={() => setResultDialog(null)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
