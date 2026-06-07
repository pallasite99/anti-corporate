import { GameState, Player, BoardSpace, ActionCard, GameLog } from '../types';
import { INITIAL_SPACES, HR_CARDS, TOWNHALL_CARDS, ROLE_PRESETS } from '../constants';

// Help helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

export function createInitialState(
  playersInput: Array<{ name: string; roleIndex: number; isAI: boolean }>
): GameState {
  const players: Player[] = playersInput.map((input, index) => {
    const preset = ROLE_PRESETS[input.roleIndex];
    return {
      id: index,
      name: input.name || `Employee #${index + 1}`,
      role: preset.name,
      color: preset.accentColor,
      avatar: preset.avatar,
      isAI: input.isAI,
      creditLimit: preset.startingLimit,
      creditBalance: preset.startingBalance, // Their beginning debt
      interestRate: preset.interestRate,
      stressLevel: 0,
      position: 0,
      isVisiting: false,
      inPIP: false,
      turnsInPIP: 0,
      bankrupt: false,
      escaped: false,
      consecutiveDoubles: 0,
      usedHrCounseling: false,
      dismissedBurnoutThisTurn: false,
    };
  });

  const spaces: BoardSpace[] = INITIAL_SPACES.map((space) => ({ ...space }));

  const startLog: GameLog = {
    id: generateId(),
    timestamp: new Date().toLocaleTimeString(),
    type: 'system',
    message: "📊 Corporate Quarter Commenced. All employees have clocked-in with heavy credit card debts. Minimize your liability to reach financial freedom ($0 debt)!",
  };

  return {
    players,
    spaces,
    currentPlayerId: 0,
    dice: [1, 1],
    hasRolled: false,
    log: [startLog],
    turnCount: 1,
    selectedSpaceId: null,
    activeCard: null,
    gameSpeed: 'normal',
    aiLogText: '',
    winnerId: null,
    victoryType: null,
    showTestConsole: false,
    burnoutPlayerId: null,
    bailoutPlayerId: null,
  };
}

export function logMessage(
  state: GameState,
  type: GameLog['type'],
  message: string,
  playerId?: number
): GameState {
  const newLog: GameLog = {
    id: generateId(),
    timestamp: new Date().toLocaleTimeString(),
    type,
    message,
    playerId,
  };
  return {
    ...state,
    log: [newLog, ...state.log].slice(0, 100), // Keep last 100 logs
  };
}

// Calculate the bandwidth tax (rent) for a space
export function calculateSpaceRent(space: BoardSpace, spaces: BoardSpace[]): number {
  if (space.outsourced || space.ownerId === null) return 0;

  // Check if owner owns the full group
  const groupMembers = spaces.filter((s) => s.group === space.group);
  const isMonopoly = groupMembers.every((s) => s.ownerId === space.ownerId && !s.outsourced);

  const rentScaleValue = space.rentScales[space.numUpgrades] || space.baseRent;
  
  if (isMonopoly && space.numUpgrades === 0) {
    return rentScaleValue * 2; // Double rent for complete group ownership
  }

  return rentScaleValue;
}

// Check victory conditions
export function checkGameEnd(state: GameState): GameState {
  let updatedState = { ...state };
  const activePlayers = updatedState.players.filter((p) => !p.bankrupt && !p.escaped);

  // Check if any player reached Financial Freedom ($0 debt)
  const financialFreedomWinner = updatedState.players.find((p) => p.creditBalance <= 0 && !p.bankrupt);
  if (financialFreedomWinner && !updatedState.winnerId) {
    updatedState.winnerId = financialFreedomWinner.id;
    updatedState.victoryType = 'financial_freedom';
    financialFreedomWinner.escaped = true;
    financialFreedomWinner.creditBalance = 0;
    updatedState = logMessage(
      updatedState,
      'victory',
      `🏆 FINANCIAL FREEDOM! ${financialFreedomWinner.name} (${financialFreedomWinner.role}) paid off 100% of their corporate debt, resigned in style, and escaped corporate slavery!`,
      financialFreedomWinner.id
    );
    return updatedState;
  }

  // Check if only one player is left standing
  if (activePlayers.length === 1 && updatedState.players.filter((p) => !p.bankrupt).length > 1) {
    const lastStanding = activePlayers[0];
    updatedState.winnerId = lastStanding.id;
    updatedState.victoryType = 'last_standing';
    updatedState = logMessage(
      updatedState,
      'victory',
      `🏆 LAST WORKER STANDING! ${lastStanding.name} survived because all other players have declared bankruptcy. Welcome to absolute dominance of the cubicle rows!`,
      lastStanding.id
    );
    return updatedState;
  }

  // Check for C-Suite Takeover (Alternative: owns 4 property groups and is rich)
  for (const player of updatedState.players) {
    if (player.bankrupt || player.escaped) continue;
    const ownedGroups = new Set<string>();
    
    // Find groups fully owned by this player
    const groupsInGame = Array.from(new Set(updatedState.spaces.filter((s) => s.group).map((s) => s.group as string)));
    for (const group of groupsInGame) {
      const groupSpaces = updatedState.spaces.filter((s) => s.group === group);
      const fullyOwned = groupSpaces.every((s) => s.ownerId === player.id);
      if (fullyOwned) ownedGroups.add(group);
    }

    if (ownedGroups.size >= 3) {
      // CEO takeover!
      updatedState.winnerId = player.id;
      updatedState.victoryType = 'ceo_takeover';
      updatedState = logMessage(
        updatedState,
        'victory',
        `🏆 C-SUITE COUP! ${player.name} fully monopolized 3 key company divisions (${Array.from(ownedGroups).join(', ')}). You are promoted directly to Executive Director! The remaining players are forced to report to your new desk.`,
        player.id
      );
      break;
    }
  }

  return updatedState;
}

