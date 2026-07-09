import { useState, useEffect, useRef } from 'react';
import { Home, Bot, PenTool, Wrench, Settings, Shield, Search, Send, ChevronRight, Star, Gift, Flame, Trophy, FileText, RefreshCw, FileEdit, DollarSign, Download, Sparkles, Lock, Delete, Target, TrendingUp, X, Briefcase, ArrowLeft, Plus, Mic, Palette, LayoutTemplate, User, BookOpen, Zap, Award, Clock, Users, Globe, Code, CreditCard, FileCheck, Brain, MessageSquare, BarChart3, LockKeyhole, HelpCircle, SkipForward, Mail } from 'lucide-react';

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
const AuthModal = ({ onClose }: { onClose: () => void }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'email'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-semibold text-xl">{mode === 'signup' ? 'Create Account' : 'Log In'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {mode === 'email' ? (
          <div className="space-y-4">
            <label className="block text-white/50 text-sm mb-1.5">Email or Phone Number</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email or phone number" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:border-cyan-500/50 outline-none" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:border-cyan-500/50 outline-none" />
            <button className="w-full py-3.5 rounded-2xl font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 border border-cyan-400/20 hover:scale-[1.01] transition-transform shadow-lg shadow-cyan-500/20">
              Log In
            </button>
            <button onClick={() => setMode('login')} className="w-full text-center text-white/50 text-sm hover:text-white/70">Back</button>
          </div>
        ) : (
          <>
            <button className="w-full py-3.5 rounded-2xl font-medium text-white transition-all hover:scale-[1.01] bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center gap-3 mb-4 border border-cyan-400/20 shadow-lg shadow-cyan-500/20">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <button className="w-full py-3.5 rounded-2xl font-medium text-white transition-all hover:scale-[1.01] bg-[#0A66C2] border border-[#0A66C2]/40 flex items-center justify-center gap-3 mb-4 shadow-lg shadow-[#0A66C2]/20">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z"/></svg>
              Continue with LinkedIn
            </button>

            <button onClick={() => setMode('email')} className="w-full py-3.5 rounded-2xl font-medium text-white transition-all hover:scale-[1.01] bg-white/10 border border-white/10 flex items-center justify-center gap-3 mb-4">
              <Mail className="w-5 h-5" />
              Continue with Email or Phone Number
            </button>

            <div className="text-center mt-6 pt-4 border-t border-white/10">
              <p className="text-white/40 text-sm mb-3">Don't have an account?</p>
              <button onClick={() => setMode('signup')} className="w-full py-3.5 rounded-2xl font-semibold text-cyan-400 bg-cyan-400/10 border-2 border-cyan-400/30 hover:bg-cyan-400/20 transition-colors">
                Create New Account
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Header = ({ onProfile, onSettings, title, subtitle, hideTicker }: { onProfile: () => void; onSettings: () => void; title?: string; subtitle?: string; hideTicker?: boolean }) => {
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
              <span className="text-black font-bold text-sm">HK</span>
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

// Interactive Tour System
const TourStep = ({ step, total, onNext, onSkip }: { step: number; total: number; onNext: () => void; onSkip: () => void }) => {
  const steps = [
    { title: 'Welcome to SkillGlint', desc: 'Your all-in-one platform for learning, earning, and building a successful freelance career.',  },
    { title: 'AI Assistant', desc: 'Chat with our intelligent AI to get personalized career guidance, job recommendations, and skill roadmaps.', icon: Bot },
    { title: 'Writer Tools', desc: 'Build professional resumes, generate cover letters, and spin articles with our premium AI tools.', icon: PenTool },
    { title: 'Utilities', desc: 'Check for scams, convert currencies, and access productivity tools to boost your workflow.', icon: Wrench },
    { title: 'Ready to Shine!', desc: 'You\'re all set! Explore the platform and start your journey to success.', icon: Trophy }
  ];
  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center px-6">
      <div className="absolute top-4 right-4">
        <button onClick={onSkip} className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all text-sm">
          <SkipForward className="w-4 h-4" /> Skip Tour
        </button>
      </div>
      <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400/30 to-blue-600/30 flex items-center justify-center mb-6 shadow-xl shadow-cyan-400/20">
          <Icon className="w-10 h-10 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">{current.title}</h2>
        <p className="text-white/60 mb-6 leading-relaxed">{current.desc}</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-cyan-400' : 'w-1.5 bg-white/20'}`} />
          ))}
        </div>
        <div className="flex gap-3">
          {step < total - 1 && (
            <button onClick={onSkip} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:bg-white/10 transition-colors text-sm">
              Skip
            </button>
          )}
          <button onClick={onNext} className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-xl text-black font-medium hover:opacity-90 transition-opacity shadow-lg shadow-cyan-400/25">
            {step === total - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center px-4" onClick={onClose}>
    <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/5 rounded-3xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white font-semibold text-xl">Profile</h2>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center ring-4 ring-cyan-400/20 shadow-xl shadow-cyan-400/20">
          <span className="text-black font-bold text-3xl">HK</span>
        </div>
        <h3 className="text-white font-semibold text-xl mt-4">Hassaan Khan</h3>
        <p className="text-white/40 text-sm">hassaan.khan@email.com</p>
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

const LockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const [pin, setPin] = useState('');
  const handlePin = (d: string) => {
    if (pin.length < 4) {
      const newPin = pin + d;
      setPin(newPin);
      if (newPin.length === 4) setTimeout(() => { if (newPin === '1234') onUnlock(); else setPin(''); }, 200);
    }
  };
  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <SparksBackground />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />
      <div className="relative z-10 flex flex-col items-center">
        <Lock className="w-8 h-8 text-cyan-400 mb-3" />
        <DiamondLogo small />
        <h2 className="text-white font-medium mt-5 mb-4">Enter PIN</h2>
        <div className="flex gap-3 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${pin[i] ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50 scale-110' : 'bg-white/20'}`} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((b, i) => b ? (
            <button key={i} onClick={() => b === 'del' ? setPin(p => p.slice(0, -1)) : handlePin(b)} className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium transition-all duration-200 ${b === 'del' ? 'text-white/60 hover:bg-white/5' : 'text-white bg-white/5 hover:bg-cyan-400/20 active:scale-90'}`}>
              {b === 'del' ? <Delete className="w-5 h-5" /> : b}
            </button>
          ) : <div key={i} />)}
        </div>
        <p className="text-white/30 text-xs mt-6">Default: 1234</p>
      </div>
    </div>
  );
};

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

const ToolCard = ({ icon: Icon, title, desc, onClick }: { icon: React.ElementType; title: string; desc: string; onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-cyan-400/30 hover:scale-[1.01] transition-all duration-300 text-left w-full group">
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
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

const HomeView = ({ onProfile, onSettings, onNavigate }: { onProfile: () => void; onSettings: () => void; onNavigate: (tab: string, tool?: string) => void }) => {
  const [streak] = useState(7);
  const [checkedIn, setCheckedIn] = useState(false);
  const jobs = [
    { title: 'Content Writer', company: 'TechFlow', pay: '$25/hr', rating: 4.9 },
    { title: 'Data Entry', company: 'DataPro', pay: '$18/hr', rating: 4.7 },
    { title: 'Virtual Assistant', company: 'RemoteFirst', pay: '$22/hr', rating: 4.8 },
    { title: 'AI Trainer', company: 'NeuralAI', pay: '$35/hr', rating: 5.0 },
    { title: 'Copy Editor', company: 'WriteHub', pay: '$28/hr', rating: 4.6 },
    { title: 'Transcription', company: 'AudioPro', pay: '$15/hr', rating: 4.5 }
  ];
  const courses = [
    { title: 'Copy-Paste Mastery', lessons: 24, progress: 75, icon: FileText },
    { title: 'Canva Design Pro', lessons: 32, progress: 40, icon: Palette },
    { title: 'AI Tools Bootcamp', lessons: 18, progress: 0, icon: Brain },
    { title: 'Freelance Success', lessons: 15, progress: 20, icon: Trophy },
    { title: 'Data Entry Pro', lessons: 20, progress: 60, icon: Database },
    { title: 'Content Writing', lessons: 28, progress: 35, icon: BookOpen }
  ];

  return (
    <>
      <Header onProfile={onProfile} onSettings={onSettings} title="Hassaan Khan" subtitle="Welcome back" />
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
            <button onClick={() => setCheckedIn(true)} disabled={checkedIn} className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${checkedIn ? 'bg-white/10 text-white/40' : 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-black shadow-lg shadow-cyan-400/25'}`}>
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
            {jobs.map((j, i) => (
              <div key={i} className="bg-black/30 backdrop-blur rounded-2xl p-4 border border-white/5 hover:border-cyan-400/30 hover:scale-[1.01] transition-all duration-300 cursor-pointer">
                <p className="text-white text-sm font-medium">{j.title}</p>
                <p className="text-white/40 text-xs mt-0.5">{j.company}</p>
                <div className="flex justify-between mt-3"><span className="text-cyan-400 font-semibold text-sm">{j.pay}</span><span className="text-white/40 text-xs flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{j.rating}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center"><BookOpen className="w-5 h-5 text-blue-400" /></div>
              <h3 className="text-white font-medium">Continue Learning</h3>
            </div>
            <button onClick={() => onNavigate('courses')} className="text-cyan-400 text-xs font-medium">All Courses</button>
          </div>
          <div className="space-y-3">
            {courses.slice(0, 3).map((c, i) => (
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
            ))}
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
  const chatRef = useRef<HTMLDivElement>(null);
  const tones = ['Professional', 'Creative', 'Technical'];
  const templates = ['Write a compelling job proposal', 'Optimize my LinkedIn profile', 'Generate a cold email', 'Create a project timeline', 'Analyze my skill gaps'];
  const actions = ['Data Entry Market', 'Freelance Strategy', 'Skill Roadmap', 'Fix My Resume', 'Job Search Tips', 'Salary Negotiation'];

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);
  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: 'user', content: text }]);
    setInput('');
    setTimeout(() => setMessages(m => [...m, { role: 'assistant', content: `I'll help you with "${text}". Let me analyze the best approach for ${tone.toLowerCase()} assistance.` }]), 800);
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
          <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-48 text-center">
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
                <button key={i} onClick={() => sendMessage(a)} className="px-4 py-2.5 bg-white/5 border border-white/5 rounded-full text-white/70 text-sm hover:bg-cyan-400/20 hover:border-cyan-400/30 hover:scale-[1.02] transition-all duration-300">{a}</button>
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
            <div className="relative flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-xl shadow-black/40">
              <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"><Plus className="w-5 h-5" /></button>
              <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"><Mic className="w-5 h-5" /></button>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)} placeholder="Ask about career, resumes, or skills..." className="flex-1 bg-transparent px-2 py-2.5 text-white text-sm placeholder-white/40 outline-none" />
              <button onClick={() => sendMessage(input)} className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-400/30 hover:scale-105 active:scale-95 transition-transform"><Send className="w-5 h-5 text-black" /></button>
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
                <button className="w-full py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-2xl font-semibold text-black flex items-center justify-center gap-2 shadow-xl shadow-cyan-400/25 hover:scale-[1.01] transition-transform">
                  <Download className="w-5 h-5" /> Download Professional PDF
                </button>
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
          <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-8 text-center">
            <Icon className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-white font-medium text-lg mb-2">{tool.title}</h3>
            <p className="text-white/50 text-sm">This tool is coming soon. Stay tuned for updates!</p>
            <button className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-400/20 to-cyan-500/20 border border-cyan-400/30 rounded-xl text-cyan-400 text-sm font-medium">Get Notified</button>
          </div>
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

