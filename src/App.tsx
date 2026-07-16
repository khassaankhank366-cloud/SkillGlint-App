import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import { Sparkles, MessageSquare, FileText, FileCheck, Search, Shield, BookOpen, Briefcase, User as UserIcon, Settings, LogOut, Send, Lock, Download, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, XCircle, HelpCircle, Star, Zap, Menu, X, Eye, EyeOff, Phone } from 'lucide-react';
import { SparksBackground } from './components/SparksBackground';
import { fetchLiveJobs, fetchCourses, fetchLessons, fetchUserProgress, markLessonComplete, reportScam, createSupportTicket, setPinCode, disablePin, exportUserData } from './services/api';
import type { JobListing, CourseWithProgress, Lesson } from './services/api';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// ============ TYPES ============
interface Profile {
  id: string;
  full_name: string | null;
  profession: string | null;
  pin_enabled: boolean;
  pin_code: string | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ToolData {
  resume_data?: string;
  cover_letter?: string;
  proposal?: string;
  brand_voice?: string;
}

// ============ MAIN APP ============
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'assistant' | 'writer' | 'utilities' | 'courses' | 'jobs' | 'settings' | 'privacy' | 'terms'>('home');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'phone'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session);
      else setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess) loadProfile(sess);
      else { setProfile(null); setLoading(false); setPinVerified(false); }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadProfile = async (sess: Session) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', sess.user.id).maybeSingle();
    if (data) {
      setProfile(data as Profile);
      if (data.pin_enabled && data.pin_code) setPinVerified(false);
      else setPinVerified(true);
    }
    setLoading(false);
  };

  const handleAuth = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        if (!fullName.trim()) { setAuthError('Please enter your name'); setAuthLoading(false); return; }
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) { setAuthError(error.message); setAuthLoading(false); return; }
        if (data.user) {
          await supabase.from('profiles').insert({ id: data.user.id, full_name: fullName, profession });
        }
      } else if (authMode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setAuthError(error.message); setAuthLoading(false); return; }
      }
    } catch (e) {
      setAuthError((e as Error).message);
    }
    setAuthLoading(false);
  };

  const handlePhoneAuth = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      if (!otp) {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) { setAuthError(error.message); setAuthLoading(false); return; }
      } else {
        const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
        if (error) { setAuthError(error.message); setAuthLoading(false); return; }
      }
    } catch (e) {
      setAuthError((e as Error).message);
    }
    setAuthLoading(false);
  };

  const verifyPin = () => {
    if (profile?.pin_code === pinInput) setPinVerified(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setActiveTab('home');
    setPinVerified(false);
  };

  // ============ LOADING ============
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="animate-pulse text-cyan-400"><Sparkles className="w-12 h-12" /></div>
      </div>
    );
  }

  // ============ AUTH SCREEN ============
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0B0F19] relative flex items-center justify-center p-4">
        <SparksBackground />
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <Sparkles className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-bold text-white">SkillGlint</span>
            </div>
            <p className="text-white/40 text-sm">AI-Powered Career Growth Platform</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex gap-2 bg-white/5 rounded-full p-1">
              <button onClick={() => setAuthMode('signin')} className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${authMode === 'signin' ? 'bg-cyan-400 text-[#0B0F19]' : 'text-white/60'}`}>Sign In</button>
              <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${authMode === 'signup' ? 'bg-cyan-400 text-[#0B0F19]' : 'text-white/60'}`}>Sign Up</button>
              <button onClick={() => setAuthMode('phone')} className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${authMode === 'phone' ? 'bg-cyan-400 text-[#0B0F19]' : 'text-white/60'}`}>Phone</button>
            </div>
            {authMode === 'phone' ? (
              <>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                  <input type="tel" placeholder="+1234567890" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none" />
                </div>
                {otp && (
                  <input type="text" placeholder="Enter OTP code" value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none" />
                )}
                <button onClick={handlePhoneAuth} disabled={authLoading} className="w-full bg-cyan-400 text-[#0B0F19] font-semibold py-3 rounded-xl hover:bg-cyan-300 transition-all disabled:opacity-50">
                  {authLoading ? 'Sending...' : otp ? 'Verify OTP' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                {authMode === 'signup' && (
                  <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none" />
                )}
                {authMode === 'signup' && (
                  <input type="text" placeholder="Profession (optional)" value={profession} onChange={e => setProfession(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none" />
                )}
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none" />
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-white/30 hover:text-white/60">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <button onClick={handleAuth} disabled={authLoading} className="w-full bg-cyan-400 text-[#0B0F19] font-semibold py-3 rounded-xl hover:bg-cyan-300 transition-all disabled:opacity-50">
                  {authLoading ? 'Loading...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </>
            )}
            {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}
          </div>
          <p className="text-white/30 text-xs text-center mt-4">By continuing, you agree to our <button onClick={() => window.open('/terms', '_blank')} className="text-cyan-400 underline">Terms</button> and <button onClick={() => window.open('/privacy', '_blank')} className="text-cyan-400 underline">Privacy Policy</button></p>
        </div>
      </div>
    );
  }

  // ============ PIN LOCK ============
  if (session && profile?.pin_enabled && !pinVerified) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
        <SparksBackground />
        <div className="relative z-10 w-full max-w-sm">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
            <h2 className="text-white text-xl font-semibold">Enter PIN</h2>
            <p className="text-white/40 text-sm mt-1">Enter your 4-digit PIN to unlock</p>
          </div>
          <input type="password" maxLength={4} placeholder="••••" value={pinInput} onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] focus:border-cyan-400 focus:outline-none mb-4" />
          <button onClick={verifyPin} className="w-full bg-cyan-400 text-[#0B0F19] font-semibold py-3 rounded-xl hover:bg-cyan-300 transition-all">Unlock</button>
          <button onClick={handleSignOut} className="w-full text-white/40 text-sm mt-3 hover:text-white/60">Sign Out</button>
        </div>
      </div>
    );
  }

  // ============ PRIVACY PAGE ============
  if (activeTab === 'privacy') return <Privacy onBack={() => setActiveTab('settings')} />;
  if (activeTab === 'terms') return <Terms onBack={() => setActiveTab('settings')} />;

  // ============ MAIN DASHBOARD ============
  return (
    <div className="min-h-screen bg-[#0B0F19] relative">
      <SparksBackground />
      {/* Header */}
      <header className="sticky top-0 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/5 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span className="text-white font-bold text-lg">SkillGlint</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <button onClick={handleSignOut} className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-red-400/20 transition-all">
              <LogOut className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 py-6 max-w-4xl mx-auto pb-24">
        {activeTab === 'home' && <HomeView profile={profile} setActiveTab={setActiveTab} session={session} />}
        {activeTab === 'assistant' && <AssistantView session={session} />}
        {activeTab === 'writer' && <WriterView session={session} />}
        {activeTab === 'utilities' && <UtilitiesView session={session} />}
        {activeTab === 'courses' && <CoursesView session={session} />}
        {activeTab === 'jobs' && <JobsView />}
        {activeTab === 'settings' && <SettingsView session={session} profile={profile} onSignOut={handleSignOut} setActiveTab={setActiveTab} />}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-white/5 z-20">
        <div className="flex justify-around items-center py-2 px-2 max-w-4xl mx-auto">
          <NavButton icon={<Sparkles className="w-5 h-5" />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavButton icon={<MessageSquare className="w-5 h-5" />} label="AI" active={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} />
          <NavButton icon={<FileText className="w-5 h-5" />} label="Writer" active={activeTab === 'writer'} onClick={() => setActiveTab('writer')} />
          <NavButton icon={<BookOpen className="w-5 h-5" />} label="Learn" active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} />
          <NavButton icon={<Briefcase className="w-5 h-5" />} label="Jobs" active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} />
          <NavButton icon={<Settings className="w-5 h-5" />} label="More" active={activeTab === 'settings' || activeTab === 'utilities'} onClick={() => setActiveTab('settings')} />
        </div>
      </nav>
    </div>
  );
}

// ============ NAV BUTTON ============
function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${active ? 'text-cyan-400' : 'text-white/40'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

// ============ HOME VIEW ============
function HomeView({ profile, setActiveTab, session }: { profile: Profile | null; setActiveTab: (t: any) => void; session: Session | null }) {
  const features = [
    { icon: <MessageSquare className="w-6 h-6" />, title: 'AI Assistant', desc: 'Chat with AI for career guidance', tab: 'assistant' },
    { icon: <FileText className="w-6 h-6" />, title: 'Writer Tools', desc: 'Resumes, cover letters, proposals', tab: 'writer' },
    { icon: <Shield className="w-6 h-6" />, title: 'Scam Checker', desc: 'Verify if a job is legitimate', tab: 'utilities' },
    { icon: <BookOpen className="w-6 h-6" />, title: 'Courses', desc: 'Learn new skills with LMS', tab: 'courses' },
    { icon: <Briefcase className="w-6 h-6" />, title: 'Jobs', desc: 'Real-time job listings', tab: 'jobs' },
    { icon: <Settings className="w-6 h-6" />, title: 'Settings', desc: 'PIN lock, export data, support', tab: 'settings' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, {profile?.full_name?.split(' ')[0] || 'User'} 👋</h1>
        <p className="text-white/40 text-sm mt-1">What would you like to do today?</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {features.map((f, i) => (
          <button key={i} onClick={() => setActiveTab(f.tab)} className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4 text-left hover:bg-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/20 flex items-center justify-center text-cyan-400 mb-3">{f.icon}</div>
            <h3 className="text-white font-medium text-sm">{f.title}</h3>
            <p className="text-white/40 text-xs mt-1">{f.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============ AI ASSISTANT VIEW ============
function AssistantView({ session }: { session: Session | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Sorry, I could not process that.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2"><MessageSquare className="w-5 h-5 text-cyan-400" /> AI Assistant</h2>
      <div ref={scrollRef} className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4 h-[60vh] overflow-y-auto space-y-3">
        {messages.length === 0 && <p className="text-white/30 text-sm text-center mt-8">Ask me anything about your career, freelancing, or skills!</p>}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-cyan-400 text-[#0B0F19]' : 'bg-white/10 text-white'}`}>{m.content}</div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white/10 rounded-2xl px-4 py-2 text-sm text-white/60">Thinking...</div></div>}
      </div>
      <div className="flex gap-2">
        <input type="text" placeholder="Type your message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none" />
        <button onClick={send} disabled={loading} className="w-12 h-12 rounded-xl bg-cyan-400 text-[#0B0F19] flex items-center justify-center hover:bg-cyan-300 transition-all disabled:opacity-50"><Send className="w-5 h-5" /></button>
      </div>
    </div>
  );
}

