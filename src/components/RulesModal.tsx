import React from 'react';
import { OFFICE_DESPAIR_DISCLAIMER } from '../constants';
import { X, Clipboard, CreditCard, Flame, TrendingUp, AlertTriangle } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export default function RulesModal({ onClose }: RulesModalProps) {
  return (
    <div id="rules_modal_overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div id="rules_modal_content" className="relative w-full max-w-2xl bg-[#faf7f2] border-2 border-neutral-900 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#fef08a] border-b-2 border-neutral-900 p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-neutral-800" />
            <h2 className="text-xl font-mono font-bold text-neutral-900 uppercase tracking-tight">STANDARD OPERATING PROCEDURE</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-neutral-800">
          <div>
            <span className="bg-neutral-900 text-amber-300 font-mono text-xs uppercase font-semibold px-2 py-0.5">PURPOSE</span>
            <p className="mt-2 text-sm">
              Welcome to <span className="font-bold underline">Anti-Corporate</span>. Unlike traditional capitalist simulators where you hoard wealth, this is an administrative struggle of endurance. You are an employee carrying heavy credit debt. Your ultimate goal is to <strong>reduce your debt liability to $0</strong> or force everyone else's credit lines to collapse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-neutral-300 p-3 bg-white space-y-1.5">
              <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span className="text-xs uppercase font-mono">1. Debt is Currency</span>
              </div>
              <p className="text-xs text-neutral-600">
                You do not hold cash. Every transaction—buying divisions, paying office rents, buying overpriced coffee—increases your <strong>Credit Card Balance</strong>. You suffer <strong>Interest</strong> on your balances when passing Go!
              </p>
            </div>

            <div className="border border-neutral-300 p-3 bg-white space-y-1.5">
              <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                <TrendingUp className="w-4 h-4 text-red-500" />
                <span className="text-xs uppercase font-mono">2. Workload Tax</span>
              </div>
              <p className="text-xs text-neutral-600">
                Land on owned "divisions" to pay "Bandwidth Tax" (rent). Claim divisions to force colleagues to spend on your departments, which directly reduces your outstanding balance!
              </p>
            </div>

            <div className="border border-neutral-300 p-3 bg-white space-y-1.5">
              <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs uppercase font-mono">3. Stress & Burnout</span>
              </div>
              <p className="text-xs text-neutral-600">
                Avoid high stress spaces like unpaid weekend overtime audits. If your Stress Level reaches 100%, you suffer a burnout event and must pay $200 in medical fees.
              </p>
            </div>

            <div className="border border-neutral-300 p-3 bg-white space-y-1.5">
              <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs uppercase font-mono">4. Out of PIP</span>
              </div>
              <p className="text-xs text-neutral-600">
                Sent to PIP (Performance Improvement Plan)? You are isolated. You cannot collect rent, and must roll doubles or serve 3 rounds with fine to escape.
              </p>
            </div>
          </div>

          <div>
            <span className="bg-neutral-800 text-white font-mono text-xs uppercase font-bold px-2 py-0.5">VICTORY CONDITIONS</span>
            <ul className="mt-2 list-disc list-inside text-sm space-y-2 text-neutral-700">
              <li><strong>Financial Freedom:</strong> Successfully reduce your Credit Card Balance (liability) to <strong>₹0</strong>. You win, resign immediately, and claim early retirement!</li>
              <li><strong>Last Worker Standing:</strong> Bankrupt everyone else. A player is bankrupt when they exceed their <strong>Credit Limit</strong> and cannot afford expenses.</li>
              <li><strong>C-Suite Directorship:</strong> Fully monopolize 3 complete department groups (e.g., Extreme Presenteeism, Vaporware Tech) to assume CEO duties.</li>
            </ul>
          </div>

          <div className="border-t border-neutral-300 pt-4 text-[11px] text-neutral-500 leading-relaxed font-mono">
            {OFFICE_DESPAIR_DISCLAIMER}
          </div>
        </div>

        <div className="bg-[#f3efe5] border-t border-neutral-300 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors font-mono uppercase text-xs"
          >
            I Acknowledge My Despair
          </button>
        </div>
      </div>
    </div>
  );
}
