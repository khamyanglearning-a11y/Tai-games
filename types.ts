
export enum GameType {
  WORD_MATCH = 'WORD_MATCH',
  SENTENCE_SCRAMBLE = 'SENTENCE_SCRAMBLE',
  IMAGE_IDENTIFY = 'IMAGE_IDENTIFY'
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CustomWord {
  id: string;
  tai: string;
  english: string;
  difficulty: Difficulty;
}

export interface CustomSentence {
  id: string;
  taiSentence: string;
  englishTranslation: string;
  difficulty: Difficulty;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  imagePrompt?: string; 
  imageUrl?: string;    
}

export interface GameState {
  score: number;
  totalQuestions: number;
  isGameOver: boolean;
  currentLevel: number;
  difficulty: Difficulty;
}
