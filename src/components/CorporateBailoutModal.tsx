import React from 'react';
import { Player } from '../types';
import { Landmark, RefreshCw, Lock, AlertTriangle, TrendingDown } from 'lucide-react';

interface CorporateBailoutModalProps {
  player: Player;
  onAccept: (playerId: number) => void;
  onDecline: (playerId: number) => void;
}

export default function CorporateBailoutModal({ player, onAccept, onDecline }: CorporateBailoutModalProps) {
  const bailoutLimitThreshold = Math.round(player.creditLimit * 0.95);
  const currentInterestPercentage = Math.round(player.interestRate * 100);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#f0f4f8] border-4 border-slate-900 p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
        {/* Aesthetic design watermarks */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full border-4 border-blue-900/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full border-8 border-blue-900/5 pointer-events-none" />

        {/* Section Title */}
        <div className="flex justify-between items-start border-b-2 border-slate-300 pb-4 mb-4">
          <div className="text-left">
            <span className="bg-blue-700 text-white font-mono text-[9px] uppercase font-extrabold px-2 py-0.5 tracking-wider">
              🏛️ FEDERAL LIQUIDITY PROTECTION BOARD
            </span>
            <h2 className="text-lg font-mono font-extrabold text-slate-900 mt-1 uppercase flex items-center gap-1.5 leading-tight">
              <Landmark className="w-5 h-5 text-blue-700 shrink-0" />
              <span>CORPORATE BAILOUT OFFER</span>
            </h2>
          </div>
          <div className="bg-blue-100 text-blue-900 text-[9px] font-mono font-bold uppercase border border-blue-400 px-1.5 py-1 select-none">
            SEC-44a-LIQ
          </div>
        </div>

        {/* Form Body Description */}
        <div className="space-y-4 font-mono text-left text-xs text-slate-800 leading-relaxed">
          <p>
            Employer status review indicates that employee{' '}
            <strong className="text-slate-900">{player.name} ({player.role})</strong> has accumulated liabilities reaching critical debt parameters (within 5% of your max corporate card quota).
          </p>

          {/* Table display */}
          <div className="border border-slate-905 p-3 bg-slate-50 space-y-2">
            <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
              <span>Outstanding Debt:</span>
              <span className="font-bold text-red-600">₹{player.creditBalance}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
              <span>Maximum Limit:</span>
              <span className="font-bold text-slate-900">₹{player.creditLimit}</span>
            </div>
            <div className="flex justify-between">
              <span>Bailout Eligibility Zone (95%):</span>
              <span className="font-bold text-blue-700">₹{bailoutLimitThreshold}</span>
            </div>
          </div>

          <p className="italic text-slate-500 text-[11px] leading-normal border-l-2 border-slate-400 pl-2">
            "Under the Federal Emergency liquidity protection directives, distressed assets may restructure operational interest. Accept immediate liquidity support now to prevent credit foreclosure."
          </p>

          {/* Proposed Bailout Impact Box */}
          <div className="bg-blue-50 border border-blue-500/30 p-3 text-blue-950 space-y-2">
            <h4 className="font-sans font-bold text-blue-800 flex items-center gap-1.5">
              <TrendingDown className="w-4.5 h-4.5 text-blue-700 shrink-0" />
              <span>PROPOSED RESTRUCTURING TERMS:</span>
            </h4>
            <ul className="text-[11px] leading-normal space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-extrabold shrink-0">📈 BENEFITS:</span>
                <span>
                  Flip passing interest charge rate to <strong>NEGATIVE (-{currentInterestPercentage}%)</strong> for the next <strong>3 turns</strong>! Instead of bleeding debt, your interest charges will fully credit your card balance and reduce your overall debt directly on Go & with each skipped turn.
                </span>
              </li>
              <li className="flex items-start gap-1.5 text-slate-800">
                <span className="text-amber-600 font-extrabold shrink-0">⚠️ AUDIT RESTRICTIONS:</span>
                <span>
                  Requires you to <strong>lose 2 consecutive turns</strong>! Operations are frozen during auditing. You will remain on your current board space with no movement, while negative interest dividends are being credited directly.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Buttons section */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2 font-mono">
          <button
            onClick={() => onAccept(player.id)}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            <span>Accept Bailout</span>
          </button>
          
          <button
            onClick={() => onDecline(player.id)}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-900 border-2 border-slate-950 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Reject Offer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
