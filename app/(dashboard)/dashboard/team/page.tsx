'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamMemberCard } from '@/components/team/team-member-card';
import { ShiftSchedule } from '@/components/team/shift-schedule';
import { Plus, Loader2 } from 'lucide-react';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import { getWorkspaceMembers, getTeamShifts, updateMemberRole, deactivateMember, createTeamShift, deleteTeamShift } from '@/lib/actions/team';
import { useToast } from '@/hooks/use-toast';

export default function TeamPage() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [workspace]);

  const loadData = async () => {
    if (!workspace) return;

    setLoading(true);
    try {
      const [membersData, shiftsData] = await Promise.all([
        getWorkspaceMembers(workspace.id),
        getTeamShifts(workspace.id),
      ]);
      setMembers(membersData || []);
      setShifts(shiftsData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load team data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, role: 'owner' | 'admin' | 'member') => {
    try {
      await updateMemberRole(memberId, role);
      await loadData();
      toast({
        title: 'Success',
        description: 'Member role updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = async (memberId: string) => {
    try {
      await deactivateMember(memberId);
      await loadData();
      toast({
        title: 'Success',
        description: 'Member deactivated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate member',
        variant: 'destructive',
      });
    }
  };

  const handleCreateShift = async (memberId: string, dayOfWeek: number, startTime: string, endTime: string) => {
    if (!workspace) return;

    try {
      await createTeamShift(workspace.id, memberId, dayOfWeek, startTime, endTime);
      await loadData();
      toast({
        title: 'Success',
        description: 'Shift created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create shift',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      await deleteTeamShift(shiftId);
      await loadData();
      toast({
        title: 'Success',
        description: 'Shift deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete shift',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Team Management" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Team Management" />
      <div className="p-6">
        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Manage your team members and their roles
              </p>
              <Button disabled>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>

            {members.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No team members yet</p>
                <p className="text-xs text-muted-foreground">You are currently the only member</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {members.map((member: any) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    onUpdateRole={handleUpdateRole}
                    onDeactivate={handleDeactivate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            {members.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  Add team members first to create schedules
                </p>
              </Card>
            ) : (
              <ShiftSchedule
                shifts={shifts}
                members={members}
                onCreateShift={handleCreateShift}
                onDeleteShift={handleDeleteShift}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