// Roll Dice logic
export function handleRollDice(state: GameState, forceRoll?: [number, number]): GameState {
  if (state.hasRolled && !forceRoll) return state;

  const die1 = forceRoll ? forceRoll[0] : Math.floor(Math.random() * 6) + 1;
  const die2 = forceRoll ? forceRoll[1] : Math.floor(Math.random() * 6) + 1;
  const rollsSum = die1 + die2;
  const isDoubles = die1 === die2;

  let updatedState = { ...state, dice: [die1, die2] as [number, number], hasRolled: true };
  let player = { ...updatedState.players[updatedState.currentPlayerId] };

  updatedState = logMessage(
    updatedState,
    'roll',
    `🎲 rolled ${die1} and ${die2} (Total: ${rollsSum})${isDoubles ? ' [DOUBLES!]' : ''}`,
    player.id
  );

  if (isDoubles) {
    player.consecutiveDoubles += 1;
    if (player.consecutiveDoubles >= 3) {
      // 3 doubles in a row triggers HR alarm -> PIP!
      player.inPIP = true;
      player.position = 16; // PIP Space
      player.consecutiveDoubles = 0;
      updatedState.players[player.id] = player;
      updatedState = logMessage(
        updatedState,
        'pip',
        `🚨 RED FLAG! ${player.name} rolled 3 doubles in a row. HR flagged this extreme coordination as suspicious 'collaboration padding.' Sent directly to PIP!`,
        player.id
      );
      return checkGameEnd(updatedState);
    } else {
      // Grant standard double alignment bonus for non-failing doubles!
      const debtSubsidy = 100;
      const stressRelief = 15;
      player.creditBalance = Math.max(0, player.creditBalance - debtSubsidy);
      player.stressLevel = Math.max(0, player.stressLevel - stressRelief);
      updatedState = logMessage(
        updatedState,
        'system',
        `✨ DOUBLE SYNERGY BONUS! ${player.name} rolled doubles and unlocked a corporate alignment stipend. Credit card balance reduced by $${debtSubsidy} and stress level eased by ${stressRelief}%!`,
        player.id
      );
    }
  } else {
    player.consecutiveDoubles = 0;
  }

  if (player.inPIP) {
    if (isDoubles) {
      player.inPIP = false;
      player.turnsInPIP = 0;
      updatedState = logMessage(
        updatedState,
        'pip',
        `🔓 PIP PASSED! ${player.name} rolled doubles and successfully authored a 50-page Self-Evaluation Apology Letter. Liberated back to the cubicle!`,
        player.id
      );
      // Move them after getting out!
    } else {
      player.turnsInPIP += 1;
      if (player.turnsInPIP >= 3) {
        // Automatic out after 3 turns with a fine
        player.inPIP = false;
        player.turnsInPIP = 0;
        player.creditBalance += 150; // Fine
        updatedState = logMessage(
          updatedState,
          'pip',
          `⏳ PIP OUT OF TIME! ${player.name} spent 3 consecutive quarters failing PIP. HR billed a $150 consulting fine to clear their record. Released.`,
          player.id
        );
      } else {
        updatedState = logMessage(
          updatedState,
          'pip',
          `🔒 PIP PENDING: ${player.name} did not roll doubles. Remains in review board isolation (Term ${player.turnsInPIP}/3).`,
          player.id
        );
        updatedState.players[player.id] = player;
        return checkGameEnd(updatedState);
      }
    }
  }

  // Move player
  const oldPosition = player.position;
  const newPosition = (oldPosition + rollsSum) % state.spaces.length;
  player.position = newPosition;

  // Handle Passing Clock-In Desk (Go)
  if (newPosition < oldPosition) {
    // Passed Go! Subtract base salary and add passive stress/interest
    const isBailoutActive = player.bailoutTurnsRemaining !== undefined && player.bailoutTurnsRemaining > 0;
    const effectiveRate = isBailoutActive ? -player.interestRate : player.interestRate;
    const interestCharge = Math.round(player.creditBalance * effectiveRate);
    const salaryRelief = 1200;
    
    // Apply changes
    player.creditBalance = Math.max(0, player.creditBalance - salaryRelief + interestCharge);
    
    // Passive stress increase on new cycle or depending on high interest rates
    player.stressLevel = Math.min(100, player.stressLevel + 10);

    if (isBailoutActive) {
      updatedState = logMessage(
        updatedState,
        'debt',
        `💼 PASSED CLOCK-IN DESK (BAILOUT TIME)! Received ₹1,200 salary, and received a ₹${Math.abs(interestCharge)} negative interest credit (reducing debt by -₹${Math.abs(interestCharge)}). Net Debt: ₹${player.creditBalance}. Stress increased to ${player.stressLevel}%.`,
        player.id
      );
    } else {
      updatedState = logMessage(
        updatedState,
        'debt',
        `💼 PASSED CLOCK-IN DESK! Received ₹1,200 salary, but charged ${Math.round(player.interestRate * 100)}% interest (+₹${interestCharge} debt penalty). Net Debt: ₹${player.creditBalance}. Stress increased to ${player.stressLevel}%.`,
        player.id
      );
    }

    if (player.stressLevel >= 100) {
      player.creditBalance += 200; // Medical burnout fee
      player.stressLevel = 60; // Stress down after fee
      updatedState = logMessage(
        updatedState,
        'stress',
        `💥 BURNOUT COLLAPSE! ${player.name} reached 100% stress, collapsed into copier machine, and was charged ₹200 for unauthorized medical downtime.`,
        player.id
      );
    }
  }

  updatedState.players[player.id] = player;
  
  // Apply land action
  updatedState = handleLandOnSpace(updatedState, player.id, newPosition);

  return checkGameEnd(updatedState);
}

