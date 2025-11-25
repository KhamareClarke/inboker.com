'use server';

import { supabase } from '../supabase';
import { revalidatePath } from 'next/cache';

export async function getClients(workspaceId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('last_activity_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getClientById(clientId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      activities:client_activities(
        *,
        created_by_user:users(*)
      )
    `)
    .eq('id', clientId)
    .single();

  if (error) throw error;
  return data;
}

export async function createClient(data: {
  workspace_id: string;
  full_name: string;
  email: string;
  phone?: string;
  pipeline_stage?: string;
  notes?: string;
  tags?: string[];
}) {
  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      workspace_id: data.workspace_id,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      tags: data.tags || [],
      pipeline_stage: data.pipeline_stage || 'lead',
      notes: data.notes,
      lead_score: 0,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('client_activities')
    .insert({
      workspace_id: data.workspace_id,
      client_id: client.id,
      activity_type: 'note',
      title: 'Client Created',
      description: 'New client added to the system',
    });

  revalidatePath('/dashboard/crm');
  return client;
}

export async function updateClient(
  clientId: string,
  updates: {
    full_name?: string;
    email?: string;
    phone?: string;
    tags?: string[];
    notes?: string;
  }
) {
  const { data, error } = await supabase
    .from('clients')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', clientId)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/dashboard/crm');
  revalidatePath('/dashboard/clients');
  return data;
}

export async function updateClientPipelineStage(
  clientId: string,
  pipelineStage: string
) {
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('workspace_id, pipeline_stage')
    .eq('id', clientId)
    .single();

  if (clientError) throw clientError;

  const { data, error } = await supabase
    .from('clients')
    .update({
      pipeline_stage: pipelineStage,
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', clientId)
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('client_activities')
    .insert({
      workspace_id: client.workspace_id,
      client_id: clientId,
      activity_type: 'status_change',
      title: 'Stage Changed',
      description: `Moved from ${client.pipeline_stage} to ${pipelineStage}`,
      metadata: {
        from: client.pipeline_stage,
        to: pipelineStage,
      },
    });

  revalidatePath('/dashboard/crm');
  return data;
}

export async function updateLeadScore(clientId: string, points: number) {
  const { data: client } = await supabase
    .from('clients')
    .select('lead_score')
    .eq('id', clientId)
    .single();

  if (!client) return;

  const { data, error } = await supabase
    .from('clients')
    .update({
      lead_score: (client.lead_score || 0) + points,
    })
    .eq('id', clientId)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/dashboard/crm');
  return data;
}

export async function deleteClient(clientId: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);

  if (error) throw error;
  revalidatePath('/dashboard/crm');
  revalidatePath('/dashboard/clients');
}

export async function getClientActivities(clientId: string) {
  const { data, error } = await supabase
    .from('client_activities')
    .select(`
      *,
      created_by_user:users(*)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createClientActivity(
  workspaceId: string,
  clientId: string,
  activityType: 'booking' | 'note' | 'email' | 'call' | 'status_change',
  title: string,
  description?: string,
  createdBy?: string
) {
  const { data, error } = await supabase
    .from('client_activities')
    .insert({
      workspace_id: workspaceId,
      client_id: clientId,
      activity_type: activityType,
      title,
      description,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('clients')
    .update({
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', clientId);

  revalidatePath('/dashboard/crm');
  revalidatePath(`/dashboard/clients/${clientId}`);
  return data;
}

export async function getClientsByPipelineStage(workspaceId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('lead_score', { ascending: false });

  if (error) throw error;

  const grouped = data.reduce((acc: any, client: any) => {
    const stage = client.pipeline_stage;
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(client);
    return acc;
  }, {} as Record<string, typeof data>);

  return grouped;
}
