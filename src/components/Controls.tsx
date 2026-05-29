import React from 'react';
import { Volume2, VolumeX, Download, LocateFixed, Trash2 } from 'lucide-react';

interface ControlsProps {
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onExport: () => void;
  onRequestClear: () => void;
  onCenter: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ audioEnabled, onToggleAudio, onExport, onRequestClear, onCenter }) => {
  return (
    <div className="absolute top-6 right-6 flex flex-col md:flex-row items-center gap-4 z-40" dir="rtl">
      
      <button
        onClick={onRequestClear}
        className="p-3 rounded-full bg-slate-900/40 text-rose-400 hover:text-rose-100 hover:bg-rose-900/60 backdrop-blur-lg transition-all duration-300 border border-slate-700/50 hover:border-rose-500 shadow-xl focus:outline-none"
        title="حذف منظومه"
      >
        <Trash2 size={20} strokeWidth={1.5} />
      </button>

      <button
        onClick={onCenter}
        className="p-3 rounded-full bg-slate-900/40 text-sky-400 hover:text-sky-100 hover:bg-sky-900/60 backdrop-blur-lg transition-all duration-300 border border-slate-700/50 hover:border-sky-500 shadow-xl focus:outline-none"
        title="بازگشت به مرکز"
      >
        <LocateFixed size={20} strokeWidth={1.5} />
      </button>

      <button
        onClick={onExport}
        className="p-3 rounded-full bg-slate-900/40 text-emerald-400 hover:text-emerald-100 hover:bg-emerald-900/60 backdrop-blur-lg transition-all duration-300 border border-slate-700/50 hover:border-emerald-500 shadow-xl focus:outline-none"
        title="دانلود منظومه من"
      >
        <Download size={20} strokeWidth={1.5} />
      </button>
      
      <button
        onClick={onToggleAudio}
        className={`p-3 rounded-full backdrop-blur-lg transition-all duration-300 border shadow-xl focus:outline-none ${
          audioEnabled 
          ? 'bg-indigo-900/60 text-indigo-100 border-indigo-500' 
          : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 border-slate-700/50 hover:bg-slate-800/60'
        }`}
        title={audioEnabled ? "قطع صدا" : "پخش صدا"}
      >
        {audioEnabled ? <Volume2 size={20} strokeWidth={1.5} /> : <VolumeX size={20} strokeWidth={1.5} />}
      </button>
    </div>
  );
};