// Land On Space Action Router
export function handleLandOnSpace(state: GameState, playerId: number, spaceId: number): GameState {
  let updatedState = { ...state };
  let player = { ...updatedState.players[playerId] };
  const space = updatedState.spaces[spaceId];

  updatedState.selectedSpaceId = spaceId;

  updatedState = logMessage(
    updatedState,
    'system',
    `📍 ${player.name} landed on ${space.name} (${space.type.toUpperCase()})`,
    player.id
  );

  switch (space.type) {
    case 'start':
      // They landed directly on Start! Double the salary relief
      player.creditBalance = Math.max(0, player.creditBalance - 600);
      player.stressLevel = Math.max(0, player.stressLevel - 15);
      updatedState = logMessage(
        updatedState,
        'debt',
        `🎯 DIRECT CLOCK-IN! Landed exactly on Clock-In Desk. Awarded extra ₹600 work credit. Stress reduced by 15%. Balance: ₹${player.creditBalance}`,
        player.id
      );
      break;

    case 'department':
      if (space.ownerId === null) {
        // Unowned. Player can buy if they are human or if AI decides.
        // Handled in UI card/decision flow.
      } else if (space.ownerId === player.id) {
        // Landed on own department
        if (space.outsourced) {
          updatedState = logMessage(
            updatedState,
            'outsourced',
            `💤 ${player.name} visited their outsourced division ${space.name}. Activity is halted.`,
            player.id
          );
        } else {
          player.stressLevel = Math.max(0, player.stressLevel - 10);
          updatedState = logMessage(
            updatedState,
            'stress',
            `🏡 COZY CELL: ${player.name} checked into their owned cubicle. Reduced stress by 10%.`,
            player.id
          );
        }
      } else {
        // Pay rent! Name "Bandwidth Tax"
        const owner = updatedState.players[space.ownerId];
        if (owner.bankrupt || owner.escaped || space.outsourced || owner.inPIP) {
          const reason = owner.inPIP ? "owner is in PIP isolation" : "division is outsourced";
          updatedState = logMessage(
            updatedState,
            'rent',
            `🛡️ NO FEE: ${player.name} bypassed workstation fee on ${space.name} because ${reason}.`,
            player.id
          );
        } else {
          const rentValue = calculateSpaceRent(space, updatedState.spaces);
          player.creditBalance += rentValue;
          owner.creditBalance = Math.max(0, owner.creditBalance - rentValue);

          updatedState = logMessage(
            updatedState,
            'rent',
            `💸 BANDWIDTH TAX! Paid ₹${rentValue} to ${owner.name} for landing on ${space.name}.`,
            player.id
          );

          updatedState.players[owner.id] = owner;
        }
      }
      break;

    case 'goToPip':
      player.inPIP = true;
      player.position = 16; // Go to PIP space
      player.consecutiveDoubles = 0;
      updatedState = logMessage(
        updatedState,
        'pip',
        `🚨 PIP SUMMONS! Escorted directly to PIP isolation. Do not collect timesheet benefits.`,
        player.id
      );
      break;

    case 'pip':
      updatedState = logMessage(
        updatedState,
        'pip',
        `🏢 ${player.name} is visiting colleagues trapped in Performance Improvement Plans. Terrified observation.`,
        player.id
      );
      break;

    case 'action_hr':
      updatedState = drawActionCard(updatedState, 'hr');
      break;

    case 'action_townhall':
      updatedState = drawActionCard(updatedState, 'townhall');
      break;

    case 'tax_overtime':
      // Pay $100 or gain 25 Stress
      if (player.creditLimit - player.creditBalance > 150) {
        player.creditBalance += 100;
        updatedState = logMessage(
          updatedState,
          'debt',
          `💥 PAID OVERTIME TAX: Charged ₹100 for private team alignment counselor.`,
          player.id
        );
      } else {
        player.stressLevel = Math.min(100, player.stressLevel + 25);
        updatedState = logMessage(
          updatedState,
          'stress',
          `⚠️ STRESS CONFLICT: Avoided cash expense but absorbed +25 Stress. Stress is now ${player.stressLevel}%.`,
          player.id
        );
      }
      break;

    case 'tax_audit':
      // Pay $150 or gain 30 Stress
      if (player.creditLimit - player.creditBalance > 200) {
        player.creditBalance += 150;
        updatedState = logMessage(
          updatedState,
          'debt',
          `⚠️ AUDIT FINE: Charged ₹150 for failing to document spreadsheet shortcuts.`,
          player.id
        );
      } else {
        player.stressLevel = Math.min(100, player.stressLevel + 30);
        updatedState = logMessage(
          updatedState,
          'stress',
          `⚠️ INSANE BURNOUT risk: Rejected the audit fine but gained +30 Stress. Stress is now ${player.stressLevel}%.`,
          player.id
        );
      }
      break;

    case 'water_cooler':
      player.stressLevel = Math.max(0, player.stressLevel - 25);
      updatedState = logMessage(
        updatedState,
        'stress',
        `☕ RELAXATION: Chilled at the water cooler. Reduced stress by 25%. Current stress: ${player.stressLevel}%`,
        player.id
      );
      break;
  }

  // If stress hits 100%
  if (player.stressLevel >= 100) {
    player.creditBalance += 200;
    player.stressLevel = 60;
    updatedState = logMessage(
      updatedState,
      'stress',
      `💥 MEDIC BURNOUT: Exhausted by micromanagement, player collapsing. Mandatory ₹200 diagnostic fees charged.`,
      player.id
    );
  }

  // Check if bankrupt (balance over limit)
  if (player.creditBalance > player.creditLimit) {
    // They are dangerously close. We'll give them a warning.
    updatedState = logMessage(
      updatedState,
      'debt',
      `⚠️ DEBT OVER-EXTENSION! ${player.name} is carrying ₹${player.creditBalance} debt on a ₹${player.creditLimit} limit. High risk of immediate bankruptcy! Must liquidate or restructure!`,
      player.id
    );
  }

  updatedState.players[player.id] = player;
  return updatedState;
}

