import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useAuth } from './AuthContext';
import { Platform, useColorScheme } from 'react-native';
import { getSettings, updateSettings } from '@/lib/supabase';

type Settings = Database['public']['Tables']['settings']['Row'];

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  changeMobileNumber: (newNumber: string) => Promise<void>;
  updateStatus: (status: 'online' | 'offline' | 'busy', message?: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, updateProfile } = useAuth();
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    if (user) {
      // Load settings when user changes
      const loadData = async () => {
        await fetchSettings();
        if (isMounted) {
          await setupNotifications();
        }
      };
      
      loadData();
    } else {
      setSettings(null);
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const data = await getSettings(user.id);
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupNotifications = async () => {
    // Notifications are only supported on native platforms
    if (Platform.OS === 'web') return;
    
    try {
      const Notifications = require('expo-notifications');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const handleUpdateSettings = async (updates: Partial<Settings>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const updatedSettings = await updateSettings(user.id, updates);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const changeMobileNumber = async (newNumber: string) => {
    try {
      if (!user) throw new Error('No user logged in');

      // First, update the profile
      await updateProfile({ mobile_number: newNumber });

      // Then, update the auth user's phone number
      const { error } = await supabase.auth.updateUser({
        phone: newNumber,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error changing mobile number:', error);
      throw error;
    }
  };

  const updateStatus = async (status: 'online' | 'offline' | 'busy', message?: string) => {
    try {
      if (!profile) throw new Error('No profile found');

      await updateProfile({
        status,
        status_message: message || null,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  };

  const value = {
    settings,
    loading,
    updateSettings: handleUpdateSettings,
    changeMobileNumber,
    updateStatus,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 