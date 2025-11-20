'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { BusinessProfile } from '@/lib/types';
import { useAuth } from '@/lib/providers/auth-provider';

export function useBusinessProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No profile found - this is okay, user can create one
          setProfile(null);
        } else {
          throw fetchError;
        }
      } else {
        setProfile(data);
      }
    } catch (err: any) {
      console.error('Error loading business profile:', err);
      setError(err.message || 'Failed to load business profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Partial<BusinessProfile>) => {
    // First, try to get the current user from Supabase directly
    // This helps with mobile browsers where session might not be detected
    let currentUser = user;
    
    if (!currentUser) {
      console.log('User not found in auth context, checking session directly...');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error('User not authenticated. Please log in again.');
        }
        if (!session?.user) {
          throw new Error('User not authenticated. Please log in again.');
        }
        currentUser = session.user;
        console.log('Found user from session:', currentUser.id);
      } catch (sessionErr: any) {
        console.error('Error getting session:', sessionErr);
        throw new Error('User not authenticated. Please log in again.');
      }
    }

    if (!currentUser) {
      throw new Error('User not authenticated. Please log in again.');
    }

    try {
      setError(null);

      console.log('Creating business profile for user:', currentUser.id);

      const { data, error: createError } = await supabase
        .from('business_profiles')
        .insert({
          user_id: currentUser.id,
          business_name: profileData.business_name || '',
          logo_url: profileData.logo_url || null,
          description: profileData.description || null,
          contact_email: profileData.contact_email || null,
          contact_phone: profileData.contact_phone || null,
          website: profileData.website || null,
          primary_color: profileData.primary_color || '#3b82f6',
          secondary_color: profileData.secondary_color || '#06b6d4',
          booking_page_title: profileData.booking_page_title || null,
          booking_page_subtitle: profileData.booking_page_subtitle || null,
          social_links: profileData.social_links || {},
          custom_settings: profileData.custom_settings || {},
        })
        .select()
        .single();

      if (createError) {
        console.error('Supabase create error:', createError);
        // Check if it's an auth error
        if (createError.code === 'PGRST301' || createError.message?.includes('JWT') || createError.message?.includes('authentication')) {
          throw new Error('Authentication expired. Please log in again.');
        }
        throw createError;
      }

      console.log('Business profile created successfully:', data.id);
      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Error creating business profile:', err);
      setError(err.message || 'Failed to create business profile');
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<BusinessProfile>) => {
    // First, try to get the current user from Supabase directly
    // This helps with mobile browsers where session might not be detected
    let currentUser = user;
    
    if (!currentUser) {
      console.log('User not found in auth context, checking session directly...');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error('User not authenticated. Please log in again.');
        }
        if (!session?.user) {
          throw new Error('User not authenticated. Please log in again.');
        }
        currentUser = session.user;
        console.log('Found user from session:', currentUser.id);
      } catch (sessionErr: any) {
        console.error('Error getting session:', sessionErr);
        throw new Error('User not authenticated. Please log in again.');
      }
    }

    if (!currentUser) {
      throw new Error('User not authenticated. Please log in again.');
    }

    try {
      setError(null);

      console.log('Updating business profile for user:', currentUser.id);

      const { data, error: updateError } = await supabase
        .from('business_profiles')
        .update(updates)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        // Check if it's an auth error
        if (updateError.code === 'PGRST301' || updateError.message?.includes('JWT') || updateError.message?.includes('authentication')) {
          throw new Error('Authentication expired. Please log in again.');
        }
        throw updateError;
      }

      console.log('Business profile updated successfully:', data.id);
      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Error updating business profile:', err);
      setError(err.message || 'Failed to update business profile');
      throw err;
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `business-logos/${fileName}`;

      // Try to upload to business-assets bucket
      let bucketName = 'business-assets';
      let { error: uploadError, data: uploadData } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      // If bucket doesn't exist, provide helpful error message
      if (uploadError) {
        const errorMsg = uploadError.message?.toLowerCase() || '';
        
        if (errorMsg.includes('bucket not found') || errorMsg.includes('not found')) {
          throw new Error(
            'Storage bucket not found. Please create a bucket named "business-assets" in your Supabase Storage settings, or contact support.'
          );
        }
        
        // If file already exists, try with upsert
        if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
          const { error: upsertError, data: upsertData } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
            });
          
          if (upsertError) {
            throw new Error(upsertError.message || 'Failed to upload logo');
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);
          
          return publicUrl;
        }
        
        throw new Error(uploadError.message || 'Failed to upload logo');
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    uploadLogo,
    refresh: loadProfile,
  };
}

