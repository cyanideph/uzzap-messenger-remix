import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getProfile, updateProfile } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserStatus = Database['public']['Enums']['user_status'];

interface SignInParams {
  email?: string;
  password?: string;
  mobile?: string;
}

interface SignUpParams {
  email: string;
  password: string;
  phone?: string;
  options?: {
    data?: {
      user_id?: string;
      first_name?: string;
      last_name?: string;
      mobile_number?: string;
      region_id?: string;
      province_id?: string;
    };
  };
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (params: SignInParams) => Promise<{ error?: string }>;
  signUp: (params: SignUpParams) => Promise<{ error?: string }>;
  verifyPin: (pin: string) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  updateStatus: (status: UserStatus) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setInitializing(false);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const profile = await getProfile(session.user.id);
          setProfile(profile);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password, mobile }: SignInParams) => {
    try {
      setLoading(true);
      
      if (email && password) {
        // Email/password sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Error signing in with email:', error);
          return { error: error.message };
        }
      } else if (mobile) {
        // Mobile number sign in
        if (!/^\+?[1-9]\d{1,14}$/.test(mobile)) {
          return { error: 'Invalid phone number format' };
        }

        const { error } = await supabase.auth.signInWithOtp({
          phone: mobile,
        });
        
        if (error) {
          console.error('Error signing in with mobile:', error);
          return { error: error.message };
        }
      } else {
        return { error: 'Invalid sign in parameters' };
      }
      
      return {};
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ email, password, phone, options }: SignUpParams) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        phone,
        options,
      });
      
      if (error) {
        console.error('Error signing up:', error);
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const verifyPin = async (pin: string) => {
    try {
      setLoading(true);
      
      // Validate PIN format
      if (!/^\d{6}$/.test(pin)) {
        return { error: 'PIN must be 6 digits' };
      }

      if (!user?.phone) {
        return { error: 'No phone number associated with this session' };
      }

      const { error } = await supabase.auth.verifyOtp({
        phone: user.phone,
        token: pin,
        type: 'sms',
      });
      
      if (error) {
        console.error('Error verifying pin:', error);
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      console.error('Error verifying pin:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return { error: error.message };
      }
      setProfile(null);
      return {};
    } catch (error) {
      console.error('Error signing out:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: 'No user logged in' };
    }
    
    try {
      setLoading(true);
      const updatedProfile = await updateProfile(user.id, updates);
      setProfile(updatedProfile);
      return {};
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: 'Failed to update profile' };
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: UserStatus) => {
    if (!user) {
      return { error: 'No user logged in' };
    }
    
    try {
      setLoading(true);
      const updatedProfile = await updateProfile(user.id, {
        status,
        last_seen: new Date().toISOString(),
      });
      setProfile(updatedProfile);
      return {};
    } catch (error) {
      console.error('Error updating status:', error);
      return { error: 'Failed to update status' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    verifyPin,
    signOut,
    updateProfile: handleUpdateProfile,
    updateStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 