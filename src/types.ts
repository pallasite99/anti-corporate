export type SpaceType =
  | 'start'
  | 'department'
  | 'pip'
  | 'goToPip'
  | 'action_hr'
  | 'action_townhall'
  | 'tax_overtime'
  | 'tax_audit'
  | 'water_cooler';

export interface BoardSpace {
  id: number;
  name: string;
  type: SpaceType;
  group?: string;
  groupColor?: string;
  cost: number;
  baseRent: number;
  rentScales: number[]; // Rent at 0, 1, 2, 3, 4 upgrades
  upgradeCost: number;
  numUpgrades: number;
  ownerId: number | null;
  outsourced: boolean; // equivalent to mortgaged
  description: string;
  upgradeName: string; // "Cubicle", "Ad-hoc Committee", "KPI Dashboard", etc.
}

export interface Player {
  id: number;
  name: string;
  role: string;
  color: string;
  avatar: string;
  isAI: boolean;
  creditLimit: number;
  creditBalance: number; // This is their DEBT. They want to get it to 0!
  interestRate: number; // e.g., 0.10 for 10%
  stressLevel: number; // 0 to 100
  position: number; // 0 to 23
  inPIP: boolean;
  turnsInPIP: number;
  bankrupt: boolean;
  escaped: boolean; // reached $0 debt and won
  consecutiveDoubles: number;
  usedHrCounseling?: boolean;
  dismissedBurnoutThisTurn?: boolean;
  hasUsedBailout?: boolean;
  bailoutTurnsRemaining?: number;
  turnsToSkip?: number;
  dismissedBailoutThisTurn?: boolean;
}

export interface ActionCard {
  id: string;
  title: string;
  type: 'hr' | 'townhall';
  text: string;
  flavorText: string;
  effectType: 'balance_change' | 'limit_change' | 'stress_change' | 'go_to_pip' | 'free_out_of_pip' | 'pay_each_player' | 'collect_from_each_player' | 'boardroom_meeting_assessment';
  value: number;
}

export interface GameLog {
  id: string;
  timestamp: string;
  playerId?: number;
  type: 'roll' | 'purchase' | 'upgrade' | 'rent' | 'card' | 'stress' | 'system' | 'debt' | 'pip' | 'victory' | 'outsourced';
  message: string;
}

export interface CareerEvent {
  id: string;
  playerId: number;
  scenarioName: string;
  situation: string;
  optionA: {
    label: string;
    debtChange: number;
    stressChange: number;
  };
  optionB: {
    label: string;
    debtChange: number;
    stressChange: number;
  };
  loading?: boolean;
  resolved?: boolean;
  chosenOption?: 'A' | 'B';
  consequenceText?: string;
}

export interface GameState {
  players: Player[];
  spaces: BoardSpace[];
  currentPlayerId: number;
  dice: [number, number];
  hasRolled: boolean;
  log: GameLog[];
  turnCount: number;
  selectedSpaceId: number | null; // For inspecting properties
  activeCard: ActionCard | null; // For HR/Townhall display
  gameSpeed: 'slow' | 'normal' | 'fast';
  aiLogText: string; // For typewriter effect of AI thinking
  winnerId: number | null;
  victoryType: 'financial_freedom' | 'last_standing' | 'ceo_takeover' | null;
  showTestConsole: boolean;
  burnoutPlayerId: number | null;
  bailoutPlayerId: number | null;
  activeCareerEvent?: CareerEvent | null;
}
