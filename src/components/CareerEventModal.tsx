import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, AlertOctagon, TrendingUp, TrendingDown, RefreshCw, CheckCircle, HelpCircle } from 'lucide-react';
import { CareerEvent, Player } from '../types';

interface CareerEventModalProps {
  event: CareerEvent;
  player: Player;
  myPlayerIndex: number;
  isMultiplayer: boolean;
  onSelectOption: (option: 'A' | 'B') => void;
  onConfirm: () => void;
}

export const CareerEventModal: React.FC<CareerEventModalProps> = ({
  event,
  player,
  myPlayerIndex,
  isMultiplayer,
  onSelectOption,
  onConfirm
}) => {
  const isMyTurn = isMultiplayer ? (player.id === myPlayerIndex) : !player.isAI;
  const isAITurn = player.isAI;

  // Funny status indicators that cycle while loading from Gemini API
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingPhrases = [
    "Compiling manager sentiments...",
    "Querying toxic department databases...",
    "GELing key performance metrics...",
    "Synergizing binary paradigms...",
    "Calculating passive-aggressive coefficient...",
    "Injecting corporate gaslight parameters..."
  ];

  useEffect(() => {
    if (event.loading) {
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingPhrases.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [event.loading]);

  return (
    <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-[#FAF9F5] border-4 border-neutral-950 text-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col"
      >
        {/* Striped Danger/Warning Banner */}
        <div className="h-4 bg-stripes bg-yellow-400 bg-neutral-950 flex" style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, #facc15, #facc15 10px, #0a0a0a 10px, #0a0a0a 20px)'
        }} />

        <div className="p-5 flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-neutral-200 pb-3">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 bg-neutral-900 text-amber-300">
                Mandatory Career Audit
              </span>
              <h2 className="text-lg font-mono font-black tracking-tight uppercase flex items-center gap-1.5 mt-1 text-neutral-950">
                <Briefcase className="w-5 h-5 text-neutral-950" />
                {event.loading ? "Aligning Directives..." : event.scenarioName}
              </h2>
            </div>
            
            <div className="text-right font-mono text-[10px] text-neutral-500">
              <p>FORM-BA-70%{event.id.substring(0, 3).toUpperCase()}</p>
              <p className="font-bold text-neutral-800">{player.avatar} {player.name}</p>
            </div>
          </div>

          {/* Body Content */}
          {event.loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 font-mono">
              <RefreshCw className="w-8 h-8 text-neutral-900 animate-spin" />
              <p className="text-xs font-bold text-neutral-800 animate-pulse">
                {loadingPhrases[loadingStep]}
              </p>
              <p className="text-[10px] text-neutral-500 max-w-xs">
                Gemini AI is constructing a highly customized corporate scenario tailored to {player.name}'s current job as '{player.role}'.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-neutral-100 border-2 border-neutral-950 p-4 font-mono text-xs text-neutral-800 leading-relaxed relative">
                <HelpCircle className="absolute -top-3.5 -left-3 w-7 h-7 text-neutral-900 fill-[#FAF9F5]" />
                <p className="mt-1 font-sans">{event.situation}</p>
                <div className="mt-3 pt-2.5 border-t border-neutral-300 grid grid-cols-2 text-[10px] text-neutral-500 font-mono">
                  <div>DEBT: ₹{player.creditBalance} / ₹{player.creditLimit}</div>
                  <div className="text-right">STRESS SCORE: {player.stressLevel}%</div>
                </div>
              </div>

              {/* Status information pane based on stage */}
              {!event.resolved ? (
                <div className="space-y-3 font-mono">
                  <div className="text-[10px] uppercase tracking-wide font-black text-neutral-600 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-neutral-700" />
                    CHOOSE YOUR COGNITIVE SYNERGY:
                  </div>

                  {/* Options layout */}
                  <div className="flex flex-col gap-2">
                    {/* Option A Toggle */}
                    <button
                      disabled={!isMyTurn}
                      onClick={() => onSelectOption('A')}
                      className={`group w-full p-3 text-left border-3 border-neutral-950 rounded-none bg-white hover:bg-neutral-50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:pointer-events-none`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[9px] bg-sky-900 text-sky-100 px-1 py-0.2 font-black uppercase tracking-wider">OPTION A</span>
                        <h4 className="text-xs font-bold text-neutral-950 group-hover:text-neutral-950 transition-colors">
                          {event.optionA.label}
                        </h4>
                      </div>
                      <div className="flex gap-2 text-[9px] font-bold">
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                          <TrendingDown className="w-3 h-3 text-emerald-600" />
                          Debt: -₹{Math.abs(event.optionA.debtChange)}
                        </span>
                        <span className="px-1.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3 text-rose-600" />
                          Stress: +{event.optionA.stressChange}%
                        </span>
                      </div>
                    </button>

                    {/* Option B Toggle */}
                    <button
                      disabled={!isMyTurn}
                      onClick={() => onSelectOption('B')}
                      className={`group w-full p-3 text-left border-3 border-neutral-950 rounded-none bg-white hover:bg-neutral-50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:pointer-events-none`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[9px] bg-indigo-900 text-indigo-100 px-1 py-0.2 font-black uppercase tracking-wider">OPTION B</span>
                        <h4 className="text-xs font-bold text-neutral-950 group-hover:text-indigo-900 transition-colors">
                          {event.optionB.label}
                        </h4>
                      </div>
                      <div className="flex gap-2 text-[9px] font-bold">
                        <span className="px-1.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3 text-rose-600" />
                          Debt: +₹{event.optionB.debtChange}
                        </span>
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                          <TrendingDown className="w-3 h-3 text-emerald-600" />
                          Stress: -{Math.abs(event.optionB.stressChange)}%
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Multiplayer and artificial intelligence alerts */}
                  {isMultiplayer && !isMyTurn && (
                    <p className="text-[10px] text-indigo-900 animate-pulse text-center font-bold">
                      🌐 Awaiting {player.name}'s choice. Reflecting corporate hierarchy...
                    </p>
                  )}
                  {isAITurn && (
                    <p className="text-[10px] text-amber-700 animate-pulse text-center font-bold">
                      🤖 AI player is modeling best practices. Selecting in 3.5s...
                    </p>
                  )}
                </div>
              ) : (
                /* Consequence resolution details */
                <div className="space-y-4 font-mono">
                  <div className="flex items-center gap-2 border-b border-dashed border-neutral-300 pb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-neutral-800 uppercase">
                      Decision Outcome Telemetry
                    </span>
                  </div>

                  <div className="p-4 bg-emerald-50/50 border border-emerald-500 text-xs leading-relaxed text-neutral-800">
                    <p className="italic font-bold text-[#1f2937]">
                      {player.name} selected: "{event.chosenOption === 'A' ? event.optionA.label : event.optionB.label}"
                    </p>
                    <p className="mt-2 text-neutral-900 font-sans">{event.consequenceText}</p>
                  </div>

                  {/* Show updated indicators */}
                  <div className="bg-neutral-900 text-[#dfdacd] p-3 text-[10.5px] grid grid-cols-2 text-center rounded-none relative">
                    <div className="border-r border-neutral-800 space-y-1">
                      <p className="text-[9px] uppercase tracking-wide text-neutral-400">Debt Correction</p>
                      <p className={`font-mono text-xs font-black ${
                        (event.chosenOption === 'A' ? event.optionA.debtChange : event.optionB.debtChange) < 0 
                          ? 'text-emerald-400' 
                          : 'text-rose-400'
                      }`}>
                        {event.chosenOption === 'A' 
                          ? (event.optionA.debtChange < 0 ? `-₹${Math.abs(event.optionA.debtChange)} credit` : `+₹${event.optionA.debtChange} liability`)
                          : (event.optionB.debtChange < 0 ? `-₹${Math.abs(event.optionB.debtChange)} credit` : `+₹${event.optionB.debtChange} liability`)
                        }
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase tracking-wide text-neutral-400 font-mono">Biometric Load</p>
                      <p className={`font-mono text-xs font-black ${
                        (event.chosenOption === 'A' ? event.optionA.stressChange : event.optionB.stressChange) <= 0 
                          ? 'text-emerald-400' 
                          : 'text-rose-400'
                      }`}>
                        {event.chosenOption === 'A' 
                          ? (event.optionA.stressChange <= 0 ? `${event.optionA.stressChange}% reduction` : `+${event.optionA.stressChange}% stress burden`)
                          : (event.optionB.stressChange <= 0 ? `${event.optionB.stressChange}% reduction` : `+${event.optionB.stressChange}% stress burden`)
                        }
                      </p>
                    </div>
                  </div>

                  {/* Accept outcome button for human */}
                  {isMyTurn && (
                    <button
                      onClick={onConfirm}
                      className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] hover:translate-y-[1px]"
                    >
                      Acknowledge & Sync Workspace
                    </button>
                  )}
                  
                  {isAITurn && (
                    <p className="text-[10px] text-amber-700 animate-pulse text-center font-bold font-mono">
                      🤖 AI player logged resolution. Auto-closing shift in 4.5s...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
