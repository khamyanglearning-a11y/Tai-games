
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import GameCard from './components/GameCard';
import QuizGame from './components/QuizGame';
import DeveloperDashboard from './components/DeveloperDashboard';
import { GameType, Difficulty } from './types';
import { getStats, addXP, spendXP, UserStats } from './services/statsService';
import { 
  BookOpen, Languages, Image as ImageIcon, Sparkles, 
  Trophy, Star, Layers, Lock, Unlock, Zap, ShieldCheck, 
  Smartphone, Fingerprint 
} from 'lucide-react';

const DAILY_GOAL = 500;
const UNLOCK_COSTS: Record<string, number> = {
  'Intermediate': 3000,
  'Advanced': 7000
};

const DEV_AUTH_NUMBER = "6901543900";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Beginner');
  const [stats, setStats] = useState<UserStats>(getStats());
  const [showUnlockModal, setShowUnlockModal] = useState<Difficulty | null>(null);
  
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Developer Authentication State
  const [isDevAuthenticated, setIsDevAuthenticated] = useState(() => {
    return localStorage.getItem('is_dev_authed') === 'true';
  });
  const [devLoginInput, setDevLoginInput] = useState('');
  const [devLoginError, setDevLoginError] = useState(false);
  const [isBioEnrolled, setIsBioEnrolled] = useState(() => localStorage.getItem('dev_bio_enrolled') === 'true');

  useEffect(() => {
    setStats(getStats());
  }, []);

  useEffect(() => {
    localStorage.setItem('is_dev_authed', isDevAuthenticated.toString());
  }, [isDevAuthenticated]);

  // Apply Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleGameFinish = (earnedXP: number) => {
    const updatedStats = addXP(earnedXP);
    setStats(updatedStats);
  };

  const handleUnlockLevel = (level: Difficulty) => {
    const cost = UNLOCK_COSTS[level];
    if (stats.totalXP >= cost) {
      const updated = spendXP(cost, level);
      setStats(updated);
      setDifficulty(level);
      setShowUnlockModal(null);
    }
  };

  const handleDevLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (devLoginInput === DEV_AUTH_NUMBER) {
      setIsDevAuthenticated(true);
      setDevLoginError(false);
      setDevLoginInput('');
    } else {
      setDevLoginError(true);
      setDevLoginInput('');
    }
  };

  const handleBioLogin = async () => {
    try {
      if (!window.PublicKeyCredential) {
        alert("Biometrics not supported in this browser.");
        return;
      }
      
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "required"
        }
      });

      if (credential) {
        setIsDevAuthenticated(true);
        setDevLoginError(false);
      }
    } catch (err) {
      console.error("Biometric login failed", err);
    }
  };

  const handleLogout = () => {
    setIsDevAuthenticated(false);
    setActiveTab('home');
  };

  const dailyProgress = Math.min((stats.dailyXP / DAILY_GOAL) * 100, 100);

  const renderDifficultyButton = (level: Difficulty) => {
    const isUnlocked = stats.unlockedLevels.includes(level);
    const cost = UNLOCK_COSTS[level];
    const canAfford = stats.totalXP >= cost;

    if (!isUnlocked) {
      return (
        <button
          key={level}
          onClick={() => canAfford ? setShowUnlockModal(level) : null}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 
            ${canAfford 
              ? 'bg-slate-100 dark:bg-slate-800 text-orange-500 hover:bg-orange-100 dark:hover:bg-slate-700' 
              : 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700 cursor-not-allowed'}
          `}
        >
          {canAfford ? <Unlock size={14} /> : <Lock size={14} />}
          {canAfford ? 'Unlock?' : '???'}
        </button>
      );
    }

    return (
      <button
        key={level}
        onClick={() => setDifficulty(level)}
        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
          difficulty === level 
            ? 'bg-orange-500 text-white shadow-lg shadow-orange-100 dark:shadow-none scale-105' 
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        {level}
      </button>
    );
  };

  const renderDevAuth = () => (
    <div className="max-w-md mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-500 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-orange-100 dark:border-slate-800 text-center">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 text-orange-600 dark:text-orange-400 shadow-inner">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-2xl font-brand font-bold text-slate-800 dark:text-slate-100 mb-2">Developer Access</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
          Verify identity using your registered mobile number {isBioEnrolled && "or fingerprint"}.
        </p>

        <form onSubmit={handleDevLogin} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="tel"
                value={devLoginInput}
                onChange={(e) => {
                  setDevLoginInput(e.target.value);
                  setDevLoginError(false);
                }}
                placeholder="Mobile number"
                className={`w-full bg-slate-50 dark:bg-slate-800 border-2 ${devLoginError ? 'border-rose-300 dark:border-rose-900 focus:ring-rose-200' : 'border-slate-100 dark:border-slate-700 focus:ring-orange-200'} rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-4 transition-all text-lg font-bold tracking-widest text-black dark:text-white`}
                required
              />
            </div>
            {isBioEnrolled && (
              <button 
                type="button"
                onClick={handleBioLogin}
                className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-5 rounded-2xl hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-all active:scale-95 border-2 border-orange-200 dark:border-orange-800/50 shadow-sm"
                title="Login with Fingerprint"
              >
                <Fingerprint size={28} />
              </button>
            )}
          </div>
          
          {devLoginError && (
            <p className="text-rose-500 text-xs font-bold animate-in fade-in zoom-in-95">
              Access Denied. Incorrect credentials.
            </p>
          )}

          <button 
            type="submit"
            className="w-full bg-slate-800 dark:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-900 dark:hover:bg-orange-700 transition-all shadow-xl active:scale-95"
          >
            Verify Access
          </button>
        </form>

        <button 
          onClick={() => setActiveTab('home')}
          className="mt-6 text-slate-400 dark:text-slate-500 font-bold text-sm hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          Cancel and return to home
        </button>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {showUnlockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 border dark:border-slate-800">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 text-orange-600 dark:text-orange-400">
              <Sparkles size={40} />
            </div>
            <h3 className="text-2xl font-brand text-slate-800 dark:text-slate-100 mb-2 font-bold">Unlock {showUnlockModal}?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Unlock the <span className="font-bold text-slate-700 dark:text-slate-300">{showUnlockModal}</span> challenges for <span className="font-bold text-orange-600 dark:text-orange-400">{UNLOCK_COSTS[showUnlockModal].toLocaleString()} XP</span>.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleUnlockLevel(showUnlockModal)}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg active:scale-95"
              >
                Confirm Unlock
              </button>
              <button 
                onClick={() => setShowUnlockModal(null)}
                className="w-full py-4 text-slate-400 dark:text-slate-500 font-bold hover:text-slate-600 dark:hover:text-slate-300 transition-all"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-600 dark:to-orange-800 rounded-[3rem] p-10 text-white shadow-2xl dark:shadow-none shadow-orange-200">
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md mb-6 border border-white/20">
            <Star size={14} className="fill-white" />
            <span className="text-xs font-bold tracking-widest uppercase">Language Journey</span>
          </div>
          <h2 className="text-4xl font-brand font-bold mb-4 leading-tight">Master Tai through Games</h2>
          <p className="text-orange-50 opacity-90 mb-8 font-medium text-lg">Spend XP to unlock harder levels and prove your mastery.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveGame(GameType.WORD_MATCH)}
              className="bg-white dark:bg-slate-900 dark:text-orange-400 text-orange-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-50 dark:hover:bg-slate-800 transition-all shadow-xl active:scale-95"
            >
              <Sparkles size={20} className="fill-current" />
              Quick Play
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-300 opacity-20 rounded-full mr-20 mb-8" />
      </div>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 px-2 gap-4">
          <div className="flex items-center gap-2">
            <Layers className="text-orange-500" size={24} />
            <h3 className="text-2xl font-brand font-bold text-slate-800 dark:text-slate-100">Learning Path</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex shadow-sm w-full sm:w-auto overflow-hidden">
            {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map(renderDifficultyButton)}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-2xl font-brand font-bold text-slate-800 dark:text-slate-100">Available Games</h3>
        </div>
        <div className="grid gap-6">
          <GameCard 
            title="Word Match" 
            description="Bridge the gap between English and Tai script. The foundation of fluency." 
            icon={<BookOpen size={32} strokeWidth={2.5} />} 
            color="orange"
            onClick={() => setActiveGame(GameType.WORD_MATCH)}
          />
          <GameCard 
            title="Photo to Name" 
            description="AI-generated visual puzzles. Match images to their correct Tai names." 
            icon={<ImageIcon size={32} strokeWidth={2.5} />} 
            color="blue"
            onClick={() => setActiveGame(GameType.IMAGE_IDENTIFY)}
          />
          <GameCard 
            title="Sentence Scramble" 
            description="Learn grammar by assembling Tai phrases. Essential for conversation." 
            icon={<Languages size={32} strokeWidth={2.5} />} 
            color="emerald"
            onClick={() => setActiveGame(GameType.SENTENCE_SCRAMBLE)}
          />
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-lg relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400">
               <Trophy size={24} />
            </div>
            <div>
              <h3 className="text-xl font-brand font-bold text-slate-800 dark:text-slate-100">Daily Progress</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Keep playing to hit your {DAILY_GOAL} XP goal!</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Exp Earned Today</span>
            <span className="text-lg font-brand font-bold text-orange-600 dark:text-orange-400">{stats.dailyXP} / {DAILY_GOAL} XP</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-1 shadow-inner">
            <div 
              className="bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700 h-full rounded-full transition-all duration-1000 ease-out shadow-sm" 
              style={{ width: `${dailyProgress}%` }} 
            />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/10 -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform duration-500" />
      </section>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800 text-center">
        <div className="w-28 h-28 bg-orange-100 dark:bg-orange-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-orange-500 dark:text-orange-400 shadow-lg rotate-3">
          <Trophy size={56} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-brand font-bold text-slate-800 dark:text-slate-100 mb-6">Mastery Dashboard</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-orange-50 dark:bg-slate-800 p-6 rounded-[2rem] border border-orange-100 dark:border-slate-700 transition-all hover:shadow-md">
            <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2">Total XP</p>
            <p className="text-4xl font-brand font-bold text-slate-800 dark:text-slate-100 tracking-tight">{stats.totalXP.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 dark:bg-slate-800 p-6 rounded-[2rem] border border-blue-100 dark:border-slate-700 transition-all hover:shadow-md">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Unlocked Levels</p>
            <p className="text-4xl font-brand font-bold text-slate-800 dark:text-slate-100 tracking-tight">{stats.unlockedLevels.length}</p>
          </div>
        </div>

        <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl text-left border border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Milestones</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">Intermediate Access</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stats.unlockedLevels.includes('Intermediate') ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>
                {stats.unlockedLevels.includes('Intermediate') ? 'Unlocked' : '3,000 XP'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">Advanced Access</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stats.unlockedLevels.includes('Advanced') ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>
                {stats.unlockedLevels.includes('Advanced') ? 'Unlocked' : '7,000 XP'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      totalXP={stats.totalXP} 
      isDarkMode={isDarkMode} 
      toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
    >
      {activeGame ? (
        <div className="animate-in fade-in duration-500">
          <button 
            onClick={() => setActiveGame(null)}
            className="mb-8 flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 font-bold transition-all"
          >
            <Zap size={20} />
            Back to Home
          </button>
          <QuizGame 
            type={activeGame} 
            difficulty={difficulty}
            onClose={() => setActiveGame(null)}
            onFinish={handleGameFinish}
          />
        </div>
      ) : activeTab === 'stats' ? (
        renderStats()
      ) : activeTab === 'dev' ? (
        isDevAuthenticated ? (
          <DeveloperDashboard stats={stats} onLogout={handleLogout} />
        ) : (
          renderDevAuth()
        )
      ) : activeTab === 'about' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800 animate-in fade-in duration-500">
          <h2 className="text-3xl font-brand font-bold text-slate-800 dark:text-slate-100 mb-6">About Tai Clubhouse</h2>
          <div className="prose prose-orange max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed space-y-4">
            <p>Tai Clubhouse is a community-driven initiative to preserve and promote the Tai language through interactive play and AI-powered learning.</p>
            <p>Our platform uses advanced Gemini AI to create contextual learning materials, including visual challenges and spoken pronunciations.</p>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl border border-orange-100 dark:border-orange-800 flex items-start gap-4 mt-8">
               <ShieldCheck className="text-orange-500 shrink-0" />
               <p className="text-sm font-bold text-orange-800 dark:text-orange-300">Developed with love for the Tai community. Preserving heritage, one word at a time.</p>
            </div>
          </div>
        </div>
      ) : (
        renderHome()
      )}
    </Layout>
  );
};

export default App;