const Dashboard = () => {
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
          {nav === 'home' && <HomeView onProfile={() => setShowProfile(true)} onSettings={() => setShowSettings(true)} onNavigate={handleNavigate} />}
          {nav === 'ai' && <AIAssistantView onProfile={() => setShowProfile(true)} onSettings={() => setShowSettings(true)} />}
          {nav === 'writer' && <WriterToolsView onProfile={() => setShowProfile(true)} onSettings={() => setShowSettings(true)} activeTool="none" setActiveTool={setWriterTool} />}
          {nav === 'utilities' && <UtilitiesView onProfile={() => setShowProfile(true)} onSettings={() => setShowSettings(true)} activeTool="none" setActiveTool={setUtilityTool} />}
          <BottomNav active={nav} setActive={setNav} />
        </>
      )}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
};

// Database icon fix
const Database = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [started, setStarted] = useState(false);
  const [tourStep, setTourStep] = useState(-1);
  const [showTour, setShowTour] = useState(true);
  const totalSteps = 5;

  useEffect(() => {
    const tourSeen = localStorage.getItem('skillglint_tour_seen');
    if (!tourSeen && started) setTourStep(0);
  }, [started]);

  const finishTour = () => {
    setTourStep(-1);
    setShowTour(false);
    localStorage.setItem('skillglint_tour_seen', 'true');
  };

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  if (!started) return (
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
        <button onClick={() => setStarted(true)} className="w-full py-4 rounded-full font-medium text-white transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-700 border border-cyan-400/20 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40">
          Get Started
        </button>
        <button onClick={() => setIsAuthOpen(true)} className="w-full py-3.5 rounded-full font-medium text-white/70 transition-all hover:text-white hover:bg-white/5 border border-white/10">
          Log In / Sign In
        </button>
      </div>
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </div>
  );

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  if (tourStep >= 0 && showTour) return <TourStep step={tourStep} total={totalSteps} onNext={() => tourStep < totalSteps - 1 ? setTourStep(tourStep + 1) : finishTour()} onSkip={finishTour} />;

  return <Dashboard />;
}

export default App;