// ============ WRITER VIEW ============
function WriterView({ session }: { session: Session | null }) {
  const [tool, setTool] = useState<'resume' | 'cover' | 'proposal' | 'brand'>('resume');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const tools = [
    { id: 'resume', label: 'Resume Builder', icon: <FileText className="w-4 h-4" />, placeholder: 'Describe your experience, skills, and target role...' },
    { id: 'cover', label: 'Cover Letter', icon: <FileCheck className="w-4 h-4" />, placeholder: 'Job title and company you are applying to...' },
    { id: 'proposal', label: 'Proposal Writer', icon: <Send className="w-4 h-4" />, placeholder: 'Project description and your relevant experience...' },
    { id: 'brand', label: 'Brand Voice', icon: <Star className="w-4 h-4" />, placeholder: 'Your brand name, niche, and target audience...' },
  ];

  const generate = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setOutput('');
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-writer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ tool, input }),
      });
      const data = await res.json();
      setOutput(data.response || 'Error generating content.');
      if (session) {
        const field = tool === 'resume' ? 'resume_data' : tool === 'cover' ? 'cover_letter' : tool === 'proposal' ? 'proposal' : 'brand_voice';
        await supabase.from('user_tools_data').upsert({ user_id: session.user.id, [field]: data.response }, { onConflict: 'user_id' });
      }
    } catch {
      setOutput('Connection error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-cyan-400" /> Writer Tools</h2>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tools.map(t => (
          <button key={t.id} onClick={() => { setTool(t.id as any); setOutput(''); }} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${tool === t.id ? 'bg-cyan-400 text-[#0B0F19]' : 'bg-white/5 text-white/60'}`}>{t.icon} {t.label}</button>
        ))}
      </div>
      <textarea placeholder={tools.find(t => t.id === tool)?.placeholder} value={input} onChange={e => setInput(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none resize-none" />
      <button onClick={generate} disabled={loading} className="w-full bg-cyan-400 text-[#0B0F19] font-semibold py-3 rounded-xl hover:bg-cyan-300 transition-all disabled:opacity-50">{loading ? 'Generating...' : 'Generate'}</button>
      {output && (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-medium text-sm">Result</h3>
            <button onClick={() => navigator.clipboard.writeText(output)} className="text-cyan-400 text-xs">Copy</button>
          </div>
          <pre className="text-white/70 text-sm whitespace-pre-wrap font-sans">{output}</pre>
        </div>
      )}
    </div>
  );
}

// ============ UTILITIES VIEW (Scam Checker + Support) ============
function UtilitiesView({ session }: { session: Session | null }) {
  const [scamInput, setScamInput] = useState('');
  const [scamResult, setScamResult] = useState<{ isScam: boolean; confidence: number; reasons: string[] } | null>(null);
  const [scamLoading, setScamLoading] = useState(false);
  const [reportNotes, setReportNotes] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');

  const checkScam = async () => {
    if (!scamInput.trim() || scamLoading) return;
    setScamLoading(true);
    setScamResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scam-checker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ input: scamInput }),
      });
      const data = await res.json();
      setScamResult(data);
    } catch {
      setScamResult({ isScam: false, confidence: 0, reasons: ['Error checking. Please try again.'] });
    }
    setScamLoading(false);
  };

  const submitReport = async () => {
    if (!scamResult || !session) return;
    await reportScam(session, scamInput, scamResult.isScam, reportNotes);
    setReportNotes('');
    setShowReport(false);
  };

  const submitTicket = async () => {
    if (!session || !ticketSubject.trim() || !ticketMessage.trim()) return;
    const { error } = await createSupportTicket(session, ticketSubject, ticketMessage);
    if (error) setTicketStatus(`Error: ${error}`);
    else { setTicketStatus('Ticket submitted! We will get back to you.'); setTicketSubject(''); setTicketMessage(''); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="w-5 h-5 text-cyan-400" /> Utilities</h2>
      {/* Scam Checker */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4 space-y-3">
        <h3 className="text-white font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" /> Scam Alert Checker</h3>
        <textarea placeholder="Paste job description, email, or link to check..." value={scamInput} onChange={e => setScamInput(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none resize-none" />
        <button onClick={checkScam} disabled={scamLoading} className="w-full bg-yellow-400/20 text-yellow-400 font-medium py-2.5 rounded-xl hover:bg-yellow-400/30 transition-all disabled:opacity-50">{scamLoading ? 'Checking...' : 'Check for Scam'}</button>
        {scamResult && (
          <div className={`rounded-xl p-4 ${scamResult.isScam ? 'bg-red-400/10 border border-red-400/30' : 'bg-green-400/10 border border-green-400/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              {scamResult.isScam ? <XCircle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-green-400" />}
              <span className={`font-medium ${scamResult.isScam ? 'text-red-400' : 'text-green-400'}`}>{scamResult.isScam ? 'Likely Scam' : 'Appears Legitimate'}</span>
              <span className="text-white/40 text-sm">({scamResult.confidence}% confidence)</span>
            </div>
            <ul className="space-y-1">
              {scamResult.reasons.map((r, i) => <li key={i} className="text-white/60 text-xs flex items-start gap-2"><span className="text-cyan-400 mt-0.5">•</span> {r}</li>)}
            </ul>
            {!showReport && <button onClick={() => setShowReport(true)} className="text-cyan-400 text-xs mt-2">Report this</button>}
            {showReport && (
              <div className="mt-3 space-y-2">
                <textarea placeholder="Add notes about this report..." value={reportNotes} onChange={e => setReportNotes(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none resize-none text-sm" />
                <div className="flex gap-2">
                  <button onClick={submitReport} className="flex-1 bg-cyan-400 text-[#0B0F19] text-sm font-medium py-2 rounded-xl">Submit Report</button>
                  <button onClick={() => setShowReport(false)} className="px-3 bg-white/5 text-white/60 text-sm py-2 rounded-xl">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Support Ticket */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4 space-y-3">
        <h3 className="text-white font-medium flex items-center gap-2"><HelpCircle className="w-4 h-4 text-cyan-400" /> Help & Support</h3>
        <input type="text" placeholder="Subject" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none" />
        <textarea placeholder="Describe your issue..." value={ticketMessage} onChange={e => setTicketMessage(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none resize-none" />
        <button onClick={submitTicket} className="w-full bg-cyan-400 text-[#0B0F19] font-medium py-2.5 rounded-xl hover:bg-cyan-300 transition-all">Submit Ticket</button>
        {ticketStatus && <p className="text-cyan-400 text-sm text-center">{ticketStatus}</p>}
      </div>
    </div>
  );
}

// ============ COURSES VIEW ============
function CoursesView({ session }: { session: Session | null }) {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [selectedCourse, setSelectedCourse] = useState<CourseWithProgress | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([fetchCourses(), fetchUserProgress(session)]);
      setCourses(c);
      setProgress(p);
      setLoading(false);
    })();
  }, [session]);

  const openCourse = async (course: CourseWithProgress) => {
    setSelectedCourse(course);
    const l = await fetchLessons(course.id);
    setLessons(l);
    setCurrentLessonIdx(0);
  };

  const completeLesson = async (lesson: Lesson, course: CourseWithProgress) => {
    await markLessonComplete(session, lesson.id, course.id);
    setProgress(prev => {
      const newProgress = { ...prev };
      const courseLessons = lessons.length;
      const completed = Math.min((prev[course.id] || 0) / 100 * courseLessons + 1, courseLessons);
      newProgress[course.id] = Math.round((completed / courseLessons) * 100);
      return newProgress;
    });
  };

  if (loading) return <div className="text-white/40 text-center py-8">Loading courses...</div>;

  if (selectedCourse) {
    const lesson = lessons[currentLessonIdx];
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-2 text-cyan-400 text-sm"><ChevronLeft className="w-4 h-4" /> Back to Courses</button>
        <h2 className="text-xl font-bold text-white">{selectedCourse.title}</h2>
        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4">
          {lesson ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-medium">Lesson {currentLessonIdx + 1}: {lesson.title}</h3>
                <span className="text-white/40 text-sm">{currentLessonIdx + 1}/{lessons.length}</span>
              </div>
              <div className="text-white/60 text-sm whitespace-pre-wrap mb-4">{lesson.content || 'Content loading...'}</div>
              <div className="flex gap-2">
                {currentLessonIdx > 0 && <button onClick={() => setCurrentLessonIdx(currentLessonIdx - 1)} className="flex items-center gap-1 bg-white/5 text-white/60 px-3 py-2 rounded-xl text-sm"><ChevronLeft className="w-4 h-4" /> Prev</button>}
                <button onClick={() => completeLesson(lesson, selectedCourse)} className="flex-1 bg-green-400/20 text-green-400 font-medium py-2 rounded-xl text-sm">Mark Complete</button>
                {currentLessonIdx < lessons.length - 1 && <button onClick={() => setCurrentLessonIdx(currentLessonIdx + 1)} className="flex items-center gap-1 bg-white/5 text-white/60 px-3 py-2 rounded-xl text-sm">Next <ChevronRight className="w-4 h-4" /></button>}
              </div>
            </>
          ) : <p className="text-white/40 text-sm">No lessons available.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-cyan-400" /> Courses</h2>
      {courses.length === 0 ? <p className="text-white/40 text-sm text-center py-8">No courses available yet.</p> : (
        <div className="space-y-3">
          {courses.map(c => (
            <button key={c.id} onClick={() => openCourse(c)} className="w-full bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4 text-left hover:bg-white/10 transition-all">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-medium">{c.title}</h3>
                <span className="text-cyan-400 text-sm">{progress[c.id] || c.progress || 0}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div className="bg-cyan-400 h-1.5 rounded-full transition-all" style={{ width: `${progress[c.id] || c.progress || 0}%` }} />
              </div>
              <p className="text-white/40 text-xs mt-2">{c.lessons} lessons</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ JOBS VIEW ============
function JobsView() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const j = await fetchLiveJobs();
      setJobs(j);
      setLoading(false);
    })();
  }, []);

  const filtered = jobs.filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-cyan-400" /> Job Listings</h2>
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-white/30" />
        <input type="text" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none" />
      </div>
      {loading ? <p className="text-white/40 text-sm text-center py-8">Loading jobs...</p> : (
        <div className="space-y-3">
          {filtered.map((j, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-white font-medium text-sm">{j.title}</h3>
                  <p className="text-white/40 text-xs">{j.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-cyan-400 text-sm font-medium">{j.pay}</p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-white/40 text-xs">{j.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              {j.source && <span className="inline-block bg-white/5 text-white/40 text-xs px-2 py-0.5 rounded-full">{j.source}</span>}
              {j.url && <a href={j.url} target="_blank" rel="noopener noreferrer" className="block text-cyan-400 text-xs mt-2">Apply Now →</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ SETTINGS VIEW ============
function SettingsView({ session, profile, onSignOut, setActiveTab }: { session: Session | null; profile: Profile | null; onSignOut: () => void; setActiveTab: (t: any) => void }) {
  const [pin, setPin] = useState('');
  const [pinStatus, setPinStatus] = useState('');
  const [exportStatus, setExportStatus] = useState('');

  const enablePin = async () => {
    if (pin.length !== 4) { setPinStatus('PIN must be 4 digits'); return; }
    const { error } = await setPinCode(session, pin);
    if (error) setPinStatus(`Error: ${error}`);
    else { setPinStatus('PIN enabled successfully!'); setPin(''); }
  };

  const removePin = async () => {
    const { error } = await disablePin(session);
    if (error) setPinStatus(`Error: ${error}`);
    else setPinStatus('PIN disabled');
  };

  const handleExport = async () => {
    setExportStatus('Exporting...');
    await exportUserData(session);
    setExportStatus('Data exported! Check your downloads.');
  };

  const settingsItems = [
    { icon: <Shield className="w-5 h-5" />, label: 'Scam Checker & Support', desc: 'Report scams and get help', action: () => setActiveTab('utilities') },
    { icon: <Lock className="w-5 h-5" />, label: 'PIN Lock', desc: 'Secure your app with a PIN', action: () => {} },
    { icon: <Download className="w-5 h-5" />, label: 'Export Data', desc: 'Download all your data', action: handleExport },
    { icon: <FileText className="w-5 h-5" />, label: 'Privacy Policy', desc: 'How we handle your data', action: () => setActiveTab('privacy') },
    { icon: <FileCheck className="w-5 h-5" />, label: 'Terms & Policies', desc: 'Terms of service', action: () => setActiveTab('terms') },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5 text-cyan-400" /> Settings</h2>
      {/* Profile Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">{profile?.full_name || 'User'}</h3>
            <p className="text-white/40 text-sm">{profile?.profession || 'No profession set'}</p>
          </div>
        </div>
      </div>
      {/* PIN Lock Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-white font-medium text-sm">PIN Lock</h3>
          {profile?.pin_enabled && <span className="bg-green-400/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Enabled</span>}
        </div>
        {profile?.pin_enabled ? (
          <button onClick={removePin} className="w-full bg-red-400/20 text-red-400 font-medium py-2.5 rounded-xl text-sm">Disable PIN</button>
        ) : (
          <>
            <input type="password" maxLength={4} placeholder="Enter 4-digit PIN" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-lg tracking-[0.3em] focus:border-cyan-400 focus:outline-none" />
            <button onClick={enablePin} className="w-full bg-cyan-400 text-[#0B0F19] font-medium py-2.5 rounded-xl text-sm">Enable PIN</button>
          </>
        )}
        {pinStatus && <p className="text-cyan-400 text-xs text-center">{pinStatus}</p>}
      </div>
      {/* Export Data */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-4 h-4 text-cyan-400" />
          <h3 className="text-white font-medium text-sm">Export My Data</h3>
        </div>
        <p className="text-white/40 text-xs mb-3">Download all your data as JSON (profile, tools, progress, reports, tickets).</p>
        <button onClick={handleExport} className="w-full bg-cyan-400 text-[#0B0F19] font-medium py-2.5 rounded-xl text-sm">Download Data</button>
        {exportStatus && <p className="text-cyan-400 text-xs text-center mt-2">{exportStatus}</p>}
      </div>
      {/* Links */}
      <button onClick={() => setActiveTab('utilities')} className="w-full bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4 text-left flex items-center gap-3 hover:bg-white/10 transition-all">
        <Shield className="w-5 h-5 text-cyan-400" />
        <div><h3 className="text-white font-medium text-sm">Scam Checker & Support</h3><p className="text-white/40 text-xs">Report scams and get help</p></div>
      </button>
      <button onClick={() => setActiveTab('privacy')} className="w-full bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4 text-left flex items-center gap-3 hover:bg-white/10 transition-all">
        <FileText className="w-5 h-5 text-cyan-400" />
        <div><h3 className="text-white font-medium text-sm">Privacy Policy</h3><p className="text-white/40 text-xs">How we handle your data</p></div>
      </button>
      <button onClick={() => setActiveTab('terms')} className="w-full bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4 text-left flex items-center gap-3 hover:bg-white/10 transition-all">
        <FileCheck className="w-5 h-5 text-cyan-400" />
        <div><h3 className="text-white font-medium text-sm">Terms & Policies</h3><p className="text-white/40 text-xs">Terms of service</p></div>
      </button>
      <button onClick={onSignOut} className="w-full bg-red-400/10 border border-red-400/20 rounded-2xl p-4 text-left flex items-center gap-3 hover:bg-red-400/20 transition-all">
        <LogOut className="w-5 h-5 text-red-400" />
        <div><h3 className="text-red-400 font-medium text-sm">Sign Out</h3><p className="text-white/40 text-xs">Log out of your account</p></div>
      </button>
    </div>
  );
}
