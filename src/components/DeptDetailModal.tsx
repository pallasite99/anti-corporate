import React from 'react';
import { BoardSpace, Player } from '../types';
import { X, TrendingUp, Cpu, Server, ClipboardList, Hammer, ShieldAlert } from 'lucide-react';

interface DeptDetailModalProps {
  space: BoardSpace;
  owner: Player | null;
  currentPlayer: Player;
  onClose: () => void;
  onUpgrade: () => void;
  onOutsource: () => void;
}

export default function DeptDetailModal({
  space,
  owner,
  currentPlayer,
  onClose,
  onUpgrade,
  onOutsource,
}: DeptDetailModalProps) {
  const isOwner = space.ownerId === currentPlayer.id;
  const rentScales = space.rentScales;

  return (
    <div id="dept_modal_overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div id="dept_modal_bg" className="relative w-full max-w-sm bg-neutral-100 border-2 border-neutral-900 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {/* Manila card file folder tab visual top */}
        <div className="absolute top-0 left-4 -translate-y-full bg-neutral-100 border-t-2 border-x-2 border-neutral-900 px-3 py-1 text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-widest rounded-t-xs">
          DEPT-FILE-{space.id.toString().padStart(2, '0')}
        </div>

        {/* Color bar matching the board group */}
        <div
          className="h-6 border-b-2 border-neutral-930 text-white flex items-center px-3"
          style={{ backgroundColor: space.groupColor || '#525252' }}
        >
          <span className="text-[10px] font-mono tracking-wider uppercase font-bold">
            {space.group || 'GENERAL OVERHEAD'}
          </span>
        </div>

        {/* Closing cross top right */}
        <button
          onClick={onClose}
          className="absolute top-1.5 right-1.5 w-6 h-6 border border-neutral-900 bg-[#fef08a] flex items-center justify-center text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <h2 className="text-xl font-mono font-bold text-neutral-900 tracking-tight leading-none">
              {space.name}
            </h2>
            <p className="mt-1.5 text-xs text-neutral-600 italic">
              &ldquo;{space.description}&rdquo;
            </p>
          </div>

          {/* Core Specs */}
          <div className="border border-neutral-300 p-3 bg-white space-y-2">
            <div className="flex justify-between text-xs border-b border-dashed border-neutral-200 pb-1.5">
              <span className="font-mono text-neutral-500 uppercase">Acquisition Liability:</span>
              <span className="font-mono font-bold text-neutral-900">₹{space.cost} Debt Added</span>
            </div>

            {/* Rent Scale Table */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                Corporate Visitor Workload Rent Scale:
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center bg-neutral-50 px-1 py-0.5">
                  <span className="font-mono">Base Station:</span>
                  <span className="font-mono font-semibold">₹{rentScales[0]}</span>
                </div>
                <div className="flex justify-between items-center px-1 py-0.5">
                  <span className="font-mono">1 {space.upgradeName}:</span>
                  <span className="font-mono font-semibold">₹{rentScales[1]}</span>
                </div>
                <div className="flex justify-between items-center bg-neutral-50 px-1 py-0.5">
                  <span className="font-mono">2 {space.upgradeName}s:</span>
                  <span className="font-mono font-semibold">₹{rentScales[2]}</span>
                </div>
                <div className="flex justify-between items-center px-1 py-0.5">
                  <span className="font-mono">3 {space.upgradeName}s:</span>
                  <span className="font-mono font-semibold">₹{rentScales[3]}</span>
                </div>
                <div className="flex justify-between items-center bg-neutral-50 px-1 py-0.5">
                  <span className="font-mono">4 {space.upgradeName}s (Max):</span>
                  <span className="font-mono font-semibold text-red-700">₹{rentScales[4]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status and Ownership Details */}
          <div className="text-xs bg-neutral-50 p-2.5 border border-neutral-300 font-mono space-y-1 text-neutral-700">
            <div>
              <span className="text-neutral-500 uppercase">Current Proprietor:</span>{' '}
              <span className="font-bold text-neutral-900">
                {owner ? `${owner.name} (${owner.role})` : 'UNMANAGED PROJECT (Bank owned)'}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 uppercase">Bureaucracy Level:</span>{' '}
              <span className="font-bold text-neutral-900">
                {space.outsourced ? 'OUTSOURCED' : `${space.numUpgrades}/4 ${space.upgradeName}s`}
              </span>
            </div>
          </div>

          {/* Outsourced Notice */}
          {space.outsourced && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-300 text-amber-800 text-xs">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>
                Operations in this division are outsourced. Visitors land without paying tax. Un-outsource (re-shore) to resume collection.
              </span>
            </div>
          )}

          {/* Active Interactions */}
          <div className="space-y-2 pt-1">
            {isOwner && !currentPlayer.bankrupt && !currentPlayer.escaped ? (
              <div className="grid grid-cols-2 gap-2">
                {/* Upgrade Button */}
                <button
                  disabled={space.numUpgrades >= 4 || space.outsourced || currentPlayer.creditBalance + space.upgradeCost > currentPlayer.creditLimit}
                  onClick={onUpgrade}
                  className="px-2 py-2 border-2 border-neutral-950 bg-emerald-600 text-white text-xs font-mono font-semibold uppercase hover:bg-emerald-700 active:translate-y-[1px] disabled:opacity-40 disabled:pointer-events-none flex flex-col items-center justify-center gap-1"
                >
                  <Hammer className="w-4 h-4" />
                  <span>Layer Up (₹{space.upgradeCost})</span>
                </button>

                {/* Outsource (Mortgage) Button */}
                <button
                  onClick={onOutsource}
                  disabled={space.outsourced && currentPlayer.creditBalance + Math.round(space.cost * 0.6) > currentPlayer.creditLimit}
                  className="px-2 py-2 border-2 border-neutral-950 bg-amber-300 text-neutral-950 text-xs font-mono font-semibold uppercase hover:bg-amber-400 active:translate-y-[1px] flex flex-col items-center justify-center gap-1"
                >
                  <Cpu className="w-4 h-4" />
                  <span>
                    {space.outsourced 
                      ? 'In-House (+₹' + Math.round(space.cost * 0.6) + ')' 
                      : 'Outsource (-₹' + Math.round(space.cost * 0.5) + ')'}
                  </span>
                </button>
              </div>
            ) : null}

            {/* Unowned Purchase button */}
            {!owner && !currentPlayer.bankrupt && !currentPlayer.escaped ? (
              <button
                disabled={currentPlayer.creditBalance + space.cost > currentPlayer.creditLimit}
                onClick={onUpgrade} // reuse same upgrade sequence but trigger buying state
                className="w-full py-2.5 border-2 border-neutral-950 bg-neutral-900 text-white text-xs font-mono font-bold uppercase hover:bg-neutral-800 tracking-wider disabled:opacity-30 disabled:pointer-events-none"
              >
                Delegate Project Division (Add ₹{space.cost} Debt)
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