// Draw Action Card logic
export function drawActionCard(state: GameState, type: 'hr' | 'townhall'): GameState {
  let updatedState = { ...state };
  const cards = type === 'hr' ? HR_CARDS : TOWNHALL_CARDS;
  const randomIndex = Math.floor(Math.random() * cards.length);
  const card = cards[randomIndex];
  
  updatedState.activeCard = card;
  const player = updatedState.players[state.currentPlayerId];

  updatedState = logMessage(
    updatedState,
    'card',
    `📜 DREW CARD: "${card.title}" - ${card.text}`,
    player.id
  );

  return updatedState;
}

// Apply Card Effect
export function applyActionCardEffect(state: GameState): GameState {
  const card = state.activeCard;
  if (!card) return state;

  let updatedState = { ...state, activeCard: null };
  let player = { ...updatedState.players[state.currentPlayerId] };

  updatedState = logMessage(
    updatedState,
    'card',
    `⚡ Applying effect: ${card.title}`,
    player.id
  );

  switch (card.effectType) {
    case 'balance_change':
      player.creditBalance = Math.max(0, player.creditBalance + card.value);
      updatedState = logMessage(
        updatedState,
        'debt',
        `💳 Debt adjusted by ${card.value >= 0 ? '+' : ''}${card.value}. Current balance: ₹${player.creditBalance}`,
        player.id
      );
      break;

    case 'limit_change':
      player.creditLimit += card.value;
      updatedState = logMessage(
        updatedState,
        'debt',
        `📈 Credit Limit expanded by ₹${card.value}. New Limit: ₹${player.creditLimit}`,
        player.id
      );
      break;

    case 'stress_change':
      player.stressLevel = Math.max(0, Math.min(100, player.stressLevel + card.value));
      updatedState = logMessage(
        updatedState,
        'stress',
        `🧘 Stress level adjusted by ${card.value >= 0 ? '+' : ''}${card.value}%. New level: ${player.stressLevel}%`,
        player.id
      );
      break;

    case 'go_to_pip':
      player.inPIP = true;
      player.position = 16; // PIP Space
      player.consecutiveDoubles = 0;
      updatedState = logMessage(
        updatedState,
        'pip',
        `🚨 SENT TO PIP: Placed in Performance Improvement evaluation isolation.`,
        player.id
      );
      break;

    case 'free_out_of_pip':
      // Saved on player or used immediately. Let's make it wipe stress to 0 and reduce debt!
      player.stressLevel = 0;
      player.creditBalance = Math.max(0, player.creditBalance - 200);
      updatedState = logMessage(
        updatedState,
        'stress',
        `🤩 IMMUNITY! Full stress relief and ₹200 debt compensation voucher applied!`,
        player.id
      );
      break;

    case 'pay_each_player':
      updatedState.players.forEach((p) => {
        if (p.id !== player.id && !p.bankrupt && !p.escaped) {
          p.creditBalance = Math.max(0, p.creditBalance - card.value); // reduce their debt
          player.creditBalance += card.value; // add to active player's debt
        }
      });
      updatedState = logMessage(
        updatedState,
        'debt',
        `💸 PAID COLLEAGUES: Sponsored ₹${card.value} team snack credits for everyone.`,
        player.id
      );
      break;

    case 'collect_from_each_player':
      updatedState.players.forEach((p) => {
        if (p.id !== player.id && !p.bankrupt && !p.escaped) {
          p.creditBalance += card.value; // increase their debt
          player.creditBalance = Math.max(0, player.creditBalance - card.value); // decrease active player's debt
        }
      });
      updatedState = logMessage(
        updatedState,
        'debt',
        `💳 CROWDFUNDED: Siphoned ₹${card.value} team credits from everyone to your account.`,
        player.id
      );
      break;

    case 'boardroom_meeting_assessment':
      updatedState.players.forEach((p) => {
        if (!p.bankrupt && !p.escaped) {
          const ownedDepts = updatedState.spaces.filter((s) => s.ownerId === p.id && s.type === 'department').length;
          const charge = ownedDepts * card.value;
          p.creditBalance += charge;
          updatedState = logMessage(
            updatedState,
            'debt',
            `🏢 BOARDROOM SURCHARGE: ${p.name} assessed ₹${charge} (₹${card.value} surcharge x ${ownedDepts} owned departments) in quarterly governance desk fees.`,
            p.id
          );
        }
      });
      break;
  }

  updatedState.players[player.id] = player;
  return checkGameEnd(updatedState);
}

