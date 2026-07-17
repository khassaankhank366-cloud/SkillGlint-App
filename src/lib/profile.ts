import { supabase } from './supabaseClient';

export interface Profile {
  id: string;
  full_name: string | null;
  profession: string | null;
  avatar_url: string | null;
  pin_code: string | null;
  pin_enabled: boolean | null;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, profession, avatar_url, pin_code, pin_enabled')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch profile:', error.message);
    return null;
  }

  return data as Profile | null;
}

export async function upsertProfile(userId: string, fullName: string, profession: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, full_name: fullName, profession }, { onConflict: 'id' })
    .select('id, full_name, profession, avatar_url, pin_code, pin_enabled')
    .maybeSingle();

  if (error) {
    console.error('Failed to upsert profile:', error.message);
    return null;
  }

  return data as Profile | null;
}
