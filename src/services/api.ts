import { supabase } from '../lib/supabaseClient';

export interface Job {
  title: string;
  company: string;
  pay: string;
  rating: number;
  url?: string;
  location?: string;
}

export async function fetchLiveJobs(query = 'freelance remote'): Promise<Job[]> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jobs-api?query=${encodeURIComponent(query)}`;
    const res = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.jobs || [];
  } catch {
    return [];
  }
}

export async function fetchCourses(): Promise<{ id: string; title: string; lessons: number; icon_name: string }[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, lessons, icon_name')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function fetchLessons(courseId: string): Promise<{ id: string; title: string; content: string | null; order_index: number }[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, content, order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });
  if (error) return [];
  return data || [];
}

export async function fetchUserProgress(userId: string): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('lesson_id, completed')
    .eq('user_id', userId);
  if (error) return {};
  const map: Record<string, boolean> = {};
  (data || []).forEach((p: { lesson_id: string; completed: boolean }) => { map[p.lesson_id] = p.completed; });
  return map;
}

export async function markLessonComplete(userId: string, courseId: string, lessonId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_progress')
    .upsert({ user_id: userId, course_id: courseId, lesson_id: lessonId, completed: true }, { onConflict: 'user_id,lesson_id' });
  return !error;
}

export async function getCourseProgressPercent(userId: string, courseId: string, totalLessons: number): Promise<number> {
  if (totalLessons === 0) return 0;
  const { count, error } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('completed', true);
  if (error || count === null) return 0;
  return Math.round((count / totalLessons) * 100);
}

export async function submitScamReport(userId: string, inputValue: string, isScam: boolean, notes: string): Promise<boolean> {
  const { error } = await supabase
    .from('scam_reports')
    .insert({ user_id: userId, input_value: inputValue, is_scam: isScam, report_notes: notes });
  return !error;
}

export async function submitSupportTicket(userId: string, subject: string, message: string): Promise<boolean> {
  const { error } = await supabase
    .from('support_tickets')
    .insert({ user_id: userId, subject, message });
  return !error;
}

export async function fetchSupportTickets(userId: string): Promise<{ id: string; subject: string; message: string; status: string; created_at: string }[]> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('id, subject, message, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function setPinCode(userId: string, pinCode: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ pin_code: pinCode, pin_enabled: true })
    .eq('id', userId);
  return !error;
}

export async function disablePin(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ pin_code: null, pin_enabled: false })
    .eq('id', userId);
  return !error;
}

export async function verifyPin(userId: string, pinCode: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('pin_code')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return false;
  return data.pin_code === pinCode;
}

export async function isPinEnabled(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('pin_enabled, pin_code')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return false;
  return data.pin_enabled === true && data.pin_code !== null;
}

export async function exportUserData(userId: string): Promise<Record<string, unknown>> {
  const [profile, toolsData, progress, scamReports, tickets] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('user_tools_data').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('user_progress').select('*').eq('user_id', userId),
    supabase.from('scam_reports').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('support_tickets').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);

  return {
    exported_at: new Date().toISOString(),
    profile: profile.data,
    tools_data: toolsData.data || [],
    learning_progress: progress.data || [],
    scam_reports: scamReports.data || [],
    support_tickets: tickets.data || [],
  };
}
