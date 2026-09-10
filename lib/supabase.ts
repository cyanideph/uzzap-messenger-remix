import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qwdxjfoohslpjuwglaar.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZHhqZm9vaHNscGp1d2dsYWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTMyODMsImV4cCI6MjA4NzY2OTI4M30.tQFfgoJyWql0CcorhdBZ7xmLAlP1Dc9-JUSmwWMoSB0';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Profile helpers ────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Database['public']['Tables']['profiles']['Update']>
) {
  const { data, error } = await (supabase
    .from('profiles') as any)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Chatroom helpers ────────────────────────────────────────────────────────

export async function getChatrooms(userId: string) {
  const { data, count, error } = await supabase
    .from('chatrooms')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { data: data || [], count };
}

// ─── Regions helpers ─────────────────────────────────────────────────────────

export async function getRegions() {
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getProvinces(regionId: string) {
  const { data, error } = await supabase
    .from('provinces')
    .select('*')
    .eq('region_id', regionId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ─── Settings helpers ────────────────────────────────────────────────────────

export async function getSettings(userId: string) {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  // Return defaults if no settings exist yet
  if (!data) {
    return {
      id: 'default',
      user_id: userId,
      theme: 'light',
      notifications: true,
      auto_message_display: true,
      offline_delivery: 'server',
      created_at: new Date().toISOString(),
      updated_at: null,
    } as Database['public']['Tables']['settings']['Row'];
  }

  return data;
}

export async function updateSettings(
  userId: string,
  updates: Partial<Database['public']['Tables']['settings']['Update']>
) {
  // Upsert so it works even if the row doesn't exist yet
  const { data, error } = await (supabase
    .from('settings') as any)
    .upsert(
      { ...updates, user_id: userId, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}
