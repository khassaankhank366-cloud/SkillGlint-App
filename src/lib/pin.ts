import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

const PIN_STORAGE_KEY = 'skillglint_pin_session';

// SHA-256 hash with a per-user salt (user id) so the same PIN hashes differently per user.
// Stored in profiles.pin_code as `salt:hash` hex. Not plaintext, not reversible.
async function hashPin(pin: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${pin}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(input: string, stored: string, salt: string): Promise<boolean> {
  if (!stored || !input) return false;
  const hashed = await hashPin(input, salt);
  return hashed === stored;
}

export async function setPinCode(session: Session | null, pin: string): Promise<{ error: string | null }> {
  if (!session) return { error: 'Not authenticated' };
  if (!/^\d{4}$/.test(pin)) return { error: 'PIN must be exactly 4 digits.' };
  const salt = session.user.id;
  const hashed = await hashPin(pin, salt);
  const { error } = await supabase
    .from('profiles')
    .update({ pin_code: `${salt}:${hashed}`, pin_enabled: true })
    .eq('id', session.user.id);
  return { error: error?.message || null };
}

export async function disablePin(session: Session | null): Promise<{ error: string | null }> {
  if (!session) return { error: 'Not authenticated' };
  const { error } = await supabase
    .from('profiles')
    .update({ pin_code: null, pin_enabled: false })
    .eq('id', session.user.id);
  clearPinSession();
  return { error: error?.message || null };
}

export async function unlockWithPin(session: Session | null, pin: string, storedPin: string | null): Promise<boolean> {
  if (!session || !storedPin) return false;
  const [salt, hash] = storedPin.split(':');
  if (!salt || !hash) return false;
  const ok = await verifyPin(pin, hash, salt);
  if (ok) markPinUnlocked(session.user.id);
  return ok;
}

// Session lock persistence: a unlocked marker keyed by user id so the PIN is only asked once per browser session.
// Cleared on explicit sign-out or on app restart via sessionStorage (not localStorage).
export function isPinUnlocked(userId: string): boolean {
  try {
    return sessionStorage.getItem(`${PIN_STORAGE_KEY}_${userId}`) === '1';
  } catch {
    return false;
  }
}

export function markPinUnlocked(userId: string): void {
  try {
    sessionStorage.setItem(`${PIN_STORAGE_KEY}_${userId}`, '1');
  } catch { /* ignore */ }
}

export function clearPinSession(): void {
  try {
    Object.keys(sessionStorage)
      .filter(k => k.startsWith(`${PIN_STORAGE_KEY}_`))
      .forEach(k => sessionStorage.removeItem(k));
  } catch { /* ignore */ }
}
