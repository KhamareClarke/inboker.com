'use client';

import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Section } from '@/components/ui/section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Recommendation = {
  id: string;
  business_id: string;
  skill_id: number;
  title: string;
  description: string;
  action: string | null;
  estimated_impact: string;
  status: string;
  created_at: string;
};

export default function AiRecommendationsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/empire-os/recommendations');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setItems(data.recommendations || []);
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Could not load recommendations',
        variant: 'destructive',
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const patchStatus = async (id: string, status: 'implemented' | 'dismissed') => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/empire-os/recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setItems((prev) => prev.filter((r) => r.id !== id));
      toast({ title: status === 'implemented' ? 'Marked implemented' : 'Dismissed' });
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Update failed',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <Header title="AI recommendations" />
      <Section className="py-ds-4 space-y-6">
        <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
          <Sparkles className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Empire OS</p>
            <p className="text-sm text-muted-foreground">
              Recommendations pushed from your intelligence layer appear here. Outbound events are logged when
              bookings, reviews, signups, and payments occur (see <code className="text-xs">empire_os_events</code> in
              Supabase).
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No recommendations yet</CardTitle>
              <CardDescription>
                When Empire OS POSTs to{' '}
                <code className="text-xs">/api/empire-os/callback</code> with your secret, items will list here.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((rec) => (
              <Card key={rec.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <Badge variant="outline">Skill {rec.skill_id}</Badge>
                    <Badge
                      variant={
                        rec.estimated_impact === 'high'
                          ? 'default'
                          : rec.estimated_impact === 'low'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {rec.estimated_impact} impact
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {new Date(rec.created_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  {rec.action && (
                    <p className="text-sm">
                      <span className="font-medium">Suggested action:</span> {rec.action}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={updatingId === rec.id}
                      onClick={() => void patchStatus(rec.id, 'implemented')}
                    >
                      Implement
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === rec.id}
                      onClick={() => void patchStatus(rec.id, 'dismissed')}
                    >
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
