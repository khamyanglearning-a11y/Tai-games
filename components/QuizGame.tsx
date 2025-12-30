
import React, { useState, useEffect } from 'react';
import { GameType, QuizQuestion, Difficulty } from '../types';
import { fetchQuizContent, generateImageForQuestion } from '../services/geminiService';
import { CheckCircle2, XCircle, ArrowRight, Loader2, ImageIcon, Zap } from 'lucide-react';

interface QuizGameProps {
  type: GameType;
  difficulty: Difficulty;
  onClose: () => void;
  onFinish: (earnedScore: number) => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ type, difficulty, onClose, onFinish }) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      const data = await fetchQuizContent(type, difficulty);
      setQuestions(data);
      setLoading(false);
    };
    loadQuestions();
  }, [type, difficulty]);

  useEffect(() => {
    if (questions.length > 0 && type === GameType.IMAGE_IDENTIFY) {
      const loadImg = async () => {
        setImageLoading(true);
        const prompt = questions[currentIndex].imagePrompt || questions[currentIndex].correctAnswer;
        const url = await generateImageForQuestion(prompt);
        setCurrentImage(url);
        setImageLoading(false);
      };
      loadImg();
    }
  }, [currentIndex, questions, type]);

  const handleAnswer = (option: string) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(option);
    const correct = option === questions[currentIndex].correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      const multiplier = difficulty === 'Advanced' ? 2 : difficulty === 'Intermediate' ? 1.5 : 1;
      setScore(prev => prev + Math.floor(10 * multiplier));
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setCurrentImage(null);
    } else {
      setCompleted(true);
      onFinish(score);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-orange-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-orange-500 animate-spin relative z-10" />
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-brand text-lg animate-pulse tracking-wide">
          Curating {difficulty} {type.toLowerCase().replace('_', ' ')} questions...
        </p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 text-center shadow-2xl border border-orange-100 dark:border-slate-800 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-inner">
          <CheckCircle2 size={56} />
        </div>
        <h2 className="text-4xl font-brand font-bold text-slate-800 dark:text-slate-100 mb-2">Level Complete!</h2>
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            difficulty === 'Beginner' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' :
            difficulty === 'Intermediate' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' :
            'bg-rose-100 dark:bg-rose-900/40 text-rose-600'
          }`}>
            {difficulty} Master
          </span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 italic">
          You've earned <span className="text-orange-600 dark:text-orange-400 font-bold px-2 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg">{score} XP</span>.
        </p>
        <button 
          onClick={onClose}
          className="w-full bg-orange-500 text-white py-5 rounded-[1.5rem] font-bold text-xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-200 dark:shadow-none active:scale-95"
        >
          Finish Game
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 flex gap-2 mr-6">
          {questions.map((_, i) => (
            <div 
              key={i} 
              className={`h-3 flex-1 rounded-full transition-all duration-500 ${
                i < currentIndex ? 'bg-emerald-400' : 
                i === currentIndex ? 'bg-orange-400 scale-y-110 shadow-sm' : 
                'bg-slate-200 dark:bg-slate-800'
              }`} 
            />
          ))}
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={14} className={difficulty === 'Beginner' ? 'text-emerald-500' : difficulty === 'Intermediate' ? 'text-amber-500' : 'text-rose-500'} />
            <span className="text-slate-400 dark:text-slate-600 font-bold text-[10px] uppercase tracking-widest shrink-0">
              {difficulty} Level
            </span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-brand text-xs">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 transition-all duration-300">
        {type === GameType.IMAGE_IDENTIFY && (
          <div className="w-full aspect-square bg-slate-50 dark:bg-slate-950 relative border-b border-slate-100 dark:border-slate-800">
            {imageLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Painting the challenge...</p>
              </div>
            ) : currentImage ? (
              <img src={currentImage} alt="Challenge" className="w-full h-full object-cover animate-in fade-in duration-700" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                <ImageIcon size={64} />
                <p className="mt-2 font-medium">Visual hint unavailable</p>
              </div>
            )}
          </div>
        )}

        <div className="p-8">
          <h3 className={`text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8 font-brand text-center ${type === GameType.IMAGE_IDENTIFY ? 'mt-2' : ''}`}>
            {currentQ.question}
          </h3>

          <div className="grid gap-4">
            {currentQ.options.map((option, idx) => (
              <button
                key={idx}
                disabled={selectedAnswer !== null || (type === GameType.IMAGE_IDENTIFY && imageLoading)}
                onClick={() => handleAnswer(option)}
                className={`
                  w-full text-left p-5 rounded-2xl border-2 transition-all font-bold text-lg relative group
                  ${selectedAnswer === null ? 'border-slate-100 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-900 hover:bg-orange-50 dark:hover:bg-slate-800 hover:translate-x-1 text-slate-700 dark:text-slate-300' : ''}
                  ${selectedAnswer === option && isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm' : ''}
                  ${selectedAnswer === option && !isCorrect ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 shadow-sm' : ''}
                  ${selectedAnswer !== null && option === currentQ.correctAnswer && !isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : ''}
                  ${selectedAnswer !== null && option !== currentQ.correctAnswer && option !== selectedAnswer ? 'opacity-40 border-slate-100 dark:border-slate-800' : ''}
                  ${type === GameType.IMAGE_IDENTIFY && imageLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-brand">{option}</span>
                  <div className="flex items-center gap-2">
                     {selectedAnswer === option && isCorrect && <CheckCircle2 className="text-emerald-500 w-6 h-6" />}
                     {selectedAnswer === option && !isCorrect && <XCircle className="text-rose-500 w-6 h-6" />}
                     {selectedAnswer === null && <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedAnswer && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-orange-100 dark:border-slate-800 flex items-center justify-between shadow-lg animate-in slide-in-from-bottom-6 duration-500">
          <div className="max-w-[70%]">
            <h4 className={`text-xl font-brand font-bold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isCorrect ? 'Sabai! (Correct)' : 'Try again later!'}
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium leading-relaxed">
              {currentQ.explanation || (isCorrect ? "You recognized the Tai script perfectly!" : `The correct answer was "${currentQ.correctAnswer}".`)}
            </p>
          </div>
          <button 
            onClick={handleNext}
            className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-orange-600 shadow-lg shadow-orange-100 dark:shadow-none transition-all active:scale-95"
          >
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
            <ArrowRight size={20} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizGame;
