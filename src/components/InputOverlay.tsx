import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send } from 'lucide-react';

interface InputOverlayProps {
  onCommit: (text: string) => void;
  onTyping: () => void;
}

export const InputOverlay: React.FC<InputOverlayProps> = ({ onCommit, onTyping }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.innerWidth > 768) {
       setTimeout(() => {
         inputRef.current?.focus();
       }, 1000);
    }
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (text.trim().length > 0) {
      onCommit(text.trim());
      setText('');
      if (window.innerWidth > 768) {
        inputRef.current?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') {
      onTyping();
    }
  };

  return (
    <div className="absolute bottom-8 md:bottom-12 left-0 right-0 flex justify-center px-4 md:px-8 z-40 pointer-events-none">
      <motion.div 
        className="w-full max-w-2xl pointer-events-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <form onSubmit={handleSubmit} className="relative group flex items-center w-full" dir="rtl">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="یک فکر را به آسمان بسپار..."
            maxLength={180}
            className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-full pl-14 pr-6 py-4 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-500/80 focus:bg-slate-900/80 transition-all duration-500 font-serif text-lg tracking-wide shadow-2xl"
          />
          
          <button 
            type="submit"
            className={`absolute left-3 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${text.trim().length > 0 ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] cursor-pointer' : 'bg-slate-800/80 text-slate-500 pointer-events-none cursor-default'}`}
          >
            <Send size={18} className="transform -translate-x-0.5 translate-y-[1px] -scale-x-100" />
          </button>

          <AnimatePresence>
            {(isFocused || text.length > 0) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-2xl transition-opacity duration-1000 pointer-events-none"
              />
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
};

