
import React, { useState, useRef, useEffect } from 'react';
import { askTaiSensei, generateSpeech, decodeBase64, decodeAudioData } from '../services/geminiService';
import { Send, User, Bot, Loader2, Volume2 } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'Sawatdee! I am your Tai Language Sensei. Ask me anything about Tai words, culture, or sentences!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await askTaiSensei(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Apologies, my scroll of wisdom is temporarily stuck. Please try again later!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const playSpeech = async (text: string, index: number) => {
    if (playingAudio !== null) return;
    setPlayingAudio(index);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const base64Audio = await generateSpeech(text);
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(
          decodeBase64(base64Audio),
          audioContextRef.current,
          24000,
          1
        );
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setPlayingAudio(null);
        source.start();
      } else {
        setPlayingAudio(null);
      }
    } catch (e) {
      console.error("Audio playback failed", e);
      setPlayingAudio(null);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl flex flex-col h-[75vh] border border-orange-100 overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
      <div className="p-6 border-b border-orange-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Bot size={28} />
          </div>
          <div>
            <h3 className="font-brand text-lg font-bold">Sensei Hata</h3>
            <p className="text-xs text-orange-100 font-medium">Your Voice-Guided Tai Tutor</p>
          </div>
        </div>
        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-orange-500' : 'bg-white border border-orange-100 text-orange-500'}`}>
                {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} />}
              </div>
              <div className="space-y-2">
                <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm relative group ${msg.role === 'user' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                  {msg.text}
                  {msg.role === 'bot' && (
                    <button 
                      onClick={() => playSpeech(msg.text, i)}
                      className={`absolute -right-12 top-1 p-2 rounded-xl bg-white border border-orange-50 text-orange-500 shadow-sm transition-all hover:scale-110 active:scale-95 ${playingAudio === i ? 'animate-pulse text-orange-700' : ''}`}
                      title="Listen to pronunciation"
                    >
                      <Volume2 size={18} className={playingAudio === i ? 'fill-orange-500' : ''} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center text-slate-400 text-xs font-medium ml-14">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></span>
              </div>
              Sensei is thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-3"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Sensei anything..."
            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-sm font-medium"
          />
          <button 
            type="submit"
            className="bg-orange-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all active:scale-95"
          >
            <Send size={24} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
