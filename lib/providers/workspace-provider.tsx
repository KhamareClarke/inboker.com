'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Workspace, WorkspaceMember } from '@/lib/types';
import { useAuth } from './auth-provider';

interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaces: Workspace[];
  currentMember: WorkspaceMember | null;
  loading: boolean;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspace: null,
  workspaces: [],
  currentMember: null,
  loading: true,
  switchWorkspace: async () => {},
  refreshWorkspace: async () => {},
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentMember, setCurrentMember] = useState<WorkspaceMember | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWorkspaces = async () => {
    if (!user) {
      setLoading(false);
      setWorkspaces([]);
      setWorkspace(null);
      setCurrentMember(null);
      return;
    }

    try {
      // First try to get own memberships (simpler query)
      const { data: members, error } = await supabase
        .from('workspace_members')
        .select(`
          *,
          workspace:workspaces(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching workspaces:', error);
        // If error, just set empty and continue - user might not have workspaces yet
        setWorkspaces([]);
        setWorkspace(null);
        setCurrentMember(null);
        setLoading(false);
        return;
      }

      const workspacesList = members?.map((m: any) => m.workspace).filter(Boolean) || [];
      setWorkspaces(workspacesList);

      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      let selectedWorkspace = workspacesList.find(w => w.id === savedWorkspaceId);

      if (!selectedWorkspace && workspacesList.length > 0) {
        selectedWorkspace = workspacesList[0];
      }

      if (selectedWorkspace) {
        setWorkspace(selectedWorkspace);
        const member = members?.find((m: any) => m.workspace_id === selectedWorkspace.id);
        setCurrentMember(member || null);
        localStorage.setItem('currentWorkspaceId', selectedWorkspace.id);
      } else {
        setWorkspace(null);
        setCurrentMember(null);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
      setWorkspaces([]);
      setWorkspace(null);
      setCurrentMember(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, [user]);

  const switchWorkspace = async (workspaceId: string) => {
    const selectedWorkspace = workspaces.find(w => w.id === workspaceId);
    if (selectedWorkspace) {
      setWorkspace(selectedWorkspace);
      localStorage.setItem('currentWorkspaceId', workspaceId);

      const { data: member } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user?.id)
        .single();

      setCurrentMember(member);
    }
  };

  const refreshWorkspace = async () => {
    await loadWorkspaces();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        workspaces,
        currentMember,
        loading,
        switchWorkspace,
        refreshWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
};
