import React from 'react';
import { Player } from '../types';
import { ShieldAlert, CheckSquare, HeartHandshake, LogOut } from 'lucide-react';

interface BurnoutReportModalProps {
  player: Player;
  onAccept: (playerId: number) => void;
  onDecline: (playerId: number) => void;
}

export default function BurnoutReportModal({ player, onAccept, onDecline }: BurnoutReportModalProps) {
  const thresholdValue = Math.round(player.creditLimit * 0.9);
  const reductionAmount = Math.round(player.creditLimit * 0.40);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#faf7f2] border-4 border-neutral-950 p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {/* Coffee cup watermark aesthetic */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full border-4 border-amber-800/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full border-8 border-amber-800/5 pointer-events-none" />

        {/* Header decoration */}
        <div className="flex justify-between items-start border-b-2 border-neutral-300 pb-4 mb-4">
          <div className="text-left">
            <span className="bg-red-600 text-white font-mono text-[9px] uppercase font-extrabold px-2 py-0.5 tracking-wider">
              🚨 HR URGENT ACTION MEMORANDUM
            </span>
            <h2 className="text-xl font-mono font-extrabold text-neutral-950 mt-1 uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <span>BURNOUT REPORT</span>
            </h2>
          </div>
          <div className="bg-amber-100 text-amber-800 text-[9px] font-mono font-bold uppercase border border-amber-400 p-1 select-none">
            FORM 98-C
          </div>
        </div>

        {/* Body content */}
        <div className="space-y-4 font-mono text-left text-xs text-neutral-800 leading-relaxed">
          <p>
            Employee reference <strong className="text-neutral-950">{player.name} ({player.role})</strong> has breached the critical{' '}
            <span className="font-bold text-red-600">90% Credit Debt Limit Alert Zone</span>.
          </p>

          <div className="border border-neutral-950 p-3 bg-red-50/50 space-y-2">
            <div className="flex justify-between border-b border-dashed border-neutral-300 pb-1">
              <span>Outstanding Card Debt:</span>
              <span className="font-bold text-red-600">₹{player.creditBalance}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-neutral-300 pb-1">
              <span>Hard Credit Limit:</span>
              <span className="font-bold">₹{player.creditLimit}</span>
            </div>
            <div className="flex justify-between">
              <span>Breach Threshold (90%):</span>
              <span className="font-bold text-amber-700">₹{thresholdValue}</span>
            </div>
          </div>

          <p className="italic text-neutral-500 text-[11px] leading-normal border-l-2 border-neutral-400 pl-2">
            "Your continuous presenteeism and lack of personal bandwidth have triggered an automated HR health intervention. Please resolve this immediate deficit or risk mandatory forced layoff."
          </p>

          <div className="bg-emerald-50 border border-emerald-500/30 p-3 text-emerald-950 space-y-1.5">
            <h4 className="font-sans font-bold text-emerald-800 flex items-center gap-1">
              <HeartHandshake className="w-4.5 h-4.5 text-emerald-700 shrink-0" />
              <span>SPECIAL RESCUE ACTION: HR COUNSELING</span>
            </h4>
            <p className="text-[11px] leading-relaxed text-emerald-900">
              Complete restorative consultation. Corporate siphons and audits will immediately{' '}
              <strong className="text-emerald-800">slash your liability by ₹{reductionAmount}</strong> (40% of standard limit).{' '}
              <span className="font-bold text-red-600 block mt-1">⚠️ Cost: Erases all remaining steps/deeds for your current turn.</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2 font-mono">
          <button
            onClick={() => onAccept(player.id)}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase border-2 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Enroll in Counseling</span>
          </button>
          
          <button
            onClick={() => onDecline(player.id)}
            className="flex-1 py-2.5 bg-yellow-105 hover:bg-red-50 hover:text-red-700 text-neutral-900 border-2 border-neutral-950 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Decline and Gamble</span>
          </button>
        </div>
      </div>
    </div>
  );
}
