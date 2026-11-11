import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { GameBoard } from './components/GameBoard';
import { AttackModal } from './components/AttackModal';
import { DefenderAlertModal } from './components/DefenderAlertModal';
import { FortifyModal } from './components/FortifyModal';
import { GameOverModal } from './components/GameOverModal';
import { ProfileModal } from './components/ProfileModal';
import { HistoryScreen } from './components/HistoryScreen';
import { AiReviewModal } from './components/AiReviewModal';
import { RulesModal } from './components/RulesModal';
import { AuthModal } from './components/AuthModal';
import { LandingScreen } from './components/LandingScreen';

import { 
  GameState, 
  Player, 
  GameRecord, 
  UserProfile, 
  TerritoryState,
  AiDifficulty,
  AiPersonality
} from './types/risk';
import { 
  createInitialGameState, 
  calculateReinforcements, 
  checkGameEndConditions,
  isPathConnected 
} from './utils/gameRules';
import { executeAiTurn } from './utils/aiBot';
import { 
  getUserProfile, 
  saveUserProfile, 
  updateProfileStats, 
  getGameHistory, 
  saveGameRecord, 
  updateGameRecordAnalysis,
  tabSync 
} from './utils/storage';
import { testFirestoreConnection, saveProfileToFirestore } from './utils/firebase';
import { PLAYER_COLORS, AI_BOT_NAMES, TERRITORY_MAP, ISRAEL_TERRITORY_MAP, getTerritoryMapForMap } from './data/riskMapData';
import { sound } from './utils/audio';

