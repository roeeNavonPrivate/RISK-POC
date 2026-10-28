export type ContinentId = 
  | 'north_america'
  | 'south_america'
  | 'europe'
  | 'africa'
  | 'asia'
  | 'australia';

export interface Continent {
  id: ContinentId;
  nameHebrew: string;
  nameEnglish: string;
  bonus: number;
  color: string;
  territoryIds: string[];
}

export interface Territory {
  id: string;
  nameHebrew: string;
  nameEnglish: string;
  continent: ContinentId;
  adjacentIds: string[];
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  color: string; // Hex color
  bgClass: string;
  borderClass: string;
  textClass: string;
  isHost: boolean;
  isAi: boolean;
  aiPersonality?: 'aggressive' | 'balanced' | 'defensive';
  isReady: boolean;
  eliminated: boolean;
  cardsCount?: number;
}

export type GamePhase = 'reinforcement' | 'attack' | 'fortify' | 'game_over';

export interface TerritoryState {
  ownerId: string;
  armies: number;
}

export interface BattleDiceRoll {
  attackerDice: number[];
  defenderDice: number[];
  attackerLosses: number;
  defenderLosses: number;
  timestamp: number;
}

export interface LogEntry {
  id: string;
  turn: number;
  playerId: string;
  playerName: string;
  playerColor: string;
  text: string;
  type: 'reinforce' | 'attack' | 'conquer' | 'fortify' | 'eliminate' | 'phase' | 'system';
  timestamp: number;
}

export interface GameState {
  roomCode: string;
  turn: number;
  round: number;
  activePlayerIndex: number;
  phase: GamePhase;
  players: Player[];
  territories: Record<string, TerritoryState>;
  reinforcementsRemaining: number;
  logs: LogEntry[];
  winnerId: string | null;
  startedAt: number;
  endedAt?: number;
  // Current combat pending state
  activeAttack?: {
    fromTerritoryId: string;
    toTerritoryId: string;
    attackerPlayerId: string;
    defenderPlayerId: string;
    attackerDiceCount?: number;
    defenderDiceCount?: number;
    lastRoll?: BattleDiceRoll;
    conquered?: boolean;
    minArmiesToMove?: number;
    maxArmiesToMove?: number;
  };
  fortifyDoneInTurn?: boolean;
}

export interface GameRecord {
  id: string;
  date: string;
  roomCode: string;
  winnerName: string;
  winnerColor: string;
  playersCount: number;
  playerNames: string[];
  turns: number;
  durationMinutes: number;
  totalBattles: number;
  attackerCasualties: number;
  defenderCasualties: number;
  keyEvents: string[];
  playerPerformances: Array<{
    name: string;
    color: string;
    territoriesWon: number;
    armiesLost: number;
    eliminated: boolean;
  }>;
  aiAnalysis?: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  preferredColor: string;
  gamesPlayed: number;
  gamesWon: number;
  territoriesConquered: number;
  armiesDefeated: number;
  rankTitle: string;
}
