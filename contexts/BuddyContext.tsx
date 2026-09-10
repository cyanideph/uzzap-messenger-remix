import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useAuth } from './AuthContext';
import { Alert, Platform } from 'react-native';

type Buddy = Database['public']['Tables']['buddies']['Row'] & {
  profile: Database['public']['Tables']['profiles']['Row'];
};

interface BuddyContextType {
  buddies: Buddy[];
  loading: boolean;
  addBuddy: (mobileNumber: string) => Promise<void>;
  removeBuddy: (buddyId: string) => Promise<void>;
  blockBuddy: (buddyId: string) => Promise<void>;
  unblockBuddy: (buddyId: string) => Promise<void>;
  searchBuddies: (query: string) => Promise<Buddy[]>;
  inviteBuddy: (mobileNumber: string) => Promise<void>;
}

const BuddyContext = createContext<BuddyContextType | undefined>(undefined);

export function BuddyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBuddies();
      const cleanup = subscribeToBuddyChanges();
      return () => {
        cleanup();
      };
    }
    return () => {};
  }, [user]);

  const fetchBuddies = async () => {
    try {
      const { data, error } = await supabase
        .from('buddies')
        .select(`
          *,
          profile:profiles!buddies_buddy_id_fkey(*)
        `)
        .eq('user_id', user?.id as string)
        .eq('status', 'accepted');

      if (error) throw error;
      setBuddies(data || []);
    } catch (error) {
      console.error('Error fetching buddies:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToBuddyChanges = () => {
    const subscription = supabase
      .channel('buddies_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'buddies',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchBuddies();
          } else if (payload.eventType === 'UPDATE') {
            fetchBuddies();
          } else if (payload.eventType === 'DELETE') {
            fetchBuddies();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const addBuddy = async (mobileNumber: string) => {
    try {
      // First, find the user by mobile number
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('mobile_number', mobileNumber)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('User not found');

      // Then, add them as a buddy
      const { error: buddyError } = await (supabase.from('buddies') as any).insert({
        user_id: user?.id,
        buddy_id: (profile as any).id,
        status: 'pending',
      });

      if (buddyError) throw buddyError;
    } catch (error) {
      console.error('Error adding buddy:', error);
      throw error;
    }
  };

  const removeBuddy = async (buddyId: string) => {
    try {
      const { error } = await supabase
        .from('buddies')
        .delete()
        .eq('user_id', user?.id as string)
        .eq('buddy_id', buddyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing buddy:', error);
      throw error;
    }
  };

  const blockBuddy = async (buddyId: string) => {
    try {
      const { error } = await (supabase
        .from('buddies') as any)
        .update({ status: 'blocked' })
        .eq('user_id', user?.id as string)
        .eq('buddy_id', buddyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error blocking buddy:', error);
      throw error;
    }
  };

  const unblockBuddy = async (buddyId: string) => {
    try {
      const { error } = await (supabase
        .from('buddies') as any)
        .update({ status: 'accepted' })
        .eq('user_id', user?.id as string)
        .eq('buddy_id', buddyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unblocking buddy:', error);
      throw error;
    }
  };

  const searchBuddies = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('mobile_number', `%${query}%`)
        .neq('id', user?.id);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching buddies:', error);
      throw error;
    }
  };

  const inviteBuddy = async (mobileNumber: string) => {
    try {
      // SMS is only available on native platforms
      if (Platform.OS === 'web') {
        Alert.alert(
          'Not Available',
          'SMS invitations are not available on web. Please use the mobile app to invite friends.'
        );
        return;
      }

      // Format the invitation message
      const appName = 'Uzzap';
      const invitationMessage = 
        `Hey! I'm inviting you to join ${appName}, a messaging app to connect with friends in the Philippines. ` +
        `Download it here: https://uzzap.app/download`;
      
      // Dynamically import SMS to avoid web crashes
      let SMS;
      try {
        SMS = require('expo-sms');
      } catch (e) {
        throw new Error('SMS is not available on this platform');
      }

      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('SMS is not available on this device');
      }

      // Open SMS composer with pre-filled message
      const { result } = await SMS.sendSMSAsync(
        [mobileNumber],
        invitationMessage
      );
      
      if (result === 'sent' || result === 'unknown') {
        // Track invitation in the database
        const { error } = await (supabase
          .from('invitations') as any)
          .insert({
            inviter_id: user?.id,
            invited_phone: mobileNumber,
            status: 'sent',
            sent_at: new Date().toISOString()
          });
          
        if (error) {
          console.warn('Could not log invitation:', error);
        }
        
        return;
      } else {
        throw new Error(`SMS was not sent: ${result}`);
      }
    } catch (error: any) {
      console.error('Error inviting buddy:', error);
      
      if (Platform.OS === 'ios' && error.message?.includes('not available')) {
        Alert.alert(
          'SMS Not Available',
          'SMS service is not available on this device. You can manually invite your friend by sharing the app link.'
        );
      } else {
        throw error;
      }
    }
  };

  const value = {
    buddies,
    loading,
    addBuddy,
    removeBuddy,
    blockBuddy,
    unblockBuddy,
    searchBuddies,
    inviteBuddy,
  };

  return <BuddyContext.Provider value={value}>{children}</BuddyContext.Provider>;
}

export function useBuddy() {
  const context = useContext(BuddyContext);
  if (context === undefined) {
    throw new Error('useBuddy must be used within a BuddyProvider');
  }
  return context;
}