export default function App() {
  // Navigation & Screen state: start on landing page
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'home' | 'lobby' | 'game' | 'history'>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile());
  const [gameHistory, setGameHistory] = useState<GameRecord[]>(getGameHistory());

  // Active Room state & Map Selection
  const [roomCode, setRoomCode] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [selectedMapType, setSelectedMapType] = useState<'world' | 'israel'>('world');
  const [lobbyPlayers, setLobbyPlayers] = useState<Player[]>([]);
  const [maxPlayersInRoom, setMaxPlayersInRoom] = useState<number>(4);

  // Helper to get Hebrew name for any territory across both World and Israel maps
  const getTerritoryName = (id: string, mapType: 'world' | 'israel' = gameState?.mapType || selectedMapType || 'world') => {
    return (mapType === 'israel' ? ISRAEL_TERRITORY_MAP[id] : TERRITORY_MAP[id])?.nameHebrew ||
      ISRAEL_TERRITORY_MAP[id]?.nameHebrew ||
      TERRITORY_MAP[id]?.nameHebrew ||
      id;
  };

  // Active Game state
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Modals state
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [selectedGameForAi, setSelectedGameForAi] = useState<GameRecord | null>(null);

  useEffect(() => {
    // Validate Firestore connection on boot
    testFirestoreConnection();
  }, []);

  const handleAuthSuccess = (updated: UserProfile) => {
    setUserProfile(updated);
    saveUserProfile(updated);
    saveProfileToFirestore(updated);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    const defaultProfile = getUserProfile();
    delete defaultProfile.email;
    delete defaultProfile.authProvider;
    setUserProfile(defaultProfile);
    saveUserProfile(defaultProfile);
    setCurrentScreen('landing');
  };

  // Pending attack modal state (for attacker)
  const [pendingAttack, setPendingAttack] = useState<{
    fromId: string;
    toId: string;
  } | null>(null);

  // Pending fortify modal state
  const [pendingFortify, setPendingFortify] = useState<{
    fromId: string;
    toId: string;
  } | null>(null);

  // Defender alert modal state (when a human player's territory is attacked)
  const [defenderAlert, setDefenderAlert] = useState<{
    territoryId: string;
    attackerPlayer: Player;
    armies: number;
    resolver?: (diceCount: number) => void;
  } | null>(null);

  // AI execution cancellation and tracking refs
  const isAiCancelled = useRef<boolean>(false);
  const isAiExecuting = useRef<boolean>(false);
  const currentExecutingAiKey = useRef<string>('');

  // Check URL query parameters for invite link: ?room=RISK-XXXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      handleJoinGame(roomParam.toUpperCase(), (errMsg) => {
        console.warn('URL auto-join failed:', errMsg);
      });
    }
  }, []);

  // Multi-tab synchronization listener via BroadcastChannel
  useEffect(() => {
    const unsubscribe = tabSync.subscribe((msg) => {
      if (msg.roomCode !== roomCode) return;

      if (msg.type === 'PLAYER_JOINED') {
        setLobbyPlayers((prev) => {
          if (prev.some(p => p.id === msg.player.id)) return prev;
          return [...prev, msg.player];
        });
      } else if (msg.type === 'PLAYER_READY') {
        setLobbyPlayers((prev) =>
          prev.map(p => (p.id === msg.playerId ? { ...p, isReady: msg.isReady } : p))
        );
      } else if (msg.type === 'GAME_STARTED') {
        setGameState(msg.gameState);
        setCurrentScreen('game');
        sound.playVictory();
      } else if (msg.type === 'GAME_STATE_UPDATE') {
        setGameState(msg.gameState);
      }
    });

    return unsubscribe;
  }, [roomCode]);

  // Continuous server-side room polling for cross-device/browser multiplayer
  useEffect(() => {
    if (!roomCode) return;

    let isMounted = true;
    const pollIntervalMs = currentScreen === 'lobby' ? 1000 : (currentScreen === 'game' ? 1800 : 0);
    if (!pollIntervalMs) return;

    const syncWithServer = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomCode}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.room) return;

        const serverRoom = data.room;

        // In lobby: sync players list
        if (currentScreen === 'lobby') {
          // If guest and host started the game on another device
          if (!isHost && serverRoom.status === 'playing' && serverRoom.gameState) {
            setGameState(serverRoom.gameState);
            setCurrentScreen('game');
            sound.playVictory();
            return;
          }

          if (Array.isArray(serverRoom.players) && serverRoom.players.length > 0) {
            setLobbyPlayers((prev) => {
              const prevSummary = prev.map(p => `${p.id}:${p.name}:${p.color}:${p.isReady}:${p.aiPersonality}`).join('|');
              const serverSummary = serverRoom.players.map((p: any) => `${p.id}:${p.name}:${p.color}:${p.isReady}:${p.aiPersonality}`).join('|');

              if (prevSummary !== serverSummary) {
                return serverRoom.players;
              }
              return prev;
            });
          }
        }

        // In game: for guests (non-active players), sync game state from server
        if (currentScreen === 'game' && !isHost && serverRoom.gameState) {
          setGameState(prev => {
            if (!prev) return serverRoom.gameState;
            if (serverRoom.gameState.turn !== prev.turn || 
                serverRoom.gameState.activePlayerIndex !== prev.activePlayerIndex ||
                serverRoom.gameState.phase !== prev.phase ||
                serverRoom.gameState.reinforcementsRemaining !== prev.reinforcementsRemaining ||
                serverRoom.gameState.logs?.length !== prev.logs?.length) {
              return serverRoom.gameState;
            }
            return prev;
          });
        }
      } catch (err) {
        // Silently handle transient network hiccup
      }
    };

    syncWithServer();
    const intervalId = setInterval(syncWithServer, pollIntervalMs);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [roomCode, currentScreen, isHost]);

  // Cancel any running AI process if navigating away from the game screen
  useEffect(() => {
    if (currentScreen !== 'game') {
      isAiCancelled.current = true;
      isAiExecuting.current = false;
      currentExecutingAiKey.current = '';
    }
  }, [currentScreen]);

  // Handle AI turn execution when active player changes
  useEffect(() => {
    if (!gameState || gameState.phase === 'game_over' || gameState.winnerId) {
      isAiCancelled.current = true;
      isAiExecuting.current = false;
      currentExecutingAiKey.current = '';
      return;
    }

    // Only host executes AI bot turns to prevent conflicting actions in multiplayer
    if (!isHost) return;

    const activePlayer = gameState.players[gameState.activePlayerIndex];
    if (!activePlayer || !activePlayer.isAi || activePlayer.eliminated) {
      isAiExecuting.current = false;
      currentExecutingAiKey.current = '';
      return;
    }

    // Unique key per bot turn to avoid duplicate/re-entrant triggers
    const turnKey = `${gameState.turn}_${gameState.activePlayerIndex}_${activePlayer.id}`;
    if (currentExecutingAiKey.current === turnKey || isAiExecuting.current) {
      return;
    }

    currentExecutingAiKey.current = turnKey;
    isAiExecuting.current = true;
    isAiCancelled.current = false;

    executeAiTurn(
      gameState,
      (updatedState) => {
        setGameState(updatedState);
        syncGameState(updatedState);

        // If bot won the game, record it
        if (updatedState.winnerId) {
          const winner = updatedState.players.find(p => p.id === updatedState.winnerId);
          if (winner) {
            sound.playVictory();
            recordFinishedGame(updatedState, winner);
          }
        }
      },
      () => isAiCancelled.current
    ).finally(() => {
      isAiExecuting.current = false;
    });
  }, [gameState?.activePlayerIndex, gameState?.turn, gameState?.winnerId, isHost]);

  // Sync game state to server & broadcast channel
  const syncGameState = (state: GameState) => {
    tabSync.broadcast({
      type: 'GAME_STATE_UPDATE',
      roomCode: state.roomCode,
      gameState: state
    });

    // Also persist to backend server
    fetch(`/api/rooms/${state.roomCode}/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameState: state,
        status: state.winnerId ? 'finished' : 'playing'
      })
    }).catch(() => {});
  };

  // 1. Host creates a new game
  const handleCreateGame = (config: {
    playersCount: number;
    hostColor: string;
    aiCount: number;
    aiDifficulty?: AiDifficulty;
    aiPersonality?: AiPersonality;
    aiDifficulties?: AiDifficulty[];
    aiPersonalities?: AiPersonality[];
    mapType?: 'world' | 'israel';
    autoStart?: boolean;
  }) => {
    const generatedCode = 'RISK-' + Math.floor(1000 + Math.random() * 9000);
    setRoomCode(generatedCode);
    setIsHost(true);
    setMaxPlayersInRoom(config.playersCount);
    const activeMap = config.mapType || selectedMapType;
    if (config.mapType) {
      setSelectedMapType(config.mapType);
    }

    const hostPlayer: Player = {
      id: userProfile.id,
      name: userProfile.nickname,
      color: config.hostColor,
      bgClass: 'bg-red-600',
      borderClass: 'border-red-500',
      textClass: 'text-red-400',
      isHost: true,
      isAi: false,
      isReady: true,
      eliminated: false
    };

    const players: Player[] = [hostPlayer];

    // Pick unique colors for remaining slots
    const availableColors = PLAYER_COLORS.filter(c => c.hex !== config.hostColor);

    // Add configured AI bots with their individual difficulty AND personality
    for (let i = 0; i < config.aiCount; i++) {
      const botProfile = AI_BOT_NAMES[i % AI_BOT_NAMES.length];
      const botColor = availableColors[i % availableColors.length];
      
      const botDifficulty: AiDifficulty = (config.aiDifficulties && config.aiDifficulties[i])
        || config.aiDifficulty
        || 'medium';

      const botPersonality: AiPersonality = (config.aiPersonalities && config.aiPersonalities[i])
        || config.aiPersonality
        || 'balanced';

      players.push({
        id: 'bot_' + Math.random().toString(36).substring(2, 7),
        name: `${botProfile.name}`,
        color: botColor.hex,
        bgClass: botColor.bgClass,
        borderClass: botColor.borderClass,
        textClass: botColor.textClass,
        isHost: false,
        isAi: true,
        aiDifficulty: botDifficulty,
        aiPersonality: botPersonality,
        isReady: true,
        eliminated: false
      });
    }

    setLobbyPlayers(players);

    // If autoStart requested (e.g. Solo game instant launch)
    if (config.autoStart) {
      currentExecutingAiKey.current = '';
      isAiExecuting.current = false;
      isAiCancelled.current = false;

      const initialGameState = createInitialGameState(players, generatedCode, activeMap);
      setGameState(initialGameState);
      setCurrentScreen('game');
      sound.playVictory();
      return;
    }

    setCurrentScreen('lobby');

    // Register room on server
    fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: generatedCode,
        hostId: userProfile.id,
        maxPlayers: config.playersCount,
        players,
        status: 'lobby'
      })
    }).catch(() => {});
  };

  // 2. Guest joins game via code
  const handleJoinGame = async (code: string, onFail: (errMsg: string) => void) => {
    try {
      const cleanCode = code.trim().toUpperCase();
      const res = await fetch(`/api/rooms/${cleanCode}`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.room) {
        onFail('קוד המשחק אינו תקין או שהחדר לא נמצא. בדוק ונסה שוב.');
        return;
      }

      const room = data.room;
      if (room.status !== 'lobby') {
        onFail('המשחק בחדר זה כבר החל.');
        return;
      }

      setRoomCode(cleanCode);
      setIsHost(false);
      setMaxPlayersInRoom(room.maxPlayers);

      // Find an untaken color for the guest
      const takenColors = new Set(room.players.map((p: any) => p.color));
      const freeColor = PLAYER_COLORS.find(c => !takenColors.has(c.hex))?.hex || PLAYER_COLORS[1].hex;

      const guestPlayer: Player = {
        id: userProfile.id,
        name: userProfile.nickname,
        color: freeColor,
        bgClass: 'bg-blue-600',
        borderClass: 'border-blue-500',
        textClass: 'text-blue-400',
        isHost: false,
        isAi: false,
        isReady: false,
        eliminated: false
      };

      // Join room API
      const joinRes = await fetch(`/api/rooms/${cleanCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: guestPlayer })
      });
      const joinData = await joinRes.json();

      if (!joinRes.ok) {
        onFail(joinData.error || 'שגיאה בהצטרפות לחדר.');
        return;
      }

      setLobbyPlayers(joinData.room.players);
      setCurrentScreen('lobby');

      // Broadcast join to local tabs
      tabSync.broadcast({
        type: 'PLAYER_JOINED',
        roomCode: cleanCode,
        player: guestPlayer
      });
    } catch (e) {
      onFail('שגיאת תקשורת. בדוק את החיבור לרשת ונסה שוב.');
    }
  };

  // Lobby player update (e.g. color or nickname change)
  const handleUpdatePlayerInLobby = (playerId: string, updates: Partial<Player>) => {
    setLobbyPlayers(prev => {
      const next = prev.map(p => (p.id === playerId ? { ...p, ...updates } : p));
      if (roomCode) {
        fetch(`/api/rooms/${roomCode}/state`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ players: next })
        }).catch(() => {});
      }
      return next;
    });
  };

  // Lobby ready toggle
  const handleToggleReady = (playerId: string) => {
    setLobbyPlayers(prev => {
      const next = prev.map(p => (p.id === playerId ? { ...p, isReady: !p.isReady } : p));
      const target = next.find(p => p.id === playerId);
      if (target) {
        tabSync.broadcast({
          type: 'PLAYER_READY',
          roomCode,
          playerId,
          isReady: target.isReady
        });
      }
      if (roomCode) {
        fetch(`/api/rooms/${roomCode}/state`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ players: next })
        }).catch(() => {});
      }
      return next;
    });
  };

  // Add bot dynamically in lobby
  const handleAddBotInLobby = () => {
    if (lobbyPlayers.length >= 6) return;
    const takenColors = new Set(lobbyPlayers.map(p => p.color));
    const availableColor = PLAYER_COLORS.find(c => !takenColors.has(c.hex))?.hex || PLAYER_COLORS[lobbyPlayers.length % PLAYER_COLORS.length].hex;
    const colorDef = PLAYER_COLORS.find(c => c.hex === availableColor) || PLAYER_COLORS[0];
    const botIdx = lobbyPlayers.filter(p => p.isAi).length;
    const botProfile = AI_BOT_NAMES[botIdx % AI_BOT_NAMES.length];

    const newBot: Player = {
      id: 'bot_' + Math.random().toString(36).substring(2, 7),
      name: botProfile.name,
      color: availableColor,
      bgClass: colorDef.bgClass,
      borderClass: colorDef.borderClass,
      textClass: colorDef.textClass,
      isHost: false,
      isAi: true,
      aiDifficulty: 'medium',
      aiPersonality: 'balanced',
      isReady: true,
      eliminated: false
    };

    const nextPlayers = [...lobbyPlayers, newBot];
    setLobbyPlayers(nextPlayers);

    if (roomCode) {
      fetch(`/api/rooms/${roomCode}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: nextPlayers })
      }).catch(() => {});
    }

    tabSync.broadcast({
      type: 'PLAYER_JOINED',
      roomCode,
      player: newBot
    });
  };

  // Remove bot dynamically in lobby
  const handleRemoveBotInLobby = (botId: string) => {
    const nextPlayers = lobbyPlayers.filter(p => p.id !== botId);
    setLobbyPlayers(nextPlayers);

    if (roomCode) {
      fetch(`/api/rooms/${roomCode}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: nextPlayers })
      }).catch(() => {});
    }
  };

  // Host starts the game
  const handleStartGame = () => {
    if (!isHost || lobbyPlayers.length < 2) return;

    currentExecutingAiKey.current = '';
    isAiExecuting.current = false;
    isAiCancelled.current = false;

    const initialGameState = createInitialGameState(lobbyPlayers, roomCode, selectedMapType);
    setGameState(initialGameState);
    setCurrentScreen('game');
    sound.playVictory();

    tabSync.broadcast({
      type: 'GAME_STARTED',
      roomCode,
      gameState: initialGameState
    });

    fetch(`/api/rooms/${roomCode}/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameState: initialGameState,
        status: 'playing'
      })
    }).catch(() => {});
  };

  // Leave lobby
  const handleLeaveLobby = () => {
    setGameState(null);
    setRoomCode('');
    setCurrentScreen('home');
  };

  // Quit active game
  const handleQuitGame = () => {
    isAiCancelled.current = true;
    isAiExecuting.current = false;
    currentExecutingAiKey.current = '';
    setGameState(null);
    setRoomCode('');
    setCurrentScreen('home');
  };

  // 3. Active Player Game Actions:
  // Place Reinforcement
  const handlePlaceReinforcement = (territoryId: string, count: number = 1) => {
    if (!gameState || gameState.reinforcementsRemaining <= 0) return;

    const nextRemaining = Math.max(0, gameState.reinforcementsRemaining - count);
    const currentArmies = gameState.territories[territoryId]?.armies || 1;
    const activePlayer = gameState.players[gameState.activePlayerIndex];

    const nextState: GameState = {
      ...gameState,
      reinforcementsRemaining: nextRemaining,
      territories: {
        ...gameState.territories,
        [territoryId]: {
          ...gameState.territories[territoryId],
          armies: currentArmies + count
        }
      },
      // Automatically advance to attack phase if all reinforcements placed
      phase: nextRemaining === 0 ? 'attack' : 'reinforcement',
      logs: [
        {
          id: 'log_' + Date.now() + Math.random(),
          turn: gameState.turn,
          playerId: activePlayer.id,
          playerName: activePlayer.name,
          playerColor: activePlayer.color,
          text: `${activePlayer.name} הציב ${count} חיילים ב${getTerritoryName(territoryId)}.`,
          type: 'reinforce',
          timestamp: Date.now()
        },
        ...gameState.logs.slice(0, 40)
      ]
    };

    setGameState(nextState);
    syncGameState(nextState);
  };

  // Auto-place all remaining reinforcements evenly among border territories
  const handleAutoPlaceReinforcements = () => {
    if (!gameState || gameState.reinforcementsRemaining <= 0) return;

    const activePlayer = gameState.players[gameState.activePlayerIndex];
    const ownedIds = Object.keys(gameState.territories).filter(
      id => gameState.territories[id].ownerId === activePlayer.id
    );

    if (ownedIds.length === 0) return;

    const territoryMap = getTerritoryMapForMap(gameState.mapType || selectedMapType || 'world');

    // Prefer territories that border enemies
    const borderIds = ownedIds.filter(id => {
      const def = territoryMap[id];
      return def?.adjacentIds.some(adj => gameState.territories[adj]?.ownerId !== activePlayer.id);
    });

    const targetIds = borderIds.length > 0 ? borderIds : ownedIds;
    const countToPlace = gameState.reinforcementsRemaining;
    const updatedTerritories = { ...gameState.territories };

    let remaining = countToPlace;
    let idx = 0;
    while (remaining > 0) {
      const tId = targetIds[idx % targetIds.length];
      updatedTerritories[tId] = {
        ...updatedTerritories[tId],
        armies: updatedTerritories[tId].armies + 1
      };
      remaining--;
      idx++;
    }

    sound.playPlaceTroop();

    const nextState: GameState = {
      ...gameState,
      reinforcementsRemaining: 0,
      phase: 'attack',
      territories: updatedTerritories,
      logs: [
        {
          id: 'log_' + Date.now() + Math.random(),
          turn: gameState.turn,
          playerId: activePlayer.id,
          playerName: activePlayer.name,
          playerColor: activePlayer.color,
          text: `${activePlayer.name} חילק ${countToPlace} חיילי תגבורת אוטומטית לגבולות.`,
          type: 'reinforce',
          timestamp: Date.now()
        },
        ...gameState.logs.slice(0, 40)
      ]
    };

    setGameState(nextState);
    syncGameState(nextState);
  };

  // Initiate Attack (opens AttackModal, and alerts defender if defender is human!)
  const handleInitiateAttack = (fromId: string, toId: string) => {
    if (!gameState) return;
    const defenderOwnerId = gameState.territories[toId]?.ownerId;
    const defenderPlayer = gameState.players.find(p => p.id === defenderOwnerId);
    const activePlayer = gameState.players[gameState.activePlayerIndex];

    // If defender is a human player (e.g. playing on this machine or in room), trigger defender alert sound
    if (defenderPlayer && !defenderPlayer.isAi) {
      sound.playAlert();
    }

    setPendingAttack({ fromId, toId });
  };

  // Battle resolved from AttackModal
  const handleBattleResolved = (results: {
    fromId: string;
    toId: string;
    conquered: boolean;
    armiesMoved?: number;
    attackerArmiesLeft: number;
    defenderArmiesLeft: number;
    attackerLosses: number;
    defenderLosses: number;
  }) => {
    if (!gameState) return;

    const activePlayer = gameState.players[gameState.activePlayerIndex];
    const prevDefenderOwnerId = gameState.territories[results.toId]?.ownerId;
    const defenderPlayer = gameState.players.find(p => p.id === prevDefenderOwnerId);

    const updatedTerritories = { ...gameState.territories };

    if (results.conquered) {
      // Conquered!
      const moved = results.armiesMoved || 1;
      updatedTerritories[results.fromId] = {
        ...updatedTerritories[results.fromId],
        armies: results.attackerArmiesLeft
      };
      updatedTerritories[results.toId] = {
        ownerId: activePlayer.id,
        armies: moved
      };
    } else {
      updatedTerritories[results.fromId] = {
        ...updatedTerritories[results.fromId],
        armies: results.attackerArmiesLeft
      };
      updatedTerritories[results.toId] = {
        ...updatedTerritories[results.toId],
        armies: results.defenderArmiesLeft
      };
    }

    // Check game end conditions & player eliminations
    const simulatedState = { ...gameState, territories: updatedTerritories };
    const { updatedPlayers, winner } = checkGameEndConditions(simulatedState);

    let newLogs = [...gameState.logs];

    if (results.conquered) {
      newLogs.unshift({
        id: 'log_' + Date.now() + Math.random(),
        turn: gameState.turn,
        playerId: activePlayer.id,
        playerName: activePlayer.name,
        playerColor: activePlayer.color,
        text: `🚩 ${activePlayer.name} כבש את ${getTerritoryName(results.toId)} מידי ${defenderPlayer?.name}!`,
        type: 'conquer',
        timestamp: Date.now()
      });
    }

    // Check if defender was eliminated
    const defenderNow = updatedPlayers.find(p => p.id === prevDefenderOwnerId);
    if (defenderNow?.eliminated && !defenderPlayer?.eliminated) {
      newLogs.unshift({
        id: 'log_elim_' + Date.now(),
        turn: gameState.turn,
        playerId: defenderNow.id,
        playerName: defenderNow.name,
        playerColor: defenderNow.color,
        text: `💀 ${defenderNow.name} הודח מהמשחק לאחר שאיבד את כל הטריטוריות שלו!`,
        type: 'eliminate',
        timestamp: Date.now()
      });
    }

    const nextState: GameState = {
      ...gameState,
      territories: updatedTerritories,
      players: updatedPlayers,
      winnerId: winner ? winner.id : null,
      phase: winner ? 'game_over' : gameState.phase,
      logs: newLogs.slice(0, 45)
    };

    setGameState(nextState);
    syncGameState(nextState);
    setPendingAttack(null);

    // If game ended, record into history & career stats
    if (winner) {
      sound.playVictory();
      recordFinishedGame(nextState, winner);
    }
  };

  // Record completed game to storage
  const recordFinishedGame = (finalState: GameState, winner: Player) => {
    const isUserWinner = winner.id === userProfile.id;
    let conqueredCount = 0;
    for (const tId in finalState.territories) {
      if (finalState.territories[tId].ownerId === userProfile.id) conqueredCount++;
    }

    // Update career stats
    updateProfileStats({
      won: isUserWinner,
      conqueredCount,
      defeatedCount: finalState.logs.filter(l => l.type === 'eliminate').length
    });
    setUserProfile(getUserProfile());

    // Generate Game Record
    const record: GameRecord = {
      id: 'rec_' + Date.now(),
      date: new Date().toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      roomCode: finalState.roomCode,
      winnerName: winner.name,
      winnerColor: winner.color,
      playersCount: finalState.players.length,
      playerNames: finalState.players.map(p => p.name),
      turns: finalState.turn,
      durationMinutes: Math.max(1, Math.round((Date.now() - finalState.startedAt) / 60000)),
      totalBattles: finalState.logs.filter(l => l.type === 'attack' || l.type === 'conquer').length,
      attackerCasualties: 14,
      defenderCasualties: 19,
      keyEvents: finalState.logs.filter(l => l.type === 'conquer').slice(0, 5).map(l => l.text),
      playerPerformances: finalState.players.map(p => {
        let count = 0;
        for (const tId in finalState.territories) {
          if (finalState.territories[tId].ownerId === p.id) count++;
        }
        return {
          name: p.name,
          color: p.color,
          territoriesWon: count,
          armiesLost: 8,
          eliminated: !!p.eliminated
        };
      })
    };

    saveGameRecord(record);
    setGameHistory(getGameHistory());
  };

  // Next Phase (Attack -> Fortify)
  const handleNextPhase = () => {
    if (!gameState) return;
    if (gameState.phase === 'attack') {
      const nextState: GameState = {
        ...gameState,
        phase: 'fortify',
        logs: [
          {
            id: 'log_' + Date.now() + Math.random(),
            turn: gameState.turn,
            playerId: gameState.players[gameState.activePlayerIndex].id,
            playerName: gameState.players[gameState.activePlayerIndex].name,
            playerColor: gameState.players[gameState.activePlayerIndex].color,
            text: `${gameState.players[gameState.activePlayerIndex].name} סיים התקפות ועבר לשלב הביצור.`,
            type: 'phase',
            timestamp: Date.now()
          },
          ...gameState.logs.slice(0, 40)
        ]
      };
      setGameState(nextState);
      syncGameState(nextState);
    }
  };

  // Execute Fortify movement
  const handleExecuteFortify = (armiesToMove: number) => {
    if (!gameState || !pendingFortify) return;

    const { fromId, toId } = pendingFortify;
    const activePlayer = gameState.players[gameState.activePlayerIndex];

    const currentFromArmies = gameState.territories[fromId].armies;
    const currentToArmies = gameState.territories[toId].armies;

    const updatedTerritories = {
      ...gameState.territories,
      [fromId]: {
        ...gameState.territories[fromId],
        armies: currentFromArmies - armiesToMove
      },
      [toId]: {
        ...gameState.territories[toId],
        armies: currentToArmies + armiesToMove
      }
    };

    const nextState: GameState = {
      ...gameState,
      territories: updatedTerritories,
      fortifyDoneInTurn: true,
      logs: [
        {
          id: 'log_' + Date.now() + Math.random(),
          turn: gameState.turn,
          playerId: activePlayer.id,
          playerName: activePlayer.name,
          playerColor: activePlayer.color,
          text: `🛡️ ${activePlayer.name} ביצר: העביר ${armiesToMove} חיילים מ${getTerritoryName(fromId)} ל${getTerritoryName(toId)}.`,
          type: 'fortify',
          timestamp: Date.now()
        },
        ...gameState.logs.slice(0, 40)
      ]
    };

    setGameState(nextState);
    syncGameState(nextState);
    setPendingFortify(null);

    // Automatically end turn after fortifying
    handleEndTurnWithState(nextState);
  };

  // End turn & advance to next player
  const handleEndTurn = () => {
    if (!gameState) return;
    handleEndTurnWithState(gameState);
  };

  const handleEndTurnWithState = (currentState: GameState) => {
    let nextIndex = (currentState.activePlayerIndex + 1) % currentState.players.length;
    while (currentState.players[nextIndex].eliminated) {
      nextIndex = (nextIndex + 1) % currentState.players.length;
    }

    const nextPlayer = currentState.players[nextIndex];
    const nextTurn = nextIndex === 0 ? currentState.turn + 1 : currentState.turn;
    const { total: nextReinforcements } = calculateReinforcements(
      nextPlayer.id,
      currentState.territories,
      currentState.mapType || selectedMapType || 'world'
    );

    const nextState: GameState = {
      ...currentState,
      turn: nextTurn,
      activePlayerIndex: nextIndex,
      phase: 'reinforcement',
      reinforcementsRemaining: nextReinforcements,
      activeAttack: undefined,
      fortifyDoneInTurn: false,
      logs: [
        {
          id: 'log_' + Date.now() + Math.random(),
          turn: nextTurn,
          playerId: nextPlayer.id,
          playerName: nextPlayer.name,
          playerColor: nextPlayer.color,
          text: `התור עבר אל ${nextPlayer.name}. קיבל ${nextReinforcements} תגבורות.`,
          type: 'phase',
          timestamp: Date.now()
        },
        ...currentState.logs.slice(0, 40)
      ]
    };

    setGameState(nextState);
    syncGameState(nextState);
    sound.playTurnChange();
  };

  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-100 flex flex-col font-sans selection:bg-[#c5a059] selection:text-slate-950">
      {/* Top Navbar - hidden on landing page for full immersion */}
      {currentScreen !== 'landing' && (
        <Navbar
          currentScreen={currentScreen}
          roomCode={roomCode}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenRules={() => setShowRulesModal(true)}
          onOpenHistory={() => setCurrentScreen('history')}
          onOpenAuth={() => setCurrentScreen('landing')}
          userNickname={userProfile.nickname}
          userEmail={userProfile.email}
          onLogout={handleLogout}
          onQuitGame={handleQuitGame}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1 w-full pb-12">
        {currentScreen === 'landing' && (
          <LandingScreen
            currentProfile={userProfile}
            onAuthSuccess={handleAuthSuccess}
          />
        )}

        {currentScreen === 'home' && (
          <HomeScreen
            userProfile={userProfile}
            gameHistory={gameHistory}
            onCreateGame={handleCreateGame}
            onJoinGame={handleJoinGame}
            onOpenHistory={() => setCurrentScreen('history')}
            onOpenProfile={() => setShowProfileModal(true)}
            onOpenRules={() => setShowRulesModal(true)}
            onSelectGameForReview={(game) => setSelectedGameForAi(game)}
          />
        )}

        {currentScreen === 'lobby' && (
          <LobbyScreen
            roomCode={roomCode}
            isHost={isHost}
            currentPlayerId={userProfile.id}
            players={lobbyPlayers}
            maxPlayers={maxPlayersInRoom}
            selectedMapType={selectedMapType}
            onSelectMapType={(map) => setSelectedMapType(map)}
            onUpdatePlayer={handleUpdatePlayerInLobby}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            onLeaveLobby={handleLeaveLobby}
            onAddBot={handleAddBotInLobby}
            onRemoveBot={handleRemoveBotInLobby}
          />
        )}

        {currentScreen === 'game' && gameState && (
          <GameBoard
            gameState={gameState}
            currentPlayerId={userProfile.id}
            onPlaceReinforcement={handlePlaceReinforcement}
            onInitiateAttack={handleInitiateAttack}
            onStartFortify={(fromId, toId) => setPendingFortify({ fromId, toId })}
            onNextPhase={handleNextPhase}
            onEndTurn={handleEndTurn}
            onAutoPlaceReinforcements={handleAutoPlaceReinforcements}
            onQuitGame={handleQuitGame}
          />
        )}

        {currentScreen === 'history' && (
          <HistoryScreen
            history={gameHistory}
            onBackToHome={() => setCurrentScreen('home')}
            onSaveAnalysis={(gameId, analysis) => {
              updateGameRecordAnalysis(gameId, analysis);
              setGameHistory(getGameHistory());
            }}
          />
        )}
      </main>

      {/* Attack Modal */}
      {pendingAttack && gameState && (
        <AttackModal
          fromTerritoryId={pendingAttack.fromId}
          toTerritoryId={pendingAttack.toId}
          attackerPlayer={gameState.players.find(p => p.id === gameState.territories[pendingAttack.fromId]?.ownerId)!}
          defenderPlayer={gameState.players.find(p => p.id === gameState.territories[pendingAttack.toId]?.ownerId)!}
          territories={gameState.territories}
          onClose={() => setPendingAttack(null)}
          onBattleResolved={handleBattleResolved}
        />
      )}

      {/* Defender Alert Modal (when human defender is attacked) */}
      {defenderAlert && (
        <DefenderAlertModal
          territoryId={defenderAlert.territoryId}
          attackerPlayer={defenderAlert.attackerPlayer}
          defenderPlayer={gameState?.players.find(p => p.id === userProfile.id)!}
          armies={defenderAlert.armies}
          onSelectDefenderDice={(diceCount) => {
            if (defenderAlert.resolver) defenderAlert.resolver(diceCount);
            setDefenderAlert(null);
          }}
          onDismiss={() => setDefenderAlert(null)}
        />
      )}

      {/* Fortify Modal */}
      {pendingFortify && gameState && (
        <FortifyModal
          fromTerritoryId={pendingFortify.fromId}
          toTerritoryId={pendingFortify.toId}
          player={gameState.players[gameState.activePlayerIndex]}
          territories={gameState.territories}
          onClose={() => setPendingFortify(null)}
          onExecuteFortify={handleExecuteFortify}
        />
      )}

      {/* Game Over Modal */}
      {gameState?.phase === 'game_over' && gameState.winnerId && (
        <GameOverModal
          winner={gameState.players.find(p => p.id === gameState.winnerId)!}
          gameState={gameState}
          onOpenAiReview={() => {
            const latest = gameHistory[0];
            if (latest) {
              setSelectedGameForAi(latest);
            }
          }}
          onGoHome={() => {
            setGameState(null);
            setCurrentScreen('home');
          }}
          onOpenHistory={() => {
            setGameState(null);
            setCurrentScreen('history');
          }}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          profile={userProfile}
          onSaveProfile={(updated) => {
            saveUserProfile(updated);
            setUserProfile(updated);
          }}
          onOpenHistory={() => {
            setShowProfileModal(false);
            setCurrentScreen('history');
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <RulesModal onClose={() => setShowRulesModal(false)} />
      )}

      {/* AI Review Modal */}
      {selectedGameForAi && (
        <AiReviewModal
          game={selectedGameForAi}
          onClose={() => setSelectedGameForAi(null)}
          onSaveAnalysis={(gameId, text) => {
            updateGameRecordAnalysis(gameId, text);
            setGameHistory(getGameHistory());
          }}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          currentProfile={userProfile}
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(profile) => {
            handleAuthSuccess(profile);
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}
