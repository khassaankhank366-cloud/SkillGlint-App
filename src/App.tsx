import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient';
import { signIn, signUp, signInWithGoogle, signInWithLinkedIn, signOut, getSession, onAuthStateChange, isValidEmail, getDisplayName, getInitial } from './lib/auth';
import { fetchProfile, type Profile } from './lib/profile';
import { saveAndGenerateResume, downloadResumeAsPDF } from './lib/resume';
import { fetchLiveJobs, fetchCourses, fetchLessons, fetchUserProgress, markLessonComplete, getCourseProgressPercent, submitScamReport, submitSupportTicket, fetchSupportTickets, setPinCode, disablePin, verifyPin, isPinEnabled, exportUserData, type Job } from './services/api';
import type { Session } from '@supabase/supabase-js';
import { Home, Bot, PenTool, Wrench, Settings, Shield, Search, Send, ChevronRight, Star, Gift, Flame, Trophy, FileText, RefreshCw, FileEdit, DollarSign, Download, Sparkles, Target, TrendingUp, X, Briefcase, ArrowLeft, Plus, Mic, Palette, LayoutTemplate, User, BookOpen, Clock, Brain, BarChart3, LockKeyhole, HelpCircle, SkipForward, Mail, Link2, Image, FileUp, Cloud, Lightbulb, Compass, Loader2, Check, Award, Play, Lock, ShieldCheck, KeyRound, FileJson } from 'lucide-react';