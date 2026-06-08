import React, { useState, useEffect, useRef } from 'react';
import { GameState, Player, BoardSpace, GameLog } from './types';
import { ROLE_PRESETS, OFFICE_DESPAIR_DISCLAIMER } from './constants';
import {
  createInitialState,
  handleRollDice,
  buyDepartmentSpace,
  upgradeDepartmentSpace,
  toggleOutsourceSpace,
  declarePlayerBankruptcy,
  restructurePlayerDebt,
  advanceToNextTurn,
  simulateAiTurn,
  calculateSpaceRent,
  applyActionCardEffect,
} from './utils/gameLogic';
import { playSound } from './utils/sound';

// Components
import Board from './components/Board';
import PlayerCard from './components/PlayerCard';
import CardModal from './components/CardModal';
import DeptDetailModal from './components/DeptDetailModal';
import RulesModal from './components/RulesModal';
import TestSandbox from './components/TestSandbox';
import BurnoutReportModal from './components/BurnoutReportModal';
import CorporateBailoutModal from './components/CorporateBailoutModal';
import ToastContainer, { Toast } from './components/ToastContainer';
import ThreeDDice from './components/ThreeDDice';
import LanMultiplayerLobby from './components/LanMultiplayerLobby';
import { CareerEventModal } from './components/CareerEventModal';

// Lucide Icons
import {
  Dice5,
  RotateCcw,
  Sliders,
  HelpCircle,
  Share2,
  FileSpreadsheet,
  Coins,
  ShieldCheck,
  Save,
  FolderOpen,
  ArrowRight,
  UserX,
  Volume2,
  VolumeX,
  MessageSquare,
  Send,
  Radio,
  Users,
} from 'lucide-react';

