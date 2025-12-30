
import React from 'react';
import { Home, Trophy, Info, Settings, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalXP: number;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, totalXP, isDarkMode, toggleDarkMode }) => {
  return (
    <div className="min-h-screen bg-orange-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-orange-100 dark:border-slate-800 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <span className="font-brand text-2xl font-bold">T</span>
          </div>
          <h1 className="font-brand text-xl font-bold text-orange-900 dark:text-orange-400">Tai Clubhouse</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-orange-100 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/40 px-3 py-1.5 rounded-full text-orange-700 dark:text-orange-400 font-bold text-sm transition-all shadow-sm">
            <Trophy className="w-4 h-4 text-orange-500" />
            <span>{totalXP.toLocaleString()} XP</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl pb-24">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-orange-100 dark:border-slate-800 px-4 py-3 flex justify-between gap-2 items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:max-w-3xl md:mx-auto md:mb-4 md:rounded-2xl z-50">
        <NavItem 
          icon={<Home />} 
          label="Home" 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
        />
        <NavItem 
          icon={<Trophy />} 
          label="Stats" 
          active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')} 
        />
        <NavItem 
          icon={<Settings />} 
          label="Admin" 
          active={activeTab === 'dev'} 
          onClick={() => setActiveTab('dev')} 
        />
        <NavItem 
          icon={<Info />} 
          label="About" 
          active={activeTab === 'about'} 
          onClick={() => setActiveTab('about')} 
        />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-1 flex-col items-center gap-1 transition-all ${active ? 'text-orange-600 dark:text-orange-400 scale-110' : 'text-slate-400 dark:text-slate-600 hover:text-orange-400 dark:hover:text-slate-400'}`}
  >
    {React.cloneElement(icon as React.ReactElement, { size: 22, strokeWidth: active ? 2.5 : 2 })}
    <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
  </button>
);

export default Layout;
