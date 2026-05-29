import React, { useState, useEffect, useCallback } from 'react';
import { SkyCanvas } from './components/SkyCanvas';
import { InputOverlay } from './components/InputOverlay';
import { Controls } from './components/Controls';
import { Title } from './components/Title';
import { Thought, AppState } from './types';
import { analyzeEmotion } from './lib/emotion';
import { audioManager } from './lib/audio';
import { calculateNextStarPosition } from './lib/placement';
import { loadThoughts, saveThoughts, loadAudioPref, saveAudioPref } from './lib/storage';
import { getEmotionColor } from './lib/colors';

const generateId = () => Math.random().toString(36).substring(2, 11);

export default function App() {
  const [state, setState] = useState<AppState>({
    thoughts: [],
    audioEnabled: false,
  });
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [centerTrigger, setCenterTrigger] = useState(0);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const updateSize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions(prev => {
          if (Math.abs(prev.width - window.innerWidth) < 10 && window.innerWidth <= 768) {
            return prev;
          }
          if (prev.width === window.innerWidth && prev.height === window.innerHeight) {
            return prev;
          }
          return { width: window.innerWidth, height: window.innerHeight };
        });
      }, 250);
    };
    
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    
    window.addEventListener('resize', updateSize);

    const t = loadThoughts();
    const a = loadAudioPref();
    
    setState({ thoughts: t, audioEnabled: a });

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (state.audioEnabled) {
      audioManager.enable();
    } else {
      audioManager.disable();
    }
  }, [state.audioEnabled]);

  const handleToggleAudio = () => {
    setState(s => {
      const next = !s.audioEnabled;
      saveAudioPref(next);
      return { ...s, audioEnabled: next };
    });
  };

  const handleClear = () => {
    setState(s => ({ ...s, thoughts: [] }));
    saveThoughts([]);
    setCenterTrigger(prev => prev + 1);
  };

  const handleCenter = () => {
    setCenterTrigger(prev => prev + 1);
  };

  const handleTyping = useCallback(() => {
    if (state.audioEnabled) {
      audioManager.playTypingSound();
    }
  }, [state.audioEnabled]);

  const handleCommit = useCallback((text: string) => {
    const emotion = analyzeEmotion(text);
    
    setState(s => {
      if (Math.random() < 0.1) {
        setCenterTrigger(prev => prev + 1);
      }

      const { position, connectedToId } = calculateNextStarPosition(dimensions.width, dimensions.height, s.thoughts);
      
      const newThought: Thought = {
        id: generateId(),
        text,
        emotion,
        x: position.x,
        y: position.y,
        connectedToId,
        timestamp: Date.now()
      };

      const nextThoughts = [...s.thoughts, newThought];
      saveThoughts(nextThoughts);
      
      if (s.audioEnabled) {
        audioManager.playStarCreation(emotion);
        if (connectedToId) {
          setTimeout(() => audioManager.playConnection(), 800);
        }
      }

      return { ...s, thoughts: nextThoughts };
    });
  }, [dimensions]);

  const handleExport = useCallback(() => {
    if (state.thoughts.length === 0) {
      alert('هنوز ستاره‌ای خلق نکرده‌اید.');
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    state.thoughts.forEach(t => {
      if (t.x < minX) minX = t.x;
      if (t.x > maxX) maxX = t.x;
      if (t.y < minY) minY = t.y;
      if (t.y > maxY) maxY = t.y;
    });

    const padding = 250;
    const expWidth = Math.max(dimensions.width, maxX - minX + padding * 2);
    const expHeight = Math.max(dimensions.height, maxY - minY + padding * 2);

    const canvas = document.createElement('canvas');
    canvas.width = expWidth;
    canvas.height = expHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#050B14';
    ctx.fillRect(0, 0, expWidth, expHeight);
    
    const bgGrad = ctx.createRadialGradient(expWidth/2, expHeight/2, 0, expWidth/2, expHeight/2, Math.max(expWidth, expHeight));
    bgGrad.addColorStop(0, 'rgba(15, 23, 42, 1)'); 
    bgGrad.addColorStop(1, 'rgba(2, 6, 23, 1)'); 
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, expWidth, expHeight);

    const contentCenterY = (minY + maxY) / 2;
    const contentCenterX = (minX + maxX) / 2;
    
    const offsetX = expWidth / 2 - contentCenterX;
    const offsetY = expHeight / 2 - contentCenterY;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    ctx.lineWidth = 1.5;
    state.thoughts.forEach(t => {
      if (t.connectedToId) {
        const parent = state.thoughts.find(p => p.id === t.connectedToId);
        if (parent) {
          ctx.beginPath();
          ctx.moveTo(t.x, t.y);
          ctx.lineTo(parent.x, parent.y);
          
          const grad = ctx.createLinearGradient(t.x, t.y, parent.x, parent.y);
          grad.addColorStop(0, `rgba(${getEmotionColor(t.emotion).rgb}, 0.5)`);
          grad.addColorStop(1, `rgba(${getEmotionColor(parent.emotion).rgb}, 0.2)`);
          
          ctx.strokeStyle = grad;
          ctx.stroke();
        }
      }
    });

    state.thoughts.forEach((t) => {
      const { rgb, glow, size } = getEmotionColor(t.emotion);
      
      const radius = size * 4.5;
      const radGrad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, radius);
      radGrad.addColorStop(0, glow);
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.beginPath();
      ctx.fillStyle = radGrad;
      ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `rgb(${rgb})`;
      ctx.arc(t.x, t.y, size * 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.arc(t.x, t.y, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '24px Vazirmatn, serif';
    ctx.textAlign = 'right';
    ctx.fillText('نوژا', expWidth - 40, expHeight - 40);

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `noja-constellation-${new Date().toISOString().slice(0,10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [state.thoughts, dimensions]);

  if (dimensions.width === 0) return null;

  return (
    <div className="relative w-screen h-screen bg-[#050B14] overflow-hidden select-none overscroll-none">
      <SkyCanvas 
        thoughts={state.thoughts} 
        width={dimensions.width} 
        height={dimensions.height} 
        centerTrigger={centerTrigger}
      />
      
      <Title />
      
      <Controls 
        audioEnabled={state.audioEnabled} 
        onToggleAudio={handleToggleAudio}
        onExport={handleExport}
        onRequestClear={() => setShowClearModal(true)}
        onCenter={handleCenter}
      />
      
      <InputOverlay 
        onCommit={handleCommit} 
        onTyping={handleTyping} 
      />

      {showClearModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center" dir="rtl">
            <h3 className="text-2xl font-serif text-white mb-3">شروعی دوباره؟</h3>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed font-sans">
              آیا می‌خواهید منظومه فعلی را پاک کنید؟<br/> تمام ستاره‌ها برای همیشه محو خواهند شد.
            </p>
            <div className="flex space-x-4 space-x-reverse justify-center">
              <button 
                onClick={() => setShowClearModal(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-medium transition-colors border border-slate-700 flex-1"
               >
                 انصراف
               </button>
               <button 
                onClick={() => {
                  handleClear();
                  setShowClearModal(false);
                }}
                className="px-6 py-2.5 bg-rose-600/80 hover:bg-rose-500 text-white rounded-full font-medium transition-colors shadow-[0_0_15px_rgba(225,29,72,0.4)] flex-1"
               >
                 بله، پاک کن
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
