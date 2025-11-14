'use server';

import { supabase } from '../supabase';
import { revalidatePath } from 'next/cache';

export async function getServices(workspaceId: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getActiveServices(workspaceId: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createService(data: {
  workspace_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  color?: string;
}) {
  const { data: service, error } = await supabase
    .from('services')
    .insert({
      workspace_id: data.workspace_id,
      name: data.name,
      description: data.description,
      duration_minutes: data.duration_minutes,
      price: data.price,
      color: data.color || '#3b82f6',
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/dashboard/services');
  return service;
}

export async function updateService(
  serviceId: string,
  updates: {
    name?: string;
    description?: string;
    duration_minutes?: number;
    price?: number;
    color?: string;
    is_active?: boolean;
  }
) {
  const { data, error } = await supabase
    .from('services')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', serviceId)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/dashboard/services');
  return data;
}

export async function deleteService(serviceId: string) {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId);

  if (error) throw error;
  revalidatePath('/dashboard/services');
}

export async function getMemberAvailability(memberId: string) {
  const { data, error } = await supabase
    .from('member_availability')
    .select('*')
    .eq('workspace_member_id', memberId)
    .eq('is_active', true)
    .order('day_of_week', { ascending: true });

  if (error) throw error;
  return data;
}

export async function setMemberAvailability(
  memberId: string,
  availability: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>
) {
  await supabase
    .from('member_availability')
    .delete()
    .eq('workspace_member_id', memberId);

  if (availability.length === 0) {
    revalidatePath('/dashboard/team');
    return;
  }

  const { data, error } = await supabase
    .from('member_availability')
    .insert(
      availability.map((slot) => ({
        workspace_member_id: memberId,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_active: true,
      }))
    )
    .select();

  if (error) throw error;
  revalidatePath('/dashboard/team');
  return data;
}
