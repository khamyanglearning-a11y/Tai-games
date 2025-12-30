
import React, { useState, useEffect } from 'react';
import { CustomWord, CustomSentence, Difficulty } from '../types';
import { UserStats } from '../services/statsService';
import { 
  Plus, Trash2, Edit2, X, BookOpen, Languages, LayoutGrid, Info, 
  CheckCircle, User, LogOut, ShieldCheck, Save, Type, 
  MessageSquareText, Fingerprint, Smartphone
} from 'lucide-react';

interface DeveloperDashboardProps {
  stats: UserStats;
  onLogout: () => void;
}

const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ stats, onLogout }) => {
  const [activeSubTab, setActiveSubTab] = useState<'words' | 'sentences' | 'profile'>('words');
  
  // Words State
  const [words, setWords] = useState<CustomWord[]>([]);
  const [newTaiWord, setNewTaiWord] = useState('');
  const [newEngWord, setNewEngWord] = useState('');
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  
  // Sentences State
  const [sentences, setSentences] = useState<CustomSentence[]>([]);
  const [newTaiSentence, setNewTaiSentence] = useState('');
  const [newEngSentence, setNewEngSentence] = useState('');
  const [editingSentenceId, setEditingSentenceId] = useState<string | null>(null);
  
  const [newDiff, setNewDiff] = useState<Difficulty>('Beginner');
  
  // Biometric Enrollment State
  const [isBioEnrolled, setIsBioEnrolled] = useState(() => localStorage.getItem('dev_bio_enrolled') === 'true');

  useEffect(() => {
    const savedWords = localStorage.getItem('tai_custom_words');
    if (savedWords) setWords(JSON.parse(savedWords));
    
    const savedSentences = localStorage.getItem('tai_custom_sentences');
    if (savedSentences) setSentences(JSON.parse(savedSentences));
  }, []);

  const saveWords = (updated: CustomWord[]) => {
    setWords(updated);
    localStorage.setItem('tai_custom_words', JSON.stringify(updated));
  };

  const saveSentences = (updated: CustomSentence[]) => {
    setSentences(updated);
    localStorage.setItem('tai_custom_sentences', JSON.stringify(updated));
  };

  const handleRegisterBio = async () => {
    try {
      if (!window.PublicKeyCredential) {
        alert("Your browser doesn't support biometric login.");
        return;
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Tai Clubhouse Admin" },
          user: {
            id: new Uint8Array(16),
            name: "admin@taiclub.dev",
            displayName: "Admin Developer"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          timeout: 60000,
          attestation: "direct"
        }
      });

      if (credential) {
        localStorage.setItem('dev_bio_enrolled', 'true');
        setIsBioEnrolled(true);
        alert("Fingerprint linked successfully! You can now login with biometrics.");
      }
    } catch (err) {
      console.error("Biometric enrollment failed", err);
    }
  };

  const handleSaveWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaiWord.trim() || !newEngWord.trim()) return;

    if (editingWordId) {
      const updated = words.map(w => 
        w.id === editingWordId 
          ? { ...w, tai: newTaiWord.trim(), english: newEngWord.trim(), difficulty: newDiff } 
          : w
      );
      saveWords(updated);
      setEditingWordId(null);
    } else {
      const newEntry: CustomWord = {
        id: Date.now().toString(),
        tai: newTaiWord.trim(),
        english: newEngWord.trim(),
        difficulty: newDiff,
      };
      saveWords([...words, newEntry]);
    }
    setNewTaiWord('');
    setNewEngWord('');
    setNewDiff('Beginner');
  };

  const handleSaveSentence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaiSentence.trim() || !newEngSentence.trim()) return;

    if (editingSentenceId) {
      const updated = sentences.map(s => 
        s.id === editingSentenceId 
          ? { ...s, taiSentence: newTaiSentence.trim(), englishTranslation: newEngSentence.trim(), difficulty: newDiff } 
          : s
      );
      saveSentences(updated);
      setEditingSentenceId(null);
    } else {
      const newEntry: CustomSentence = {
        id: Date.now().toString(),
        taiSentence: newTaiSentence.trim(),
        englishTranslation: newEngSentence.trim(),
        difficulty: newDiff,
      };
      saveSentences([...sentences, newEntry]);
    }
    setNewTaiSentence('');
    setNewEngSentence('');
    setNewDiff('Beginner');
  };

  const startEditingWord = (word: CustomWord) => {
    setEditingWordId(word.id);
    setNewTaiWord(word.tai);
    setNewEngWord(word.english);
    setNewDiff(word.difficulty);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditingSentence = (s: CustomSentence) => {
    setEditingSentenceId(s.id);
    setNewTaiSentence(s.taiSentence);
    setNewEngSentence(s.englishTranslation);
    setNewDiff(s.difficulty);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingWordId(null);
    setEditingSentenceId(null);
    setNewTaiWord('');
    setNewEngWord('');
    setNewTaiSentence('');
    setNewEngSentence('');
    setNewDiff('Beginner');
  };

  const deleteWord = (id: string) => {
    if (editingWordId === id) cancelEdit();
    saveWords(words.filter(w => w.id !== id));
  };

  const deleteSentence = (id: string) => {
    if (editingSentenceId === id) cancelEdit();
    saveSentences(sentences.filter(s => s.id !== id));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl animate-in fade-in duration-500 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl text-orange-600 dark:text-orange-400 shadow-sm">
            <LayoutGrid size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-brand font-bold text-slate-800 dark:text-slate-100">Admin Panel</h2>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Developer Dashboard</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveSubTab('words')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'words' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-md scale-105' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <BookOpen size={14} /> Words
          </button>
          <button 
            onClick={() => setActiveSubTab('sentences')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'sentences' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-md scale-105' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <Languages size={14} /> Sentences
          </button>
          <button 
            onClick={() => setActiveSubTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'profile' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-md scale-105' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <User size={14} /> Profile
          </button>
        </div>
      </div>

      {activeSubTab === 'profile' ? (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-orange-500 dark:text-orange-400 border-2 border-orange-100 dark:border-slate-700 shadow-md">
                  <ShieldCheck size={48} />
                </div>
              </div>
              <h3 className="text-2xl font-brand font-bold text-slate-800 dark:text-slate-100">Admin Explorer</h3>
              <p className="text-slate-400 dark:text-slate-500 font-medium mb-8">Phone: 6901543900</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-10">
                <div className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <Type size={20} className="text-orange-500 mb-2" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Words Added</span>
                  <span className="text-2xl font-brand font-bold text-slate-800 dark:text-slate-100">{words.length}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <MessageSquareText size={20} className="text-blue-500 mb-2" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sentences Added</span>
                  <span className="text-2xl font-brand font-bold text-slate-800 dark:text-slate-100">{sentences.length}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 max-w-sm mx-auto mb-8">
                {isBioEnrolled ? (
                  <div className="flex items-center justify-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 py-4 rounded-2xl font-bold border border-emerald-100 dark:border-emerald-800/50">
                    <Fingerprint size={20} />
                    Biometrics Linked
                  </div>
                ) : (
                  <button 
                    onClick={handleRegisterBio}
                    className="flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 py-4 rounded-2xl font-bold border border-orange-100 dark:border-slate-700 hover:bg-orange-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
                  >
                    <Fingerprint size={20} />
                    Link Fingerprint Access
                  </button>
                )}
                
                <button 
                  onClick={onLogout}
                  className="flex items-center justify-center gap-3 bg-rose-500 text-white py-4 rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-lg active:scale-95 shadow-rose-100 dark:shadow-none"
                >
                  <LogOut size={20} />
                  Log Out Admin
                </button>
              </div>
           </div>
        </div>
      ) : (
        <>
          <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/30 mb-8 flex gap-4 items-start shadow-sm">
            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
               <Info className="text-orange-500 dark:text-orange-400" size={20} />
            </div>
            <p className="text-orange-900 dark:text-orange-200 text-sm leading-relaxed font-medium">
              {activeSubTab === 'words' 
                ? "These words will appear in 'Word Match' (Tai to English) and 'Photo to Name' (AI Image to Tai options). Adding unique items here overrides default AI content." 
                : "These sentences will appear in 'Sentence Scramble'. Players will match the English meaning to your full Tai sentence."}
              <span className="block mt-2 font-bold flex items-center gap-1">
                <CheckCircle size={14} className="text-emerald-500" /> Only developer-added content is prioritized.
              </span>
            </p>
          </div>

          {activeSubTab === 'words' ? (
            <form onSubmit={handleSaveWord} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 mb-10 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-inner relative">
              {editingWordId && (
                <div className="absolute -top-3 left-6 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                  Editing Mode
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tai script word</label>
                <input 
                  type="text" 
                  required
                  value={newTaiWord} 
                  onChange={(e) => setNewTaiWord(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-400 text-black dark:text-white font-brand text-xl shadow-sm"
                  placeholder="e.g. ၵိၼ်"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">English meaning</label>
                <input 
                  type="text" 
                  required
                  value={newEngWord} 
                  onChange={(e) => setNewEngWord(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-400 text-black dark:text-white font-medium shadow-sm"
                  placeholder="e.g. Eat"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Level</label>
                <select 
                  value={newDiff} 
                  onChange={(e) => setNewDiff(e.target.value as Difficulty)}
                  className="w-full bg-white dark:bg-slate-800 px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-400 text-black dark:text-white font-bold shadow-sm"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg dark:shadow-none active:scale-95">
                  {editingWordId ? <Save size={20} strokeWidth={2.5} /> : <Plus size={22} strokeWidth={2.5} />}
                  {editingWordId ? 'Update' : 'Save'}
                </button>
                {editingWordId && (
                  <button type="button" onClick={cancelEdit} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-4 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all shadow-sm">
                    <X size={20} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleSaveSentence} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 mb-10 flex flex-col gap-5 shadow-inner relative">
              {editingSentenceId && (
                <div className="absolute -top-3 left-6 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                  Editing Mode
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tai full sentence</label>
                  <input 
                    type="text" 
                    required
                    value={newTaiSentence} 
                    onChange={(e) => setNewTaiSentence(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-400 text-black dark:text-white font-brand text-xl shadow-sm"
                    placeholder="Write the full Tai sentence..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">English translation</label>
                  <input 
                    type="text" 
                    required
                    value={newEngSentence} 
                    onChange={(e) => setNewEngSentence(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-400 text-black dark:text-white font-medium shadow-sm"
                    placeholder="Meaning in English..."
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                 <div className="flex-1 w-full space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Difficulty</label>
                  <div className="flex gap-2">
                    {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setNewDiff(d)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${newDiff === d ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button type="submit" className="flex-1 sm:px-12 bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg dark:shadow-none active:scale-95">
                    {editingSentenceId ? <Save size={20} strokeWidth={2.5} /> : <Plus size={22} strokeWidth={2.5} />}
                    {editingSentenceId ? 'Update' : 'Save'}
                  </button>
                  {editingSentenceId && (
                    <button type="button" onClick={cancelEdit} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-4 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all shadow-sm">
                      <X size={20} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-brand font-bold text-slate-700 dark:text-slate-300">
                {activeSubTab === 'words' ? `Word Library (${words.length})` : `Sentence Library (${sentences.length})`}
              </h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700">Exclusive Content</span>
              </div>
            </div>
            
            <div className="grid gap-4">
              {activeSubTab === 'words' ? (
                words.length === 0 ? <EmptyState msg="No words added yet." /> : words.map(word => (
                  <div key={word.id} className={`flex items-center justify-between p-6 bg-white dark:bg-slate-800 border rounded-[1.5rem] transition-all group ${editingWordId === word.id ? 'border-orange-400 ring-2 ring-orange-50 dark:ring-orange-900/20 shadow-md' : 'border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-900/40 hover:shadow-lg dark:hover:shadow-none'}`}>
                    <div className="flex gap-10 items-center">
                      <div className="flex flex-col">
                        <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-brand tracking-wide">{word.tai}</span>
                        <span className="text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">{word.english}</span>
                      </div>
                      <DifficultyBadge diff={word.difficulty} />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEditingWord(word)} 
                        className={`p-3.5 rounded-2xl transition-all ${editingWordId === word.id ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' : 'text-slate-300 dark:text-slate-600 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-700'}`}
                        title="Edit Word"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button 
                        onClick={() => deleteWord(word.id)} 
                        className="p-3.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
                        title="Delete Word"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                sentences.length === 0 ? <EmptyState msg="No sentences added yet." /> : sentences.map(s => (
                  <div key={s.id} className={`flex flex-col p-6 bg-white dark:bg-slate-800 border rounded-[1.5rem] transition-all group ${editingSentenceId === s.id ? 'border-orange-400 ring-2 ring-orange-50 dark:ring-orange-900/20 shadow-md' : 'border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-900/40 hover:shadow-lg dark:hover:shadow-none'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-brand leading-tight">{s.taiSentence}</p>
                        <p className="text-slate-500 dark:text-slate-400 font-medium italic text-lg opacity-80">"{s.englishTranslation}"</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEditingSentence(s)} 
                          className={`p-3 rounded-2xl transition-all ${editingSentenceId === s.id ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' : 'text-slate-300 dark:text-slate-600 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-700'}`}
                          title="Edit Sentence"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={() => deleteSentence(s.id)} 
                          className="p-3 text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
                          title="Delete Sentence"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <DifficultyBadge diff={s.difficulty} />
                       <span className="text-[10px] font-bold text-orange-400 uppercase bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-800">For Sentence Scramble</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const DifficultyBadge = ({ diff }: { diff: Difficulty }) => (
  <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
    diff === 'Beginner' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
    diff === 'Intermediate' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800' :
    'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800'
  }`}>
    {diff}
  </span>
);

const EmptyState = ({ msg }: { msg: string }) => (
  <div className="text-center py-24 text-slate-400 dark:text-slate-600 italic bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-4">
    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-200 dark:text-slate-700 shadow-sm">
       <LayoutGrid size={32} />
    </div>
    <p className="font-medium">{msg} Start building your library above.</p>
  </div>
);

export default DeveloperDashboard;
