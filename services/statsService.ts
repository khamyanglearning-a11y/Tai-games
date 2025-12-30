
import { Difficulty } from "../types";

export interface UserStats {
  totalXP: number;
  dailyXP: number;
  lastUpdated: string; // ISO date
  unlockedLevels: Difficulty[];
}

const STORAGE_KEY = 'tai_clubhouse_stats';

export const getStats = (): UserStats => {
  const saved = localStorage.getItem(STORAGE_KEY);
  const today = new Date().toDateString();
  
  if (!saved) {
    return { 
      totalXP: 0, 
      dailyXP: 0, 
      lastUpdated: today,
      unlockedLevels: ['Beginner'] 
    };
  }

  const stats: UserStats = JSON.parse(saved);
  
  // Ensure unlockedLevels exists for backward compatibility
  if (!stats.unlockedLevels) {
    stats.unlockedLevels = ['Beginner'];
  }

  // Reset daily XP if it's a new day
  if (stats.lastUpdated !== today) {
    return { ...stats, dailyXP: 0, lastUpdated: today };
  }

  return stats;
};

export const addXP = (amount: number): UserStats => {
  const stats = getStats();
  const updated = {
    ...stats,
    totalXP: stats.totalXP + amount,
    dailyXP: stats.dailyXP + amount,
    lastUpdated: new Date().toDateString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const spendXP = (amount: number, newLevel: Difficulty): UserStats => {
  const stats = getStats();
  if (stats.totalXP < amount) return stats;

  const updated = {
    ...stats,
    totalXP: stats.totalXP - amount,
    unlockedLevels: [...new Set([...stats.unlockedLevels, newLevel])]
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