export default function App() {
  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // Track start-of-turn debt balance and swipe overlay animations
  const [turnStartBalance, setTurnStartBalance] = useState<number | null>(null);
  const [activeSwipe, setActiveSwipe] = useState<{
    show: boolean;
    playerName: string;
    playerAvatar: string;
    playerColor: string;
    amount: number;
    isProfit: boolean;
  } | null>(null);

  // Sync turnStartBalance when active player switches
  useEffect(() => {
    if (gameState) {
      const activeP = gameState.players[gameState.currentPlayerId];
      if (activeP) {
        setTurnStartBalance(activeP.creditBalance);
      }
    }
  }, [gameState?.currentPlayerId]);

  // Sliding Toast alerts state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 3D Dice states
  const [isRolling, setIsRolling] = useState(false);
  const [visualDice, setVisualDice] = useState<[number, number]>([1, 1]);

  // Setup interface view mode
  const [setupMode, setSetupMode] = useState<'local' | 'lan'>('local');

  // SLA auto-play turn timer state
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const latestGameStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    latestGameStateRef.current = gameState;
  }, [gameState]);

  // Multiplayer LAN states
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [lanRoomCode, setLanRoomCode] = useState("");
  const [lanIsHost, setLanIsHost] = useState(false);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number>(-1);
  const [lanChats, setLanChats] = useState<any[]>([]);
  const [activeLedgerTab, setActiveLedgerTab] = useState<'logs' | 'chat'>('logs');
  const [playChatInput, setPlayChatInput] = useState("");
  const isRemoteUpdateRef = useRef(false);
  const lanSocketRef = useRef<WebSocket | null>(null);

  // References of active inputs
  const [lanPlayerName, setLanPlayerName] = useState("Suresh Agarwal");
  const [lanRoleIndex, setLanRoleIndex] = useState(0);
  const lanPlayerNameRef = useRef("Suresh Agarwal");

  useEffect(() => {
    lanPlayerNameRef.current = lanPlayerName;
  }, [lanPlayerName]);

  // Keep track of which GameLog IDs we have already displayed as toast notifications
  const processedLogIdsRef = useRef<Set<string>>(new Set());

  // Automatically watch and generate gorgeous satirical toasts for major game achievements
  useEffect(() => {
    if (gameState && !isRolling) {
      setVisualDice(gameState.dice);
    }
  }, [gameState?.dice, isRolling]);

  // Send state updates to other LAN players
  useEffect(() => {
    if (isMultiplayer && gameState && lanSocketRef.current && lanSocketRef.current.readyState === WebSocket.OPEN) {
      if (isRemoteUpdateRef.current) {
        return;
      }
      lanSocketRef.current.send(JSON.stringify({
        type: "sync-state",
        payload: { gameState }
      }));
    }
  }, [gameState, isMultiplayer]);

  // Listen for incoming remote state synchronization and chat broadcasts
  useEffect(() => {
    if (!isMultiplayer || !lanSocketRef.current) return;

    const socket = lanSocketRef.current;
    
    const handleWsMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;

        if (type === "state-synced") {
          isRemoteUpdateRef.current = true;
          setGameState(payload.gameState);
          setTimeout(() => {
            isRemoteUpdateRef.current = false;
          }, 80);
        } else if (type === "chat-broadcast") {
          setLanChats((prev) => [...prev, payload]);
        }
      } catch (err) {
        console.error("Active multiplayer socket message parse failure", err);
      }
    };

    socket.addEventListener("message", handleWsMessage);
    return () => {
      socket.removeEventListener("message", handleWsMessage);
    };
  }, [isMultiplayer]);

  // Handler passed to LanMultiplayerLobby to trigger full transition
  const handleStartLanGame = (
    arrangedPlayers: Array<{ name: string; roleIndex: number; isAI: boolean }>,
    roomCode: string,
    isHost: boolean,
    myPlayerId: string,
    socket: WebSocket
  ) => {
    lanSocketRef.current = socket;
    setIsMultiplayer(true);
    setLanRoomCode(roomCode);
    setLanIsHost(isHost);

    const myIndex = isHost ? 0 : arrangedPlayers.findIndex((p) => {
      return p.name === lanPlayerNameRef.current;
    });

    setMyPlayerIndex(myIndex !== -1 ? myIndex : 0);

    if (isHost) {
      const startState = createInitialState(arrangedPlayers);
      startState.log = [
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'system',
          message: `📢 MULTIPLAYER LAN COMMENCED. Grid synchronized on Node Room Code #${roomCode} by ${arrangedPlayers[0].name}.`,
        },
        ...startState.log
      ];
      setGameState(startState);

      socket.send(JSON.stringify({
        type: "sync-state",
        payload: { gameState: startState }
      }));
    }
  };

  useEffect(() => {
    if (!gameState) {
      processedLogIdsRef.current.clear();
      setToasts([]);
      return;
    }

    const newToastsToAdd: Toast[] = [];

    // Scan backwards to match newest logs chronological insertion
    for (let i = gameState.log.length - 1; i >= 0; i--) {
      const log = gameState.log[i];
      if (processedLogIdsRef.current.has(log.id)) {
        continue;
      }

      processedLogIdsRef.current.add(log.id);

      const msg = log.message;
      const lowerMsg = msg.toLowerCase();
      
      let toastType: Toast['type'] | null = null;
      let title = "";

      if (log.type === 'victory' || lowerMsg.includes('last worker standing') || lowerMsg.includes('financial freedom winner') || lowerMsg.includes('survived because all other players')) {
        toastType = 'victory';
        title = "🏆 Victory Achieved";
      } else if (lowerMsg.includes('bankruptcy') || lowerMsg.includes('bankrupt') || lowerMsg.includes('declared bankruptcy') || lowerMsg.includes('survivors remain')) {
        toastType = 'bankruptcy';
        title = "💀 Bankruptcy & Fired";
      } else if (lowerMsg.includes('bailout') || lowerMsg.includes('accepted federal corporate bailout') || lowerMsg.includes('state-funded bailout')) {
        toastType = 'bailout';
        title = "🏢 State-Funded Bailout";
      } else if (lowerMsg.includes('burnout') || lowerMsg.includes('burnout collapse') || lowerMsg.includes('stress level critical')) {
        toastType = 'burnout';
        title = "🔥 Burnout Collapse";
      } else if (log.type === 'pip' || lowerMsg.includes('put on pip') || lowerMsg.includes('performance improvement plan')) {
        toastType = 'pip';
        title = "📋 Mandatory PIP Notice";
      } else if (log.type === 'outsourced' || lowerMsg.includes('outsourcing mandatory') || lowerMsg.includes('outsourced department')) {
        toastType = 'outsourced';
        title = "✨ Divestout Synergy";
      } else if (lowerMsg.includes('debt over-extension') || lowerMsg.includes('over-limit')) {
        toastType = 'debt_warning';
        title = "⚠️ Critical Over-limit";
      } else if (log.type === 'card') {
        toastType = 'card';
        title = lowerMsg.includes('toxic negativity') || lowerMsg.includes('townhall') 
          ? "🎙️ compliance townhall" 
          : "📝 hr cabinet directive";
      }

      if (toastType) {
        const associatedPlayer = log.playerId !== undefined ? gameState.players.find(p => p.id === log.playerId) : undefined;
        newToastsToAdd.push({
          id: log.id,
          type: toastType,
          title: title.toUpperCase(),
          message: msg,
          timestamp: log.timestamp,
          playerName: associatedPlayer?.name,
          playerColor: associatedPlayer?.color,
        });
      }
    }

    if (newToastsToAdd.length > 0) {
      setToasts((prev) => {
        // Limit max active toasts to keep screens uncluttered
        const merged = [...prev, ...newToastsToAdd];
        return merged.slice(-4);
      });
    }
  }, [gameState?.log, gameState?.players]);

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [setupPlayers, setSetupPlayers] = useState([
    { name: "Suresh Agarwal", roleIndex: 0, isAI: false },
    { name: "Bot Jenkins", roleIndex: 1, isAI: true },
    { name: "Bot Karen", roleIndex: 2, isAI: true },
  ]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'intern' | 'senior' | 'ceo_nephew'>('senior');

  // Modals & configuration states
  const [showRules, setShowRules] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const isAiProcessing = useRef(false);

  // Load game from localStorge on boot
  useEffect(() => {
    const saved = localStorage.getItem('anti_corporate_saved_game');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.spaces && parsed.spaces.length === 32) {
          setGameState(parsed);
        } else {
          // Schema mismatch (e.g. ancient 7x7 board format), purge save to prevent page corruption
          localStorage.removeItem('anti_corporate_saved_game');
        }
      } catch (err) {
        console.error("Error loading saved corporate docket file", err);
      }
    }
  }, []);

  // Sync state changes with localStorage
  const handleModifyState = (updater: (state: GameState) => GameState) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      
      // Check if current human player has exceeded 90% limit and needs burnout popup
      let finalState = { ...next };
      const currentHPlayer = finalState.players[finalState.currentPlayerId];
      if (
        currentHPlayer &&
        !currentHPlayer.isAI &&
        !currentHPlayer.bankrupt &&
        !currentHPlayer.escaped &&
        currentHPlayer.creditBalance > 0.9 * currentHPlayer.creditLimit &&
        !currentHPlayer.usedHrCounseling &&
        !currentHPlayer.dismissedBurnoutThisTurn &&
        !finalState.activeCard && // Don't block card modal
        finalState.burnoutPlayerId !== currentHPlayer.id
      ) {
        finalState.burnoutPlayerId = currentHPlayer.id;
      }

      // Check if current human player is within 5% of credit limit and needs Corporate Bailout modal
      if (
        currentHPlayer &&
        !currentHPlayer.isAI &&
        !currentHPlayer.bankrupt &&
        !currentHPlayer.escaped &&
        currentHPlayer.creditBalance >= 0.95 * currentHPlayer.creditLimit &&
        !currentHPlayer.hasUsedBailout &&
        !currentHPlayer.dismissedBailoutThisTurn &&
        !finalState.activeCard &&
        finalState.burnoutPlayerId === null &&
        finalState.bailoutPlayerId !== currentHPlayer.id
      ) {
        finalState.bailoutPlayerId = currentHPlayer.id;
      }

      localStorage.setItem('anti_corporate_saved_game', JSON.stringify(finalState));
      return finalState;
    });
  };

  // Sound triggering proxy
  const handlePlaySound = (type: 'beep' | 'bzzt' | 'coin' | 'horn' | 'success' | 'foreclosure') => {
    if (soundEnabled) playSound(type);
  };

  // Start a fresh Q4 quarter
  const handleStartGame = () => {
    const startingState = createInitialState(setupPlayers);
    
    // Customize starting parameters based on difficulty presets
    startingState.players.forEach((player) => {
      if (selectedDifficulty === 'intern') {
        // Hard mode: high beginning debt, low capacity limit
        player.creditLimit -= 500;
        player.creditBalance += 800;
        player.interestRate += 0.02;
      } else if (selectedDifficulty === 'ceo_nephew') {
        // Easy mode: low beginning debt, higher limit
        player.creditLimit += 1500;
        player.creditBalance = 800;
        player.interestRate -= 0.03;
      }
    });

    setGameState(startingState);
    localStorage.setItem('anti_corporate_saved_game', JSON.stringify(startingState));
    handlePlaySound('success');
  };

  // Remove player during setup
  const removeSetupPlayer = (index: number) => {
    if (setupPlayers.length <= 2) return;
    setSetupPlayers(setupPlayers.filter((_, i) => i !== index));
  };

  // Add new employee setup slot
  const addSetupPlayer = () => {
    if (setupPlayers.length >= 4) return;
    setSetupPlayers([
      ...setupPlayers,
      {
        name: `Employee #${setupPlayers.length + 1}`,
        roleIndex: Math.floor(Math.random() * ROLE_PRESETS.length),
        isAI: true,
      },
    ]);
  };

  // Update setup player attributes
  const updateSetupPlayer = (index: number, key: string, value: any) => {
    const next = [...setupPlayers];
    next[index] = { ...next[index], [key]: value };
    setSetupPlayers(next);
  };

  // Roll dice action
  const executeRoll = () => {
    if (isRolling || !gameState || gameState.hasRolled) return;
    if (isMultiplayer && gameState.currentPlayerId !== myPlayerIndex) return;

    setIsRolling(true);
    handlePlaySound('beep');

    // Tapping sound tick intervals every 120ms to simulate physical dice bouncing
    let stepCount = 0;
    const interval = setInterval(() => {
      setVisualDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
      handlePlaySound('beep');
      stepCount++;
      if (stepCount >= 6) {
        clearInterval(interval);
      }
    }, 110);

    // After 800ms, apply actual state roll
    setTimeout(() => {
      setIsRolling(false);
      handleModifyState((prev) => {
        const next = handleRollDice(prev);
        
        // If landed on tax/action space, trigger corresponding sounds
        const playerPos = next.players[next.currentPlayerId].position;
        const space = next.spaces[playerPos];
        if (['tax_audit', 'tax_overtime', 'goToPip'].includes(space.type)) {
          handlePlaySound('bzzt');
        } else if (space.type === 'start') {
          handlePlaySound('coin');
        }

        // 25% chance to trigger a Career Path dilemma, if player is active and not currently in PIP or bankrupt
        const activePlayerObj = next.players[next.currentPlayerId];
        if (activePlayerObj && !activePlayerObj.inPIP && !activePlayerObj.bankrupt && !activePlayerObj.escaped) {
          const checkRoll = Math.random() < 0.25;
          if (checkRoll) {
            next.activeCareerEvent = {
              id: Math.random().toString(36).substring(2, 9),
              playerId: next.currentPlayerId,
              scenarioName: "Syncing HR Directives...",
              situation: "An urgent carrier pathway realignment request has arrived from executive headquarters.",
              optionA: { label: "Please wait...", debtChange: 0, stressChange: 0 },
              optionB: { label: "Please wait...", debtChange: 0, stressChange: 0 },
              loading: true,
              resolved: false
            };
          }
        }

        return next;
      });
    }, 800);
  };

  // Purchase unowned division or Upgrade owned division
  const handleAcquireOrUpgrade = () => {
    if (!gameState) return;
    if (isMultiplayer && gameState.currentPlayerId !== myPlayerIndex) return;
    const spaceId = gameState.selectedSpaceId;
    if (spaceId === null) return;

    handleModifyState((prev) => {
      const space = prev.spaces[spaceId];
      if (space.ownerId === null) {
        handlePlaySound('coin');
        return buyDepartmentSpace(prev, spaceId);
      } else {
        handlePlaySound('coin');
        return upgradeDepartmentSpace(prev, spaceId);
      }
    });
  };

  // Restructure active debt
  const handleRestructureDebt = () => {
    if (!gameState) return;
    if (isMultiplayer && gameState.currentPlayerId !== myPlayerIndex) return;
    handleModifyState((prev) => {
      handlePlaySound('horn');
      return restructurePlayerDebt(prev, prev.currentPlayerId);
    });
  };

  // Outsource or Insource toggle
  const handleToggleOutsource = () => {
    if (!gameState || gameState.selectedSpaceId === null) return;
    if (isMultiplayer && gameState.currentPlayerId !== myPlayerIndex) return;
    const spaceId = gameState.selectedSpaceId;
    handleModifyState((prev) => {
      handlePlaySound('bzzt');
      return toggleOutsourceSpace(prev, spaceId);
    });
  };

  // Confirms action card message screen
  const handleDismissCard = () => {
    if (isMultiplayer && gameState?.currentPlayerId !== myPlayerIndex) return;
    handleModifyState((prev) => {
      if (prev.activeCard) {
        const isGoToPip = prev.activeCard.effectType === 'go_to_pip';
        handlePlaySound(isGoToPip ? 'horn' : 'coin');
      }
      return applyActionCardEffect(prev);
    });
  };

  // Career Event Decision Select Option (A or B)
  const handleSelectCareerOption = async (option: 'A' | 'B') => {
    if (!gameState || !gameState.activeCareerEvent) return;
    const eventObj = gameState.activeCareerEvent;
    if (eventObj.loading || eventObj.resolved) return;

    if (isMultiplayer && gameState.currentPlayerId !== myPlayerIndex) return;

    const currentPlayerObj = gameState.players[gameState.currentPlayerId];
    const chosenOptionObj = option === 'A' ? eventObj.optionA : eventObj.optionB;

    // Place into resolved and analyzing stage immediately
    handleModifyState((prev) => {
      if (!prev.activeCareerEvent) return prev;
      return {
        ...prev,
        activeCareerEvent: {
          ...prev.activeCareerEvent,
          chosenOption: option,
          resolved: true,
          consequenceText: "Analyzing chosen action pathway through modern HR audit nodes..."
        }
      };
    });

    handlePlaySound('beep');

    try {
      const res = await fetch("/api/career-event/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: currentPlayerObj.name,
          playerRole: currentPlayerObj.role,
          scenarioName: eventObj.scenarioName,
          situation: eventObj.situation,
          chosenOptionLabel: chosenOptionObj.label,
          debtChange: chosenOptionObj.debtChange,
          stressChange: chosenOptionObj.stressChange
        })
      });
      const json = await res.json();

      if (json.success) {
        handleModifyState((prev) => {
          if (!prev.activeCareerEvent) return prev;

          // Apply state corrections to player
          const updatedPlayers = prev.players.map((p, idx) => {
            if (idx !== prev.currentPlayerId) return p;

            let newDebt = Math.max(0, p.creditBalance + chosenOptionObj.debtChange);
            let newStress = Math.max(0, Math.min(100, p.stressLevel + chosenOptionObj.stressChange));

            // Burnout Collapse check
            if (newStress >= 100) {
              newDebt += 200;
              newStress = 60;
            }

            return {
              ...p,
              creditBalance: newDebt,
              stressLevel: newStress
            };
          });

          // Register Game Ledger record
          const newLog: GameLog = {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString(),
            type: chosenOptionObj.debtChange < 0 ? 'debt' : 'stress',
            message: `💼 CAREER DECISION: ${json.data.logMessage}`,
            playerId: prev.currentPlayerId
          };

          return {
            ...prev,
            players: updatedPlayers,
            log: [newLog, ...prev.log],
            activeCareerEvent: {
              ...prev.activeCareerEvent,
              consequenceText: json.data.consequenceText
            }
          };
        });

        handlePlaySound('coin');
      }
    } catch (err) {
      console.error("Failed to resolve career dilemma:", err);
      // Fallback
      handleModifyState((prev) => {
        if (!prev.activeCareerEvent) return prev;

        const updatedPlayers = prev.players.map((p, idx) => {
          if (idx !== prev.currentPlayerId) return p;
          return {
            ...p,
            creditBalance: Math.max(0, p.creditBalance + chosenOptionObj.debtChange),
            stressLevel: Math.max(0, Math.min(100, p.stressLevel + chosenOptionObj.stressChange))
          };
        });

        const newLog: GameLog = {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'system',
          message: `📊 ${currentPlayerObj.name} resolved career choice: "${chosenOptionObj.label}". Debt: ${chosenOptionObj.debtChange > 0 ? "+" : ""}₹${chosenOptionObj.debtChange}, Stress: ${chosenOptionObj.stressChange > 0 ? "+" : ""}${chosenOptionObj.stressChange}%.`,
          playerId: prev.currentPlayerId
        };

        return {
          ...prev,
          players: updatedPlayers,
          log: [newLog, ...prev.log],
          activeCareerEvent: {
            ...prev.activeCareerEvent,
            consequenceText: "The resolution telemetry was compiled offline. State values adjusted."
          }
        };
      });
    }
  };

  // Close and complete active Career Event Card
  const handleDismissCareerEvent = () => {
    if (isMultiplayer && gameState?.currentPlayerId !== myPlayerIndex) return;
    handleModifyState((prev) => {
      return {
        ...prev,
        activeCareerEvent: null
      };
    });
    handlePlaySound('beep');
  };

  // Lifecycle logic: Fetch AI scenario when activeCareerEvent loading is triggered
  useEffect(() => {
    if (!gameState?.activeCareerEvent) return;
    const eventObj = gameState.activeCareerEvent;
    if (!eventObj.loading) return;

    const currentPlayerObj = gameState.players[gameState.currentPlayerId];
    const isMyTurn = isMultiplayer ? (gameState.currentPlayerId === myPlayerIndex) : true;
    const amIHost = isMultiplayer ? lanIsHost : true;

    // Only fetch if executing active turn, or if host acting for a bot player
    const shouldIFetch = (isMyTurn && !currentPlayerObj.isAI) || (currentPlayerObj.isAI && amIHost);
    if (!shouldIFetch) return;

    let active = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    async function loadCareerDilemma() {
      try {
        const res = await fetch("/api/career-event/generate", {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerName: currentPlayerObj.name,
            playerRole: currentPlayerObj.role,
            currentDebt: currentPlayerObj.creditBalance,
            currentStress: currentPlayerObj.stressLevel
          })
        });
        if (!res.ok) {
          throw new Error(`Career event request failed with ${res.status}`);
        }

        const json = await res.json();
        if (!json.success || !json.data) {
          throw new Error("Career event response was missing scenario data");
        }

        if (active) {
          handleModifyState((prev) => {
            if (!prev.activeCareerEvent || prev.activeCareerEvent.id !== eventObj.id) return prev;
            return {
              ...prev,
              activeCareerEvent: {
                ...prev.activeCareerEvent,
                ...json.data,
                loading: false
              }
            };
          });
        }
      } catch (err) {
        console.error("Failed to load Gemini career event:", err);
        if (!active) return;

        handleModifyState((prev) => {
          if (!prev.activeCareerEvent || prev.activeCareerEvent.id !== eventObj.id) return prev;

          const fallbackEvent = buildFallbackCareerEvent(currentPlayerObj);
          const newLog: GameLog = {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString(),
            type: 'system',
            message: `Offline HR directive substituted for ${currentPlayerObj.name}; remote career audit timed out or failed.`,
            playerId: currentPlayerObj.id,
          };

          return {
            ...prev,
            log: [newLog, ...prev.log],
            activeCareerEvent: {
              ...prev.activeCareerEvent,
              ...fallbackEvent,
              loading: false,
              resolved: false,
            }
          };
        });
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    loadCareerDilemma();

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [gameState?.activeCareerEvent?.id, gameState?.activeCareerEvent?.loading]);

  // AI bot players career decision automated simulation loop
  useEffect(() => {
    if (!gameState || gameState.winnerId !== null) return;
    const activePlayerObj = gameState.players[gameState.currentPlayerId];
    if (!activePlayerObj.isAI) return;

    const eventObj = gameState.activeCareerEvent;
    if (!eventObj || eventObj.loading) return;

    const amIHost = isMultiplayer ? lanIsHost : true;
    if (!amIHost) return;

    if (!eventObj.resolved) {
      const timer = setTimeout(() => {
        const botChoice = Math.random() < 0.5 ? 'A' : 'B';
        handleSelectCareerOption(botChoice);
      }, 3500); // Allow human players time to scan the custom lore
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        handleDismissCareerEvent();
      }, 4500); // Allow time to read consequence
      return () => clearTimeout(timer);
    }
  }, [
    gameState?.currentPlayerId,
    gameState?.activeCareerEvent?.id,
    gameState?.activeCareerEvent?.loading,
    gameState?.activeCareerEvent?.resolved
  ]);

  // Move to next player turn with a credit / debit card swipe animation indicating profit or loss
  const handleEndTurn = () => {
    if (!gameState) return;
    if (isMultiplayer && gameState.currentPlayerId !== myPlayerIndex) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerId];
    if (currentPlayer) {
      const initialBalance = turnStartBalance !== null ? turnStartBalance : currentPlayer.creditBalance;
      const finalBalance = currentPlayer.creditBalance;
      const debtChange = finalBalance - initialBalance;

      // Only display card swipe modal delayed screen for active HUMAN players to keep bot speed fast
      if (!currentPlayer.isAI) {
        setActiveSwipe({
          show: true,
          playerName: currentPlayer.name,
          playerAvatar: currentPlayer.avatar,
          playerColor: currentPlayer.color,
          amount: Math.abs(debtChange),
          isProfit: debtChange < 0,
        });

        if (soundEnabled) {
          playSound('beep');
          setTimeout(() => {
            playSound(debtChange < 0 ? 'coin' : debtChange > 0 ? 'bzzt' : 'beep');
          }, 350);
        }

        // Wait 1.8 seconds for card swipe visual slide to finish before state transitions
        setTimeout(() => {
          setActiveSwipe(null);
          handleModifyState((prev) => {
            return advanceToNextTurn(prev);
          });
        }, 1800);
        return;
      }
    }

    // AI automatic player fallback
    handlePlaySound('beep');
    handleModifyState((prev) => {
      return advanceToNextTurn(prev);
    });
  };

  // Accept the special corporate bailout package, flipping the interest rate but freezing them for 2 turns
  const handleAcceptCorporateBailout = (playerId: number) => {
    handleModifyState((prev) => {
      let next = { ...prev };
      const playerIndex = next.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        const p = { ...next.players[playerIndex] };
        p.hasUsedBailout = true;
        p.bailoutTurnsRemaining = 3;
        p.turnsToSkip = 2;
        next.players[playerIndex] = p;

        const newLog = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          type: 'debt' as const,
          message: `🏛️ BAILOUT APPROVED: ${p.name} accepted federal corporate bailout! Interest rate flipped to negative (-${Math.round(p.interestRate * 100)}%) for 3 turns. Operations frozen for 2 turns during audit.`,
          playerId: p.id,
        };
        next.log = [newLog, ...next.log];
      }
      next.bailoutPlayerId = null;
      return advanceToNextTurn(next);
    });
    handlePlaySound('success');
  };

  // Decline the special corporate bailout package
  const handleDeclineCorporateBailout = (playerId: number) => {
    handleModifyState((prev) => {
      let next = { ...prev };
      const playerIndex = next.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        const p = { ...next.players[playerIndex] };
        p.dismissedBailoutThisTurn = true;
        next.players[playerIndex] = p;

        const newLog = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          type: 'system' as const,
          message: `⚠️ BAILOUT REJECTED: ${p.name} declined the federal corporate bailout, gambling on high-stake active projects.`,
          playerId: p.id,
        };
        next.log = [newLog, ...next.log];
      }
      next.bailoutPlayerId = null;
      return next;
    });
    handlePlaySound('bzzt');
  };

  // Accept standard restorative HR Counseling, slashing debt but costing turn
  const handleAcceptHrCounseling = (playerId: number) => {
    handleModifyState((prev) => {
      let next = { ...prev };
      const playerIndex = next.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        const p = { ...next.players[playerIndex] };
        const debtReduction = Math.round(p.creditLimit * 0.40);
        const originalDebt = p.creditBalance;
        p.creditBalance = Math.max(0, p.creditBalance - debtReduction);
        p.usedHrCounseling = true;
        next.players[playerIndex] = p;
        
        // Log counseling event to administrative feed
        const newLog = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          type: 'debt' as const,
          message: `💆 HR COUNSELING SUCCESSFUL: ${p.name} completed consultation. Debt reduced by $${debtReduction} (from $${originalDebt} to $${p.creditBalance}). Turn ended to cover cost of assessment.`,
          playerId: p.id,
        };
        next.log = [newLog, ...next.log];
      }
      next.burnoutPlayerId = null;
      // End turn as cost of counseling
      return advanceToNextTurn(next);
    });
    handlePlaySound('success');
  };

  // Decline counseling, choosing to risk high debt stress
  const handleDeclineHrCounseling = (playerId: number) => {
    handleModifyState((prev) => {
      let next = { ...prev };
      const playerIndex = next.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        const p = { ...next.players[playerIndex] };
        p.dismissedBurnoutThisTurn = true;
        next.players[playerIndex] = p;
        
        // Log rejection event
        const newLog = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          type: 'system' as const,
          message: `⚠️ COUNSELING REFUSED: ${p.name} declined standard HR counseling, carrying a dangerous debt load of $${p.creditBalance}. Risk points accrued!`,
          playerId: p.id,
        };
        next.log = [newLog, ...next.log];
      }
      next.burnoutPlayerId = null;
      return next;
    });
    handlePlaySound('bzzt');
  };

  // SLA auto-play executor in case of slow or blocked actions
  const triggerSlaAutoPlay = () => {
    const state = latestGameStateRef.current;
    if (!state || state.winnerId !== null) return;

    const currentPlayerObj = state.players[state.currentPlayerId];
    if (!currentPlayerObj) return;

    // In multiplayer: only host behaves as fallback regulator, or if it is my turn
    if (isMultiplayer) {
      const isMyTurn = (state.currentPlayerId === myPlayerIndex);
      const amIHost = lanIsHost;
      if (!isMyTurn && !amIHost) return;
    }

    // Force unblock stuck bot processing state
    if (currentPlayerObj.isAI) {
      isAiProcessing.current = false;
    }

    const sysLogMessage = (msg: string) => {
      handleModifyState((prev) => {
        const next = { ...prev };
        next.log = [
          {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString(),
            type: 'system',
            message: msg,
            playerId: currentPlayerObj.id
          },
          ...next.log
        ];
        return next;
      });
    };

    // Case 1: Burnout modal has locked state
    if (state.burnoutPlayerId !== null) {
      sysLogMessage(`⏰ SLA TICKER: ${currentPlayerObj.name}'s restorative HR feedback autosubmitted due to response timeout.`);
      handleAcceptHrCounseling(state.burnoutPlayerId);
      return;
    }

    // Case 2: Bailout modal is open
    if (state.bailoutPlayerId !== null) {
      sysLogMessage(`⏰ SLA TICKER: ${currentPlayerObj.name} missed response window. Bailout package automatically declined.`);
      handleDeclineCorporateBailout(state.bailoutPlayerId);
      return;
    }

    // Case 3: Action Card pending confirmation
    if (state.activeCard !== null) {
      sysLogMessage(`⏰ SLA TICKER: Standard HR cabinet directive confirmed for ${currentPlayerObj.name} automatically.`);
      handleDismissCard();
      return;
    }

    // Case 4: Career path event pending decision
    if (state.activeCareerEvent) {
      const ev = state.activeCareerEvent;
      if (!ev.resolved) {
        sysLogMessage(`⏰ SLA TICKER: ${currentPlayerObj.name} chose Option A automatically due to corporate productivity SLA directive.`);
        handleSelectCareerOption('A');
      } else {
        handleDismissCareerEvent();
      }
      return;
    }

    // Case 5: Player has not rolled yet
    if (!state.hasRolled) {
      sysLogMessage(`⏰ SLA TICKER: Corporate automated clock-in triggered timesheet roll for ${currentPlayerObj.name}`);
      executeRoll();
      return;
    }

    // Case 6: Has rolled but turn still pending
    if (state.hasRolled) {
      const landedSpace = state.spaces[currentPlayerObj.position];
      const canBuy = landedSpace && landedSpace.type === 'department' && landedSpace.ownerId === null;
      const affordable = landedSpace ? (currentPlayerObj.creditBalance + landedSpace.cost <= currentPlayerObj.creditLimit) : false;

      if (canBuy && affordable) {
        sysLogMessage(`⏰ SLA TICKER: Turn ended automatically. Landmark division ${landedSpace.name} was auto-delegated to player credit card.`);
        handleModifyState((prev) => {
          let next = buyDepartmentSpace(prev, currentPlayerObj.position);
          next = advanceToNextTurn(next);
          return next;
        });
      } else {
        sysLogMessage(`⏰ SLA TICKER: Turn completed automatically for ${currentPlayerObj.name}`);
        handleEndTurn();
      }
      return;
    }
  };

  const triggerSlaAutoPlayRef = useRef(triggerSlaAutoPlay);
  useEffect(() => {
    triggerSlaAutoPlayRef.current = triggerSlaAutoPlay;
  }, [triggerSlaAutoPlay]);

  // Reset SLA Turn timer when any turn state or modal boundary shifts
  useEffect(() => {
    if (!gameState || gameState.winnerId !== null) {
      setTimeLeft(30);
      return;
    }
    setTimeLeft(30);
  }, [
    gameState?.currentPlayerId,
    gameState?.hasRolled,
    gameState?.activeCard?.id,
    gameState?.activeCareerEvent?.id,
    gameState?.activeCareerEvent?.resolved,
    gameState?.activeCareerEvent?.loading,
    gameState?.burnoutPlayerId,
    gameState?.bailoutPlayerId
  ]);

  // Tick countdown timer every second
  useEffect(() => {
    if (!gameState || gameState.winnerId !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          triggerSlaAutoPlayRef.current();
          return 30; // reset
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState?.winnerId]);

  // AI Automatic Behavior loop controller
  useEffect(() => {
    if (!gameState || gameState.winnerId !== null) return;

    const currentPlayer = gameState.players[gameState.currentPlayerId];
    if (currentPlayer.isAI && !gameState.hasRolled && !isAiProcessing.current) {
      isAiProcessing.current = true;
      
      // Determine simulation timing based on selected speed
      const delay = gameState.gameSpeed === 'fast' ? 1000 : gameState.gameSpeed === 'slow' ? 3000 : 2000;

      // Stage 1: AI Thinking typewriter effect simulation
      let text = "Analyzing liabilities...";
      let idx = 0;
      const typeInterval = setInterval(() => {
        setGameState((prev) => {
          if (!prev) return prev;
          return { ...prev, aiLogText: text.substring(0, idx) };
        });
        idx++;
        if (idx > text.length) clearInterval(typeInterval);
      }, 50);

      const aiTimer = setTimeout(() => {
        // Trigger rolling sequence state for AI turn
        setIsRolling(true);
        handlePlaySound('beep');

        let stepCount = 0;
        const interval = setInterval(() => {
          setVisualDice([
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
          ]);
          handlePlaySound('beep');
          stepCount++;
          if (stepCount >= 5) {
            clearInterval(interval);
          }
        }, 110);

        setTimeout(() => {
          setIsRolling(false);
          handleModifyState((prev) => {
            const result = simulateAiTurn(prev);
            handlePlaySound('beep');
            
            // Clear active modal auto-saves for AI cards to keep progress going
            let nextState = result.state;
            if (nextState.activeCard) {
              nextState = applyActionCardEffect(nextState);
            }
            
            // Auto advance to next turn for AI players to keep game highly interactive
            nextState = advanceToNextTurn(nextState);
            return nextState;
          });
          
          isAiProcessing.current = false;
        }, 600);
      }, delay);

      return () => {
        clearInterval(typeInterval);
        clearTimeout(aiTimer);
      };
    }
  }, [gameState?.currentPlayerId, gameState?.hasRolled]);

  // Reset entire simulation / wipe save
  const handleWipeSave = () => {
    localStorage.removeItem('anti_corporate_saved_game');
    setGameState(null);
    handlePlaySound('bzzt');
    setIsMultiplayer(false);
    if (lanSocketRef.current) {
      lanSocketRef.current.close();
      lanSocketRef.current = null;
    }
  };

  // Explicit Save game message triggers
  const handleManualSave = () => {
    if (!gameState) return;
    localStorage.setItem('anti_corporate_saved_game', JSON.stringify(gameState));
    handleModifyState((prev) => {
      const next = { ...prev };
      next.log = [
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'system',
          message: "💾 MANUAL OPERATION CONFIRMED. Active game spreadsheet successfully compiled to your local disk.",
        },
        ...next.log,
      ];
      return next;
    });
    handlePlaySound('success');
  };

  const handleShareStatus = async () => {
    if (!gameState || typeof window === 'undefined') return;

    const { title, text } = buildSharePayload(gameState, window.location.href);

    try {
      if (navigator.share) {
        await navigator.share({ title, text });
        return;
      }

      await navigator.clipboard.writeText(text);
      setToasts((prev) => [
        ...prev.slice(-3),
        {
          id: Math.random().toString(),
          type: 'card',
          title: 'SHARE TEXT COPIED',
          message: 'Web Share API is unavailable here, so the recap was copied to your clipboard.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      console.error('Share action failed', err);
      setToasts((prev) => [
        ...prev.slice(-3),
        {
          id: Math.random().toString(),
          type: 'debt_warning',
          title: 'SHARE UNAVAILABLE',
          message: 'Your browser could not open the share sheet or copy the recap text.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const handleSendPlayChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playChatInput.trim().length || !lanSocketRef.current) return;
    try {
      lanSocketRef.current.send(JSON.stringify({
        type: "chat-send",
        payload: {
          text: playChatInput.trim(),
          senderName: lanPlayerName,
          senderRoleIndex: lanRoleIndex
        }
      }));
      setPlayChatInput("");
    } catch (err) {
      console.error("Play room send chat failed", err);
    }
  };

  const activePlayer = gameState ? gameState.players[gameState.currentPlayerId] : null;
  const selectedSpace = gameState && gameState.selectedSpaceId !== null ? gameState.spaces[gameState.selectedSpaceId] : null;
  const selectedSpaceOwner = selectedSpace && selectedSpace.ownerId !== null ? gameState!.players[selectedSpace.ownerId] : null;

  return (
    <div id="full_page_container" className="min-h-screen bg-[#ede8e0] text-neutral-900 border-t-8 border-neutral-900 selection:bg-amber-200">
      
      {/* Satirical Corporate Header Bar */}
      <header id="main_app_header" className="border-b-2 border-neutral-950 px-4 py-3 bg-[#faf7f2] flex flex-col md:flex-row justify-between items-center gap-3 font-sans">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-mono font-extrabold tracking-tighter text-neutral-950 uppercase flex items-center gap-1.5">
              <span>🏢 ANTI-CORPORATE</span>
            </h1>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 border border-amber-300">
              SATIRICAL SIMULATOR v1.4
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-mono italic">
            Survive the quarterly spreadsheet review by dodging HR complaints and managing corporate debt.
          </p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio volume control proxy */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 border border-dashed border-neutral-700 hover:bg-neutral-200 text-neutral-700 transition-all flex items-center gap-1 text-xs font-mono"
            title="Toggle audio synth sounds"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
            <span className="hidden sm:inline">{soundEnabled ? "Audio On" : "Muted"}</span>
          </button>

          {/* Toggle Interactive QA Console */}
          {gameState && (
            <button
              onClick={() => handleModifyState(prev => ({ ...prev, showTestConsole: !prev.showTestConsole }))}
              className={`p-1.5 border border-neutral-950 font-mono text-xs flex items-center gap-1 ${
                gameState.showTestConsole ? 'bg-orange-500 text-zinc-950 font-bold' : 'bg-[#fff1f2] hover:bg-zinc-200 text-orange-600'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>QA Console</span>
            </button>
          )}

          {gameState && (
            <button
              onClick={handleShareStatus}
              className="p-1.5 border border-sky-900 bg-sky-100 hover:bg-sky-200 text-sky-900 transition-all flex items-center gap-1 text-xs font-mono"
              title="Share your current corporate status"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          )}

          <button
            onClick={() => setShowRules(true)}
            className="px-3 py-1.5 bg-[#fef08a] border-2 border-neutral-950 font-mono text-xs font-bold uppercase hover:bg-yellow-300 tracking-tight flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" />
            <span>How to Survive</span>
          </button>

          {gameState && (
            <>
              <button
                onClick={handleManualSave}
                className="p-1.5 border border-neutral-950 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-all font-mono text-xs flex items-center gap-1"
                title="Save game progress"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleWipeSave}
                className="p-1.5 border border-neutral-900 bg-red-800/10 hover:bg-red-800/20 text-red-700 font-mono text-xs uppercase font-bold"
                title="Wipe current save and exit to main menu"
              >
                Exit Game
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Area */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* State A: setup setup screen */}
        {!gameState ? (
          <div className="space-y-6">
            {/* Setup Mode Tab Segment */}
            <div className="flex border-2 border-[#1e293b] p-1 bg-[#ede8e0] max-w-4xl mx-auto">
              <button
                type="button"
                onClick={() => setSetupMode('local')}
                className={`flex-1 py-2 font-mono text-xs font-black uppercase text-center transition-all cursor-pointer ${
                  setupMode === 'local' ? 'bg-neutral-950 text-white shadow-sm' : 'text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                🏢 LOCAL AREA OFFICE (PASS-n-PLAY & BOTS)
              </button>
              <button
                type="button"
                onClick={() => setSetupMode('lan')}
                className={`flex-1 py-2 font-mono text-xs font-black uppercase text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  setupMode === 'lan' ? 'bg-blue-900 text-amber-300' : 'text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${setupMode === 'lan' ? "animate-pulse" : ""}`} />
                <span>📡 HIGH-COLLABORATION LAN (BETA MULTIPLAYER)</span>
                <span className="bg-red-650 text-white text-[8px] font-black tracking-tight px-1.5 py-0.2 uppercase shrink-0">BETA</span>
              </button>
            </div>

            {setupMode === 'local' ? (
              <div id="game_setup_canvas" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
            {/* Left Box: Title & Setup presets */}
            <div className="lg:col-span-7 bg-[#faf7f2] border-2 border-neutral-950 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
              <div className="border-b-2 border-neutral-300 pb-4">
                <span className="bg-neutral-900 text-white font-mono text-xs uppercase px-2 py-0.5">ESTABLISH STAFF LIST</span>
                <h2 className="text-2xl font-mono font-extrabold text-neutral-950 mt-2">DEBT MANAGEMENT OFFICE REGISTRY</h2>
                <p className="text-sm text-neutral-600 mt-1">
                  Draft employees for the quarterly corporate audit cycle. Add bot players or manage pass-and-play colleagues. Every player starts inside the cubicles carry outstanding credit card liabilities.
                </p>
              </div>

              {/* Add employees rows */}
              <div className="space-y-4">
                {setupPlayers.map((player, idx) => (
                  <div key={idx} className="border border-neutral-300 p-3 bg-white flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    <span className="text-xs font-mono font-bold bg-neutral-100 border border-neutral-300 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>

                    {/* Name input */}
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] text-neutral-400 font-mono uppercase block text-left">Employee Name</label>
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => updateSetupPlayer(idx, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-neutral-300 font-mono text-xs focus:outline-hidden focus:border-neutral-900"
                        placeholder="Employee Name"
                      />
                    </div>

                    {/* Role selector dropdown */}
                    <div className="md:w-56 space-y-1">
                      <label className="text-[10px] text-neutral-400 font-mono uppercase block text-left">Fictional Job Role</label>
                      <select
                        value={player.roleIndex}
                        onChange={(e) => updateSetupPlayer(idx, 'roleIndex', parseInt(e.target.value))}
                        className="w-full px-2 py-1 border border-neutral-300 font-mono text-xs focus:outline-hidden focus:border-neutral-900"
                      >
                        {ROLE_PRESETS.map((preset, pIdx) => (
                          <option key={pIdx} value={pIdx}>
                            {preset.name} (Limit: ₹{preset.startingLimit}, Debt: ₹{preset.startingBalance})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Type check toggle AI / Human */}
                    <div className="md:w-28 space-y-1">
                      <label className="text-[10px] text-neutral-400 font-mono uppercase block text-left">Intelligence</label>
                      <select
                        value={player.isAI.toString()}
                        onChange={(e) => updateSetupPlayer(idx, 'isAI', e.target.value === 'true')}
                        className="w-full px-2 py-1 border border-neutral-300 font-mono text-xs focus:outline-hidden focus:border-neutral-900"
                      >
                        <option value="false">Human</option>
                        <option value="true">Computer Bot</option>
                      </select>
                    </div>

                    {/* Delete button */}
                    {setupPlayers.length > 2 && (
                      <button
                        onClick={() => removeSetupPlayer(idx)}
                        className="self-end md:self-auto p-1.5 border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-650 transition-colors"
                        title="Remove employee slot"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {setupPlayers.length < 4 && (
                  <button
                    onClick={addSetupPlayer}
                    className="w-full py-2 border border-dashed border-neutral-400 font-mono text-xs uppercase font-bold text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all"
                  >
                    ➕ ADD ADDITIONAL EMPLOYEE DECK SLOT (Max 4)
                  </button>
                )}
              </div>

              {/* Difficulty presetting */}
              <div className="border border-neutral-300 p-4 bg-[#fbf9f4] space-y-2">
                <span className="bg-neutral-800 text-[#facc15] text-[9px] font-mono uppercase px-2 py-0.5 font-bold">Adjust Corporate Retainer Difficulty</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedDifficulty('ceo_nephew')}
                    className={`p-2 border font-mono text-xs ${
                      selectedDifficulty === 'ceo_nephew' ? 'bg-emerald-100 border-emerald-600 text-emerald-800 font-bold' : 'bg-white border-neutral-300'
                    }`}
                  >
                    CEO's Nephew
                    <span className="block text-[8px] text-neutral-400 mt-0.5">Easy starting debt</span>
                  </button>
                  <button
                    onClick={() => setSelectedDifficulty('senior')}
                    className={`p-2 border font-mono text-xs ${
                      selectedDifficulty === 'senior' ? 'bg-blue-100 border-blue-600 text-blue-800 font-bold' : 'bg-white border-neutral-300'
                    }`}
                  >
                    Mid Associate
                    <span className="block text-[8px] text-neutral-400 mt-0.5">Standard starting debt</span>
                  </button>
                  <button
                    onClick={() => setSelectedDifficulty('intern')}
                    className={`p-2 border font-mono text-xs ${
                      selectedDifficulty === 'intern' ? 'bg-red-100 border-red-600 text-red-800 font-bold' : 'bg-white border-neutral-300'
                    }`}
                  >
                    Unpaid Intern
                    <span className="block text-[8px] text-neutral-400 mt-0.5">Intense startup stress</span>
                  </button>
                </div>
              </div>

              {/* Start game trigger buttons */}
              <button
                onClick={handleStartGame}
                className="w-full py-3 bg-neutral-900 text-white font-mono font-bold uppercase tracking-wider text-sm border-2 border-neutral-950 hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <span>🚀 Clock-In & Issue Credit Cards (Simulate Game)</span>
              </button>
            </div>

            {/* Right Box Help / Rules intro */}
            <div className="lg:col-span-5 bg-amber-50 border-2 border-neutral-950 p-6 space-y-4 font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">OFFICIAL SYSTEM MEMORANDUM</span>
              <h3 className="text-xl font-bold font-sans text-neutral-900 leading-snug">HOW TO DEFEAT LACK-OF-ALIGNMENT DEBT:</h3>
              
              <ul className="text-xs text-neutral-700 space-y-3 leading-relaxed list-decimal list-inside pr-1">
                <li>
                  <strong>Do not hoard liquid credits.</strong> There is no physical cash in this office. Every action adds balance (unpaid liability) to your cards.
                </li>
                <li>
                  <strong>Claim unassigned projects (divisions).</strong> Land on gray blocks to delegate ownership. Other employees who land on them pay <strong>Bandwidth Fees</strong>, directly reducing your debt.
                </li>
                <li>
                  <strong>Pass Go (the Clock-In Desk).</strong> Collects timesheet compensation but forces <strong>Rate Interest Charges</strong> on unpaid loans. Pay off loans quickly to avoid interest rate penalties!
                </li>
                <li>
                  <strong>Keep Stress Levels down.</strong> Land on the Water Cooler or buy overpriced coffee. Collapsing from burnout demands medical administrative bills of ₹200.
                </li>
              </ul>

              <div className="border-t border-neutral-300 pt-4 text-[10px] text-neutral-500 italic leading-relaxed">
                {OFFICE_DESPAIR_DISCLAIMER}
              </div>
            </div>
          </div>
          ) : (
            <LanMultiplayerLobby
              onStartGame={handleStartLanGame}
              registeredRoleIndex={lanRoleIndex}
              onRoleIndexChange={setLanRoleIndex}
              registeredName={lanPlayerName}
              onNameChange={setLanPlayerName}
            />
          )}
          </div>
        ) : (
          /* State B: Active game board layout */
          <div id="game_panel_board_columns" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Column 1 (Left 7-span width): Board viewport & inspection panel */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* QA Console overlay banner if toggled */}
              {gameState.showTestConsole && (
                <TestSandbox
                  gameState={gameState}
                  onModifyState={handleModifyState}
                />
              )}

              {/* Main digital perimeter board */}
              <Board
                spaces={gameState.spaces}
                players={gameState.players}
                currentPlayerId={gameState.currentPlayerId}
                selectedSpaceId={gameState.selectedSpaceId}
                onSelectSpace={(id) => handleModifyState(prev => ({ ...prev, selectedSpaceId: id }))}
              >
                {/* Board central command box */}
                <div className="text-center p-3 h-full flex flex-col justify-between items-center text-neutral-900 relative">
                  
                  {/* Current Active Employee state card summary */}
                  <div className="w-full max-w-[220px] bg-[#faf7f2] border border-neutral-950 p-2.5 space-y-1 relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[9px] bg-neutral-900 text-amber-300 font-mono uppercase font-bold px-1 py-0.2">
                      Active Shift Associate
                    </span>
                    <h3 className="text-sm font-mono font-bold flex justify-center items-center gap-1 mt-1 text-neutral-950">
                      <span>{activePlayer!.avatar}</span>
                      <span>{activePlayer!.name}</span>
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-tight truncate">
                      Job: {activePlayer!.role}
                    </p>
                    <div className="mt-1 pb-1 pt-1.5 border-t border-dashed border-neutral-300 flex flex-col gap-1 text-left">
                      <div className="flex items-center justify-between gap-1 w-full text-[8.5px] text-neutral-400 font-mono">
                        <span className="uppercase tracking-tighter">PRODUCTIVITY SLA:</span>
                        <span className={`font-mono text-[9.5px] font-black px-1.5 py-0.2 select-none border tracking-tighter ${
                          timeLeft <= 8 ? 'bg-red-650 text-white border-red-800 animate-pulse font-extrabold' : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          {timeLeft}s
                        </span>
                      </div>
                      <div className="w-full bg-neutral-205 h-1 border border-neutral-305 relative overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            timeLeft <= 8 ? 'bg-red-600' : 'bg-emerald-600'
                          }`} 
                          style={{ width: `${(timeLeft / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dice roll animation or static view */}
                  <div className="my-1.5 flex flex-col items-center justify-center gap-1">
                    <div className="flex gap-4 items-center justify-center h-16">
                      <ThreeDDice value={visualDice[0]} rolling={isRolling} />
                      <ThreeDDice value={visualDice[1]} rolling={isRolling} />
                    </div>
                    <span className="text-[9.5px] text-neutral-600 font-mono tracking-tight uppercase font-bold">
                      {isRolling ? "Sifting Timesheet Data..." : `Timesheet score: ${visualDice[0] + visualDice[1]}`}
                    </span>
                  </div>

                  {/* Operational triggers */}
                  <div className="w-full max-w-[220px] space-y-2">
                    
                    {/* If player is AI: show simulated clock banner */}
                    {activePlayer!.isAI ? (
                      <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-none flex items-center justify-center gap-2 animate-pulse">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                        <span className="font-mono text-xs text-amber-900 tracking-tight">
                          🤖 {activePlayer!.name} thinking: {gameState.aiLogText || "synthesizing options..."}
                        </span>
                      </div>
                    ) : (
                      /* Human controls */
                      <div className="space-y-2">
                        {isMultiplayer && gameState.currentPlayerId !== myPlayerIndex ? (
                          <div className="bg-blue-50 border-2 border-blue-900/60 p-2.5 text-center rounded-none font-mono text-[9.5px] space-y-1">
                            <span className="bg-blue-900 text-[#facc15] font-mono text-[8px] font-black uppercase px-1.5 py-0.2 tracking-wider animate-pulse inline-block">
                              SYNCING WORKSPACE
                            </span>
                            <p className="text-blue-900 font-extrabold leading-tight">
                              💻 {gameState.players[gameState.currentPlayerId].name.toUpperCase()} is executing their active corporate turn cycle...
                            </p>
                          </div>
                        ) : (
                          <>
                            {/* Roll dice trigger */}
                            {!gameState.hasRolled ? (
                              <button
                                onClick={executeRoll}
                                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                              >
                                <Dice5 className="w-4 h-4 animate-bounce" />
                                <span>Submit Timesheet Roll (Roll Dice)</span>
                              </button>
                            ) : (
                              /* Land Action options or pass turn */
                              <div className="grid grid-cols-2 gap-2 font-mono">
                                {/* Option 2: Pass shift */}
                                <button
                                  onClick={handleEndTurn}
                                  className="w-full py-2 border-2 border-neutral-950 bg-neutral-900 text-white font-bold text-xs uppercase hover:bg-neutral-800"
                                >
                                  <span>Submit Shift (Done)</span>
                                </button>

                                {/* Option 1: Buy property if landed on unassigned */}
                                {(() => {
                                  const landedSpace = gameState.spaces[activePlayer!.position];
                                  const canBuy = landedSpace.type === 'department' && landedSpace.ownerId === null;
                                  return (
                                    <button
                                      disabled={!canBuy || activePlayer!.creditBalance + landedSpace.cost > activePlayer!.creditLimit}
                                      onClick={() => handleModifyState((prev) => buyDepartmentSpace(prev, activePlayer!.position))}
                                      className="w-full py-2 border-2 border-neutral-950 bg-emerald-600 text-white font-bold text-xs uppercase hover:bg-emerald-700 disabled:opacity-30 disabled:pointer-events-none"
                                    >
                                      <span>Claim Division (₹{landedSpace.cost})</span>
                                    </button>
                                  );
                                })()}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Board>

              {/* Inspected square drawer (below board if selected) */}
              {selectedSpace && (
                <div id="inspected_space_drawer" className="bg-[#faf7f2] border-2 border-neutral-950 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: selectedSpace.groupColor || '#ccc' }} />
                      <h4 className="text-sm font-mono font-extrabold text-neutral-900 uppercase">
                        {selectedSpace.name} ({selectedSpace.type.toUpperCase()})
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-500 max-w-lg leading-relaxed font-mono">
                      {selectedSpace.description}
                    </p>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end font-mono text-[10px]">
                    <button
                      onClick={() => handleModifyState(prev => ({ ...prev, selectedSpaceId: null }))}
                      className="px-2.5 py-1.5 border border-neutral-400 hover:bg-zinc-200"
                    >
                      Dismiss View
                    </button>
                    
                    {selectedSpace.type === 'department' && (
                      <button
                        onClick={() => handleModifyState(prev => {
                          const stateCopy = { ...prev };
                          stateCopy.selectedSpaceId = selectedSpace.id;
                          return stateCopy;
                        })} // will re-trigger the DetailModal rendering!
                        className="px-2.5 py-1.5 bg-[#fef08a] hover:bg-yellow-300 border-2 border-neutral-950 font-bold uppercase"
                      >
                        File Operations (Manage)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Column 2 (Right 5-span width): Player standings and detailed administrative audit log ladder */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              
              {/* Turn Quarter details Card */}
              <div id="quarter_dashboard_indicator" className="bg-[#faf7f2] border-2 border-neutral-950 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left font-mono text-xs flex justify-between items-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Active Retainer Phase:</span>
                  <h3 className="text-lg font-extrabold text-neutral-950 tracking-tighter uppercase mt-0.5">
                    🗂️ Q{gameState.turnCount} Audit Loop
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Board Safe Zone:</span>
                  <div className="mt-0.5 text-neutral-800 font-semibold uppercase font-mono text-[11px]">
                    ☕ Water Cooler is Space 8
                  </div>
                </div>
              </div>

              {/* Player Standings list */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider text-left">
                  Staff Roster & Debt Position Summary:
                </h3>
                
                <div id="player_standing_scroller" className="grid grid-cols-1 gap-3 max-h-[440px] overflow-y-auto">
                  {gameState.players.map((player) => {
                    const ownedSpaces = gameState.spaces.filter((s) => s.ownerId === player.id);
                    return (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        isActive={gameState.currentPlayerId === player.id}
                        ownedSpaces={ownedSpaces}
                        onRestructure={handleRestructureDebt}
                        onOpenSpaceDetails={(spaceId) => handleModifyState(prev => ({ ...prev, selectedSpaceId: spaceId }))}
                        showRestructureBtn={player.id === activePlayer!.id && !player.isAI}
                        soundEnabled={soundEnabled}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Administrative ledger log box */}
              <div className="bg-black text-amber-200 border-2 border-neutral-950 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-full min-h-[220px] max-h-[300px] flex flex-col justify-between">
                <div>
                  {isMultiplayer ? (
                    <div className="flex border-b border-zinc-850 pb-1 mb-2 gap-4 text-[10.5px] font-mono uppercase">
                      <button
                        type="button"
                        onClick={() => setActiveLedgerTab('logs')}
                        className={`pb-1 font-bold cursor-pointer ${activeLedgerTab === 'logs' ? 'text-amber-200 border-b-2 border-amber-200' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        📊 LEDGER JOURNAL
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveLedgerTab('chat')}
                        className={`pb-1 font-bold cursor-pointer relative ${activeLedgerTab === 'chat' ? 'text-amber-200 border-b-2 border-amber-200' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        💬 CORPMESSENGER CHAT
                        <span className="ml-1 bg-blue-600 text-[7.5px] text-white px-1 font-black animate-pulse uppercase rounded-sm">ROOM #{lanRoomCode}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-1 text-[10px] font-mono uppercase text-zinc-400">
                      <span>Administrative Ledger Journal Ledger</span>
                      <span className="text-emerald-400">● LIVE DATAFEED</span>
                    </div>
                  )}

                  {activeLedgerTab === 'logs' || !isMultiplayer ? (
                    <div className="overflow-y-auto text-left font-mono text-[10px] space-y-1.5 h-38 pr-1.5 leading-snug mt-2">
                      {gameState.log.map((log) => {
                        const author = log.playerId !== undefined ? gameState.players[log.playerId] : null;
                        return (
                          <div key={log.id} className="border-b border-zinc-900 pb-1">
                            <span className="text-zinc-500 text-[8.5px] font-semibold mr-1.5">{log.timestamp}</span>
                            {author && (
                              <span className="font-bold mr-1.5" style={{ color: author.color }}>
                                [{author.name.substring(0, 8)}]
                              </span>
                            )}
                            <span className="text-zinc-200">{log.message}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col h-38 justify-between mt-2">
                      <div className="overflow-y-auto text-left font-mono text-[10px] space-y-1.5 h-28 pr-1.5 leading-snug">
                        {lanChats.length === 0 ? (
                          <div className="text-zinc-500 italic text-[9.5px] py-4 text-center">
                            No telemetry broadcasted yet. Type below to memo your colleagues!
                          </div>
                        ) : (
                          lanChats.map((chat, idx) => {
                            const senderRolePreset = ROLE_PRESETS[chat.senderRoleIndex || 0];
                            return (
                              <div key={idx} className="border-b border-zinc-950 pb-1 text-zinc-300">
                                <span className="text-neutral-500 text-[8.5px] mr-1">[{chat.timestamp || new Date().toLocaleTimeString()}]</span>
                                <span className="font-bold" style={{ color: senderRolePreset?.accentColor || '#3b82f6' }}>
                                  {chat.senderName} ({senderRolePreset?.name.substring(0, 10)}):
                                </span>{" "}
                                <span className="text-zinc-100">{chat.text}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <form onSubmit={handleSendPlayChat} className="flex gap-1 border-t border-zinc-900 pt-1.5">
                        <input
                          type="text"
                          value={playChatInput}
                          onChange={(e) => setPlayChatInput(e.target.value)}
                          placeholder="Type internal slack memo..."
                          className="flex-1 bg-zinc-950 border border-zinc-800 text-[10px] text-amber-200 px-2 py-1 font-mono focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="bg-zinc-800 hover:bg-zinc-700 text-[9.5px] font-bold text-amber-200 px-2 rounded-none border border-zinc-700 flex items-center justify-center cursor-pointer font-mono uppercase"
                        >
                          <Send className="w-3 h-3 mr-1 text-[#facc15]" />
                          Send
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER & DISCLAIMER */}
      <footer id="app_bottom_disclaimer" className="border-t border-neutral-300 py-6 mt-12 bg-[#dfdacd]/20 text-[10.5px] text-neutral-500 leading-relaxed font-mono px-4 text-center max-w-4xl mx-auto">
        {OFFICE_DESPAIR_DISCLAIMER}
      </footer>

      {/* Rules Modal display */}
      {showRules && (
        <RulesModal onClose={() => setShowRules(false)} />
      )}

      {/* HR / Town Hall card memo active modal display */}
      {gameState && gameState.activeCard && (
        <CardModal
          card={gameState.activeCard}
          playerName={gameState.players[gameState.currentPlayerId].name}
          onConfirm={handleDismissCard}
        />
      )}

      {/* Career Path event system dilemma/consequence active modal display */}
      {gameState && gameState.activeCareerEvent && (
        <CareerEventModal
          event={gameState.activeCareerEvent}
          player={gameState.players[gameState.currentPlayerId]}
          myPlayerIndex={myPlayerIndex}
          isMultiplayer={isMultiplayer}
          onSelectOption={handleSelectCareerOption}
          onConfirm={handleDismissCareerEvent}
        />
      )}

      {/* Property detail full operations modal drawer */}
      {selectedSpace && selectedSpaceIdOverLimitAndConfirmModalOpen(gameState, selectedSpace) && (
        <DeptDetailModal
          space={selectedSpace}
          owner={selectedSpaceOwner}
          currentPlayer={activePlayer!}
          onClose={() => handleModifyState(prev => ({ ...prev, selectedSpaceId: null }))}
          onUpgrade={handleAcquireOrUpgrade}
          onOutsource={handleToggleOutsource}
        />
      )}

      {/* Burnout Report Urgent HR modal display */}
      {gameState && gameState.burnoutPlayerId !== null && (() => {
        const p = gameState.players.find(pl => pl.id === gameState.burnoutPlayerId);
        return p ? (
          <BurnoutReportModal
            player={p}
            onAccept={handleAcceptHrCounseling}
            onDecline={handleDeclineHrCounseling}
          />
        ) : null;
      })()}

      {/* Corporate Bailout Choice modal display */}
      {gameState && gameState.bailoutPlayerId !== null && (() => {
        const p = gameState.players.find(pl => pl.id === gameState.bailoutPlayerId);
        return p ? (
          <CorporateBailoutModal
            player={p}
            onAccept={handleAcceptCorporateBailout}
            onDecline={handleDeclineCorporateBailout}
          />
        ) : null;
      })()}

      {/* Transaction Swipe Card Terminal Satirical Overlay */}
      {activeSwipe && activeSwipe.show && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border-4 border-neutral-900 rounded-none p-6 max-w-sm w-full text-center relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {/* Ledger Screen Terminal Display */}
            <div className="bg-black border-2 border-neutral-800 p-4 rounded-none mb-6 font-mono text-left select-none relative">
              <div className={`absolute top-2.5 right-2.5 w-3.5 h-3.5 rounded-full ${
                activeSwipe.isProfit ? 'bg-emerald-500 animate-terminal-success' : 'bg-red-500 animate-terminal-fail'
              }`} />
              
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-neutral-800 pb-1 mb-2">
                📟 CORP READ-OUT V19.0
              </p>
              
              {activeSwipe.amount === 0 ? (
                <div>
                  <p className="text-zinc-300 text-xs font-bold uppercase">SWIPED: NO DIFFERENCE</p>
                  <p className="text-zinc-500 text-[10px] mt-1">Associate: {activeSwipe.playerName}</p>
                  <p className="text-amber-400 text-xs font-bold mt-2">₹0 WORKING SHIFT FLUCTUATION</p>
                </div>
              ) : activeSwipe.isProfit ? (
                <div>
                  <p className="text-emerald-400 text-xs font-bold uppercase">✅ TRANSACTION APPROVED</p>
                  <p className="text-zinc-400 text-[10px] mt-1">Associate: {activeSwipe.playerName}</p>
                  <p className="text-neutral-500 text-[9px] mt-2">Restructured / Out-sourced:</p>
                  <p className="text-emerald-500 text-lg font-black mt-1">-₹{activeSwipe.amount}</p>
                  <p className="text-emerald-400 text-[9px] uppercase tracking-tighter mt-1 italic animate-pulse">
                    * REDUCED PERSONAL CARD LIABILITY *
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-red-500 text-xs font-bold uppercase">❌ LIABILITY OVERDRAFT</p>
                  <p className="text-zinc-400 text-[10px] mt-1">Associate: {activeSwipe.playerName}</p>
                  <p className="text-neutral-500 text-[9px] mt-2">Expensed / Accumulated Interests:</p>
                  <p className="text-red-500 text-lg font-black mt-1">+₹{activeSwipe.amount}</p>
                  <p className="text-rose-400 text-[9px] uppercase tracking-tighter mt-1 italic animate-pulse">
                    * ACCUMULATED DEBT EXPANSIONS *
                  </p>
                </div>
              )}
            </div>

            {/* Track Slot Slider background */}
            <div className="h-20 bg-neutral-900 border-2 border-neutral-800 rounded-none relative overflow-hidden flex items-center justify-center">
              {/* Swipe swipe arrow line markers */}
              <div className="absolute inset-x-0 h-1 bg-amber-400/20 flex justify-between px-2 items-center text-amber-500 text-[8px] font-mono select-none">
                <span>&lt;&lt;&lt; INSERT BADGE</span>
                <span>SWIPING CARD TRACK &gt;&gt;&gt;</span>
              </div>

              {/* Animated Credit Card Swipe Segment */}
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-14 rounded-md border-2 border-neutral-950 p-1.5 flex flex-col justify-between shadow-lg select-none animate-card-swipe"
                style={{ backgroundColor: activeSwipe.playerColor }}
              >
                {/* Chip design details */}
                <div className="flex justify-between items-start">
                  <span className="text-[5.5px] font-extrabold text-neutral-950 tracking-widest uppercase truncate max-w-[70px]">
                    {activeSwipe.playerName}
                  </span>
                  <div className="w-4 h-3 bg-yellow-400/80 rounded-xs border border-neutral-950" />
                </div>
                
                <div className="flex justify-between items-end">
                  <span className="text-[6px] font-mono text-zinc-900 font-bold">
                    •••• 1984
                  </span>
                  <span className="text-[5.5px] text-zinc-900 font-extrabold tracking-tight">
                    LIABILITY BADGE
                  </span>
                </div>
              </div>
            </div>
            
            {/* Satirical warning details footer */}
            <p className="text-[8px] font-mono text-zinc-500 mt-4 leading-relaxed uppercase">
              * Signoff: Proceeding confirms immediate voluntary salary sacrifice. Approved by local synergy compliance units.
            </p>
          </div>
        </div>
      )}

      {/* Slide-In Toast Notification Alert Stack */}
      <ToastContainer toasts={toasts} onRemove={handleRemoveToast} />
    </div>
  );
}

// Inline helper to check if space is valid for detailing
function selectedSpaceIdOverLimitAndConfirmModalOpen(state: GameState, space: BoardSpace): boolean {
  // If human, they can click departments they own or unowned spaces to inspect
  if (state.selectedSpaceId === null) return false;
  return space.type === 'department';
}

function buildFallbackCareerEvent(player: Player): Pick<
  NonNullable<GameState['activeCareerEvent']>,
  'scenarioName' | 'situation' | 'optionA' | 'optionB'
> {
  return {
    scenarioName: 'Legacy HR Escalation Memo',
    situation: `${player.name} is pulled into an emergency alignment meeting after the remote HR directive service stops responding. The department still needs a decision, because bureaucracy never waits for infrastructure.`,
    optionA: {
      label: 'Accept the manual remediation sprint',
      debtChange: -120,
      stressChange: 18,
    },
    optionB: {
      label: 'File a passive-aggressive outage report',
      debtChange: 90,
      stressChange: -12,
    },
  };
}

function buildSharePayload(state: GameState, currentUrl: string): { title: string; text: string } {
  const winPlayer = state.winnerId !== null ? state.players[state.winnerId] : null;
  const bankruptPlayer = state.players.find((player) => player.bankrupt) ?? null;
  const escapedPlayer = state.players.find((player) => player.escaped) ?? null;
  const primaryPlayer = winPlayer ?? bankruptPlayer ?? escapedPlayer ?? state.players.find((player) => !player.isAI) ?? state.players[state.currentPlayerId];

  const victoryLabels: Record<NonNullable<GameState['victoryType']>, string> = {
    financial_freedom: 'Financial Freedom',
    last_standing: 'Last Worker Standing',
    ceo_takeover: 'C-Suite Coup',
  };

  if (winPlayer) {
    const victoryLabel = state.victoryType ? victoryLabels[state.victoryType] : 'Corporate Victory';
    return {
      title: 'Anti-Corporate corporate win',
      text: [
        'Anti-Corporate corporate win',
        '',
        `${winPlayer.name} just won by ${victoryLabel}.`,
        `Debt balance: ₹${winPlayer.creditBalance} / ₹${winPlayer.creditLimit}`,
        `Stress level: ${winPlayer.stressLevel}%`,
        `Turn: ${state.turnCount}`,
        `Play here: ${currentUrl}`,
      ].join('\n'),
    };
  }

  if (bankruptPlayer) {
    return {
      title: 'Anti-Corporate bankruptcy status',
      text: [
        'Anti-Corporate bankruptcy status',
        '',
        `${bankruptPlayer.name} has been declared bankrupt.`,
        `Debt balance: ₹${bankruptPlayer.creditBalance} / ₹${bankruptPlayer.creditLimit}`,
        `Stress level: ${bankruptPlayer.stressLevel}%`,
        `Turn: ${state.turnCount}`,
        `Play here: ${currentUrl}`,
      ].join('\n'),
    };
  }

  if (escapedPlayer) {
    return {
      title: 'Anti-Corporate win recap',
      text: [
        'Anti-Corporate win recap',
        '',
        `${escapedPlayer.name} reached financial freedom and escaped the office.`,
        `Debt balance: ₹${escapedPlayer.creditBalance} / ₹${escapedPlayer.creditLimit}`,
        `Stress level: ${escapedPlayer.stressLevel}%`,
        `Turn: ${state.turnCount}`,
        `Play here: ${currentUrl}`,
      ].join('\n'),
    };
  }

  return {
    title: 'Anti-Corporate status update',
    text: [
      'Anti-Corporate status update',
      '',
      `${primaryPlayer.name} is still surviving the quarterly audit.`,
      `Debt balance: ₹${primaryPlayer.creditBalance} / ₹${primaryPlayer.creditLimit}`,
      `Stress level: ${primaryPlayer.stressLevel}%`,
      `Turn: ${state.turnCount}`,
      `Play here: ${currentUrl}`,
    ].join('\n'),
  };
}
