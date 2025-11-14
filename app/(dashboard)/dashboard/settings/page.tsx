'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import { useAuth } from '@/lib/providers/auth-provider';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

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
      <div className="p-6">
        <Tabs defaultValue="workspace">
          <TabsList>
            <TabsTrigger value="workspace">Workspace</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="booking">Booking Page</TabsTrigger>
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

          <TabsContent value="profile" className="mt-6">
            <Card>
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

          <TabsContent value="booking" className="mt-6">
            <Card>
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
        </Tabs>
      </div>
    </div>
  );
}
