
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GameType, QuizQuestion, Difficulty, CustomWord, CustomSentence } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getCustomWords = (): CustomWord[] => {
  const saved = localStorage.getItem('tai_custom_words');
  return saved ? JSON.parse(saved) : [];
};

const getCustomSentences = (): CustomSentence[] => {
  const saved = localStorage.getItem('tai_custom_sentences');
  return saved ? JSON.parse(saved) : [];
};

/**
 * fetchQuizContent:
 * - Prioritizes developer-added content from localStorage.
 * - Falls back to AI generation.
 */
export const fetchQuizContent = async (type: GameType, difficulty: Difficulty): Promise<QuizQuestion[]> => {
  const allCustomWords = getCustomWords().filter(w => w.difficulty === difficulty);
  const allCustomSentences = getCustomSentences().filter(s => s.difficulty === difficulty);

  // 1. Word Match
  if (type === GameType.WORD_MATCH && allCustomWords.length >= 3) {
    return allCustomWords.map(word => {
      const otherEng = allCustomWords.filter(w => w.id !== word.id).map(w => w.english);
      const distractors = [...otherEng].sort(() => 0.5 - Math.random()).slice(0, 3);
      while (distractors.length < 3) distractors.push("Unknown Term");
      return {
        question: `What is the meaning of "${word.tai}"?`,
        correctAnswer: word.english,
        options: [word.english, ...distractors].sort(() => 0.5 - Math.random()),
        explanation: `In Tai, "${word.tai}" translates to "${word.english}" in English.`
      };
    }).sort(() => 0.5 - Math.random()).slice(0, 5);
  }

  // 2. Photo to Name
  if (type === GameType.IMAGE_IDENTIFY && allCustomWords.length >= 3) {
    return allCustomWords.map(word => {
      const otherTai = allCustomWords.filter(w => w.id !== word.id).map(w => w.tai);
      const distractors = [...otherTai].sort(() => 0.5 - Math.random()).slice(0, 3);
      while (distractors.length < 3) distractors.push("???");
      return {
        question: "Select the correct Tai name for this image:",
        correctAnswer: word.tai,
        options: [word.tai, ...distractors].sort(() => 0.5 - Math.random()),
        imagePrompt: word.english,
        explanation: `Correct! This is "${word.english}", written in Tai as "${word.tai}".`
      };
    }).sort(() => 0.5 - Math.random()).slice(0, 5);
  }

  // 3. Sentence Scramble
  if (type === GameType.SENTENCE_SCRAMBLE && allCustomSentences.length >= 2) {
    return allCustomSentences.map(sentence => {
      const otherTai = allCustomSentences.filter(s => s.id !== sentence.id).map(s => s.taiSentence);
      const distractors = [...otherTai].sort(() => 0.5 - Math.random()).slice(0, 3);
      while (distractors.length < 3) distractors.push("...");
      return {
        question: `Choose the correct Tai sentence for: "${sentence.englishTranslation}"`,
        correctAnswer: sentence.taiSentence,
        options: [sentence.taiSentence, ...distractors].sort(() => 0.5 - Math.random()),
        explanation: `The full Tai sentence is: "${sentence.taiSentence}"`
      };
    }).sort(() => 0.5 - Math.random()).slice(0, 5);
  }

  // FALLBACK: AI Generation
  const model = "gemini-3-flash-preview";
  let prompt = type === GameType.WORD_MATCH 
    ? `Generate 5 multiple choice questions for learning Tai words at ${difficulty} level.` 
    : type === GameType.SENTENCE_SCRAMBLE 
    ? `Generate 5 sentence translation questions at ${difficulty} level.` 
    : `Generate 5 'Photo to Name' questions at ${difficulty} level.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              imagePrompt: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
};

export const askTaiSensei = async (message: string): Promise<string> => {
  const model = "gemini-3-pro-preview";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: message,
      config: {
        systemInstruction: "You are Sensei Hata, a friendly Tai Language tutor. Provide Tai script alongside English.",
      }
    });
    return response.text || "I am reflecting on your request.";
  } catch (error) {
    return "I am currently meditating. Please try again later!";
  }
};

export const generateImageForQuestion = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `A vibrant educational illustration of: ${prompt}. Solid white background.` }] },
      config: { imageConfig: { aspectRatio: "1:1" } },
    });
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : null;
  } catch (error) {
    return null;
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || null;
  } catch (error) {
    return null;
  }
};

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}