// Purchase property / department
export function buyDepartmentSpace(state: GameState, spaceId: number): GameState {
  let updatedState = { ...state };
  let player = { ...updatedState.players[state.currentPlayerId] };
  const space = { ...updatedState.spaces[spaceId] };

  if (space.ownerId !== null) return state;
  if (player.creditBalance + space.cost > player.creditLimit) {
    return logMessage(
      updatedState,
      'debt',
      `❌ TRANSACTION DECLINED: ${player.name} cannot afford to delegate ${space.name} (Cost: ₹${space.cost}). Exceeds credit limit!`,
      player.id
    );
  }

  // Charge player and assign owner
  player.creditBalance += space.cost;
  space.ownerId = player.id;

  updatedState.players[player.id] = player;
  updatedState.spaces[spaceId] = space;

  updatedState = logMessage(
    updatedState,
    'purchase',
    `💼 DELEGATION COMPLETED! ${player.name} authorized credit to take ownership of ${space.name} for ₹${space.cost}. Bandwidth fee is now ₹${space.baseRent}.`,
    player.id
  );

  return checkGameEnd(updatedState);
}

// Upgrade Department
export function upgradeDepartmentSpace(state: GameState, spaceId: number): GameState {
  let updatedState = { ...state };
  let player = { ...updatedState.players[state.currentPlayerId] };
  const space = { ...updatedState.spaces[spaceId] };

  if (space.ownerId !== player.id) return state;
  if (space.numUpgrades >= 4) {
    return logMessage(
      updatedState,
      'system',
      `❌ MAXED OUT: ${space.name} has the maximum level of bureaucracy layered on.`,
      player.id
    );
  }

  if (player.creditBalance + space.upgradeCost > player.creditLimit) {
    return logMessage(
      updatedState,
      'debt',
      `❌ TRANSACTION DECLINED: Cannot afford to layer on ${space.upgradeName} (Cost: ₹${space.upgradeCost}). Exceeds credit limit!`,
      player.id
    );
  }

  // Charge player and increment level
  player.creditBalance += space.upgradeCost;
  space.numUpgrades += 1;

  updatedState.players[player.id] = player;
  updatedState.spaces[spaceId] = space;

  const nextRent = calculateSpaceRent(space, updatedState.spaces);

  updatedState = logMessage(
    updatedState,
    'upgrade',
    `📈 BUREAUCRACY LAYERED! ${player.name} upgraded ${space.name} with a '${space.upgradeName}' (Level ${space.numUpgrades}/4) for ₹${space.upgradeCost}. Hostile visitor tax is now ₹${nextRent}.`,
    player.id
  );

  return checkGameEnd(updatedState);
}

