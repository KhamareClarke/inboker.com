'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { PipelineBoard } from '@/components/crm/pipeline-board';
import { AddClientDialog } from '@/components/crm/add-client-dialog';
import { Loader2 } from 'lucide-react';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import { getClientsByPipelineStage, updateClientPipelineStage } from '@/lib/actions/clients';
import { useToast } from '@/hooks/use-toast';

export default function CRMPage() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const [clientsByStage, setClientsByStage] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, [workspace]);

  const loadClients = async () => {
    if (!workspace) return;
    setLoading(true);
    try {
      const grouped = await getClientsByPipelineStage(workspace.id);
      setClientsByStage(grouped);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load clients',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (clientId: string, newStage: string) => {
    try {
      await updateClientPipelineStage(clientId, newStage);
      await loadClients();
      toast({
        title: 'Success',
        description: 'Client stage updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update stage',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="CRM Pipeline" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="CRM Pipeline" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Manage your leads and track client progress
          </p>
          {workspace && <AddClientDialog workspaceId={workspace.id} onClientAdded={loadClients} />}
        </div>
        <PipelineBoard clientsByStage={clientsByStage} onUpdateStage={handleUpdateStage} onClientClick={(id) => {}} />
      </div>
    </div>
  );
}
