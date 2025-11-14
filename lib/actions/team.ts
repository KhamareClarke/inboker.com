'use server';

import { supabase } from '../supabase';
import { revalidatePath } from 'next/cache';

export async function getWorkspaceMembers(workspaceId: string) {
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      *,
      user:users(*)
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addWorkspaceMember(
  workspaceId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member'
) {
  const { data, error } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      role,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/dashboard/team');
  return data;
}

export async function updateMemberRole(
  memberId: string,
  role: 'owner' | 'admin' | 'member'
) {
  const { data, error } = await supabase
    .from('workspace_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/dashboard/team');
  return data;
}

export async function deactivateMember(memberId: string) {
  const { data, error } = await supabase
    .from('workspace_members')
    .update({ is_active: false })
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/dashboard/team');
  return data;
}

export async function getTeamShifts(workspaceId: string) {
  const { data, error } = await supabase
    .from('team_shifts')
    .select(`
      *,
      member:workspace_members(
        *,
        user:users(*)
      )
    `)
    .eq('workspace_id', workspaceId)
    .order('day_of_week', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createTeamShift(
  workspaceId: string,
  memberId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string
) {
  const { data, error } = await supabase
    .from('team_shifts')
    .insert({
      workspace_id: workspaceId,
      member_id: memberId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/dashboard/team');
  return data;
}

export async function updateTeamShift(
  shiftId: string,
  startTime: string,
  endTime: string
) {
  const { data, error } = await supabase
    .from('team_shifts')
    .update({
      start_time: startTime,
      end_time: endTime,
    })
    .eq('id', shiftId)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/dashboard/team');
  return data;
}

export async function deleteTeamShift(shiftId: string) {
  const { error } = await supabase
    .from('team_shifts')
    .delete()
    .eq('id', shiftId);

  if (error) throw error;
  revalidatePath('/dashboard/team');
}

export async function getTimeOff(workspaceId: string) {
  const { data, error } = await supabase
    .from('time_off')
    .select(`
      *,
      member:workspace_members(
        *,
        user:users(*)
      )
    `)
    .eq('workspace_id', workspaceId)
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createTimeOff(
  workspaceId: string,
  memberId: string,
  startDate: string,
  endDate: string,
  reason: string,
  allDay: boolean
) {
  const { data, error } = await supabase
    .from('time_off')
    .insert({
      workspace_id: workspaceId,
      member_id: memberId,
      start_date: startDate,
      end_date: endDate,
      reason,
      all_day: allDay,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/dashboard/calendar');
  return data;
}

export async function deleteTimeOff(timeOffId: string) {
  const { error } = await supabase
    .from('time_off')
    .delete()
    .eq('id', timeOffId);

  if (error) throw error;
  revalidatePath('/dashboard/calendar');
}
