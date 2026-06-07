import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

interface LANPlayer {
  id: string;
  name: string;
  roleIndex: number;
  isHost: boolean;
  isActive: boolean;
  ready: boolean;
  color?: string;
  ws?: WebSocket;
}

interface LANRoom {
  code: string;
  name: string;
  createdTime: number;
  players: LANPlayer[];
  gameState: any | null;
  chats: Array<{
    id: string;
    sender: string;
    text: string;
    timestamp: string;
  }>;
}

const PLAYER_COLORS = ["#2563eb", "#ea580c", "#16a34a", "#9333ea"];

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });
  const PORT = 3000;

  // In-memory LAN Rooms
  const rooms: Map<string, LANRoom> = new Map();

  app.use(express.json());

  // API Route: Let client discover all active LAN Rooms hosted on this network node
  app.get("/api/lan/rooms", (req, res) => {
    const list = Array.from(rooms.values()).map(r => ({
      code: r.code,
      name: r.name,
      playerCount: r.players.length,
      started: r.gameState !== null,
      createdTime: r.createdTime
    }));
    res.json(list);
  });

  // API Route: AI-generated satirical Career Path Events
  app.post("/api/career-event/generate", async (req, res) => {
    const { playerName, playerRole, currentDebt, currentStress } = req.body;
    try {
      const ai = getGeminiClient();
      const prompt = `You are a satirical writer specializing in toxic corporate culture parody.
Generate a funny, absurd mock corporate "Career Path Option Dilemma" for a player in our Monopoly-like board game.
The player profile is:
- Name: ${playerName}
- Role/Job Title: ${playerRole}
- Current Debt Level: ₹${currentDebt}
- Current Stress Level: ${currentStress}%

Create a satirical scenario name and situation description. Frame it as a critical choice between doing a toxic work task or rejecting it, having hilarious, direct impacts on their debt and stress.
All monetary symbols used in descriptions and options MUST be the Indian Rupee symbol (₹).
Option A: Usually represents compliant/submissive/toxic behavior (e.g. working excessively, agreeing to unreasonable management demands). It should decrease their debt somewhat (by -50 to -250), but increase their stress level (+10 to +30).
Option B: Usually represents individualistic/rebellious/passive-aggressive behavior (e.g. ignoring warnings, delegating to a scapegoat, feigning illness, running away). It should increase their debt somewhat (+50 to +200) due to corporate penalties, compliance audits, or lost bonuses, but decrease or hold their stress level (-20 to -5 or +0).

Respond STRICTLY in JSON format matching the schema provided. No markdown or wrappers outside the raw JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the central game engine of 'Anti-Corporate', a highly satirical, dark-comedy corporate board game. You write laugh-out-loud funny narratives mocking performance metrics, synergies, and passive-aggressive office emails.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scenarioName: { type: Type.STRING },
              situation: { type: Type.STRING },
              optionA: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  debtChange: { type: Type.INTEGER },
                  stressChange: { type: Type.INTEGER }
                },
                required: ["label", "debtChange", "stressChange"]
              },
              optionB: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  debtChange: { type: Type.INTEGER },
                  stressChange: { type: Type.INTEGER }
                },
                required: ["label", "debtChange", "stressChange"]
              }
            },
            required: ["scenarioName", "situation", "optionA", "optionB"]
          }
        }
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("Gemini Generate Career Path Event Failed:", error);
      // Graceful offline fallback
      const mockEvents = [
        {
          scenarioName: "The 11:58 PM Teams Ping",
          situation: `Your manager sends an urgent message: 'Hey ${playerName}, quick favor, can you summarize this 400-page board deck by tomorrow 8 AM? It's key for our alignment metrics.'`,
          optionA: { label: "Work Overtime", debtChange: -150, stressChange: 20 },
          optionB: { label: "Ignore Email", debtChange: 100, stressChange: -10 }
        },
        {
          scenarioName: "Unpaid Synergy Seminar",
          situation: `HR invites ${playerName} to a voluntary-but-actually-mandatory Saturday morning workshop on 'Workplace Wellness and Zero-Hour Loyalty'.`,
          optionA: { label: "Attend Seminar", debtChange: -100, stressChange: 15 },
          optionB: { label: "Skip Seminar", debtChange: 120, stressChange: -15 }
        }
      ];
      const fallback = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      res.json({ success: true, data: fallback, fallbackUsed: true });
    }
  });

  // API Route: AI-generated resolution after a binary option is selected
  app.post("/api/career-event/resolve", async (req, res) => {
    const { playerName, playerRole, scenarioName, situation, chosenOptionLabel, debtChange, stressChange } = req.body;
    try {
      const ai = getGeminiClient();
      const prompt = `In our satirical corporate board game, the player ${playerName} (${playerRole}) faced the dilemma: "${scenarioName}".
Situation was: "${situation}"
They chose the option: "${chosenOptionLabel}"
The consequence of this choice is modifying their state by:
- Debt Change: ₹${debtChange}
- Stress Change: ${stressChange}%

Describe the aftermath in a witty, highly satirical, funny 2-3 sentence paragraph. Incorporate India Rupee (₹) symbol when mentioning debt changes.
Also construct a 1-sentence summary log message suitable to put into our system ledger. Respond in strict JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the referee of 'Anti-Corporate'. You write witty responses describing ridiculous corporate outcomes, audit punishments, or employee gaslighting. All currency symbols in text must be Indian Rupee (₹).",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              consequenceText: { type: Type.STRING },
              logMessage: { type: Type.STRING }
            },
            required: ["consequenceText", "logMessage"]
          }
        }
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("Gemini Resolve Career Path Event Failed:", error);
      // Graceful offline fallback
      const consequenceText = `Due to server-side HR microservices undergoing high latency, ${playerName}'s decision was processed by a legacy sorting algorithm. Management has resolved the event in accordance with standard operating procedures.`;
      const sign = debtChange < 0 ? "-" : "+";
      const logMessage = `📋 ${playerName} chose: ${chosenOptionLabel}. Debt: ${sign}₹${Math.abs(debtChange)}, Stress: ${stressChange > 0 ? "+" : ""}${stressChange}%`;
      res.json({
        success: true,
        data: { consequenceText, logMessage },
        fallbackUsed: true
      });
    }
  });

  // Support upgrading connection to WebSocket
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
    if (pathname === "/ws/lan") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // WebSocket Server connection handler
  wss.on("connection", (ws: WebSocket) => {
    let clientRoomCode: string | null = null;
    let clientPlayerId: string | null = null;

    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message);
        const { type, payload } = data;

        switch (type) {
          case "create-room": {
            const { roomCode, roomName, hostName, roleIndex } = payload;
            const code = roomCode.toUpperCase();
            
            // If room already exists, wipe or re-use it
            if (rooms.has(code)) {
              rooms.delete(code);
            }

            const playerId = "p-host";
            const hostPlayer: LANPlayer = {
              id: playerId,
              name: hostName,
              roleIndex: roleIndex,
              isHost: true,
              isActive: true,
              ready: false,
              color: PLAYER_COLORS[0],
              ws: ws
            };

            const newRoom: LANRoom = {
              code,
              name: roomName || `${hostName}'s Strategy Lounge`,
              createdTime: Date.now(),
              players: [hostPlayer],
              gameState: null,
              chats: []
            };

            rooms.set(code, newRoom);
            clientRoomCode = code;
            clientPlayerId = playerId;

            // Reply success
            ws.send(JSON.stringify({
              type: "room-created",
              payload: {
                roomCode: code,
                playerId,
                players: serializePlayers(newRoom.players)
              }
            }));
            break;
          }

          case "join-room": {
            const { roomCode, playerName, roleIndex } = payload;
            const code = roomCode.toUpperCase();
            const room = rooms.get(code);

            if (!room) {
              ws.send(JSON.stringify({
                type: "error",
                payload: { message: `LAN Room #${code} not found on this node.` }
              }));
              return;
            }

            if (room.gameState !== null) {
              ws.send(JSON.stringify({
                type: "error",
                payload: { message: `Game already started in Room ${code}.` }
              }));
              return;
            }

            if (room.players.length >= 4) {
              ws.send(JSON.stringify({
                type: "error",
                payload: { message: `Room ${code} is full (Max 4 players allowed).` }
              }));
              return;
            }

            const playerId = `p-${Date.now()}`;
            const newPlayer: LANPlayer = {
              id: playerId,
              name: playerName,
              roleIndex: roleIndex,
              isHost: false,
              isActive: true,
              ready: false,
              color: PLAYER_COLORS[room.players.length],
              ws: ws
            };

            room.players.push(newPlayer);
            clientRoomCode = code;
            clientPlayerId = playerId;

            ws.send(JSON.stringify({
              type: "room-joined",
              payload: {
                roomCode: code,
                playerId,
                players: serializePlayers(room.players)
              }
            }));

            // Notify everyone in the lobby
            broadcastToRoom(room, {
              type: "room-players",
              payload: { players: serializePlayers(room.players) }
            });
            break;
          }

          case "start-multiplayer-game": {
            if (!clientRoomCode) return;
            const room = rooms.get(clientRoomCode);
            if (!room || room.players[0].id !== clientPlayerId) return; // Only host starts

            const unready = room.players.filter((player) => !player.ready);
            if (unready.length > 0) {
              ws.send(JSON.stringify({
                type: "error",
                payload: { message: `Cannot start until all players are ready (${unready.length} remaining).` }
              }));
              return;
            }

            if (room.players.length < 2) {
              ws.send(JSON.stringify({
                type: "error",
                payload: { message: "At least 2 players must be connected to start the multiplayer game." }
              }));
              return;
            }

            const { initialState } = payload;
            room.gameState = initialState;

            broadcastToRoom(room, {
              type: "game-started",
              payload: { gameState: room.gameState, playerId: clientPlayerId }
            });
            break;
          }

          case "reconnect-room": {
            const { roomCode, playerId, playerName, roleIndex } = payload;
            const code = roomCode.toUpperCase();
            const room = rooms.get(code);
            if (!room) {
              ws.send(JSON.stringify({ type: "error", payload: { message: `LAN Room #${code} not found.` } }));
              return;
            }

            const existingPlayer = room.players.find((p) => p.id === playerId);
            if (!existingPlayer) {
              ws.send(JSON.stringify({ type: "error", payload: { message: `Player session not found for ${playerId}. Please rejoin with a fresh room code.` } }));
              return;
            }

            existingPlayer.ws = ws;
            existingPlayer.isActive = true;
            existingPlayer.name = playerName;
            existingPlayer.roleIndex = roleIndex;
            clientRoomCode = code;
            clientPlayerId = playerId;

            ws.send(JSON.stringify({
              type: "room-rejoined",
              payload: {
                roomCode: code,
                playerId,
                players: serializePlayers(room.players),
                roomName: room.name
              }
            }));

            broadcastToRoom(room, {
              type: "room-players",
              payload: { players: serializePlayers(room.players) }
            }, ws);
            break;
          }

          case "toggle-ready": {
            if (!clientRoomCode) return;
            const room = rooms.get(clientRoomCode);
            if (!room) return;
            const player = room.players.find((p) => p.id === clientPlayerId);
            if (!player) return;
            player.ready = !player.ready;

            broadcastToRoom(room, {
              type: "room-players",
              payload: { players: serializePlayers(room.players) }
            });
            break;
          }

          case "sync-state": {
            if (!clientRoomCode) return;
            const room = rooms.get(clientRoomCode);
            if (!room) return;

            // Save authoritative state on server
            room.gameState = payload.gameState;

            broadcastToRoom(room, {
              type: "state-synced",
              payload: { gameState: room.gameState }
            }, ws); // Skip sender to optimize bandwidth
            break;
          }

          case "chat-send": {
            if (!clientRoomCode) return;
            const room = rooms.get(clientRoomCode);
            if (!room) return;

            const { text, senderName } = payload;
            const chatObj = {
              id: Math.random().toString(),
              sender: senderName,
              text,
              timestamp: new Date().toLocaleTimeString()
            };

            room.chats.push(chatObj);
            if (room.chats.length > 50) room.chats.shift();

            broadcastToRoom(room, {
              type: "chat-broadcast",
              payload: chatObj
            });
            break;
          }
        }
      } catch (err) {
        console.error("LAN web socket error processing message", err);
      }
    });

    ws.on("close", () => {
      if (clientRoomCode) {
        const room = rooms.get(clientRoomCode);
        if (room) {
          const player = room.players.find(p => p.id === clientPlayerId);
          if (player) {
            player.isActive = false;
            player.ws = undefined;

            const sysChat = {
              id: Math.random().toString(),
              sender: "SYSTEM",
              text: `${player.name} disconnected from the LAN lobby. Awaiting possible reconnect.`,
              timestamp: new Date().toLocaleTimeString()
            };
            room.chats.push(sysChat);
            broadcastToRoom(room, { type: "chat-broadcast", payload: sysChat });

            const activePlayers = room.players.filter((p) => p.isActive);
            if (activePlayers.length === 0) {
              setTimeout(() => {
                const staleRoom = rooms.get(clientRoomCode!);
                if (staleRoom && staleRoom.players.every((p) => !p.isActive)) {
                  rooms.delete(clientRoomCode!);
                }
              }, 60000);
            }

            if (player.isHost && activePlayers.length > 0) {
              const newHost = activePlayers[0];
              newHost.isHost = true;
              player.isHost = false;
              const hostTransferChat = {
                id: Math.random().toString(),
                sender: "SYSTEM",
                text: `Host disconnected. Room ownership assigned to ${newHost.name}.`,
                timestamp: new Date().toLocaleTimeString()
              };
              room.chats.push(hostTransferChat);
              broadcastToRoom(room, { type: "chat-broadcast", payload: hostTransferChat });
            }

            broadcastToRoom(room, {
              type: "room-players",
              payload: { players: serializePlayers(room.players) }
            });
          }
        }
      }
    });
  });

  function serializePlayers(players: LANPlayer[]) {
    return players.map((p) => ({
      id: p.id,
      name: p.name,
      roleIndex: p.roleIndex,
      isHost: p.isHost,
      isActive: p.isActive,
      ready: p.ready,
      color: p.color
    }));
  }

  function broadcastToRoom(room: LANRoom, messageObj: any, skipWS?: WebSocket) {
    const rawMsg = JSON.stringify(messageObj);
    room.players.forEach((p) => {
      if (p.ws && p.ws.readyState === WebSocket.OPEN && p.ws !== skipWS) {
        p.ws.send(rawMsg);
      }
    });
  }

  // Vite development integration middleware handles client requests cleanly
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`📡 ANTI-CORPORATE Multiplayer backend running on port ${PORT}`);
  });
}

startServer();
