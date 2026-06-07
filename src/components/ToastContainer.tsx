import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, TrendingDown, ShieldAlert, Flame, Award, X, Sparkles, Megaphone, FileWarning } from 'lucide-react';
import { GameLog } from '../types';

export interface Toast {
  id: string;
  type: 'bankruptcy' | 'bailout' | 'burnout' | 'pip' | 'victory' | 'outsourced' | 'card' | 'debt_warning';
  title: string;
  message: string;
  timestamp: string;
  playerName?: string;
  playerColor?: string;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] p-4 pointer-events-none flex flex-col gap-3.5 max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastCardProps {
  key?: React.Key | string;
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastCard({ toast, onRemove }: ToastCardProps) {
  // Auto-expire toast
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5500); // Plenty of time to read the hilarious messages
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  // Select dynamic themes based on satirical event type
  let config = {
    bgColor: "bg-red-50 border-rose-950 text-red-950",
    accentLine: "bg-red-600",
    icon: <Skull className="w-5 h-5 text-red-600 animate-pulse" />,
    badgeText: "DEBT TERMINATION",
    titleColor: "text-red-950"
  };

  switch (toast.type) {
    case 'bankruptcy':
      config = {
        bgColor: "bg-red-100 border-neutral-900 text-red-950 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]",
        accentLine: "bg-red-600",
        icon: <Skull className="w-5 h-5 text-red-600 animate-bounce" />,
        badgeText: "CORPORATE BANKRUPTCY 💀",
        titleColor: "text-red-950 font-black"
      };
      break;

    case 'bailout':
      config = {
        bgColor: "bg-emerald-50 border-neutral-900 text-emerald-950 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]",
        accentLine: "bg-emerald-600",
        icon: <TrendingDown className="w-5 h-5 text-emerald-600" />,
        badgeText: "GOVERNMENT BAILOUT 🏢",
        titleColor: "text-emerald-950 font-black"
      };
      break;

    case 'burnout':
      config = {
        bgColor: "bg-amber-50 border-neutral-900 text-amber-950 shadow-[4px_4px_0px_0px_rgba(245,158,11,1)]",
        accentLine: "bg-amber-500",
        icon: <Flame className="w-5 h-5 text-amber-500 animate-pulse" />,
        badgeText: "BURNOUT COLLAPSE 🔥",
        titleColor: "text-amber-950 font-bold"
      };
      break;

    case 'pip':
      config = {
        bgColor: "bg-rose-50 border-neutral-900 text-rose-950 shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]",
        accentLine: "bg-rose-500",
        icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
        badgeText: "PIP MANDATORY QUARANTINE 📋",
        titleColor: "text-rose-950 font-bold"
      };
      break;

    case 'victory':
      config = {
        bgColor: "bg-violet-50 border-neutral-900 text-violet-950 shadow-[4px_4px_0px_0px_rgba(139,92,246,1)]",
        accentLine: "bg-violet-600",
        icon: <Award className="w-5 h-5 text-violet-600" />,
        badgeText: "CORPORATE VICTORY 🏆",
        titleColor: "text-violet-950 font-black tracking-wide"
      };
      break;

    case 'outsourced':
      config = {
        bgColor: "bg-indigo-50 border-neutral-900 text-indigo-950 shadow-[4px_4px_0px_0px_rgba(79,70,229,1)]",
        accentLine: "bg-indigo-500",
        icon: <Sparkles className="w-5 h-5 text-indigo-500" />,
        badgeText: "OUTSOURCED DIVESTMENT ✨",
        titleColor: "text-indigo-950 font-bold"
      };
      break;

    case 'card':
      config = {
        bgColor: "bg-sky-50 border-neutral-900 text-sky-950 shadow-[4px_4px_0px_0px_rgba(14,165,233,1)]",
        accentLine: "bg-sky-500",
        icon: <Megaphone className="w-5 h-5 text-sky-500" />,
        badgeText: "EXECUTIVE DIRECTIVE 🎙️",
        titleColor: "text-sky-950 font-mono text-[9.5px]"
      };
      break;

    case 'debt_warning':
      config = {
        bgColor: "bg-yellow-50 border-neutral-900 text-yellow-950 shadow-[4px_4px_0px_0px_rgba(234,179,8,1)]",
        accentLine: "bg-yellow-500",
        icon: <FileWarning className="w-5 h-5 text-yellow-600" />,
        badgeText: "AUDITING STRESS OVERDRAFT ⚠️",
        titleColor: "text-yellow-950 font-bold"
      };
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 120, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      layout
      id={`toast-${toast.id}`}
      className={`pointer-events-auto h-auto w-full border-2 border-neutral-950 rounded-none overflow-hidden relative flex flex-col p-3 z-50 ${config.bgColor}`}
    >
      {/* Decorative mechanical indicator tabs */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${config.accentLine}`} />
      
      {/* Top Banner Tag */}
      <div className="flex justify-between items-center pl-1.5 border-b border-neutral-950/20 pb-1.5 mb-1.5">
        <span className="text-[8px] font-mono font-black tracking-widest text-neutral-950/70 uppercase">
          {config.badgeText}
        </span>
        <button
          onClick={() => onRemove(toast.id)}
          className="p-0.5 hover:bg-neutral-950/10 active:bg-neutral-950/20 rounded-none transition-colors border border-transparent hover:border-neutral-950/20"
          id={`close-toast-${toast.id}`}
        >
          <X className="w-3.5 h-3.5 text-neutral-900" />
        </button>
      </div>

      <div className="flex gap-2 text-left pl-1.5">
        {/* Dynamic event icon representation */}
        <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
          {config.icon}
        </div>
        
        {/* Content body messages */}
        <div className="flex-1 space-y-0.5">
          <p className={`text-[10px] leading-tight font-extrabold uppercase ${config.titleColor}`}>
            {toast.title}
          </p>
          <p className="text-[10.5px] font-medium leading-normal tracking-tight">
            {toast.message}
          </p>
          
          {/* Associated Player signature element */}
          {toast.playerName && (
            <div className="flex items-center gap-1.5 pt-1.5 select-none">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: toast.playerColor || '#000' }} />
              <span className="text-[8px] font-mono tracking-tight font-bold text-neutral-600">
                SUBJECT: {toast.playerName.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
