import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

export interface JobListing {
  title: string;
  company: string;
  pay: string;
  rating: number;
  source?: string;
  url?: string;
}

const FALLBACK_JOBS: JobListing[] = [
  { title: 'Data Entry Specialist', company: 'TechFlow', pay: '$22/hr', rating: 4.8, source: 'fallback' },
  { title: 'Virtual Assistant', company: 'RemoteFirst', pay: '$25/hr', rating: 4.6, source: 'fallback' },
  { title: 'Social Media Designer', company: 'CreativeHub', pay: '$30/hr', rating: 4.9, source: 'fallback' },
  { title: 'AI Trainer', company: 'NeuralAI', pay: '$40/hr', rating: 4.7, source: 'fallback' },
  { title: 'Content Writer', company: 'WriteHub', pay: '$28/hr', rating: 4.5, source: 'fallback' },
  { title: 'Freelance PM', company: 'Upwork Pro', pay: '$32/hr', rating: 4.8, source: 'fallback' },
];

export async function fetchLiveJobs(): Promise<JobListing[]> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('title, company, pay, rating')
      .order('created_at', { ascending: false })
      .limit(12);

    if (!error && data && data.length > 0) {
      return data as JobListing[];
    }
  } catch { /* ignore */ }

  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jobs-api`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ query: 'freelance remote data entry virtual assistant' }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.jobs && data.jobs.length > 0) return data.jobs as JobListing[];
    }
  } catch { /* ignore */ }

  return FALLBACK_JOBS;
}

export interface CourseWithProgress {
  id: string;
  title: string;
  lessons: number;
  progress: number;
  icon_name: string | null;
}

export async function fetchCourses(): Promise<CourseWithProgress[]> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, lessons, progress, icon_name')
      .order('created_at', { ascending: false });

    if (!error && data) return data as CourseWithProgress[];
  } catch { /* ignore */ }
  return [];
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string | null;
  order_index: number;
}

export async function fetchLessons(courseId: string): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('id, course_id, title, content, order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (!error && data) return data as Lesson[];
  } catch { /* ignore */ }
  return [];
}

export async function fetchUserProgress(session: Session | null): Promise<Record<string, number>> {
  if (!session) return {};
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('course_id, completed')
      .eq('user_id', session.user.id);

    if (!error && data) {
      const progressMap: Record<string, number> = {};
      const courseIds = new Set(data.map((r: { course_id: string }) => r.course_id));
      for (const cid of courseIds) {
        const courseRows = data.filter((r: { course_id: string }) => r.course_id === cid);
        const completed = courseRows.filter((r: { completed: boolean }) => r.completed).length;
        const total = courseRows.length;
        progressMap[cid] = total > 0 ? Math.round((completed / total) * 100) : 0;
      }
      return progressMap;
    }
  } catch { /* ignore */ }
  return {};
}

export async function markLessonComplete(session: Session | null, lessonId: string, courseId: string): Promise<void> {
  if (!session) return;
  try {
    await supabase
      .from('user_progress')
      .upsert({
        user_id: session.user.id,
        lesson_id: lessonId,
        course_id: courseId,
        completed: true,
      }, { onConflict: 'user_id,lesson_id' });
  } catch { /* ignore */ }
}

export async function reportScam(session: Session | null, inputValue: string, isScam: boolean, reportNotes: string): Promise<void> {
  if (!session) return;
  try {
    await supabase.from('scam_reports').insert({
      user_id: session.user.id,
      input_value: inputValue,
      is_scam: isScam,
      report_notes: reportNotes,
    });
  } catch { /* ignore */ }
}

export async function createSupportTicket(session: Session | null, subject: string, message: string): Promise<{ error: string | null }> {
  if (!session) return { error: 'Not authenticated' };
  try {
    const { error } = await supabase.from('support_tickets').insert({
      user_id: session.user.id,
      subject,
      message,
    });
    return { error: error?.message || null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function setPinCode(session: Session | null, pin: string): Promise<{ error: string | null }> {
  if (!session) return { error: 'Not authenticated' };
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ pin_code: pin, pin_enabled: true })
      .eq('id', session.user.id);
    return { error: error?.message || null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function disablePin(session: Session | null): Promise<{ error: string | null }> {
  if (!session) return { error: 'Not authenticated' };
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ pin_code: null, pin_enabled: false })
      .eq('id', session.user.id);
    return { error: error?.message || null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function exportUserData(session: Session | null): Promise<void> {
  if (!session) return;
  try {
    const [profileRes, toolsRes, progressRes, scamRes, ticketRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
      supabase.from('user_tools_data').select('*').eq('user_id', session.user.id),
      supabase.from('user_progress').select('*').eq('user_id', session.user.id),
      supabase.from('scam_reports').select('*').eq('user_id', session.user.id),
      supabase.from('support_tickets').select('*').eq('user_id', session.user.id),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: { id: session.user.id, email: session.user.email },
      profile: profileRes.data,
      toolsData: toolsRes.data || [],
      learningProgress: progressRes.data || [],
      scamReports: scamRes.data || [],
      supportTickets: ticketRes.data || [],
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillglint-data-${session.user.email?.split('@')[0] || 'user'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Export failed:', e);
  }
}
