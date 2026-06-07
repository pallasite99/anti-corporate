import React from 'react';
import { BoardSpace, Player } from '../types';
import { calculateSpaceRent } from '../utils/gameLogic';
import { Flame, Star, ShieldAlert, Zap, Construction } from 'lucide-react';

interface BoardProps {
  spaces: BoardSpace[];
  players: Player[];
  currentPlayerId: number;
  selectedSpaceId: number | null;
  onSelectSpace: (id: number) => void;
  children?: React.ReactNode; // Middle block visual content
}

function getSpaceCoords(id: number): { row: number; col: number } {
  if (id >= 0 && id <= 8) {
    return { row: 8, col: id };
  } else if (id >= 8 && id <= 16) {
    return { row: 16 - id, col: 8 };
  } else if (id >= 16 && id <= 24) {
    return { row: 0, col: 24 - id };
  } else {
    return { row: id - 24, col: 0 };
  }
}

export default function Board({
  spaces,
  players,
  currentPlayerId,
  selectedSpaceId,
  onSelectSpace,
  children,
}: BoardProps) {
  // Find all players landed on a specific space
  const getPlayersOnSpace = (spaceId: number): Player[] => {
    return players.filter((p) => p.position === spaceId && !p.bankrupt);
  };

  return (
    <div id="game_board_viewport" className="relative w-full aspect-square max-w-[700px] mx-auto bg-[#efebe4] p-2 border-4 border-neutral-900 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      {/* Visual office floor background lines representing tile separators */}
      <div className="absolute inset-0 grid grid-cols-9 grid-rows-9 opacity-5 pointer-events-none border-2 border-neutral-900" />

      {/* Grid container */}
      <div id="board_grid" className="w-full h-full grid grid-cols-9 grid-rows-9 gap-1">
        {/* Render 24 Board Spaces */}
        {spaces.map((space) => {
          const coords = getSpaceCoords(space.id);
          const spacePlayers = getPlayersOnSpace(space.id);
          const isSelected = selectedSpaceId === space.id;
          
          // Get owner avatar if owned
          const owner = space.ownerId !== null ? players[space.ownerId] : null;

          // Corner tiles styling
          const isCorner = [0, 8, 16, 24].includes(space.id);

          return (
            <div
              key={space.id}
              onClick={() => onSelectSpace(space.id)}
              style={{
                gridRowStart: coords.row + 1,
                gridColumnStart: coords.col + 1,
              }}
              className={`relative flex flex-col justify-between border-2 border-neutral-900 p-1 cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-amber-100 ring-2 ring-orange-400 z-10 scale-[1.02] shadow-md' 
                  : isCorner 
                    ? 'bg-[#e2ddd5] hover:bg-[#eae6de]' 
                    : 'bg-[#faf7f2] hover:bg-[#f6f2e9]'
              }`}
            >
              {/* Ownership Color Bar / Indicator */}
              {!isCorner && space.type === 'department' && (
                <div
                  className="h-2 w-full border-b border-neutral-800 -mt-1 -mx-1"
                  style={{ backgroundColor: space.groupColor || '#525252' }}
                />
              )}

              {/* Title / Info */}
              <div className="flex flex-col h-full justify-between select-none">
                <div className="text-[9px] font-mono leading-tight font-bold text-neutral-800 line-clamp-2 mt-0.5" title={space.name}>
                  {space.name}
                </div>

                {/* Center visual representation / values */}
                <div className="flex items-center justify-between text-[9px] font-mono mt-1 text-neutral-400">
                  {/* Space Icon based on type */}
                  <span className="text-sm">
                    {space.id === 0 && '⏰'}
                    {space.id === 8 && '☕'}
                    {space.id === 16 && '🔒'}
                    {space.id === 24 && '🚨'}
                    {space.type === 'action_hr' && '📝'}
                    {space.type === 'action_townhall' && '🎙️'}
                    {(space.type === 'tax_audit' || space.type === 'tax_overtime') && '🧾'}
                    {space.type === 'department' && '💼'}
                  </span>

                  {/* Price tag or status */}
                  {space.type === 'department' && (
                    <span className="font-semibold text-neutral-600">
                      {space.outsourced ? (
                        <span className="text-amber-600 font-bold">OUTS</span>
                      ) : (
                        <span>₹{space.cost}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Ownership ribbon indicator */}
              {owner && (
                <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-neutral-900 text-white rounded-none px-1 py-0.2 text-[8px] font-mono scale-90">
                  <span style={{ color: owner.color }}>●</span>
                  <span>{owner.name.substring(0, 3)}</span>
                </div>
              )}

              {/* Bureaucracy upgrade level items (Red/Green cubicle dots) */}
              {space.numUpgrades > 0 && !space.outsourced && (
                <div className="absolute top-3 left-1 flex gap-0.5">
                  {Array.from({ length: space.numUpgrades }).map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-red-600 border border-neutral-900" title="Bureaucracy Cubicle Upgrade" />
                  ))}
                </div>
              )}

              {/* Landed Players floating badges container */}
              {spacePlayers.length > 0 && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex -space-x-1 justify-center z-20">
                  {spacePlayers.map((player) => {
                    const isActive = players[currentPlayerId].id === player.id;
                    const isBurnoutRisk = player.creditBalance > 0.8 * player.creditLimit;
                    return (
                      <div
                        key={player.id}
                        className={`relative w-6 h-6 rounded-full border-2 border-neutral-950 flex items-center justify-center text-xs shadow-xs transition-transform transform ${
                          isActive 
                            ? 'translate-y-[-4px] scale-110 ring-2 ring-lime-400 z-30' 
                            : 'scale-90'
                        } ${isBurnoutRisk ? 'animate-burnout-shake grayscale' : ''}`}
                        style={{ backgroundColor: player.color }}
                        title={`${player.name} (${player.role})${isBurnoutRisk ? ' - ⚠️ BURNOUT RISK! Debt exceeded 80% of credit limit.' : ''}`}
                      >
                        <span className="select-none">{player.avatar}</span>
                        
                        {/* Burnout indicator badge */}
                        {isBurnoutRisk && (
                          <div 
                            className="absolute -top-1.5 -right-1.5 bg-red-600 text-[8px] animate-pulse rounded-full w-3.5 h-3.5 flex items-center justify-center text-white border border-neutral-950 shadow-sm z-40"
                            title="⚠️ Burnout Status: Credit Debt > 80% of Limit!"
                          >
                            🔥
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Middle content block (7x7 grid cells spanning Center) */}
        <div id="board_center_box" className="col-start-2 col-end-9 row-start-2 row-end-9 bg-[#dfdacd]/60 border-2 border-dashed border-neutral-600/40 p-4 flex flex-col justify-between overflow-hidden relative">
          {/* Fictional watermark logo in the paper deck */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none rotate-[-15deg]">
            <h1 className="text-5xl font-mono tracking-tighter text-black font-extrabold uppercase">
              DEBT LIFE
            </h1>
          </div>

          {/* Diagonally oriented Monopoly-inspired card piles */}
          {/* Top-Right: HR Community Audit Stack */}
          <div 
            className="absolute top-3 right-3 w-24 h-16 border border-dashed border-neutral-600 bg-sky-50 shadow-[3px_3px_0px_0px_rgba(30,58,138,0.35)] hover:shadow-[4px_4px_0px_0px_rgba(30,58,138,0.5)] rotate-[15deg] hover:rotate-[9deg] transition-all duration-300 group cursor-help z-20 flex flex-col justify-between p-1 select-none overflow-hidden"
            title="COMMUNITY AUDIT DECK: Contains HR files, compliance training audits, and employee reviews. Land on any HR (📝) space to pull a card!"
          >
            {/* Folder card tab line */}
            <div className="absolute left-0 top-0 h-1 w-full bg-sky-700" />
            <div className="text-[6.5px] font-mono leading-none font-bold text-sky-800 bg-sky-100 py-0.5 px-0.8 tracking-wider uppercase border-b border-sky-200">
              AUDIT DOSSIER
            </div>
            
            <div className="text-center font-mono font-extrabold text-[8px] text-neutral-800 uppercase tracking-tighter py-0.5">
              COMMUNITY<br/>CHEST
            </div>
            
            <div className="flex justify-between items-center text-[7px] font-mono text-sky-700 font-bold px-0.5">
              <span>DECK A</span>
              <span>📝</span>
            </div>
            
            {/* Visual multi-stack papers beneath */}
            <div className="absolute -bottom-1 -right-1 w-full h-full border border-neutral-400 bg-white/70 -z-10 transform translate-x-1.5 translate-y-1" />
            <div className="absolute -bottom-2 -right-2 w-full h-full border border-neutral-350 bg-white/40 -z-20 transform translate-x-3 translate-y-2" />
          </div>

          {/* Bottom-Left: Townhall Incident / Chance Stack */}
          <div 
            className="absolute bottom-3 left-3 w-24 h-16 border border-dashed border-neutral-600 bg-rose-50 shadow-[3px_3px_0px_0px_rgba(153,27,27,0.35)] hover:shadow-[4px_4px_0px_0px_rgba(153,27,27,0.5)] rotate-[-15deg] hover:rotate-[-9deg] transition-all duration-300 group cursor-help z-20 flex flex-col justify-between p-1 select-none overflow-hidden"
            title="CHANCE INCIDENTS DECK: Contains townhall mandates, restructuring announcements, and executive directives. Land on any Townhall (🎙️) space to pull a card!"
          >
            {/* Card header card stripes */}
            <div className="absolute right-0 top-0 h-1 w-full bg-rose-700" />
            <div className="text-[6.5px] font-mono leading-none font-bold text-rose-800 bg-rose-100 py-0.5 px-0.8 tracking-wider uppercase border-b border-rose-200">
              EXECUTIVE MEMO
            </div>
            
            <div className="text-center font-mono font-extrabold text-[8px] text-neutral-800 uppercase tracking-tighter py-0.5">
              INCIDENT<br/>CHANCE
            </div>
            
            <div className="flex justify-between items-center text-[7px] font-mono text-rose-700 font-bold px-0.5">
              <span>🎙️</span>
              <span>DECK B</span>
            </div>
            
            {/* Visual multi-stack paper shadows beneath */}
            <div className="absolute -top-1 -left-1 w-full h-full border border-neutral-400 bg-white/70 -z-10 transform -translate-x-1.5 -translate-y-1" />
            <div className="absolute -top-2 -left-2 w-full h-full border border-neutral-350 bg-white/40 -z-20 transform -translate-x-3 -translate-y-2" />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