// Outsource / Insource property (Mortgage)
export function toggleOutsourceSpace(state: GameState, spaceId: number): GameState {
  let updatedState = { ...state };
  const space = { ...updatedState.spaces[spaceId] };
  if (space.ownerId === null) return state;
  
  const owner = { ...updatedState.players[space.ownerId] };

  if (!space.outsourced) {
    // Outsource! Gives immediate 50% credit relief (reduces debt)
    const creditRelief = Math.round(space.cost * 0.5);
    owner.creditBalance = Math.max(0, owner.creditBalance - creditRelief);
    space.outsourced = true;
    space.numUpgrades = 0; // Clear upgrades on mortgage

    updatedState = logMessage(
      updatedState,
      'outsourced',
      `😴 OUTSOURCED! ${owner.name} outsourced division ${space.name}, pocketing ₹${creditRelief} in core savings. No visitors will pay tax here until in-housed. All upgrades cleared!`,
      owner.id
    );
  } else {
    // Buy back (Insource!) Costs 60% of original cost (added to debt)
    const insourceCost = Math.round(space.cost * 0.6);
    if (owner.creditBalance + insourceCost > owner.creditLimit) {
      return logMessage(
        updatedState,
        'debt',
        `❌ TRANSACTION DECLINED: ${owner.name} cannot afford to re-shore/in-house ${space.name} yet. Insourcing fee: ₹${insourceCost}.`,
        owner.id
      );
    }
    owner.creditBalance += insourceCost;
    space.outsourced = false;

    updatedState = logMessage(
      updatedState,
      'outsourced',
      `🤝 IN-HOUSED! ${owner.name} re-shored operations of ${space.name} for ₹${insourceCost}. Division is active again!`,
      owner.id
    );
  }

  updatedState.players[owner.id] = owner;
  updatedState.spaces[spaceId] = space;
  return checkGameEnd(updatedState);
}

// Declare Bankruptcy
export function declarePlayerBankruptcy(state: GameState, playerId: number): GameState {
  let updatedState = { ...state };
  let player = { ...updatedState.players[playerId] };

  if (player.bankrupt) return state;

  player.bankrupt = true;
  player.creditBalance = player.creditLimit; // Full debt freeze
  player.stressLevel = 100;

  // Release all properties to the bank
  updatedState.spaces.forEach((space) => {
    if (space.ownerId === playerId) {
      space.ownerId = null;
      space.numUpgrades = 0;
      space.outsourced = false;
    }
  });

  updatedState.players[playerId] = player;
  updatedState = logMessage(
    updatedState,
    'pip',
    `💀 BANKRUPT & LAID OFF! ${player.name} (${player.role}) has breached their absolute credit limit! Escorted from the building with a security guard. All owned cubicles are vacated.`,
    player.id
  );

  return checkGameEnd(updatedState);
}

// Debt Consolidation / Restructuring (Fills stress, extends limit at a penalty)
export function restructurePlayerDebt(state: GameState, playerId: number): GameState {
  let updatedState = { ...state };
  let player = { ...updatedState.players[playerId] };

  if (player.stressLevel >= 80) {
    return logMessage(
      updatedState,
      'system',
      `❌ IMPOSSIBLE RESTRUCTURING: ${player.name} is too stressed out (${player.stressLevel}%) to organize debt restructuring forms right now. Visit the Water Cooler!`,
      player.id
    );
  }

  const limitBoost = 1500;
  const stressCost = 35;
  const rateIncrease = 0.04;

  player.creditLimit += limitBoost;
  player.stressLevel = Math.min(100, player.stressLevel + stressCost);
  player.interestRate += rateIncrease;

  updatedState.players[playerId] = player;
  updatedState = logMessage(
    updatedState,
    'debt',
    `🏛️ DEBT RESTRUCTURED! ${player.name} filed form 40a-Consolidated. Limit boosted by ₹1,500, but interest rate increased by +4% (${Math.round(player.interestRate * 100)}% cumulative) and stress gained +35%.`,
    player.id
  );

  return checkGameEnd(updatedState);
}

