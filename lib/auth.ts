import { supabase } from './supabase';

export type UserRole = 'admin' | 'business_owner' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  timezone: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) return null;
  return profile as UserProfile;
}

export async function signUp(
  email: string, 
  password: string, 
  fullName: string,
  role: UserRole = 'business_owner' // Default to business_owner for signup flow
) {
  // Validate inputs
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address');
  }
  
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  if (!fullName || fullName.trim().length < 2) {
    throw new Error('Please enter your full name');
  }

  console.log('📝 Signup attempt:', { email: email.trim(), role, fullName });

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password: password,
    options: {
      emailRedirectTo: undefined, // Don't send confirmation email
      data: {
        full_name: fullName.trim(),
        role: role,
      },
    },
  });

  if (error) {
    console.error('❌ Signup error:', {
      message: error.message,
      status: error.status,
      name: error.name
    });
    
    // Provide user-friendly error messages
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes('user already registered') || 
        errorMsg.includes('already exists') ||
        errorMsg.includes('already registered')) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }
    
    if (errorMsg.includes('signup disabled') || 
        errorMsg.includes('signups are disabled')) {
      throw new Error('Signup is currently disabled. Please contact support.');
    }
    
    if (errorMsg.includes('invalid email')) {
      throw new Error('Please enter a valid email address');
    }
    
    if (errorMsg.includes('password')) {
      throw new Error('Password does not meet requirements');
    }
    
    // Throw the original error if we can't categorize it
    throw error;
  }

  console.log('✅ Signup successful:', { userId: data.user?.id, email: data.user?.email });

  // The database trigger will automatically:
  // 1. Auto-confirm the email
  // 2. Create the user profile from metadata
  // So we don't need to manually create the profile here
  // Just wait a moment for the trigger to complete
  if (data.user) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password,
  });

  if (error) {
    throw new Error('Invalid email or password');
  }
  
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
}
