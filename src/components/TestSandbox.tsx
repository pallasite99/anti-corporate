import React, { useState } from 'react';
import { runTests } from '../utils/gameLogic.test';
import { GameState } from '../types';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TestSandboxProps {
  gameState: GameState;
  onModifyState: (updater: (state: GameState) => GameState) => void;
}

export default function TestSandbox({ gameState, onModifyState }: TestSandboxProps) {
  const [testOutput, setTestOutput] = useState<string[]>([]);
  const [testsPassed, setTestsPassed] = useState<boolean | null>(null);

  const handleRunSystemTests = () => {
    const results = runTests();
    setTestOutput(results.results);
    setTestsPassed(results.success);
  };

  const handleForcePip = (playerId: number, target: boolean) => {
    onModifyState((prev) => {
      const updated = { ...prev };
      const player = { ...updated.players[playerId] };
      player.inPIP = target;
      if (target) {
        player.position = 16; // Go to PIP space
        player.turnsInPIP = 1;
      } else {
        player.turnsInPIP = 0;
      }
      updated.players[playerId] = player;
      return updated;
    });
  };

  const handleAdjustDebt = (playerId: number, value: number) => {
    onModifyState((prev) => {
      const updated = { ...prev };
      const player = { ...updated.players[playerId] };
      player.creditBalance = Math.max(0, player.creditBalance + value);
      updated.players[playerId] = player;
      return updated;
    });
  };

  const handleAdjustStress = (playerId: number, value: number) => {
    onModifyState((prev) => {
      const updated = { ...prev };
      const player = { ...updated.players[playerId] };
      player.stressLevel = Math.max(0, Math.min(100, player.stressLevel + value));
      updated.players[playerId] = player;
      return updated;
    });
  };

  const handleForceDice = (die1: number, die2: number) => {
    onModifyState((prev) => {
      // Set the force values in dice, but let the user roll or apply immediately
      // Actually, we can roll it right now by checking state
      return {
        ...prev,
        dice: [die1, die2] as [number, number],
        hasRolled: false // allow rolling this forced pair!
      };
    });
  };

  const activePlayer = gameState.players[gameState.currentPlayerId];

  return (
    <div id="test_sandbox_panel" className="bg-[#1e1e1e] border-2 border-orange-500 rounded-none p-4 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] text-amber-100 font-mono text-xs space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-orange-500/50 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-orange-400">
          <AlertTriangle className="w-4 h-4 animate-pulse text-orange-500" />
          <span>ADMIN QA ENGINEERING DESK</span>
        </div>
        <span className="text-[9px] bg-orange-950 text-orange-300 px-1.5 py-0.5 uppercase tracking-wider">
          Testing Console Mode
        </span>
      </div>

      <p className="text-[10px] text-zinc-400 leading-snug">
        Use this panel to simulate exact game mechanics, trigger states, or trigger the standalone system automated test suite. Satisfies QA specification checkouts.
      </p>

      {/* Unit Tests trigger */}
      <div className="bg-zinc-900 border border-zinc-800 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#facc15] uppercase tracking-wide">1. Core Compliance Logic Verification</span>
          <button
            onClick={handleRunSystemTests}
            className="px-2.5 py-1 bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold uppercase text-[10px] flex items-center gap-1 transition-colors border border-amber-300"
          >
            <Play className="w-3 h-3 fill-zinc-950" /> Run QA Suite
          </button>
        </div>

        {testsPassed !== null && (
          <div className={`p-2 border flex items-center gap-2 text-[11px] ${
            testsPassed ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-red-950/40 border-red-500/40 text-red-300'
          }`}>
            {testsPassed ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{testsPassed ? "ALL AUDIT CHECKS CONFIRMED GREEN." : "VERIFICATION DISCREPANCY DETECTED."}</span>
          </div>
        )}

        {testOutput.length > 0 && (
          <div className="bg-black text-lime-400 text-[10px] p-2 rounded-xs border border-zinc-800 max-h-32 overflow-y-auto font-mono whitespace-pre-wrap leading-tight">
            {testOutput.map((line, idx) => (
              <div key={idx} className={line.startsWith('✅') ? 'text-lime-400' : line.startsWith('❌') ? 'text-red-400' : 'text-zinc-300'}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* State Forcing Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Player Forcer */}
        <div className="bg-zinc-900 border border-zinc-800 p-3 space-y-2.5">
          <div className="font-bold text-[#facc15] border-b border-zinc-800 pb-1 text-[11px] uppercase">
            2. Force Active Employee State ({activePlayer.name})
          </div>
          <div className="space-y-2">
             {/* Debt Modifiers */}
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-400">Restructure Assets / Debt Balance:</span>
              <div className="flex gap-1.5 items-center">
                <button
                  onClick={() => handleAdjustDebt(activePlayer.id, -500)}
                  className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-650 border border-zinc-700 text-white"
                >
                  -₹500 Debt
                </button>
                <button
                  onClick={() => handleAdjustDebt(activePlayer.id, 500)}
                  className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-650 border border-zinc-700 text-white"
                >
                  +₹500 Debt
                </button>
                <button
                  onClick={() => onModifyState((prev) => {
                    const updated = { ...prev };
                    const player = { ...updated.players[activePlayer.id] };
                    player.creditBalance = Math.round(player.creditLimit * 0.95);
                    player.dismissedBurnoutThisTurn = false;
                    player.usedHrCounseling = false;
                    updated.players[activePlayer.id] = player;
                    return updated;
                  })}
                  className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 font-bold"
                  title="Force player's debt to 95% of limit to test Burnout Report"
                >
                  💥 95% Debt
                </button>
              </div>
            </div>

            {/* Stress Modifiers */}
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-400">Stress Mitigation / Elevation:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleAdjustStress(activePlayer.id, -20)}
                  className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white"
                >
                  -20 Stress
                </button>
                <button
                  onClick={() => handleAdjustStress(activePlayer.id, 20)}
                  className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white"
                >
                  +20 Stress
                </button>
              </div>
            </div>

            {/* PIP Toggler */}
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-400">HR Direct Disciplinary Action:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleForcePip(activePlayer.id, true)}
                  className="px-2 py-0.5 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 font-bold"
                >
                  Force PIP
                </button>
                <button
                  onClick={() => handleForcePip(activePlayer.id, false)}
                  className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 font-bold"
                >
                  Clear PIP
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dice Preset Roller */}
        <div className="bg-zinc-900 border border-zinc-800 p-3 space-y-2.5">
          <div className="font-bold text-[#facc15] border-b border-zinc-800 pb-1 text-[11px] uppercase">
            3. Force Matrix Dice Values
          </div>
          <p className="text-[9px] text-zinc-500 font-mono">
            Click to force the next roll values to trigger specific grid spaces or doubles logic.
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <button
              onClick={() => handleForceDice(1, 1)}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-center"
            >
              Force Doubles (1, 1)
            </button>
            <button
              onClick={() => handleForceDice(3, 3)}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-center"
            >
              Force Doubles (3, 3)
            </button>
            <button
              onClick={() => handleForceDice(4, 2)}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-center"
            >
              Force Move 6 spaces
            </button>
            <button
              onClick={() => handleForceDice(6, 6)}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-center text-orange-400 font-semibold"
            >
              Force Move 12 spaces
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
