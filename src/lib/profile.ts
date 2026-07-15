import { supabase } from './supabaseClient';

export interface Profile {
  id: string;
  full_name: string | null;
  profession: string | null;
  avatar_url: string | null;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, profession, avatar_url')
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
    .select('id, full_name, profession, avatar_url')
    .maybeSingle();

  if (error) {
    console.error('Failed to upsert profile:', error.message);
    return null;
  }

  return data as Profile | null;
}
