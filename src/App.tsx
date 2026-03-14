/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { 
  BookOpen, 
  Calculator, 
  Atom, 
  FlaskConical, 
  Dna, 
  Languages, 
  Send, 
  Loader2, 
  Sparkles,
  ChevronRight,
  Trash2,
  BrainCircuit,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Subject = 'Hindi' | 'English' | 'Math' | 'Physics' | 'Chemistry' | 'Biology' | 'General';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const SUBJECTS: { id: Subject; name: string; icon: React.ReactNode; color: string }[] = [
  { id: 'General', name: 'General AI', icon: <BrainCircuit className="w-4 h-4" />, color: 'bg-indigo-500' },
  { id: 'Math', name: 'Mathematics', icon: <Calculator className="w-4 h-4" />, color: 'bg-blue-500' },
  { id: 'Physics', name: 'Physics', icon: <Atom className="w-4 h-4" />, color: 'bg-purple-500' },
  { id: 'Chemistry', name: 'Chemistry', icon: <FlaskConical className="w-4 h-4" />, color: 'bg-emerald-500' },
  { id: 'Biology', name: 'Biology', icon: <Dna className="w-4 h-4" />, color: 'bg-rose-500' },
  { id: 'English', name: 'English', icon: <BookOpen className="w-4 h-4" />, color: 'bg-amber-500' },
  { id: 'Hindi', name: 'Hindi', icon: <Languages className="w-4 h-4" />, color: 'bg-orange-500' },
];

export default function App() {
  const [selectedSubject, setSelectedSubject] = useState<Subject>('General');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = scrollRef.current;
        const isNearBottom = scrollHeight - clientHeight - scrollTop < 100;
        
        // Auto-scroll if we're already near the bottom or if it's the first message
        if (isNearBottom || messages.length <= 2) {
          scrollRef.current.scrollTo({
            top: scrollHeight,
            behavior: 'smooth'
          });
        }
      }
    };

    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `Subject: ${selectedSubject}\nQuestion: ${input}` }]
          }
        ],
        config: {
          systemInstruction: `You are an elite academic mentor. 
          Provide sophisticated, clear, and accurate explanations for ${selectedSubject}. 
          Use LaTeX-style formatting for math if possible. 
          Be concise but thorough. Use Markdown. 
          Respond in the language of the question if it's Hindi or English.`,
        }
      });

      const aiMessage: Message = {
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't generate a response.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMessage = "System Error: Connection to neural network failed. Please try again in a moment.";
      
      if (error?.message === "API_KEY_MISSING") {
        errorMessage = "Configuration Error: Gemini API key is missing. Please check your environment settings.";
      } else if (error?.message?.includes("quota")) {
        errorMessage = "System Error: API Quota exceeded. Please try again later.";
      } else if (error?.message?.includes("model")) {
        errorMessage = "System Error: The requested AI model is currently unavailable.";
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:relative flex flex-col w-72 h-full bg-[#0A0A0A] border-r border-white/5 p-6 z-50 transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white">Solver AI</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Knowledge Base</p>
          {SUBJECTS.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubject(sub.id);
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative",
                selectedSubject === sub.id 
                  ? "bg-white/5 text-white font-medium" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all duration-300",
                selectedSubject === sub.id ? "bg-indigo-500 text-white" : "bg-white/5 group-hover:bg-white/10"
              )}>
                {sub.icon}
              </div>
              <span className="text-sm">{sub.name}</span>
              {selectedSubject === sub.id && (
                <motion.div 
                  layoutId="active-pill" 
                  className="absolute left-0 w-1 h-4 bg-indigo-500 rounded-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
          <button 
            onClick={clearChat}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Clear Session</span>
          </button>
          
          <div className="px-3 py-2 flex items-center gap-2 text-slate-600">
            <div className="w-1 h-1 bg-indigo-500 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Made by Ali</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Header */}
        <header className="h-16 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold">Active Module</span>
              <h2 className="font-semibold text-white text-sm">
                {SUBJECTS.find(s => s.id === selectedSubject)?.name}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Online</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-8">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[2rem] flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-2xl shadow-indigo-500/5"
              >
                <BrainCircuit className="w-12 h-12" />
              </motion.div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-white tracking-tight">How can I assist your learning?</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                  I'm your advanced academic AI. Select a subject and let's solve complex problems together.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {[
                  { label: 'Solve Calculus', sub: 'Math' },
                  { label: 'Hindi Translation', sub: 'Hindi' },
                  { label: 'Quantum Physics', sub: 'Physics' },
                  { label: 'Organic Chemistry', sub: 'Chemistry' }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setSelectedSubject(item.sub as Subject);
                      setInput(`Can you explain ${item.label} to me?`);
                    }}
                    className="px-5 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-xs font-medium text-slate-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-white transition-all duration-300 text-left group flex items-center justify-between"
                  >
                    {item.label}
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-10">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.timestamp}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-5",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white shadow-lg",
                      msg.role === 'user' 
                        ? "bg-slate-800 border border-white/10" 
                        : "bg-gradient-to-br from-indigo-500 to-purple-600"
                    )}>
                      {msg.role === 'user' ? <span className="text-xs font-bold">ME</span> : <Sparkles className="w-5 h-5" />}
                    </div>
                    <div className={cn(
                      "max-w-[88%] px-6 py-4 rounded-[1.5rem] shadow-2xl",
                      msg.role === 'user' 
                        ? "bg-white/5 border border-white/10 text-white rounded-tr-none" 
                        : "bg-[#0A0A0A] border border-white/5 text-slate-200 rounded-tl-none"
                    )}>
                      <div className="markdown-body prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-white prose-strong:text-indigo-400">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                      <div className={cn(
                        "text-[9px] mt-3 font-bold uppercase tracking-widest opacity-30",
                        msg.role === 'user' ? "text-right" : "text-left"
                      )}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-5"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-[1.5rem] rounded-tl-none shadow-2xl flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
                    </div>
                    <span className="text-xs text-slate-500 font-medium tracking-wide">Processing Query...</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-10 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500" />
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Ask your ${selectedSubject} question...`}
                className="relative w-full bg-[#0A0A0A] border border-white/10 rounded-2xl px-6 py-5 pr-16 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all shadow-2xl resize-none min-h-[64px] max-h-[200px] text-sm leading-relaxed"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute right-3.5 bottom-3.5 p-2.5 rounded-xl transition-all duration-300",
                  input.trim() && !isLoading 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95" 
                    : "bg-white/5 text-slate-600 cursor-not-allowed"
                )}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <p className="text-[9px] text-slate-600 uppercase tracking-[0.2em] font-bold">
                Advanced Neural Intelligence
              </p>
              <div className="w-1 h-1 bg-slate-800 rounded-full" />
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                Created by Ali
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