// End Current Turn
export function advanceToNextTurn(state: GameState): GameState {
  let updatedState = { ...state };
  
  // Decrement bailout remaining turns for current player whose active turn is concluding
  const activeId = updatedState.currentPlayerId;
  const activeP = updatedState.players[activeId];
  if (activeP && activeP.bailoutTurnsRemaining !== undefined && activeP.bailoutTurnsRemaining > 0) {
    const updatedActiveP = { ...activeP };
    updatedActiveP.bailoutTurnsRemaining -= 1;
    updatedState.players[activeId] = updatedActiveP;
  }

  const currentCount = updatedState.players.length;
  let nextId = (updatedState.currentPlayerId + 1) % currentCount;

  // Find next non-bankrupt / non-escaped player with consideration for skipped turns
  let searchCount = 0;
  while (searchCount < currentCount) {
    const candidate = updatedState.players[nextId];
    if (candidate.bankrupt || candidate.escaped) {
      nextId = (nextId + 1) % currentCount;
      searchCount++;
      continue;
    }

    if (candidate.turnsToSkip !== undefined && candidate.turnsToSkip > 0) {
      const p = { ...candidate };
      p.turnsToSkip -= 1;
      
      let bailoutMessageDetail = "";
      if (p.bailoutTurnsRemaining !== undefined && p.bailoutTurnsRemaining > 0) {
        p.bailoutTurnsRemaining -= 1;
        const relief = Math.round(p.creditBalance * p.interestRate);
        p.creditBalance = Math.max(0, p.creditBalance - relief);
        bailoutMessageDetail = ` Recalculated interest rate flipped to negative: debt siphoned by -₹${relief} to inject liquidity. New liability: ₹${p.creditBalance}.`;
      }
      
      updatedState.players[p.id] = p;
      updatedState = logMessage(
        updatedState,
        'debt',
        `😴 BAILOUT REGIME: ${p.name}'s turn is frozen due to bailout terms.${bailoutMessageDetail} (${p.turnsToSkip} skipped turns remaining.)`,
        p.id
      );

      nextId = (nextId + 1) % currentCount;
      searchCount++;
    } else {
      break;
    }
  }

  updatedState.currentPlayerId = nextId;
  updatedState.hasRolled = false;
  updatedState.activeCard = null;
  updatedState.aiLogText = '';
  updatedState.burnoutPlayerId = null;
  updatedState.bailoutPlayerId = null;
  updatedState.players = updatedState.players.map(p => ({
    ...p,
    dismissedBurnoutThisTurn: false,
    dismissedBailoutThisTurn: false
  }));

  if (nextId === 0) {
    updatedState.turnCount += 1;
    updatedState = logMessage(
      updatedState,
      'system',
      `🏢 QUARTER END. Entering Quarter Q${updatedState.turnCount}. Keep optimizing those metrics!`
    );
  }

  const nextPlayer = updatedState.players[nextId];
  updatedState = logMessage(
    updatedState,
    'system',
    `👉 It is now ${nextPlayer.name}'s turn (${nextPlayer.role}).`
  );

  return checkGameEnd(updatedState);
}

