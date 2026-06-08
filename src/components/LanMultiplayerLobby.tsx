import React, { useState, useEffect, useRef } from "react";
import { ROLE_PRESETS } from "../constants";
import { RefreshCw, Radio, Server, MessageSquare, ShieldAlert, Check, HelpCircle, Gamepad2, ArrowRight, FolderOpen } from "lucide-react";

interface LANPlayer {
  id: string;
  name: string;
  roleIndex: number;
  isHost: boolean;
  isActive: boolean;
  ready: boolean;
  color?: string;
}

interface DiscoverableRoom {
  code: string;
  name: string;
  playerCount: number;
  started: boolean;
}

interface LANChat {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface LanMultiplayerLobbyProps {
  onStartGame: (players: Array<{ name: string; roleIndex: number; isAI: boolean }>, roomCode: string, isHost: boolean, myPlayerId: string, socket: WebSocket) => void;
  registeredRoleIndex: number;
  onRoleIndexChange: (idx: number) => void;
  registeredName: string;
  onNameChange: (name: string) => void;
}

export default function LanMultiplayerLobby({
  onStartGame,
  registeredRoleIndex,
  onRoleIndexChange,
  registeredName,
  onNameChange
}: LanMultiplayerLobbyProps) {
  const [roleIndex, setRoleIndex] = useState(registeredRoleIndex);
  const [name, setName] = useState(registeredName);

  // Connection/Room states
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [roomNameInput, setRoomNameInput] = useState("");
  const [status, setStatus] = useState<"offline" | "connecting" | "lobby">("offline");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active lobby info
  const [activeCode, setActiveCode] = useState<string>("");
  const [lobbyPlayers, setLobbyPlayers] = useState<LANPlayer[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string>("");
  const [isHost, setIsHost] = useState(false);
  const [roomInviteLink, setRoomInviteLink] = useState<string>("");

  // Discoverable LAN lobbies
  const [discoveredRooms, setDiscoveredRooms] = useState<DiscoverableRoom[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Chat message support
  const [chats, setChats] = useState<LANChat[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Web socket instance
  const socketRef = useRef<WebSocket | null>(null);

  // Sync state upward when edited
  useEffect(() => {
    onRoleIndexChange(roleIndex);
  }, [roleIndex]);

  useEffect(() => {
    onNameChange(name);
  }, [name]);

  // Discover active rooms on mount and update lists
  const fetchActiveRooms = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/lan/rooms");
      if (res.ok) {
        const data = await res.json();
        setDiscoveredRooms(data);
      }
    } catch (err) {
      console.warn("Could not probe REST list of rooms (likely in sandboxed dev client)");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveRooms();
    const interval = setInterval(fetchActiveRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const saveRoomSession = (roomCode: string, playerId: string, name: string, roleIndex: number) => {
    window.sessionStorage.setItem("antiCorporateLanRoom", JSON.stringify({ roomCode, playerId, name, roleIndex }));
  };

  const clearRoomSession = () => {
    window.sessionStorage.removeItem("antiCorporateLanRoom");
  };

  const makeInviteLink = (code: string) => {
    const origin = window.location.origin;
    return `${origin}${window.location.pathname}?lanRoom=${code}`;
  };

  const loadPreviousRoomSession = () => {
    const stored = window.sessionStorage.getItem("antiCorporateLanRoom");
    if (!stored) return null;
    try {
      return JSON.parse(stored) as { roomCode: string; playerId: string; name: string; roleIndex: number };
    } catch {
      return null;
    }
  };

  const connectToSocket = (roomCode: string, actionType: "create" | "join" | "reconnect", customRoomName?: string, playerId?: string) => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    setErrorMsg(null);
    setStatus("connecting");

    // Dynamically derive WebSocket URL based on current router (secure or in-secure)
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/lan`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      if (actionType === "create") {
        socket.send(JSON.stringify({
          type: "create-room",
          payload: {
            roomCode,
            roomName: customRoomName,
            hostName: name || "Anonymous HR Lead",
            roleIndex: roleIndex
          }
        }));
      } else if (actionType === "join") {
        socket.send(JSON.stringify({
          type: "join-room",
          payload: {
            roomCode,
            playerName: name || "Colleague Anon",
            roleIndex: roleIndex
          }
        }));
      } else if (actionType === "reconnect" && playerId) {
        socket.send(JSON.stringify({
          type: "reconnect-room",
          payload: {
            roomCode,
            playerId,
            playerName: name || "Colleague Anon",
            roleIndex: roleIndex
          }
        }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, payload } = msg;

        switch (type) {
          case "room-created":
          case "room-joined":
          case "room-rejoined": {
            setStatus("lobby");
            setActiveCode(payload.roomCode);
            setMyPlayerId(payload.playerId);
            setIsHost(payload.playerId === "p-host");
            setLobbyPlayers(payload.players);
            setRoomInviteLink(makeInviteLink(payload.roomCode));
            saveRoomSession(payload.roomCode, payload.playerId, name, roleIndex);
            
            // Add custom connection line log
            setChats([{
              id: "startup",
              sender: "SYSTEM",
              text: `Connected to LAN Group Room #${payload.roomCode}. High frequency alignment operational.`,
              timestamp: new Date().toLocaleTimeString()
            }]);
            break;
          }

          case "room-players": {
            setLobbyPlayers(payload.players);
            const current = payload.players.find((p: LANPlayer) => p.id === myPlayerId);
            if (current) {
              setIsHost(current.isHost);
            }
            break;
          }

          case "chat-broadcast": {
            setChats((prev) => [...prev, payload]);
            break;
          }

          case "game-started": {
            // Unmount/Transition state to main multiplayer board
            if (socketRef.current) {
              // Convert lobby players to the system preset parameters
              const arrangedList = payload.gameState.players.map((p: any) => ({
                name: p.name,
                roleIndex: p.role ? ROLE_PRESETS.findIndex(r => r.name === p.role) : 0,
                isAI: false
              }));
              
              onStartGame(arrangedList, activeCode, payload.playerId === "p-host", payload.playerId || "p-guest", socketRef.current);
            }
            break;
          }

          case "error": {
            setErrorMsg(payload.message);
            setStatus("offline");
            socket.close();
            break;
          }
        }
      } catch (e) {
        console.error("Lobby message validation error", e);
      }
    };

    socket.onclose = () => {
      if (status === "lobby") {
        setErrorMsg("Connection lost. Use the reconnect button to rejoin your room.");
      }
      setStatus("offline");
    };

    socket.onerror = () => {
      setErrorMsg("LAN Gateway Interface timeout. Is the network container active?");
      setStatus("offline");
    };
  };

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const handleCreateLobby = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Enter your corporate name signature before creating rooms.");
      return;
    }
    const code = generateRandomCode();
    connectToSocket(code, "create", roomNameInput || `${name}'s Governance Cabin`);
  };

  const handleJoinLobbyByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Provide your credentials in the signature slot before joining.");
      return;
    }
    if (!roomCodeInput.trim()) {
      setErrorMsg("Room Code is empty");
      return;
    }
    connectToSocket(roomCodeInput.trim().toUpperCase(), "join");
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current || status !== "lobby") return;

    socketRef.current.send(JSON.stringify({
      type: "chat-send",
      payload: {
        text: chatInput.trim(),
        senderName: name || "Anonymous User"
      }
    }));
    setChatInput("");
  };

  const handleLeaveLobby = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setStatus("offline");
    setLobbyPlayers([]);
    setChats([]);
    setActiveCode("");
    setMyPlayerId("");
    setIsHost(false);
    setRoomInviteLink("");
    clearRoomSession();
    fetchActiveRooms();
  };

  const handleToggleReady = () => {
    if (!socketRef.current || status !== "lobby" || !myPlayerId) return;
    socketRef.current.send(JSON.stringify({
      type: "toggle-ready",
      payload: { playerId: myPlayerId }
    }));
  };

  const handleReconnectLobby = () => {
    const previousSession = loadPreviousRoomSession();
    if (!previousSession) {
      setErrorMsg("No saved room session found to reconnect.");
      return;
    }
    setName(previousSession.name);
    setRoleIndex(previousSession.roleIndex);
    setRoomCodeInput(previousSession.roomCode);
    connectToSocket(previousSession.roomCode, "reconnect", undefined, previousSession.playerId);
  };

  const handleCopyInviteLink = async () => {
    if (!roomInviteLink) {
      setErrorMsg("No active room invite link available yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(roomInviteLink);
      setErrorMsg("Invite link copied to clipboard.");
    } catch {
      setErrorMsg("Unable to copy invite link. Please copy it manually.");
    }
  };

  const myPlayerReady = lobbyPlayers.find((player) => player.id === myPlayerId)?.ready ?? false;
  const allPlayersReady = lobbyPlayers.length > 0 && lobbyPlayers.every((player) => player.ready);

  const handleHostLaunchGame = () => {
    if (!isHost || status !== "lobby" || !socketRef.current) return;
    if (lobbyPlayers.length < 2) {
      setErrorMsg("Multiplayer LAN requires at least 2 human players to clock in.");
      return;
    }

    // Prepare full initialization state using our constants logic
    const lobbyInput = lobbyPlayers.map((p) => ({
      name: p.name,
      roleIndex: p.roleIndex,
      isAI: false
    }));

    // Trigger initial state generation
    // (This will be imported in App.tsx side, but we can generate a mock template that App.tsx consumes)
    socketRef.current.send(JSON.stringify({
      type: "start-multiplayer-game",
      payload: {
        initialState: lobbyInput // We will intercept this array to construct genuine state on initialisation
      }
    }));
  };

  return (
    <div id="lan_multiplayer_lobby_block" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      
      {/* Left Column: Create / Configure Personal Details (Col 5) */}
      <div className="lg:col-span-5 bg-[#faf7f2] border-2 border-neutral-950 p-5 shadow-[4px_4px_0px_0px_rgba(30,58,138,0.35)] space-y-5">
        <div className="border-b-2 border-neutral-300 pb-3 flex items-center justify-between">
          <div>
            <span className="bg-blue-900 text-amber-300 font-mono text-[9px] font-black uppercase px-2 py-0.5 tracking-wider">
              LAN MULTIPLAYER (BETA)
            </span>
            <h3 className="text-xl font-mono font-black text-neutral-950 mt-1 uppercase">Lobby Gateway</h3>
          </div>
          <Radio className="w-5 h-5 text-blue-600 animate-pulse" />
        </div>

        {status === "offline" || status === "connecting" ? (
          <div className="space-y-4">
            {/* Identity Settings */}
            <div className="space-y-3 bg-white p-3 border border-neutral-300">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">STEP 1: IDENTITY SIGNATURE</span>
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-500 font-mono uppercase block text-left">Your Player Name</label>
                <input
                  type="text"
                  maxLength={18}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2 py-1.5 border border-neutral-300 font-mono text-xs focus:outline-hidden focus:border-neutral-900"
                  placeholder="e.g., Sundar Pichai"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-500 font-mono uppercase block text-left">Fictional Job Role</label>
                <select
                  value={roleIndex}
                  onChange={(e) => setRoleIndex(parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 border border-neutral-300 font-mono text-xs focus:outline-hidden focus:border-neutral-900 bg-white"
                >
                  {ROLE_PRESETS.map((preset, pIdx) => (
                    <option key={pIdx} value={pIdx}>
                      {preset.name} (Limit: ${preset.startingLimit})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error alerts */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-300 p-2 text-xs font-mono text-red-700 flex gap-2 items-center">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 2 Selection Buttons */}
            {status === "connecting" ? (
              <div className="text-center py-6 space-y-2 border border-neutral-300 bg-white">
                <RefreshCw className="w-6 h-6 mx-auto text-blue-600 animate-spin" />
                <p className="text-xs font-mono text-neutral-600">Registering credentials on LAN gateway server...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Option A: Host */}
                <form onSubmit={handleCreateLobby} className="border border-neutral-300 bg-white p-3 space-y-2 text-left">
                  <span className="text-[9.5px] font-mono font-bold text-neutral-500 uppercase tracking-wide block">OPTION A: HOST A NEW OFFICE CARD ROOM</span>
                  <input
                    type="text"
                    maxLength={24}
                    placeholder="Lobby Name (Optional)"
                    value={roomNameInput}
                    onChange={(e) => setRoomNameInput(e.target.value)}
                    className="w-full px-2 py-1 border border-neutral-300 font-mono text-xs focus:outline-hidden focus:border-neutral-900"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-mono text-xs font-extrabold uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>Host New Room (Generates Code)</span>
                  </button>
                </form>

                {/* Option B: Join */}
                <form onSubmit={handleJoinLobbyByCode} className="border border-neutral-300 bg-white p-3 space-y-2 text-left">
                  <span className="text-[9.5px] font-mono font-bold text-neutral-500 uppercase tracking-wide block">OPTION B: JOIN BY EXTRA ROOM CODE</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g., ABCD"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      className="w-24 text-center px-2 py-1 border border-neutral-300 font-mono font-black text-xs uppercase focus:outline-hidden focus:border-neutral-900"
                    />
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-neutral-900 hover:bg-[#2563eb] hover:text-white text-[#facc15] font-mono text-xs font-extrabold uppercase flex items-center justify-center gap-1.5 border border-neutral-950 active:translate-y-0.5"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Clock-In To Room</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* State LOBBY: User is active in room */
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-3 text-left space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase bg-blue-900 text-white px-1.5 py-0.2">
                  LOBBY STATUS: ACTIVE
                </span>
                <span className="font-mono text-xs font-black text-blue-900">
                  CODE: {activeCode}
                </span>
              </div>
              <h4 className="text-sm font-extrabold font-mono text-neutral-950">
                {lobbyPlayers[0]?.name}'s Governance Stack
              </h4>
              <p className="text-[10px] text-neutral-500 font-mono leading-tight">
                All players joining will appear real-time on the rosters list. Host must launch when ready.
              </p>
            </div>

            {/* Error inside room */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-300 p-2 text-xs font-mono text-red-700 flex gap-2 items-center">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleToggleReady}
                className={`w-full py-2.5 ${myPlayerReady ? "bg-amber-700 hover:bg-amber-600" : "bg-slate-800 hover:bg-slate-700"} border-2 border-neutral-950 text-[#faf7f2] font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5`}
              >
                <Check className="w-4 h-4" />
                <span>{myPlayerReady ? "Player Ready" : "Mark Ready"}</span>
              </button>

              <button
                onClick={handleCopyInviteLink}
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 border-2 border-neutral-950 text-amber-300 font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Copy Invite Link</span>
              </button>
            </div>

            {isHost ? (
                <button
                  onClick={handleHostLaunchGame}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 border-2 border-neutral-950 text-[#faf7f2] font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Launch Multiplayer Game ({lobbyPlayers.length} / 4 Boarded){allPlayersReady ? " – All Ready" : ""}</span>
                </button>
              ) : (
                <div className="text-center py-2 bg-neutral-100 border border-neutral-300 font-mono text-[10.5px] text-neutral-600 animate-pulse">
                  ⏳ Waiting for corporate host to deploy spreadsheet registry...
                </div>
              )}

              <button
                onClick={handleLeaveLobby}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-mono text-xs font-extrabold uppercase"
              >
                Disconnect & LEAVE Lobby
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Discover list & CorpChat Interface (Col 7) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* State A: Offline List of lobbies */}
        {status !== "lobby" ? (
          <div className="bg-white border-2 border-neutral-950 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Server className="w-4.5 h-4.5 text-blue-600" />
                <h4 className="font-mono text-sm font-extrabold text-neutral-950 uppercase">Active LAN Lobbies on Node</h4>
              </div>
              <button 
                onClick={fetchActiveRooms}
                disabled={isRefreshing}
                className="p-1 hover:bg-neutral-100 text-neutral-500 border border-neutral-300 rounded-none cursor-pointer flex items-center gap-1 font-mono text-[10px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Refresh Lobbies List</span>
              </button>
            </div>

            {discoveredRooms.length === 0 ? (
              <div className="py-10 text-center space-y-2 border border-dashed border-neutral-300 font-mono">
                <HelpCircle className="w-7 h-7 mx-auto text-neutral-400" />
                <p className="text-xs text-neutral-600">No active LAN group directories identified in local router pool.</p>
                <p className="text-[10px] text-neutral-400 italic font-mono max-w-xs mx-auto">Click "Host New Room" on the left to spin up a custom board simulation lobby code!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                {discoveredRooms.map((room) => (
                  <div 
                    key={room.code} 
                    className="p-3 border border-neutral-300 bg-neutral-50 hover:bg-blue-50/10 flex justify-between items-center text-left"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black bg-blue-900 text-white px-1.5 py-0.2 rounded-xs">
                          #{room.code}
                        </span>
                        <h5 className="font-extrabold text-xs text-neutral-950 font-mono truncate max-w-xs">{room.name}</h5>
                      </div>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        Network Node Activity slot. Slots registered: {room.playerCount} / 4. Status: {room.started ? "DEPLOYED" : "SIGNUP WINDOW"}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setRoomCodeInput(room.code);
                        connectToSocket(room.code, "join");
                      }}
                      disabled={room.started || room.playerCount >= 4}
                      className="px-3 py-1.5 bg-blue-900 border border-neutral-950 text-amber-300 hover:bg-neutral-900 hover:text-white font-mono text-xs font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed text-center shrink-0 cursor-pointer"
                    >
                      {room.started ? "In Progress" : room.playerCount >= 4 ? "Full" : "Clock In"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 p-3 font-mono text-[10.5px] leading-relaxed text-amber-900 text-left">
              <strong>💡 NETWORK ROBUSTNESS & FREEMIUM PLATFORM NOTE:</strong> We use an Express backend linked via native WebSockets on your host. There are absolutely 0 third party subscription fees, token counts, or paywalls. Perfect for low latency local LAN environments.
            </div>
          </div>
        ) : (
          /* Lobby Roster & CorpChat Messaging Block */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[390px]">
            
            {/* Split A: Lobby Roster list */}
            <div className="bg-white border-2 border-neutral-950 p-3 h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="border-b border-neutral-200 pb-1 text-left">
                  <span className="text-[8.5px] font-mono tracking-widest text-neutral-400 font-black uppercase">ROOM REGISTER ROSTER</span>
                  <h4 className="font-mono text-xs font-black text-neutral-950 flex items-center gap-1">
                    <span>ACTIVE EMPLOYEES ({lobbyPlayers.length})</span>
                  </h4>
                </div>

                <div className="space-y-2">
                  {lobbyPlayers.map((player) => {
                    const preset = ROLE_PRESETS[player.roleIndex];
                    return (
                      <div 
                        key={player.id} 
                        className="p-2 border border-neutral-300 flex items-center justify-between bg-neutral-50 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: player.color || "#000" }} />
                          <div>
                            <p className="text-xs font-black font-mono text-neutral-950 uppercase">{player.name}</p>
                            <span className="text-[9.5px] text-neutral-500 font-mono tracking-tight">{preset.name}</span>
                          </div>
                        </div>

                        {player.isHost && (
                          <span className="bg-neutral-900 text-amber-300 font-mono text-[8px] font-black uppercase px-1.5 py-0.2 tracking-wider shrink-0">
                            HOST
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Filler spots */}
                  {Array.from({ length: 4 - lobbyPlayers.length }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className="p-2 border border-dashed border-neutral-200 flex items-center justify-center bg-white/40 text-neutral-300 text-[10px] font-mono"
                    >
                      (EMPTY REGISTRATION GATEWAY)
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 p-2 text-left">
                <p className="text-[10px] text-neutral-500 font-mono leading-tight">
                  Subject IDs aligned. All modifications write directly to node storage mapping.
                </p>
              </div>
            </div>

            {/* Split B: CorpChat console (IRC style block!) */}
            <div className="bg-neutral-900 border-2 border-neutral-950 text-[#4ade80] font-mono p-3 h-full flex flex-col justify-between">
              <div className="border-b border-green-900/40 pb-1.5 flex justify-between items-center text-left">
                <span className="text-[8.5px] text-[#4ade80]/60 font-black tracking-widest font-mono uppercase">
                  IRC CHAT : CORPLINK v1.22
                </span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              </div>

              {/* Chat history items */}
              <div className="flex-1 overflow-y-auto space-y-2 py-2 text-left text-xs pr-1 scrollbar-thin scrollbar-thumb-emerald-800">
                {chats.map((chat) => (
                  <div key={chat.id} className="leading-snug break-words">
                    {chat.sender === "SYSTEM" ? (
                      <span className="text-yellow-400">
                        [{chat.timestamp}] *** {chat.text}
                      </span>
                    ) : (
                      <>
                        <span className="text-blue-400">&lt;{chat.sender}&gt;</span>{" "}
                        <span className="text-neutral-200">{chat.text}</span>
                      </>
                    )}
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat sender inputs */}
              <form onSubmit={handleSendChatMessage} className="mt-2 pt-2 border-t border-green-900/40 flex gap-1.5">
                <input
                  type="text"
                  maxLength={100}
                  placeholder="Type message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-neutral-950 text-[#4ade80] px-2 py-1 border border-green-900/60 font-mono text-xs focus:outline-hidden focus:border-green-400 placeholder:text-green-900"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-[#4ade80] hover:bg-[#34d399] text-neutral-950 font-bold hover:text-neutral-950 transition-colors shrink-0 font-mono text-xs flex items-center justify-center"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
