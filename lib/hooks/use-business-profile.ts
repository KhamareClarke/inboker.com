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
        // Add timeout for mobile
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 10000)
        );

        const sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (sessionResult.error) {
          console.error('Session error:', sessionResult.error);
          throw new Error('User not authenticated. Please log in again.');
        }
        
        if (!sessionResult.data?.session?.user) {
          // Try one more time on mobile
          await new Promise(r => setTimeout(r, 1000));
          const retryResult = await supabase.auth.getSession();
          if (!retryResult.data?.session?.user) {
            throw new Error('User not authenticated. Please log in again.');
          }
          currentUser = retryResult.data.session.user;
        } else {
          currentUser = sessionResult.data.session.user;
        }
        
        if (!currentUser) {
          throw new Error('User not authenticated. Please log in again.');
        }
        
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

      // Add timeout to prevent hanging on mobile
      const insertPromise = supabase
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

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timed out')), 30000) // Increased to 30s for mobile
      );

      const result = await Promise.race([
        insertPromise.then((r: any) => ({ type: 'success', data: r.data, error: r.error })),
        timeoutPromise.then(() => ({ type: 'timeout', data: null, error: { message: 'Operation timed out' } }))
      ]) as any;

      if (result.type === 'timeout') {
        console.error('Create profile timeout');
        throw new Error('Save operation timed out. Please check your connection and try again.');
      }

      if (result.error) {
        console.error('Supabase create error:', result.error);
        // Check if it's an auth error
        if (result.error.code === 'PGRST301' || result.error.message?.includes('JWT') || result.error.message?.includes('authentication')) {
          throw new Error('Authentication expired. Please log in again.');
        }
        // Provide more specific error messages
        if (result.error.message?.includes('duplicate') || result.error.message?.includes('unique')) {
          throw new Error('A business profile already exists for this account.');
        }
        throw new Error(result.error.message || 'Failed to save profile. Please try again.');
      }

      if (!result.data) {
        throw new Error('Failed to create profile. Please try again.');
      }

      console.log('Business profile created successfully:', result.data.id);
      setProfile(result.data);
      return result.data;
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
        // Add timeout for mobile
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 10000)
        );

        const sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (sessionResult.error) {
          console.error('Session error:', sessionResult.error);
          throw new Error('User not authenticated. Please log in again.');
        }
        
        if (!sessionResult.data?.session?.user) {
          // Try one more time on mobile
          await new Promise(r => setTimeout(r, 1000));
          const retryResult = await supabase.auth.getSession();
          if (!retryResult.data?.session?.user) {
            throw new Error('User not authenticated. Please log in again.');
          }
          currentUser = retryResult.data.session.user;
        } else {
          currentUser = sessionResult.data.session.user;
        }
        
        if (!currentUser) {
          throw new Error('User not authenticated. Please log in again.');
        }
        
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

      // Add timeout to prevent hanging on mobile
      const updatePromise = supabase
        .from('business_profiles')
        .update(updates)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timed out')), 30000) // Increased to 30s for mobile
      );

      const result = await Promise.race([
        updatePromise.then((r: any) => ({ type: 'success', data: r.data, error: r.error })),
        timeoutPromise.then(() => ({ type: 'timeout', data: null, error: { message: 'Operation timed out' } }))
      ]) as any;

      if (result.type === 'timeout') {
        console.error('Update profile timeout');
        throw new Error('Save operation timed out. Please check your connection and try again.');
      }

      if (result.error) {
        console.error('Supabase update error:', result.error);
        // Check if it's an auth error
        if (result.error.code === 'PGRST301' || result.error.message?.includes('JWT') || result.error.message?.includes('authentication')) {
          throw new Error('Authentication expired. Please log in again.');
        }
        // Provide more specific error messages
        throw new Error(result.error.message || 'Failed to save profile. Please try again.');
      }

      if (!result.data) {
        throw new Error('Failed to update profile. Please try again.');
      }

      console.log('Business profile updated successfully:', result.data.id);
      setProfile(result.data);
      return result.data;
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