// AI Turn Logic Helper
export function simulateAiTurn(state: GameState): {
  state: GameState;
  actionsTaken: string[];
} {
  let updatedState = { ...state };
  const aiId = updatedState.currentPlayerId;
  const ai = { ...updatedState.players[aiId] };
  const actionsTaken: string[] = [];

  if (!ai.isAI || ai.bankrupt || ai.escaped) return { state: updatedState, actionsTaken };

  // 1. Roll dice
  updatedState = handleRollDice(updatedState);
  const updatedAi = updatedState.players[aiId];

  // If AI got sent to PIP or is still in PIP
  if (updatedAi.inPIP) {
    actionsTaken.push("Locked in PIP, rolled but remained stuck.");
    return { state: updatedState, actionsTaken };
  }

  const currentSpace = updatedState.spaces[updatedAi.position];

  // 2. Decide on landing
  if (currentSpace.type === 'department' && currentSpace.ownerId === null) {
    // Buy department?
    const hasEnoughMargin = updatedAi.creditLimit - updatedAi.creditBalance > currentSpace.cost + 200;
    if (hasEnoughMargin) {
      updatedState = buyDepartmentSpace(updatedState, currentSpace.id);
      actionsTaken.push(`Delegated division ${currentSpace.name} for $${currentSpace.cost}.`);
    } else {
      actionsTaken.push(`Declined to delegate ${currentSpace.name} to preserve credit limit safety.`);
    }
  }

  // 3. Upgrade owned departments?
  const ownedDepts = updatedState.spaces.filter((s) => s.ownerId === aiId && !s.outsourced && s.numUpgrades < 4);
  if (ownedDepts.length > 0) {
    // Find the cheapest upgrade and check if they can comfortably afford it
    const targetDept = ownedDepts[Math.floor(Math.random() * ownedDepts.length)];
    const canAfford = updatedAi.creditLimit - updatedAi.creditBalance > targetDept.upgradeCost + 300;
    if (canAfford) {
      updatedState = upgradeDepartmentSpace(updatedState, targetDept.id);
      actionsTaken.push(`Upgraded division ${targetDept.name} with ${targetDept.upgradeName} to spike fees.`);
    }
  }

  // 4. Over-limit restructuring or outsourcing?
  if (updatedAi.creditBalance > updatedAi.creditLimit) {
    // AI is over limit! Try to outsource some space
    const outsourcingCandidates = updatedState.spaces.filter((s) => s.ownerId === aiId && !s.outsourced);
    if (outsourcingCandidates.length > 0) {
      const targetSpace = outsourcingCandidates[0];
      updatedState = toggleOutsourceSpace(updatedState, targetSpace.id);
      actionsTaken.push(`Emergency: Outsourced ${targetSpace.name} to avoid immediate card suspension.`);
    } else if (updatedAi.stressLevel < 80) {
      // Must restructure
      updatedState = restructurePlayerDebt(updatedState, aiId);
      actionsTaken.push(`Emergency: Restructured overall liabilities with paperwork. Extended limit.`);
    } else {
      // Bankrupt!
      updatedState = declarePlayerBankruptcy(updatedState, aiId);
      actionsTaken.push(`Bankrupted! Limit surpassed without liquidation avenues.`);
    }
  }

  // 4.5 Corporate Bailout check for active AI
  const aiToCheck = updatedState.players[aiId];
  if (
    aiToCheck &&
    !aiToCheck.bankrupt &&
    !aiToCheck.escaped &&
    aiToCheck.creditBalance >= Math.round(aiToCheck.creditLimit * 0.95) &&
    !aiToCheck.hasUsedBailout &&
    !aiToCheck.dismissedBailoutThisTurn
  ) {
    const shouldAccept = Math.random() < 0.85;
    if (shouldAccept) {
      const p = { ...aiToCheck };
      p.hasUsedBailout = true;
      p.bailoutTurnsRemaining = 3;
      p.turnsToSkip = 2;
      updatedState.players[aiId] = p;

      updatedState = logMessage(
        updatedState,
        'debt',
        `🏛️ AI BAILOUT: ${p.name} accepted an emergency federal Bailout! Interest rate flipped to negative (-${Math.round(p.interestRate * 100)}%) for 3 turns. Operations frozen for 2 turns.`,
        p.id
      );
      actionsTaken.push(`Accepted federal corporate bailout to avoid bankruptcy, auditing begins immediately.`);
      return { state: updatedState, actionsTaken };
    } else {
      const p = { ...aiToCheck };
      p.dismissedBailoutThisTurn = true;
      updatedState.players[aiId] = p;
      updatedState = logMessage(
        updatedState,
        'system',
        `⚠️ AI RISK: ${p.name} declined the federal corporate bailout, gambling on high-stake active projects.`,
        p.id
      );
      actionsTaken.push(`Declined corporate bailout in favor of maintaining operational velocity.`);
    }
  }

  // 5. Burnout HR Counseling check for active AI
  const finalAi = updatedState.players[aiId];
  if (
    finalAi &&
    !finalAi.bankrupt &&
    !finalAi.escaped &&
    finalAi.creditBalance > 0.9 * finalAi.creditLimit &&
    !finalAi.usedHrCounseling
  ) {
    // AI has a high chance (80%) of taking counseling if their debt exceeds 90%
    const shouldAccept = Math.random() < 0.80;
    if (shouldAccept) {
      const p = { ...updatedState.players[aiId] };
      const debtReduction = Math.round(p.creditLimit * 0.40);
      const originalDebt = p.creditBalance;
      p.creditBalance = Math.max(0, p.creditBalance - debtReduction);
      p.usedHrCounseling = true;
      updatedState.players[aiId] = p;

      updatedState = logMessage(
        updatedState,
        'debt',
        `💆 AI BOT COUNSELING: ${p.name} completed emergency HR counseling. Debt slashed by ₹${debtReduction} (from ₹${originalDebt} to ₹${p.creditBalance}). Paid with remaining turn capacity.`,
        p.id
      );
      actionsTaken.push(`Completed emergency HR Counseling to slash ₹${debtReduction} debt.`);
    } else {
      const p = { ...updatedState.players[aiId] };
      p.dismissedBurnoutThisTurn = true;
      updatedState.players[aiId] = p;
      updatedState = logMessage(
        updatedState,
        'system',
        `⚠️ AI RISK: ${p.name} bypassed HR counseling, continuing under critical debt exposure of ₹${p.creditBalance}.`,
        p.id
      );
      actionsTaken.push(`Declined HR Counseling and took on heavy credit risk.`);
    }
  }

  return { state: updatedState, actionsTaken };
}
