import React from 'react';
import { ActionCard } from '../types';
import { HelpCircle, Sparkles, UserCheck, AlertOctagon, TrendingDown, DollarSign } from 'lucide-react';

interface CardModalProps {
  card: ActionCard;
  playerName: string;
  onConfirm: () => void;
}

export default function CardModal({ card, playerName, onConfirm }: CardModalProps) {
  const isHr = card.type === 'hr';

  return (
    <div id="card_modal_overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div
        id="card_modal_container"
        className={`w-full max-w-md border-2 border-neutral-950 p-6 ${
          isHr ? 'bg-amber-50 shadow-[6px_6px_0px_0px_rgba(180,83,9,1)]' : 'bg-blue-50 shadow-[6px_6px_0px_0px_rgba(29,78,216,1)]'
        } relative overflow-hidden`}
      >
        {/* Satirical coffee stain overlay decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full border-[6px] border-amber-900/15 pointer-events-none rotate-12 flex items-center justify-center">
          <span className="text-[10px] font-mono font-bold text-amber-900/15 uppercase tracking-widest select-none">OFFICE COFFEE</span>
        </div>

        {/* Header Indicator */}
        <div className="flex justify-between items-start pb-4 border-b border-neutral-400">
          <div>
            <span
              className={`font-mono text-xs uppercase px-2 py-0.5 font-bold ${
                isHr ? 'bg-amber-600 text-white' : 'bg-blue-700 text-white'
              }`}
            >
              💼 {isHr ? 'HR ADMINISTRATIVE AUDIT' : 'C-SUITE DIRECTIVE'}
            </span>
            <div className="text-[10px] text-neutral-500 mt-1 font-mono uppercase">
              FORM-{isHr ? 'PIP-7982' : 'CEO-0012'} // TO: {playerName.toUpperCase()}
            </div>
          </div>
          {isHr ? (
            <AlertOctagon className="w-8 h-8 text-amber-600 animate-pulse" />
          ) : (
            <Sparkles className="w-8 h-8 text-blue-700" />
          )}
        </div>

        {/* Card Body */}
        <div className="py-6 space-y-4">
          <h3 className="text-xl font-mono font-bold text-neutral-900 tracking-tight leading-snug">
            {card.title}
          </h3>

          <p className="text-sm text-neutral-800 leading-relaxed font-sans bg-white/60 p-3 border border-neutral-200">
            {card.text}
          </p>

          <div className="text-xs text-amber-900/80 italic bg-[#fef3c7]/40 p-2 border-l-2 border-amber-500/50">
            &ldquo;{card.flavorText}&rdquo;
          </div>

          {/* Action indicator badge */}
          <div className="border border-neutral-300 bg-white/80 p-3 rounded-xs flex items-center gap-3">
            <div className="p-1.5 bg-neutral-100 rounded-full">
              {card.effectType === 'balance_change' && (
                <DollarSign className={`w-5 h-5 ${card.value >= 0 ? 'text-red-500' : 'text-emerald-600'}`} />
              )}
              {card.effectType === 'limit_change' && (
                <TrendingDown className="w-5 h-5 text-emerald-600" />
              )}
              {card.effectType === 'stress_change' && (
                <HelpCircle className="w-5 h-5 text-amber-600" />
              )}
              {card.effectType === 'go_to_pip' && (
                <AlertOctagon className="w-5 h-5 text-red-600" />
              )}
              {card.effectType === 'free_out_of_pip' && (
                <UserCheck className="w-5 h-5 text-emerald-600" />
              )}
              {['pay_each_player', 'collect_from_each_player'].includes(card.effectType) && (
                <DollarSign className="w-5 h-5 text-purple-600" />
              )}
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
                Financial/Wellness Implication:
              </div>
              <div className="text-sm font-mono font-bold text-neutral-950">
                {card.effectType === 'balance_change' && (
                  <span>
                    {card.value >= 0 
                      ? `+$${card.value} added to your outstanding DEBT balance.` 
                      : `Savings of -$${Math.abs(card.value)} applied to your balance.`}
                  </span>
                )}
                {card.effectType === 'limit_change' && (
                  <span>Credit Limit altered by {card.value >= 0 ? `+$${card.value}` : `-$${Math.abs(card.value)}`}.</span>
                )}
                {card.effectType === 'stress_change' && (
                  <span>Stress level altered by {card.value >= 0 ? `+${card.value}%` : `-${Math.abs(card.value)}%`}.</span>
                )}
                {card.effectType === 'go_to_pip' && (
                  <span className="text-red-600 font-bold uppercase">Sent directly to PIP Isolation. No Salary collected.</span>
                )}
                {card.effectType === 'free_out_of_pip' && (
                  <span className="text-emerald-700">Receive Immunity, zero Stress, and -$200 debt voucher!</span>
                )}
                {card.effectType === 'pay_each_player' && (
                  <span>Sponsored snack credit: Pay each active colleague $${card.value}.</span>
                )}
                {card.effectType === 'collect_from_each_player' && (
                  <span>Coffee fund tax: Siphon $${card.value} from each active colleague.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-300 flex justify-end">
          <button
            onClick={onConfirm}
            className={`w-full py-2.5 border-2 border-neutral-950 text-xs font-mono uppercase font-bold text-white transition-all transform hover:translate-y-[-1px] active:translate-y-[1px] ${
              isHr 
                ? 'bg-amber-700 hover:bg-amber-800' 
                : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            Authorize Document Alignment
          </button>
        </div>
      </div>
    </div>
  );
}
