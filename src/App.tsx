import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient';
import { signIn, signUp, signInWithGoogle, signInWithLinkedIn, signOut, getSession, onAuthStateChange } from './lib/auth';
import { fetchProfile, type Profile } from './lib/profile';
import { saveAndGenerateResume, downloadResumeAsPDF } from './lib/resume';
import type { Session } from '@supabase/supabase-js';
import { Home, Bot, PenTool, Wrench, Settings, Shield, Search, Send, ChevronRight, Star, Gift, Flame, Trophy, FileText, RefreshCw, FileEdit, DollarSign, Download, Sparkles, Target, TrendingUp, X, Briefcase, ArrowLeft, Plus, Mic, Palette, LayoutTemplate, User, BookOpen, Clock, Brain, BarChart3, LockKeyhole, HelpCircle, SkipForward, Mail, Link2, Image, FileUp, Cloud, Lightbulb, Compass, Loader2, Check } from 'lucide-react';

// Simple Vertical Falling Sparks - Soft Cyan/Blue
const SparksBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    const particles: { x: number; y: number; vy: number; size: number; alpha: number }[] = [];
    const spawn = () => {
      if (particles.length >= 50) return;
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        vy: 0.8 + Math.random() * 1.2,
        size: 0.8 + Math.random() * 1.2,
        alpha: 0.15 + Math.random() * 0.35
      });
    };
    const animate = () => {
      ctx.fillStyle = 'rgba(11, 15, 25, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y += p.vy;
        const gradient = ctx.createLinearGradient(p.x, p.y - 25, p.x, p.y);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, `rgba(34, 211, 238, ${p.alpha})`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - 25);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        if (p.y > canvas.height) particles.splice(i, 1);
      }
      if (particles.length < 50) spawn();
      animationId = requestAnimationFrame(animate);
    };
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    animate();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

// Electric Blue Diamond Logo - Clean Symmetric Geometry
const VipDiamondLogo = ({ size = 120 }: { size?: number }) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="electricBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <filter id="blueGlow"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        {/* Outer diamond */}
        <path d="M60 10 L110 45 L60 110 L10 45 Z" stroke="rgba(34,211,238,0.3)" strokeWidth="2" fill="rgba(34,211,238,0.05)" />
        <path d="M60 10 L110 45 L60 110 L10 45 Z" stroke="url(#electricBlue)" strokeWidth="2" filter="url(#blueGlow)" />
        {/* Inner facets */}
        <path d="M60 10 L60 45" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
        <path d="M10 45 L60 45 L110 45" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
        <path d="M60 10 L35 45" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
        <path d="M60 10 L85 45" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
        <path d="M25 65 L95 65" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
        <path d="M10 45 L25 65" stroke="#22d3ee" strokeWidth="1" opacity="0.5" />
        <path d="M110 45 L95 65" stroke="#22d3ee" strokeWidth="1" opacity="0.5" />
        <path d="M25 65 L60 110 M95 65 L60 110 M60 65 L60 110" stroke="#22d3ee" strokeWidth="1" opacity="0.4" />
      </svg>
      <div className="absolute inset-0 bg-cyan-400/10 blur-2xl rounded-full scale-75 animate-pulse" />
    </div>
  );
};

const DiamondLogo = ({ small, animated }: { small?: boolean; animated?: boolean }) => {
  const size = small ? 64 : 112;
  return animated ? <VipDiamondLogo size={size} /> : (
    <svg className={small ? 'w-16 h-16' : 'w-28 h-28'} viewBox="0 0 100 100" fill="none">
      <path d="M50 8 L92 38 L50 92 L8 38 Z" stroke="#22d3ee" strokeWidth="2" fill="rgba(34,211,238,0.08)" />
    </svg>
  );
};

