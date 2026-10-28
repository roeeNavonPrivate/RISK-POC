import { GameRecord, UserProfile, GameState } from '../types/risk';

const PROFILE_KEY = 'risk_user_profile';
const HISTORY_KEY = 'risk_game_history';
const ROOMS_KEY = 'risk_local_rooms';

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const defaultProfile: UserProfile = {
    id: 'user_' + Math.random().toString(36).substring(2, 9),
    nickname: 'מפקד שדה',
    preferredColor: '#ef4444',
    gamesPlayed: 0,
    gamesWon: 0,
    territoriesConquered: 0,
    armiesDefeated: 0,
    rankTitle: 'טוראי ראשון'
  };
  saveUserProfile(defaultProfile);
  return defaultProfile;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {}
}

export function updateProfileStats(stats: {
  won: boolean;
  conqueredCount: number;
  defeatedCount: number;
}): void {
  const profile = getUserProfile();
  profile.gamesPlayed += 1;
  if (stats.won) profile.gamesWon += 1;
  profile.territoriesConquered += stats.conqueredCount;
  profile.armiesDefeated += stats.defeatedCount;

  // Update military rank based on achievements
  const wins = profile.gamesWon;
  if (wins >= 15) profile.rankTitle = 'פילדמרשל עליון';
  else if (wins >= 10) profile.rankTitle = 'גנרל 4 כוכבים';
  else if (wins >= 6) profile.rankTitle = 'קולונל אסטרטגי';
  else if (wins >= 3) profile.rankTitle = 'רב-סרן קרבי';
  else if (wins >= 1) profile.rankTitle = 'סגן מפקד';
  else profile.rankTitle = 'טוראי ראשון';

  saveUserProfile(profile);
}

export function getGameHistory(): GameRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export function saveGameRecord(record: GameRecord): void {
  try {
    const list = getGameHistory();
    list.unshift(record);
    // Keep last 25 games
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 25)));
  } catch (e) {}
}

export function updateGameRecordAnalysis(id: string, aiAnalysis: string): void {
  try {
    const list = getGameHistory();
    const item = list.find(g => g.id === id);
    if (item) {
      item.aiAnalysis = aiAnalysis;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    }
  } catch (e) {}
}

// BroadcastChannel for instant local multi-tab sync
type SyncMessage = 
  | { type: 'PLAYER_JOINED'; roomCode: string; player: any }
  | { type: 'PLAYER_READY'; roomCode: string; playerId: string; isReady: boolean }
  | { type: 'GAME_STARTED'; roomCode: string; gameState: GameState }
  | { type: 'GAME_STATE_UPDATE'; roomCode: string; gameState: GameState }
  | { type: 'DEFENDER_PROMPT'; roomCode: string; attackData: any };

class MultiTabSync {
  private channel: BroadcastChannel | null = null;
  private listeners: Array<(msg: SyncMessage) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('risk_multiplayer_sync');
      this.channel.onmessage = (event) => {
        const msg = event.data as SyncMessage;
        this.listeners.forEach(fn => fn(msg));
      };
    }
  }

  public subscribe(fn: (msg: SyncMessage) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  public broadcast(msg: SyncMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (e) {}
    }
  }
}

export const tabSync = new MultiTabSync();
