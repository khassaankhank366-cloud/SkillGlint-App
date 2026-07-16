import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export async function signIn(email: string, password: string): Promise<void> {
  if (!isValidEmail(email)) throw new Error('Please enter a valid email address.');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(email: string, password: string): Promise<void> {
  if (!isValidEmail(email)) throw new Error('Please enter a valid email address.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return { data };
}

export function getDisplayName(session: Session | null, profile?: { full_name?: string | null } | null): string {
  if (profile?.full_name) return profile.full_name;
  if (session?.user?.email) return session.user.email.split('@')[0];
  return 'User';
}

export function getInitial(session: Session | null, profile?: { full_name?: string | null } | null): string {
  const name = getDisplayName(session, profile);
  return name.charAt(0).toUpperCase();
}