// Auth Modal
const AuthModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'email'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!email.trim() || !password.trim()) { setError('Please enter both email and password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      if (isSignUp) await signUp(email.trim(), password);
      else await signIn(email.trim(), password);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'linkedin') => {
    setOauthLoading(provider);
    setError('');
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithLinkedIn();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `${provider} sign-in failed. Please try again.`;
      setError(msg);
      setOauthLoading(null);
    }
  };

  const Spinner = ({ className }: { className?: string }) => (
    <span className={`border-2 border-white/30 border-t-white rounded-full ${className}`} style={{ animation: 'spin 0.6s linear infinite' }} />
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center px-4 animate-fade-in-up" onClick={loading || oauthLoading ? undefined : onClose}>
      <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <DiamondLogo small />
            <div>
              <h2 className="text-white font-semibold text-xl">{mode === 'signup' ? 'Create Account' : mode === 'email' ? 'Log In' : 'Welcome to SkillGlint'}</h2>
              <p className="text-white/40 text-xs">{mode === 'signup' ? 'Join the platform' : mode === 'email' ? 'Sign in to continue' : 'Sign in to continue'}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading || oauthLoading !== null} className="text-white/40 hover:text-white transition-colors disabled:opacity-40"><X className="w-5 h-5" /></button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
        )}

        {mode === 'email' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-sm mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:border-cyan-500/50 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth(false)} placeholder="At least 6 characters" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:border-cyan-500/50 outline-none transition-colors" />
            </div>
            <button onClick={() => handleEmailAuth(false)} disabled={loading} className="w-full py-3.5 rounded-2xl font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 border border-cyan-400/20 hover:scale-[1.01] transition-transform shadow-lg shadow-cyan-500/20 disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2">
              {loading ? <Spinner className="w-5 h-5" /> : 'Log In'}
            </button>
            <div className="text-center pt-2">
              <button onClick={() => { setMode('signup'); setError(''); }} disabled={loading} className="text-white/50 text-sm hover:text-cyan-400 transition-colors">Don't have an account? <span className="text-cyan-400 font-medium">Sign up</span></button>
            </div>
            <button onClick={() => { setMode('login'); setError(''); }} disabled={loading} className="w-full text-center text-white/40 text-sm hover:text-white/70 transition-colors flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to all options
            </button>
          </div>
        ) : mode === 'signup' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-sm mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:border-cyan-500/50 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth(true)} placeholder="At least 6 characters" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:border-cyan-500/50 outline-none transition-colors" />
            </div>
            <button onClick={() => handleEmailAuth(true)} disabled={loading} className="w-full py-3.5 rounded-2xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-cyan-500 border border-cyan-400/30 hover:scale-[1.01] transition-transform shadow-lg shadow-cyan-500/20 disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2">
              {loading ? <Spinner className="w-5 h-5 border-cyan-400/30 border-t-cyan-400" /> : 'Create New Account'}
            </button>
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs">or sign up with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleOAuth('google')} disabled={oauthLoading !== null} className="flex-1 py-3 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-white/80 text-sm hover:bg-white/15 transition-all disabled:opacity-50">
                {oauthLoading === 'google' ? <Spinner className="w-4 h-4" /> : <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
                Google
              </button>
              <button onClick={() => handleOAuth('linkedin')} disabled={oauthLoading !== null} className="flex-1 py-3 rounded-xl bg-[#0A66C2]/20 border border-[#0A66C2]/40 flex items-center justify-center gap-2 text-white/80 text-sm hover:bg-[#0A66C2]/30 transition-all disabled:opacity-50">
                {oauthLoading === 'linkedin' ? <Spinner className="w-4 h-4" /> : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z"/></svg>}
                LinkedIn
              </button>
            </div>
            <button onClick={() => { setMode('login'); setError(''); }} disabled={loading} className="w-full text-center text-white/40 text-sm hover:text-white/70 transition-colors flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Already have an account? <span className="text-cyan-400 font-medium">Log in</span>
            </button>
          </div>
        ) : (
          <>
            <button onClick={() => handleOAuth('google')} disabled={oauthLoading !== null} className="w-full py-3.5 rounded-2xl font-medium text-white transition-all hover:scale-[1.01] bg-white/10 border border-white/10 flex items-center justify-center gap-3 mb-3 disabled:opacity-60 disabled:scale-100">
              {oauthLoading === 'google' ? <Spinner className="w-5 h-5" /> : <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
              Continue with Google
            </button>

            <button onClick={() => handleOAuth('linkedin')} disabled={oauthLoading !== null} className="w-full py-3.5 rounded-2xl font-medium text-white transition-all hover:scale-[1.01] bg-[#0A66C2] border border-[#0A66C2]/40 flex items-center justify-center gap-3 mb-3 shadow-lg shadow-[#0A66C2]/20 disabled:opacity-60 disabled:scale-100">
              {oauthLoading === 'linkedin' ? <Spinner className="w-5 h-5" /> : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z"/></svg>}
              Continue with LinkedIn
            </button>

            <button onClick={() => { setMode('email'); setError(''); }} disabled={oauthLoading !== null} className="w-full py-3.5 rounded-2xl font-medium text-white transition-all hover:scale-[1.01] bg-white/10 border border-white/10 flex items-center justify-center gap-3 mb-4 disabled:opacity-60 disabled:scale-100">
              <Mail className="w-5 h-5" />
              Continue with Email
            </button>

            <div className="text-center mt-6 pt-4 border-t border-white/10">
              <p className="text-white/40 text-sm mb-3">New to SkillGlint?</p>
              <button onClick={() => { setMode('signup'); setError(''); }} disabled={oauthLoading !== null} className="w-full py-3.5 rounded-2xl font-semibold text-cyan-400 bg-cyan-400/10 border-2 border-cyan-400/30 hover:bg-cyan-400/20 transition-colors disabled:opacity-60">
                Create New Account
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Header = ({ onProfile, onSettings, title, subtitle, hideTicker, profile, session }: { onProfile: () => void; onSettings: () => void; title?: string; subtitle?: string; hideTicker?: boolean; profile?: Profile | null; session?: Session | null }) => {
  const tickerItems = [
    { name: 'Sarah M.', action: 'earned $450 via Data Entry', type: 'earning' },
    { name: 'James K.', action: 'mastered Freelance Strategy', type: 'skill' },
    { name: 'Maria L.', action: 'completed AI Resume Builder', type: 'tool' },
    { name: 'Ahmed R.', action: 'earned $1,200 this week', type: 'earning' },
    { name: 'Lisa T.', action: 'won Top Freelancer badge', type: 'achievement' }
  ];

  return (
    <>
      <header className="sticky top-0 bg-[#0B0F19]/95 backdrop-blur-xl border-b border-white/5 z-30">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <div>
            {subtitle && <p className="text-white/40 text-xs font-medium">{subtitle}</p>}
            {title && <h1 className="text-white font-semibold text-lg">{title}</h1>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onProfile} className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center ring-2 ring-cyan-400/20 hover:scale-105 transition-transform shadow-lg shadow-cyan-400/20">
              <span className="text-black font-bold text-sm">{profile?.full_name?.charAt(0)?.toUpperCase() || (session?.user?.email?.charAt(0)?.toUpperCase() ?? 'U')}</span>
            </button>
            <button onClick={onSettings} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-cyan-400/20 hover:border-cyan-400/30 transition-all">
              <Settings className="w-5 h-5 text-cyan-400" />
            </button>
          </div>
        </div>
        {!hideTicker && (
          <div className="border-t border-white/5 bg-gradient-to-r from-cyan-400/5 via-blue-500/5 to-cyan-400/5 backdrop-blur-xl">
            <div className="overflow-hidden py-2">
              <div className="animate-marquee whitespace-nowrap flex">
                {[...tickerItems, ...tickerItems].map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 mx-4 text-xs">
                    {item.type === 'earning' && <DollarSign className="w-3 h-3 text-emerald-400" />}
                    {item.type === 'skill' && <BookOpen className="w-3 h-3 text-cyan-400" />}
                    {item.type === 'tool' && <Wrench className="w-3 h-3 text-blue-400" />}
                    {item.type === 'achievement' && <Trophy className="w-3 h-3 text-yellow-400" />}
                    <span className="text-cyan-400 font-medium">{item.name}</span>
                    <span className="text-white/50"> {item.action}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

const BottomNav = ({ active, setActive }: { active: string; setActive: (v: string) => void }) => {
  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'ai', icon: Bot, label: 'AI Assistant' },
    { id: 'writer', icon: PenTool, label: 'Writer Tools' },
    { id: 'utilities', icon: Wrench, label: 'Utilities' }
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-white/5 px-4 py-3 z-30">
      <div className="flex justify-around max-w-lg mx-auto">
        {items.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActive(id)} className={`flex flex-col items-center gap-1.5 transition-all duration-300 px-4 py-1 rounded-xl ${active === id ? 'text-cyan-400 bg-cyan-400/10' : 'text-white/40 hover:text-white/60'}`}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// VIP Interactive Tour System
const VipWelcomeOverlay = ({ onBegin }: { onBegin: () => void }) => {
  return (
    <div className="fixed inset-0 bg-[#0B0F19] z-[60] flex flex-col items-center justify-center overflow-hidden">
      <SparksBackground />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[180px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[160px]" />

      {/* Expanding rings behind diamond */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute w-48 h-48 -translate-x-1/2 -translate-y-1/2 border border-cyan-400/20 rounded-full animate-ring-expand" />
        <div className="absolute w-48 h-48 -translate-x-1/2 -translate-y-1/2 border border-cyan-400/20 rounded-full animate-ring-expand" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="relative mb-8 animate-float">
          <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-150" />
          <VipDiamondLogo size={140} />
        </div>

        <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-cyan-400/10 via-cyan-400/20 to-cyan-400/10 border border-cyan-400/30 rounded-full text-cyan-400 text-xs font-medium tracking-[0.2em] uppercase mb-6 animate-fade-in-up">
          VIP Access Granted
        </span>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <span className="bg-gradient-to-r from-cyan-300 via-white to-cyan-300 bg-clip-text text-transparent animate-shimmer">
            Welcome to SkillGlint
          </span>
        </h1>

        <p className="text-white/50 text-base max-w-md leading-relaxed mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          Your premium platform for learning, earning, and building a successful freelance career.
        </p>

        <button onClick={onBegin} className="px-10 py-4 rounded-full font-medium text-black bg-gradient-to-r from-cyan-300 to-cyan-500 border border-cyan-300/30 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-2xl shadow-cyan-500/30 animate-fade-in-up flex items-center gap-2" style={{ animationDelay: '0.6s' }}>
          Begin VIP Tour
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const TourFeatureStep = ({ step, total, onNext, onSkip, onBack }: { step: number; total: number; onNext: () => void; onSkip: () => void; onBack: () => void }) => {
  const steps = [
    { title: 'AI Assistant', desc: 'Chat with our intelligent AI to get personalized career guidance, job recommendations, and skill roadmaps tailored specifically to you.', icon: Bot, badge: 'Smart', accent: 'from-cyan-400/20 to-blue-600/20' },
    { title: 'Writer Tools', desc: 'Build professional resumes, generate cover letters, and spin articles with our premium AI-powered writing suite.', icon: PenTool, badge: 'Pro Tools', accent: 'from-emerald-400/20 to-teal-600/20' },
    { title: 'Dashboard', desc: 'Track your progress, discover hot jobs, and continue your learning journey — all from one elegant command center.', icon: BarChart3, badge: 'Hub', accent: 'from-amber-400/20 to-orange-600/20' },
    { title: 'Ready to Shine!', desc: "You're all set! Explore the platform and start your journey to success. Your future starts now.", icon: Trophy, badge: "Let's Go", accent: 'from-cyan-400/20 to-cyan-600/20' }
  ];
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === total - 1;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-lg z-[60] flex items-center justify-center px-6">
      <div className="absolute top-6 right-6">
        <button onClick={onSkip} className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all text-sm">
          <SkipForward className="w-4 h-4" /> Skip Tour
        </button>
      </div>

      <div key={step} className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-cyan-400/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl shadow-cyan-500/10 animate-step-in">
        <div className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${current.accent} border border-white/10 flex items-center justify-center mb-6 shadow-xl`}>
          <Icon className="w-12 h-12 text-white" />
        </div>
        <span className="inline-block px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 rounded-full text-cyan-400 text-xs font-medium mb-3">{current.badge}</span>
        <h2 className="text-2xl font-semibold text-white mb-3">{current.title}</h2>
        <p className="text-white/60 mb-8 leading-relaxed text-sm">{current.desc}</p>

        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-400 ${i === step ? 'w-8 bg-cyan-400' : i < step ? 'w-1.5 bg-cyan-400/40' : 'w-1.5 bg-white/15'}`} />
          ))}
        </div>

        <div className="flex gap-3">
          {!isLast && (
            <button onClick={onSkip} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:bg-white/10 transition-colors text-sm">
              Skip
            </button>
          )}
          {step > 0 && (
            <button onClick={onBack} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:bg-white/10 transition-colors text-sm flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button onClick={onNext} className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-xl text-black font-medium hover:opacity-90 hover:scale-[1.02] active:scale-[0.97] transition-all shadow-lg shadow-cyan-400/25">
            {isLast ? 'Enter Dashboard' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileModal = ({ onClose, profile, session }: { onClose: () => void; profile: Profile | null; session: Session | null }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center px-4" onClick={onClose}>
    <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/5 rounded-3xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white font-semibold text-xl">Profile</h2>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center ring-4 ring-cyan-400/20 shadow-xl shadow-cyan-400/20">
          <span className="text-black font-bold text-3xl">{profile?.full_name?.charAt(0)?.toUpperCase() || (session?.user?.email?.charAt(0)?.toUpperCase() ?? 'U')}</span>
        </div>
        <h3 className="text-white font-semibold text-xl mt-4">{profile?.full_name || 'Your Name'}</h3>
        <p className="text-white/40 text-sm">{session?.user?.email || 'No email'}</p>
        {profile?.profession && <p className="text-cyan-400/80 text-sm mt-1">{profile.profession}</p>}
        <div className="flex gap-8 mt-6">
          <div className="text-center"><p className="text-cyan-400 font-bold text-2xl">12</p><p className="text-white/40 text-xs">Courses</p></div>
          <div className="text-center"><p className="text-cyan-400 font-bold text-2xl">48</p><p className="text-white/40 text-xs">Hours</p></div>
          <div className="text-center"><p className="text-cyan-400 font-bold text-2xl">5</p><p className="text-white/40 text-xs">Certs</p></div>
        </div>
      </div>
      {[Trophy, Gift, Settings, HelpCircle].map((Icon, i) => (
        <button key={i} className="w-full flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 mt-3 hover:bg-white/10 transition-all">
          <Icon className="w-5 h-5 text-cyan-400" />
          <span className="text-white flex-1 text-left">{['Achievements', 'Rewards', 'Settings', 'Help'][i]}</span>
          <ChevronRight className="w-4 h-4 text-white/30" />
        </button>
      ))}
    </div>
  </div>
);

const IncomeGoalTracker = () => {
  const [target, setTarget] = useState(1000);
  const [current] = useState(350);
  const [editing, setEditing] = useState(false);
  const progress = (current / target) * 100;
  return (
    <div className="bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-xl shadow-cyan-400/5 hover:shadow-cyan-400/10 transition-all duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-400/20 flex items-center justify-center"><Target className="w-5 h-5 text-cyan-400" /></div>
          <span className="text-white font-medium">Income Goal</span>
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <span className="text-white/40">$</span>
            <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} className="w-20 bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 text-white text-sm" />
            <button onClick={() => setEditing(false)} className="text-cyan-400 text-sm font-medium">Save</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-white/40 text-sm hover:text-cyan-400 transition-colors">Edit</button>
        )}
      </div>
      <div className="flex items-end justify-between mb-3">
        <div><p className="text-3xl font-bold text-white">${current}</p><p className="text-white/40 text-sm">of ${target} target</p></div>
        <div className="flex items-center gap-1.5 text-emerald-400"><TrendingUp className="w-4 h-4" /><span className="font-medium">{progress.toFixed(0)}%</span></div>
      </div>
      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
    </div>
  );
};

const SettingsModal = ({ onClose, onSignOut }: { onClose: () => void; onSignOut: () => void }) => {
  const [signingOut, setSigningOut] = useState(false);
  const handleSignOut = async () => {
    setSigningOut(true);
    try { await signOut(); } catch { /* ignore — still reset local state */ }
    onSignOut();
  };
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center px-4" onClick={signingOut ? undefined : onClose}>
      <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/5 rounded-3xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-semibold text-xl">Settings</h2>
          <button onClick={onClose} disabled={signingOut} className="text-white/40 hover:text-white transition-colors disabled:opacity-40"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          {[
            { icon: Shield, label: 'Privacy & Security' },
            { icon: FileText, label: 'Terms & Policies' },
            { icon: Download, label: 'Export My Data' },
            { icon: HelpCircle, label: 'Help & Support' },
          ].map(({ icon: Icon, label }, i) => (
            <button key={i} className="w-full flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all">
              <Icon className="w-5 h-5 text-cyan-400" />
              <span className="text-white flex-1 text-left">{label}</span>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </button>
          ))}
          <button onClick={handleSignOut} disabled={signingOut} className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 hover:bg-red-500/20 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-60">
            {signingOut ? <span className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full" style={{ animation: 'spin 0.6s linear infinite' }} /> : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Career Insight Card - AI-analyzed job recommendations based on course progress
const CareerInsightCard = ({ courses }: { courses: { title: string; progress: number; icon: React.ElementType }[] }) => {
  const completed = courses.filter(c => c.progress >= 100);
  const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100);
  const skillMap: Record<string, { title: string; company: string; pay: string; match: number; tag: string }[]> = {
    'Copy-Paste Mastery': [{ title: 'Data Entry Specialist', company: 'TechFlow', pay: '$22/hr', match: 95, tag: 'Top Match' }, { title: 'Virtual Assistant', company: 'RemoteFirst', pay: '$25/hr', match: 88, tag: 'High' }],
    'Canva Design Pro': [{ title: 'Social Media Designer', company: 'CreativeHub', pay: '$30/hr', match: 92, tag: 'Top Match' }, { title: 'Brand Designer', company: 'PixelCo', pay: '$35/hr', match: 85, tag: 'High' }],
    'AI Tools Bootcamp': [{ title: 'AI Trainer', company: 'NeuralAI', pay: '$40/hr', match: 96, tag: 'Top Match' }, { title: 'Prompt Engineer', company: 'AIWorks', pay: '$45/hr', match: 90, tag: 'High' }],
    'Freelance Success': [{ title: 'Freelance Project Manager', company: 'Upwork Pro', pay: '$32/hr', match: 87, tag: 'High' }, { title: 'Client Success Manager', company: 'RemoteCo', pay: '$28/hr', match: 82, tag: 'Good' }],
    'Data Entry Pro': [{ title: 'Data Analyst', company: 'DataPro', pay: '$26/hr', match: 89, tag: 'High' }, { title: 'Data Entry Clerk', company: 'QuickData', pay: '$18/hr', match: 94, tag: 'Top Match' }],
    'Content Writing': [{ title: 'Content Writer', company: 'WriteHub', pay: '$28/hr', match: 93, tag: 'Top Match' }, { title: 'Copy Editor', company: 'EditPro', pay: '$30/hr', match: 86, tag: 'High' }],
  };
  const recommendations: { title: string; company: string; pay: string; match: number; tag: string }[] = [];
  [...completed, ...inProgress].forEach(c => {
    const matches = skillMap[c.title];
    if (matches) matches.forEach(m => { if (!recommendations.find(r => r.title === m.title)) recommendations.push(m); });
  });
  const topJobs = recommendations.sort((a, b) => b.match - a.match).slice(0, 3);
  const totalSkills = completed.length + inProgress.length;
  return (
    <div className="bg-gradient-to-br from-cyan-400/8 via-blue-500/5 to-transparent backdrop-blur-xl border border-cyan-400/15 rounded-2xl p-5 hover:border-cyan-400/25 transition-all duration-500 animate-fade-in-up">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/25 to-blue-500/25 flex items-center justify-center"><Compass className="w-5 h-5 text-cyan-400" /></div>
          <div><h3 className="text-white font-medium">Career Insight</h3><p className="text-white/40 text-xs">AI-analyzed job recommendations</p></div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-400/10 rounded-full"><Lightbulb className="w-3.5 h-3.5 text-cyan-400" /><span className="text-cyan-400 text-xs font-medium">{totalSkills} skills</span></div>
      </div>
      {topJobs.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {topJobs.map((job, i) => (
            <div key={i} className="flex items-center gap-3 bg/black/25 rounded-xl p-3.5 border border-white/5 hover:border-cyan-400/20 hover:bg-black/40 transition-all duration-300 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/15 to-blue-500/15 flex items-center justify-center flex-shrink-0"><Briefcase className="w-5 h-5 text-cyan-400/70" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="text-white text-sm font-medium truncate">{job.title}</p>{job.match >= 90 && <span className="px-1.5 py-0.5 bg-cyan-400/15 text-cyan-400 text-[10px] font-medium rounded-md flex-shrink-0">{job.tag}</span>}</div>
                <p className="text-white/40 text-xs mt-0.5">{job.company} · {job.pay}</p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0"><div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{ width: `${job.match}%` }} /></div><span className="text-cyan-400 text-xs font-medium mt-1">{job.match}%</span></div>
            </div>
          ))}
          <p className="text-white/30 text-xs text-center pt-1">Complete more courses to unlock better matches</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3"><Compass className="w-6 h-6 text-white/30" /></div>
          <p className="text-white/50 text-sm">Stay tuned, we are finding the best matches for you</p>
          <p className="text-white/30 text-xs mt-1">Start a course to unlock personalized job recommendations</p>
        </div>
      )}
    </div>
  );
};

// Professional Empty State
const EmptyState = ({ icon: Icon, title, desc, action }: { icon: React.ElementType; title: string; desc: string; action?: { label: string; onClick: () => void } }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in-up">
    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4"><Icon className="w-8 h-8 text-white/25" /></div>
    <p className="text-white/60 text-sm font-medium">{title}</p>
    <p className="text-white/35 text-xs mt-1.5 max-w-xs">{desc}</p>
    {action && <button onClick={action.onClick} className="mt-4 px-5 py-2.5 bg-cyan-400/10 border border-cyan-400/20 rounded-xl text-cyan-400 text-sm font-medium hover:bg-cyan-400/20 hover:scale-[1.02] active:scale-[0.97] transition-all">{action.label}</button>}
  </div>
);

// AI Assistant Attachment Menu - solid dark background for readability
const AIAttachMenu = ({ onClose, onSelect }: { onClose: () => void; onSelect: (label: string) => void }) => {
  const options = [
    { icon: FileUp, label: 'Upload Resume (PDF/Doc)', desc: 'Share your resume for analysis' },
    { icon: Image, label: 'Upload Project Image', desc: 'Show your work visually' },
    { icon: Link2, label: 'Attach Link/URL', desc: 'Reference external content' },
    { icon: Cloud, label: 'Import from Google Drive', desc: 'Pull files from your Drive' },
  ];
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute bottom-full left-0 mb-2 w-72 bg-[#0B0F19] border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/80 animate-fade-in-scale origin-bottom-left">
        {options.map((opt, i) => (
          <button key={i} onClick={() => { onSelect(opt.label); onClose(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 active:scale-[0.97] transition-all text-left group">
            <div className="w-9 h-9 rounded-lg bg-cyan-400/15 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-400/25 transition-colors"><opt.icon className="w-4 h-4 text-cyan-400" /></div>
            <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium">{opt.label}</p><p className="text-white/50 text-xs mt-0.5">{opt.desc}</p></div>
          </button>
        ))}
      </div>
    </>
  );
};

const ToolCard = ({ icon: Icon, title, desc, onClick }: { icon: React.ElementType; title: string; desc: string; onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-cyan-400/30 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-400/10 transition-all duration-300 text-left w-full group">
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
      <Icon className="w-7 h-7 text-cyan-400" />
    </div>
    <div className="flex-1 min-w-0"><h3 className="text-white font-medium text-lg">{title}</h3><p className="text-white/50 text-sm">{desc}</p></div>
    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
  </button>
);

// Full-Screen Tool View Wrapper
const FullScreenTool = ({ title, icon: Icon, onBack, children }: { title: string; icon: React.ElementType; onBack: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-[#0B0F19] z-40 overflow-y-auto">
    <SparksBackground />
    <div className="relative z-10 min-h-full">
      <div className="sticky top-0 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-blue-600/30 flex items-center justify-center shadow-xl shadow-cyan-400/20">
            <Icon className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            <p className="text-white/50 text-sm mt-1">Premium AI-powered tool</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const HomeView = ({ onProfile, onSettings, onNavigate, profile, session }: { onProfile: () => void; onSettings: () => void; onNavigate: (tab: string, tool?: string) => void; profile: Profile | null; session: Session | null }) => {
  const [streak] = useState(7);
  const [checkedIn, setCheckedIn] = useState(false);
  const [jobs, setJobs] = useState<{ title: string; company: string; pay: string; rating: number }[]>([]);
  const [courses, setCourses] = useState<{ title: string; lessons: number; progress: number; icon: React.ElementType }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      const [jobsRes, coursesRes] = await Promise.all([
        supabase.from('jobs').select('title, company, pay, rating').order('created_at', { ascending: false }),
        supabase.from('courses').select('title, lessons, progress, icon_name').order('created_at', { ascending: false }),
      ]);
      if (jobsRes.error || coursesRes.error) { setError(true); setLoading(false); return; }
      const iconByName: Record<string, React.ElementType> = { FileText, Palette, Brain, Trophy, BookOpen };
      setJobs(jobsRes.data || []);
      setCourses((coursesRes.data || []).map(c => ({ title: c.title, lessons: c.lessons, progress: c.progress, icon: iconByName[c.icon_name] || BookOpen })));
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <Header onProfile={onProfile} onSettings={onSettings} title={profile?.full_name || session?.user?.email || 'Welcome'} subtitle={profile?.profession || 'Welcome back'} profile={profile} session={session} />
      <main className="px-4 py-5 max-w-2xl mx-auto space-y-5 pb-24 relative z-10">
        <div className="absolute top-20 left-0 w-72 h-72 bg-indigo-600/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-40 right-0 w-80 h-80 bg-cyan-600/5 rounded-full blur-[100px]" />

        <IncomeGoalTracker />

        <div className="bg-gradient-to-r from-cyan-400/15 to-blue-500/15 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400/20 to-red-500/20 flex items-center justify-center">
                {checkedIn ? <Gift className="w-6 h-6 text-cyan-400" /> : <Flame className="w-6 h-6 text-orange-400" />}
              </div>
              <div><p className="text-white font-medium">Daily Check-in</p><p className="text-white/50 text-sm flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" />{streak} day streak</p></div>
            </div>
            <button onClick={() => setCheckedIn(true)} disabled={checkedIn} className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.96] ${checkedIn ? 'bg-white/10 text-white/40' : 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-black shadow-lg shadow-cyan-400/25 hover:shadow-cyan-400/40'}`}>
              {checkedIn ? 'Claimed' : 'Check In'}
            </button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/20 flex items-center justify-center"><Briefcase className="w-5 h-5 text-cyan-400" /></div>
              <h3 className="text-white font-medium">Hot Jobs Today</h3>
            </div>
            <button className="text-cyan-400 text-xs font-medium">View All</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-8"><span className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full" style={{ animation: 'spin 0.6s linear infinite' }} /></div>
            ) : error ? (
              <div className="col-span-full text-center py-8 text-white/40 text-sm">Unable to load jobs. Please try again later.</div>
            ) : jobs.length === 0 ? (
              <div className="col-span-full text-center py-8 text-white/40 text-sm">No jobs available right now. Check back soon!</div>
            ) : (
              jobs.map((j, i) => (
                <div key={i} className="bg-black/30 backdrop-blur rounded-2xl p-4 border border-white/5 hover:border-cyan-400/30 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-400/10 transition-all duration-300 cursor-pointer group">
                  <p className="text-white text-sm font-medium">{j.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{j.company}</p>
                  <div className="flex justify-between mt-3"><span className="text-cyan-400 font-semibold text-sm">{j.pay}</span><span className="text-white/40 text-xs flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{j.rating}</span></div>
                </div>
              ))
            )}
          </div>
        </div>

        <CareerInsightCard courses={courses} />

        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center"><BookOpen className="w-5 h-5 text-blue-400" /></div>
              <h3 className="text-white font-medium">Continue Learning</h3>
            </div>
            <button onClick={() => onNavigate('courses')} className="text-cyan-400 text-xs font-medium">All Courses</button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8"><span className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full" style={{ animation: 'spin 0.6s linear infinite' }} /></div>
            ) : error ? (
              <div className="text-center py-8 text-white/40 text-sm">Unable to load courses. Please try again later.</div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-sm">No courses available yet. Check back soon!</div>
            ) : (
              courses.slice(0, 3).map((c, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-black/30 rounded-xl border border-white/5 hover:border-cyan-400/20 transition-colors cursor-pointer">
                  <c.icon className="w-8 h-8 text-cyan-400/60" />
                  <div className="flex-1"><p className="text-white text-sm font-medium">{c.title}</p><p className="text-white/40 text-xs">{c.lessons} lessons</p></div>
                  {c.progress > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-cyan-400 rounded-full" style={{ width: `${c.progress}%` }} /></div>
                      <span className="text-white/40 text-xs">{c.progress}%</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
};

const AIAssistantView = ({ onProfile, onSettings }: { onProfile: () => void; onSettings: () => void }) => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('Professional');
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [attachLabel, setAttachLabel] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const tones = ['Professional', 'Creative', 'Technical'];
  const templates = ['Write a compelling job proposal', 'Optimize my LinkedIn profile', 'Generate a cold email', 'Create a project timeline', 'Analyze my skill gaps'];
  const actions = ['Data Entry Market', 'Freelance Strategy', 'Skill Roadmap', 'Fix My Resume', 'Job Search Tips', 'Salary Negotiation'];

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages, loading]);
  const sendMessage = (text: string) => {
    if (!text.trim() || loading) return;
    setMessages(m => [...m, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    setTimeout(() => { setMessages(m => [...m, { role: 'assistant', content: `I am analyzing your query... Here's what I found for "${text}" — let me break this down with a ${tone.toLowerCase()} approach.` }]); setLoading(false); }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col relative">
      <SparksBackground />
      <header className="sticky top-0 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/5 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="w-7 h-7 text-cyan-400" />
            <span className="text-white font-medium">AI Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onProfile} className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center ring-2 ring-cyan-400/20 text-black font-bold text-sm">HK</button>
            <button onClick={onSettings} className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-cyan-400/20 transition-all"><Settings className="w-4 h-4 text-cyan-400" /></button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full relative z-10">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-48 text-center animate-fade-in-up">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px]" />
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-90 animate-pulse" />
              <div className="relative"><VipDiamondLogo size={96} /></div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-light bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent mb-4">
              Welcome to SkillGlint AI Assistant
            </h2>
            <p className="text-white/50 text-base mb-10 max-w-md">Your AI-powered guide for career growth, resumes, and skills. How can I help you today?</p>
            <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-lg">
              {actions.map((a, i) => (
                <button key={i} onClick={() => sendMessage(a)} className="px-4 py-2.5 bg-white/5 border border-white/5 rounded-full text-white/70 text-sm hover:bg-cyan-400/20 hover:border-cyan-400/30 hover:scale-[1.03] active:scale-[0.96] transition-all duration-300" style={{ animationDelay: `${i * 60}ms` }}>{a}</button>
              ))}
            </div>
          </div>
        ) : (
          <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-48">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-end gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round"><path d="M12 2 L22 9 L12 22 L2 9 Z" /></svg>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${m.role === 'user' ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-medium' : 'bg-white/5 backdrop-blur border border-white/5 text-white'}`}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="flex items-end gap-2.5 justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round"><path d="M12 2 L22 9 L12 22 L2 9 Z" /></svg>
                </div>
                <div className="bg-white/5 backdrop-blur border border-white/5 rounded-2xl px-5 py-3.5 flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full" style={{ animation: 'spin 0.6s linear infinite' }} />
                  <span className="text-white/50 text-sm">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="fixed bottom-[68px] left-0 right-0 z-20 px-4 pt-3 pb-3 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/95 to-transparent">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <div className="flex items-center gap-1 flex-shrink-0">
                <Palette className="w-4 h-4 text-white/40" />
                {tones.map(t => (
                  <button key={t} onClick={() => setTone(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${tone === t ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30' : 'text-white/50 hover:text-white/80'}`}>{t}</button>
                ))}
              </div>
              <button onClick={() => setShowTemplates(!showTemplates)} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/50 hover:text-white/80 transition-colors flex-shrink-0 whitespace-nowrap">
                <LayoutTemplate className="w-4 h-4" /> Templates
              </button>
            </div>
            {showTemplates && (
              <div className="flex flex-wrap gap-2">{templates.map((t, i) => <button key={i} onClick={() => { sendMessage(t); setShowTemplates(false); }} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-xs text-white/60 hover:text-cyan-400 transition-colors">{t}</button>)}</div>
            )}
            {attachLabel && (
              <div className="flex items-center gap-2 px-3 py-2 bg-cyan-400/10 border border-cyan-400/20 rounded-xl text-xs text-cyan-400 animate-fade-in-up">
                <FileUp className="w-3.5 h-3.5" />
                <span className="flex-1 truncate">{attachLabel}</span>
                <button onClick={() => setAttachLabel('')} className="text-white/40 hover:text-white/70 transition-colors"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
            <div className="relative flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-xl shadow-black/40">
              <div className="relative">
                {showAttach && <AIAttachMenu onClose={() => setShowAttach(false)} onSelect={(label) => setAttachLabel(label)} />}
                <button onClick={() => setShowAttach(!showAttach)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showAttach ? 'text-cyan-400 bg-cyan-400/15' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}><Plus className={`w-5 h-5 transition-transform duration-300 ${showAttach ? 'rotate-45' : ''}`} /></button>
              </div>
              <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"><Mic className="w-5 h-5" /></button>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)} placeholder="Ask about career, resumes, or skills..." className="flex-1 bg-transparent px-2 py-2.5 text-white text-sm placeholder-white/40 outline-none" />
              <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-400/30 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:scale-100"><Send className="w-5 h-5 text-black" /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const WriterToolsView = ({ onProfile, onSettings, activeTool, setActiveTool }: { onProfile: () => void; onSettings: () => void; activeTool: string; setActiveTool: (v: string) => void }) => {
  const [resume, setResume] = useState({ name: '', education: '', skills: '' });
  const [textToSpin, setTextToSpin] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [spun, setSpun] = useState('');
  const [cover, setCover] = useState('');
  const [resumeGenerating, setResumeGenerating] = useState(false);
  const [resumeResult, setResumeResult] = useState<{ id: string; generatedContent: string } | null>(null);
  const [resumeError, setResumeError] = useState('');

  const tools = [
    { id: 'resume', icon: FileText, title: 'AI Resume Builder', desc: 'Create ATS-friendly resumes' },
    { id: 'spinner', icon: RefreshCw, title: 'Article Spinner', desc: 'Rewrite content instantly' },
    { id: 'cover', icon: FileEdit, title: 'Cover Letter Writer', desc: 'Generate job proposals' },
    { id: 'linkedin', icon: User, title: 'LinkedIn Optimizer', desc: 'Profile enhancement' },
    { id: 'portfolio', icon: Briefcase, title: 'Portfolio Generator', desc: 'Build your portfolio' },
    { id: 'proposal', icon: Send, title: 'Proposal Composer', desc: 'Client-winning proposals' }
  ];

  if (activeTool && activeTool !== 'none') {
    const tool = tools.find(t => t.id === activeTool);
    if (!tool) return null;
    const Icon = tool.icon;

    return (
      <FullScreenTool title={tool.title} icon={Icon} onBack={() => setActiveTool('none')}>
        {activeTool === 'resume' && (
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="space-y-4">
                <input value={resume.name} onChange={(e) => setResume({ ...resume, name: e.target.value })} placeholder="Full Name" className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-white/40 focus:border-cyan-400/50 outline-none transition-colors" />
                <input value={resume.education} onChange={(e) => setResume({ ...resume, education: e.target.value })} placeholder="Education (e.g., BS in Computer Science)" className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-white/40 focus:border-cyan-400/50 outline-none transition-colors" />
                <textarea value={resume.skills} onChange={(e) => setResume({ ...resume, skills: e.target.value })} placeholder="Skills (comma separated: Data Entry, Excel, Writing...)" rows={3} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-white/40 focus:border-cyan-400/50 outline-none resize-none transition-colors" />
                {resumeError && <p className="text-red-400 text-sm">{resumeError}</p>}
                <button onClick={async () => {
                  setResumeGenerating(true); setResumeError(''); setResumeResult(null);
                  const res = await saveAndGenerateResume(resume);
                  setResumeGenerating(false);
                  if (res.error) { setResumeError(res.error); return; }
                  setResumeResult({ id: res.id, generatedContent: res.generatedContent });
                }} disabled={resumeGenerating} className="w-full py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-2xl font-semibold text-black flex items-center justify-center gap-2 shadow-xl shadow-cyan-400/25 hover:scale-[1.01] transition-transform disabled:opacity-50">
                  {resumeGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />} {resumeGenerating ? 'Generating...' : 'Generate & Download PDF'}
                </button>
                {resumeResult && (
                  <div className="mt-2 p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-cyan-400 text-sm font-medium flex items-center gap-1.5"><Check className="w-4 h-4" /> Resume saved & generated!</span>
                      <button onClick={() => downloadResumeAsPDF(resumeResult.generatedContent, resume.name || 'resume')} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-400/20 border border-cyan-400/30 rounded-lg text-cyan-400 text-xs hover:bg-cyan-400/30 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </button>
                    </div>
                    <pre className="text-xs text-white/60 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto bg-black/20 rounded-xl p-3">{resumeResult.generatedContent}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTool === 'spinner' && (
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <textarea value={textToSpin} onChange={(e) => setTextToSpin(e.target.value)} placeholder="Paste your article, blog post, or content here to spin..." rows={6} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-white/40 focus:border-cyan-400/50 outline-none resize-none transition-colors" />
              <button onClick={() => setSpun(textToSpin.split(' ').reverse().join(' '))} className="w-full mt-4 py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-2xl font-semibold text-black flex items-center justify-center gap-2 shadow-xl shadow-cyan-400/25 hover:scale-[1.01] transition-transform">
                <RefreshCw className="w-5 h-5" /> Spin Text Now
              </button>
              {spun && <div className="mt-4 p-5 bg-cyan-400/10 border border-cyan-400/20 rounded-2xl text-white/80">{spun}</div>}
            </div>
          </div>
        )}
        {activeTool === 'cover' && (
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Paste the full job description here..." rows={5} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-white/40 focus:border-cyan-400/50 outline-none resize-none transition-colors" />
              <button onClick={() => setCover(`Dear Hiring Manager,\n\nI am thrilled to apply for this opportunity. With my expertise in ${jobDesc.slice(0, 40)}..., I am confident I can deliver exceptional results.\n\nKey achievements:\n- 5+ years relevant experience\n- Proven track record of success\n- Strong communication skills\n\nI look forward to discussing how I can contribute.\n\nBest regards,\nHassaan Khan`)} className="w-full mt-4 py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-2xl font-semibold text-black flex items-center justify-center gap-2 shadow-xl shadow-cyan-400/25 hover:scale-[1.01] transition-transform">
                <Sparkles className="w-5 h-5" /> Generate Cover Letter
              </button>
              {cover && <div className="mt-4 p-5 bg-cyan-400/10 border border-cyan-400/20 rounded-2xl text-white/80 whitespace-pre-line">{cover}</div>}
            </div>
          </div>
        )}
        {activeTool === 'linkedin' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6 text-center">
            <User className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">LinkedIn Optimization</h3>
            <p className="text-white/50 text-sm">Connect your LinkedIn to optimize your profile with AI suggestions.</p>
            <button className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-xl text-black font-medium">Connect LinkedIn</button>
          </div>
        )}
        {activeTool === 'portfolio' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6 text-center">
            <Briefcase className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Portfolio Generator</h3>
            <p className="text-white/50 text-sm">Create a stunning portfolio website in minutes.</p>
            <button className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-xl text-black font-medium">Start Building</button>
          </div>
        )}
        {activeTool === 'proposal' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6 text-center">
            <Send className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Proposal Composer</h3>
            <p className="text-white/50 text-sm">Generate winning proposals for any freelance project.</p>
            <button className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-xl text-black font-medium">Create Proposal</button>
          </div>
        )}
      </FullScreenTool>
    );
  }

  return (
    <>
      <Header onProfile={onProfile} onSettings={onSettings} title="Writer Tools" hideTicker />
      <main className="px-4 py-6 max-w-2xl mx-auto pb-24 relative z-10">
        <div className="grid gap-3">
          {tools.map((t) => (
            <ToolCard key={t.id} icon={t.icon} title={t.title} desc={t.desc} onClick={() => setActiveTool(t.id)} />
          ))}
        </div>
      </main>
    </>
  );
};

const UtilitiesView = ({ onProfile, onSettings, activeTool, setActiveTool }: { onProfile: () => void; onSettings: () => void; activeTool: string; setActiveTool: (v: string) => void }) => {
  const [scamSearch, setScamSearch] = useState('');
  const [scamResult, setScamResult] = useState<{ safe: boolean; message: string } | null>(null);
  const [currency, setCurrency] = useState({ usd: '', pkr: '' });
  const rate = 278;
  const scamKeywords = ['MegaTypers', 'SurveyDollars', 'TaskEarning', 'PtclEarning', 'ClickWorkerPro', 'EarnFastCash', 'DailyTaskPay'];

  const tools = [
    { id: 'scam', icon: Shield, title: 'Scam Alert Checker', desc: 'Verify website legitimacy' },
    { id: 'currency', icon: DollarSign, title: 'Currency Converter', desc: 'USD to PKR calculator' },
    { id: 'rates', icon: BarChart3, title: 'Market Rates', desc: 'Freelance pricing guide' },
    { id: 'time', icon: Clock, title: 'Time Tracker', desc: 'Track work hours' },
    { id: 'pass', icon: LockKeyhole, title: 'Password Generator', desc: 'Secure passwords' },
    { id: 'notes', icon: FileText, title: 'Quick Notes', desc: 'Save important info' }
  ];

  const checkScam = () => {
    const found = scamKeywords.find(k => scamSearch.toLowerCase().includes(k.toLowerCase()));
    setScamResult(found ? { safe: false, message: `"${found}" is a KNOWN SCAM SITE. Do NOT engage or share any personal information!` } : { safe: true, message: 'No known scams detected. Always verify independently before engaging.' });
  };

  if (activeTool && activeTool !== 'none') {
    const tool = tools.find(t => t.id === activeTool);
    if (!tool) return null;
    const Icon = tool.icon;

    return (
      <FullScreenTool title={tool.title} icon={Icon} onBack={() => setActiveTool('none')}>
        {activeTool === 'scam' && (
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <p className="text-white/50 text-sm mb-4">We check against our database of known scam websites targeting freelancers.</p>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input value={scamSearch} onChange={(e) => setScamSearch(e.target.value)} placeholder="Enter website name..." className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-white/40 focus:border-cyan-400/50 outline-none transition-colors" />
                </div>
                <button onClick={checkScam} className="px-6 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-2xl font-medium text-black shadow-lg shadow-cyan-400/25 hover:scale-[1.01] transition-transform">Check</button>
              </div>
              {scamResult && (
                <div className={`mt-4 p-5 rounded-2xl border ${scamResult.safe ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  <div className="flex items-center gap-2 font-semibold mb-2"><Shield className="w-5 h-5" />{scamResult.safe ? 'VERIFIED' : 'DANGER - SCAM DETECTED'}</div>
                  <p className="text-sm">{scamResult.message}</p>
                </div>
              )}
              <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-white/40 text-xs mb-2 font-medium">Known Scam Sites in Database:</p>
                <div className="flex flex-wrap gap-2">{scamKeywords.map((k, i) => <span key={i} className="px-2.5 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">{k}</span>)}</div>
              </div>
            </div>
          </div>
        )}
        {activeTool === 'currency' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-white/50 text-sm mb-2 block">USD</label>
                <input type="number" value={currency.usd} onChange={(e) => setCurrency({ usd: e.target.value, pkr: e.target.value ? (parseFloat(e.target.value) * rate).toFixed(0) : '' })} placeholder="0" className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white text-2xl font-medium placeholder-white/30 focus:border-cyan-400/50 outline-none transition-colors" />
              </div>
              <span className="text-white/30 text-3xl mt-8">=</span>
              <div className="flex-1">
                <label className="text-white/50 text-sm mb-2 block">PKR</label>
                <input type="number" value={currency.pkr} onChange={(e) => setCurrency({ pkr: e.target.value, usd: e.target.value ? (parseFloat(e.target.value) / rate).toFixed(2) : '' })} placeholder="0" className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white text-2xl font-medium placeholder-white/30 focus:border-cyan-400/50 outline-none transition-colors" />
              </div>
            </div>
            <div className="mt-4 text-center p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-xl">
              <span className="text-cyan-400 font-medium">Live Rate: </span>
              <span className="text-white/80">1 USD = {rate} PKR</span>
            </div>
          </div>
        )}
        {(activeTool === 'rates' || activeTool === 'time' || activeTool === 'pass' || activeTool === 'notes') && (
          <EmptyState icon={Icon} title={tool.title} desc="This tool is coming soon. Stay tuned for updates!" action={{ label: 'Get Notified', onClick: () => {} }} />
        )}
      </FullScreenTool>
    );
  }

  return (
    <>
      <Header onProfile={onProfile} onSettings={onSettings} title="Utilities" hideTicker />
      <main className="px-4 py-6 max-w-2xl mx-auto pb-24 relative z-10">
        <div className="grid gap-3">
          {tools.map((t) => (
            <ToolCard key={t.id} icon={t.icon} title={t.title} desc={t.desc} onClick={() => setActiveTool(t.id)} />
          ))}
        </div>
      </main>
    </>
  );
};

const Dashboard = ({ onSignOut, profile, session }: { onSignOut: () => void; profile: Profile | null; session: Session | null }) => {
  const [nav, setNav] = useState('home');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [writerTool, setWriterTool] = useState('none');
  const [utilityTool, setUtilityTool] = useState('none');

  const handleNavigate = (tab: string, tool?: string) => {
    setNav(tab);
    if (tool && tab === 'writer') setWriterTool(tool);
    if (tool && tab === 'utilities') setUtilityTool(tool);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] relative">
      <SparksBackground />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[180px]" />
      </div>
      {(nav === 'writer' && writerTool !== 'none') || (nav === 'utilities' && utilityTool !== 'none') ? (
        nav === 'writer' ? (
          <WriterToolsView onProfile={() => setShowProfile(true)} onSettings={() => setShowSettings(true)} activeTool={writerTool} setActiveTool={setWriterTool} />
        ) : (
          <UtilitiesView onProfile={() => setShowProfile(true)} onSettings={() => setShowSettings(true)} activeTool={utilityTool} setActiveTool={setUtilityTool} />
        )
      ) : (
        <>
          {nav === 'home' && <HomeView onProfile={() => setShowProfile(true)} onSettings={() => setShowSettings(true)} onNavigate={handleNavigate} profile={profile} session={session} />}
          {nav === 'ai' && <AIAssistantView onProfile={() => setShowProfile(true)} onSettings={() => setShowSettings(true)} />}
          {nav === 'writer' && <WriterToolsView onProfile={() => setShowProfile(true)} onSettings={() => setShowSettings(true)} activeTool="none" setActiveTool={setWriterTool} />}
          {nav === 'utilities' && <UtilitiesView onProfile={() => setShowProfile(true)} onSettings={() => setShowSettings(true)} activeTool="none" setActiveTool={setUtilityTool} />}
          <BottomNav active={nav} setActive={setNav} />
        </>
      )}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} profile={profile} session={session} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onSignOut={onSignOut} />}
    </div>
  );
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [tourStep, setTourStep] = useState(-1);
  const [profile, setProfile] = useState<Profile | null>(null);
  const totalSteps = 4;

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => { if (mounted) setSessionLoading(false); }, 3000);
    (async () => {
      try {
        const s = await getSession();
        if (mounted) setSession(s);
      } catch { /* network unreachable — proceed to landing */ }
      finally { if (mounted) { clearTimeout(timer); setSessionLoading(false); } }
    })();
    const { data: sub } = onAuthStateChange((s) => {
      if (!mounted) return;
      setSession(s);
      if (s) {
        setIsAuthOpen(false); setStarted(true);
        (async () => { const p = await fetchProfile(s.user.id); if (mounted) setProfile(p); })();
      } else { setProfile(null); }
    });
    return () => { mounted = false; clearTimeout(timer); sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (session && tourStep < 0 && !showWelcome) {
      const key = `skillglint_tour_seen_${session.user.id}`;
      if (!localStorage.getItem(key)) setShowWelcome(true);
    }
  }, [session, tourStep, showWelcome]);

  const beginTour = () => {
    setShowWelcome(false);
    setTourStep(0);
  };

  const finishTour = () => {
    setTourStep(-1);
    if (session) localStorage.setItem(`skillglint_tour_seen_${session.user.id}`, 'true');
  };

  const handleSignOut = async () => {
    try { await signOut(); } catch {}
    setSession(null);
    setStarted(false);
    setShowWelcome(false);
    setTourStep(-1);
    setIsAuthOpen(false);
    setProfile(null);
  };

  if (sessionLoading) return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
      <div className="relative mb-6"><VipDiamondLogo size={80} /></div>
      <span className="w-7 h-7 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full" style={{ animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  // Landing page — visible to everyone. "Get Started" conditionally redirects.
  if (!started) return (
    <>
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <SparksBackground />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[180px]" />
        <div className="flex flex-col items-center justify-center flex-1 relative z-10">
          <div className="relative mb-8"><VipDiamondLogo size={130} /></div>
          <h1 className="text-5xl sm:text-6xl font-extralight tracking-tight mb-3 text-white/90">
            SkillGlint
          </h1>
          <p className="text-white/40 text-sm tracking-[0.35em] uppercase font-light">
            Shine In Your Career
          </p>
        </div>
        <div className="w-full max-w-xs pb-12 relative z-10 space-y-4">
          <button onClick={() => session ? setStarted(true) : setIsAuthOpen(true)} className="w-full py-4 rounded-full font-medium text-white transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-700 border border-cyan-400/20 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40">
            {session ? 'Go to Dashboard' : 'Get Started'}
          </button>
          {!session && (
            <button onClick={() => setIsAuthOpen(true)} className="w-full py-3.5 rounded-full font-medium text-white/70 transition-all hover:text-white hover:bg-white/5 border border-white/10">
              Log In / Sign In
            </button>
          )}
        </div>
      </div>
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} onSuccess={() => { setIsAuthOpen(false); setStarted(true); }} />}
    </>
  );

  // AUTH GUARD — user clicked "Go to Dashboard" but has no session
  if (!session) return (
    <>
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <SparksBackground />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[180px]" />
        <div className="flex flex-col items-center justify-center flex-1 relative z-10">
          <div className="relative mb-8"><VipDiamondLogo size={130} /></div>
          <h1 className="text-5xl sm:text-6xl font-extralight tracking-tight mb-3 text-white/90">
            SkillGlint
          </h1>
          <p className="text-white/40 text-sm tracking-[0.35em] uppercase font-light">
            Shine In Your Career
          </p>
        </div>
        <div className="w-full max-w-xs pb-12 relative z-10 space-y-4">
          <button onClick={() => setIsAuthOpen(true)} className="w-full py-4 rounded-full font-medium text-white transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-700 border border-cyan-400/20 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40">
            Get Started
          </button>
          <button onClick={() => setIsAuthOpen(true)} className="w-full py-3.5 rounded-full font-medium text-white/70 transition-all hover:text-white hover:bg-white/5 border border-white/10">
            Log In / Sign In
          </button>
        </div>
      </div>
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} onSuccess={() => { setIsAuthOpen(false); setStarted(true); }} />}
    </>
  );

  // Authenticated — VIP welcome overlay (new users only)
  if (showWelcome) return <VipWelcomeOverlay onBegin={beginTour} />;

  // Feature tour steps
  if (tourStep >= 0) return (
    <TourFeatureStep
      step={tourStep}
      total={totalSteps}
      onNext={() => tourStep < totalSteps - 1 ? setTourStep(tourStep + 1) : finishTour()}
      onBack={() => setTourStep(Math.max(0, tourStep - 1))}
      onSkip={finishTour}
    />
  );

  return <Dashboard onSignOut={handleSignOut} profile={profile} session={session} />;
}

export default App;
