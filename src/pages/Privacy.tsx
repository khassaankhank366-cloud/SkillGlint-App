import { ArrowLeft } from 'lucide-react';
import { SparksBackground } from '../components/SparksBackground';

export default function Privacy({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#0B0F19] relative">
      <SparksBackground />
      <header className="sticky top-0 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/5 z-20">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-cyan-400/20 transition-all">
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
          </button>
          <h1 className="text-white font-medium text-lg">Privacy Policy</h1>
        </div>
      </header>
      <main className="px-4 py-6 max-w-2xl mx-auto pb-24 relative z-10 space-y-6">
        <section className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-medium text-lg mb-3">1. Data We Collect</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            SkillGlint collects the following data to provide our services: your email address (for authentication),
            profile information (name, profession), learning progress, tool-generated content (resumes, cover letters),
            scam reports, and support tickets. We do not collect payment information.
          </p>
        </section>
        <section className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-medium text-lg mb-3">2. How We Use Your Data</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Your data is used solely to provide and improve SkillGlint features. We use your profile to personalize
            your dashboard, your learning progress to track course completion, and your tool data to save generated
            content. We never sell your data to third parties.
          </p>
        </section>
        <section className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-medium text-lg mb-3">3. Data Security</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            All data is stored securely in Supabase with Row Level Security (RLS) enabled. Each user can only access
            their own data. Passwords are hashed by Supabase Auth. Optional PIN codes add an additional layer of
            security at app launch. All API keys are stored as server-side secrets and never exposed to the client.
          </p>
        </section>
        <section className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-medium text-lg mb-3">4. Your Rights</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            You have the right to access, export, and delete your data at any time. Use the "Export My Data" feature
            in Settings to download all your information as a JSON file. To delete your account and all associated
            data, contact support through the Help & Support form.
          </p>
        </section>
        <section className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-medium text-lg mb-3">5. Third-Party Services</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            SkillGlint integrates with Google and LinkedIn for OAuth authentication, Groq for AI chat responses,
            SerpAPI and Jooble for job listings, and Pexels for stock images. These services have their own privacy
            policies that govern how they handle your data.
          </p>
        </section>
        <p className="text-white/30 text-xs text-center">Last updated: July 2026</p>
      </main>
    </div>
  );
}
