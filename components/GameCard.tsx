
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, icon, color, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full bg-white dark:bg-slate-900 p-5 rounded-3xl flex items-center gap-4 text-left border-2 border-transparent hover:border-${color}-200 dark:hover:border-${color}-900/50 hover:shadow-xl dark:hover:shadow-none transition-all group relative overflow-hidden shadow-sm dark:shadow-none`}
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${color === 'orange' ? 'bg-orange-500' : color === 'blue' ? 'bg-blue-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-purple-500'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-brand leading-tight">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{description}</p>
      </div>
      <ChevronRight className="w-6 h-6 text-slate-300 dark:text-slate-700 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
    </button>
  );
};

export default GameCard;
