import React, { useEffect, useRef } from 'react';
import { Player, BoardSpace } from '../types';
import { CreditCard, Flame, Award, ShieldAlert, CheckSquare, Sparkles, LogOut, ArrowRight, HelpCircle } from 'lucide-react';
import { playSound } from '../utils/sound';

interface PlayerCardProps {
  key?: React.Key | number | string;
  player: Player;
  isActive: boolean;
  ownedSpaces: BoardSpace[];
  onRestructure?: () => void;
  onOpenSpaceDetails?: (spaceId: number) => void;
  showRestructureBtn?: boolean;
  soundEnabled?: boolean;
}

export default function PlayerCard({
  player,
  isActive,
  ownedSpaces,
  onRestructure,
  onOpenSpaceDetails,
  showRestructureBtn = false,
  soundEnabled = true,
}: PlayerCardProps) {
  // Calculate percentage of credit limit used
  const debtPercentage = Math.min(100, Math.round((player.creditBalance / player.creditLimit) * 100));
  const isOverExtended = player.creditBalance > player.creditLimit;
  const isDebtCritical = player.creditBalance >= 0.8 * player.creditLimit;
  const isTooStressedToRestructure = player.stressLevel >= 80;
  
  // Real foreclosure panic: breached credit threshold and no options left (stress too high to restructure)
  const isForeclosurePanic = isOverExtended && isTooStressedToRestructure && !player.bankrupt && !player.escaped;

  // Audio Hook: Plays funny foreclosure corporate funeral doom sound when terminal debt panic is hit
  const prevForeclosureRef = useRef(false);
  useEffect(() => {
    if (isForeclosurePanic && !prevForeclosureRef.current) {
      if (soundEnabled) {
        playSound('foreclosure');
      }
    }
    prevForeclosureRef.current = isForeclosurePanic;
  }, [isForeclosurePanic, soundEnabled]);

  return (
    <div
      id={`employee_badge_${player.id}`}
      className={`relative border-2 border-neutral-950 p-4 rounded-none transition-all ${
        isActive 
          ? 'bg-amber-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ring-2 ring-amber-400' 
          : 'bg-[#faf7f2]/90 opacity-80'
      } ${player.bankrupt ? 'bg-red-50/50 border-red-950 opacity-50 grayscale select-none' : ''} ${player.escaped ? 'bg-emerald-50 border-emerald-500 shadow-none' : ''} ${
        isForeclosurePanic ? 'animate-foreclosure-panic' : ''
      }`}
    >
      {/* Visual clip holder on top of player card */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-16 h-4 bg-zinc-400 border border-neutral-900 rounded-b-md flex justify-center items-center">
        <div className="w-10 h-1 bg-zinc-600 rounded-full" />
      </div>

      {/* Main Row */}
      <div className="flex justify-between items-start pt-1.5 pb-2.5 border-b border-neutral-300">
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3.5 h-3.5 rounded-full border border-neutral-950"
              style={{ backgroundColor: player.color }}
            />
            <h4 className="text-sm font-mono font-bold text-neutral-900 tracking-tight flex items-center gap-1">
              <span>{player.name}</span>
              {player.isAI && <span className="text-[9px] bg-neutral-200 text-neutral-700 px-1 py-0.2 rounded-xs border border-neutral-300 uppercase">AI Bot</span>}
            </h4>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono tracking-tight text-left block">
            💼 {player.role}
          </span>
        </div>

        {/* Big Avatar */}
        <div className="text-2xl mt-[-4px] select-none">{player.avatar}</div>
      </div>

      {/* Employee Status line */}
      {player.bankrupt && (
        <span className="mt-1 block text-center text-xs font-mono text-red-700 bg-red-100 border border-red-400 py-1 uppercase font-bold">
          💀 BANKRUPT / FIRED
        </span>
      )}
      {player.escaped && (
        <span className="mt-1 block text-center text-xs font-mono text-emerald-700 bg-emerald-100 border border-emerald-400 py-1 uppercase font-bold">
          🎉 RETIRED / ESCAPED!
        </span>
      )}
      {player.inPIP && (
        <span className="mt-1 block text-center text-xs font-mono text-amber-700 bg-amber-100 border border-amber-400 py-1 uppercase font-bold animate-pulse">
          🚨 ON PIP (Isolated)
        </span>
      )}

      {/* Metrics section */}
      {!player.bankrupt && !player.escaped && (
        <div className="py-2.5 space-y-2.5">
          {/* Credit limit debt card */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-neutral-600 items-baseline">
              <span className={`uppercase text-left text-[10px] tracking-tight ${isDebtCritical ? 'text-red-650 font-bold' : ''}`}>
                Corporate Debt Balance
              </span>
              <span className={`font-bold font-mono text-right transition-all ${
                isDebtCritical ? 'animate-debt-critical font-extrabold text-[#ef4444]' : 'text-neutral-900'
              }`}>
                ₹{player.creditBalance} / ₹{player.creditLimit}
              </span>
            </div>
            
            {/* Thermometer Bar */}
            <div className="w-full h-3.5 bg-neutral-200 border border-neutral-900 rounded-none relative overflow-hidden">
              <div
                className={`h-full border-r border-neutral-900 transition-all ${
                  isOverExtended 
                    ? 'bg-red-600' 
                    : debtPercentage > 75 
                      ? 'bg-orange-500' 
                      : 'bg-emerald-600'
                }`}
                style={{ width: `${debtPercentage}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-neutral-800 drop-shadow-xs">
                {debtPercentage}% Limit Capacity Exceeded
              </span>
            </div>

            {/* Segmented ledger node indicators for rich visual confirmation */}
            <div className="flex gap-0.5 justify-between w-full mt-1.5" aria-hidden="true">
              {Array.from({ length: 10 }).map((_, i) => {
                const threshold = (i + 1) * 10;
                const isUsed = debtPercentage >= threshold;
                let activeColor = "bg-neutral-300/60";
                
                if (isUsed) {
                  if (threshold > 80) {
                    activeColor = "bg-red-600 border-red-700 shadow-[0_0_4px_rgba(239,68,68,0.5)]";
                  } else if (threshold > 50) {
                    activeColor = "bg-amber-500 border-amber-600";
                  } else {
                    activeColor = "bg-emerald-600 border-emerald-700";
                  }
                }
                
                return (
                  <div
                    key={i}
                    className={`h-2 flex-1 border border-neutral-900 transition-all duration-300 ${activeColor} ${
                      isDebtCritical && threshold > 80 && isUsed ? 'animate-pulse' : ''
                    }`}
                    title={`${threshold}% of maximum limits reached`}
                  />
                );
              })}
            </div>

            {isOverExtended && (
              <span className="text-[9px] text-red-600 font-bold uppercase tracking-wider block text-left">
                ⚠️ CARD OVER-LIMIT! OUTSOURCING MANDATORY OR FACE BANKRUPTCY
              </span>
            )}
          </div>

          {/* Stress & Interest Double Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Stress thermometer */}
            <div className="border border-neutral-300 p-1.5 bg-white space-y-1">
              <div className="flex justify-between font-mono text-[10px] text-neutral-500 uppercase">
                <span>Burnout</span>
                <span className="font-bold text-neutral-900">{player.stressLevel}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 border border-neutral-400">
                <div
                  className={`h-full transition-all ${
                    player.stressLevel > 75 ? 'bg-orange-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${player.stressLevel}%` }}
                />
              </div>
            </div>

            {/* Passing Interest metric */}
            <div className={`border p-1.5 flex flex-col justify-between transition-all ${
              player.bailoutTurnsRemaining !== undefined && player.bailoutTurnsRemaining > 0
                ? 'border-blue-500 bg-blue-50/50 animate-pulse'
                : 'border-neutral-300 bg-white'
            }`}>
              <div className="font-mono text-[10px] text-neutral-500 uppercase">
                {player.bailoutTurnsRemaining !== undefined && player.bailoutTurnsRemaining > 0 ? 'Bailout Rebate' : 'Passing Interest'}
              </div>
              <div className="font-mono font-bold text-xs mt-0.5">
                {player.bailoutTurnsRemaining !== undefined && player.bailoutTurnsRemaining > 0 ? (
                  <span className="text-blue-700">-{Math.round(player.interestRate * 100)}% Credit ({player.bailoutTurnsRemaining}t)</span>
                ) : (
                  <span className="text-neutral-800">{Math.round(player.interestRate * 100)}% Charge</span>
                )}
              </div>
            </div>
          </div>

          {/* Owned Departments roll */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider text-left">
              Assigned Corporate Projects List ({ownedSpaces.length}):
            </div>
            {ownedSpaces.length === 0 ? (
              <span className="text-[10px] text-neutral-400 font-mono italic block text-left">No operational divisions leased.</span>
            ) : (
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1 bg-white border border-neutral-300">
                {ownedSpaces.map((space) => (
                  <button
                    key={space.id}
                    onClick={() => onOpenSpaceDetails?.(space.id)}
                    className="px-1.5 py-0.5 border border-neutral-800 rounded-none text-[8.5px] font-mono uppercase bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors flex items-center gap-1 shrink-0"
                    title={`Upgrades: ${space.numUpgrades}/4 | click to manage`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: space.groupColor }} />
                    <span className="truncate max-w-[80px]">{space.name}</span>
                    <span className="text-[7.5px] text-neutral-500 font-bold">[{space.numUpgrades}]</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Restructure Liability Option */}
          {showRestructureBtn && isActive && onRestructure && (
            <button
              onClick={onRestructure}
              disabled={player.stressLevel >= 80}
              className="w-full py-1.5 border border-dashed border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all text-[10px] font-mono uppercase font-bold tracking-wider disabled:opacity-40 disabled:hover:text-neutral-500 disabled:pointer-events-none"
              title="Add 1500 to Credit Limit, but add +30% stress and +4% ongoing cycle interest rate."
            >
              🏢 Consolidate / Restructure Debt Limit
            </button>
          )}
        </div>
      )}
    </div>
  );
}
