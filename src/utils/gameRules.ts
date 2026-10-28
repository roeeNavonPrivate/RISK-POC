import { 
  GameState, 
  Player, 
  TerritoryState, 
  BattleDiceRoll, 
  LogEntry 
} from '../types/risk';
import { CONTINENTS, TERRITORIES, TERRITORY_MAP } from '../data/riskMapData';

export function calculateReinforcements(
  playerId: string, 
  territories: Record<string, TerritoryState>
): { total: number; base: number; continentBonuses: Array<{ name: string; bonus: number }> } {
  // Count player territories
  let count = 0;
  for (const tId in territories) {
    if (territories[tId].ownerId === playerId) {
      count++;
    }
  }

  const base = Math.max(3, Math.floor(count / 3));
  const continentBonuses: Array<{ name: string; bonus: number }> = [];
  let bonusSum = 0;

  // Check each continent
  for (const cKey in CONTINENTS) {
    const continent = CONTINENTS[cKey];
    const ownsAll = continent.territoryIds.every(
      tId => territories[tId]?.ownerId === playerId
    );
    if (ownsAll) {
      continentBonuses.push({ name: continent.nameHebrew, bonus: continent.bonus });
      bonusSum += continent.bonus;
    }
  }

  return {
    total: base + bonusSum,
    base,
    continentBonuses
  };
}

// Initial game setup: distribute 42 territories among active players
export function createInitialGameState(players: Player[], roomCode: string): GameState {
  const shuffledTerritoryIds = [...TERRITORIES.map(t => t.id)].sort(() => Math.random() - 0.5);
  const territories: Record<string, TerritoryState> = {};

  // Deal territories round-robin
  shuffledTerritoryIds.forEach((tId, index) => {
    const player = players[index % players.length];
    // Each territory starts with 1 army, plus some have 2-3 to make initial board dynamic
    const initialArmies = (index % 3 === 0) ? 2 : 1;
    territories[tId] = {
      ownerId: player.id,
      armies: initialArmies
    };
  });

  const firstPlayer = players[0];
  const { total: initialReinforcements } = calculateReinforcements(firstPlayer.id, territories);

  const initialLog: LogEntry = {
    id: 'log_start',
    turn: 1,
    playerId: firstPlayer.id,
    playerName: firstPlayer.name,
    playerColor: firstPlayer.color,
    text: `המשחק החל! התור של ${firstPlayer.name}. קיבל ${initialReinforcements} תגבורות.`,
    type: 'system',
    timestamp: Date.now()
  };

  return {
    roomCode,
    turn: 1,
    round: 1,
    activePlayerIndex: 0,
    phase: 'reinforcement',
    players: players.map(p => ({ ...p, eliminated: false })),
    territories,
    reinforcementsRemaining: initialReinforcements,
    logs: [initialLog],
    winnerId: null,
    startedAt: Date.now(),
    fortifyDoneInTurn: false
  };
}

// Execute dice battle simulation
export function resolveBattle(
  attackerDiceCount: number,
  defenderDiceCount: number
): { attackerDice: number[]; defenderDice: number[]; attackerLosses: number; defenderLosses: number } {
  // Roll attacker dice (1-6)
  const attackerDice: number[] = [];
  for (let i = 0; i < attackerDiceCount; i++) {
    attackerDice.push(Math.floor(Math.random() * 6) + 1);
  }
  attackerDice.sort((a, b) => b - a);

  // Roll defender dice (1-6)
  const defenderDice: number[] = [];
  for (let i = 0; i < defenderDiceCount; i++) {
    defenderDice.push(Math.floor(Math.random() * 6) + 1);
  }
  defenderDice.sort((a, b) => b - a);

  let attackerLosses = 0;
  let defenderLosses = 0;

  // Compare highest dice
  if (attackerDice[0] > defenderDice[0]) {
    defenderLosses++;
  } else {
    // Defender wins on ties!
    attackerLosses++;
  }

  // Compare 2nd highest dice if both rolled at least 2 dice
  if (attackerDice.length >= 2 && defenderDice.length >= 2) {
    if (attackerDice[1] > defenderDice[1]) {
      defenderLosses++;
    } else {
      attackerLosses++;
    }
  }

  return {
    attackerDice,
    defenderDice,
    attackerLosses,
    defenderLosses
  };
}

// Check if two territories are connected through a path of territories owned by the same player
export function isPathConnected(
  fromId: string, 
  toId: string, 
  playerId: string, 
  territories: Record<string, TerritoryState>
): boolean {
  if (fromId === toId) return true;
  if (territories[fromId]?.ownerId !== playerId || territories[toId]?.ownerId !== playerId) {
    return false;
  }

  const visited = new Set<string>();
  const queue = [fromId];
  visited.add(fromId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === toId) return true;

    const territoryDef = TERRITORY_MAP[current];
    if (!territoryDef) continue;

    for (const neighborId of territoryDef.adjacentIds) {
      if (!visited.has(neighborId) && territories[neighborId]?.ownerId === playerId) {
        visited.add(neighborId);
        queue.push(neighborId);
      }
    }
  }

  return false;
}

// Check if any player has won or been eliminated
export function checkGameEndConditions(
  gameState: GameState
): { updatedPlayers: Player[]; winner: Player | null } {
  const activePlayers = gameState.players.filter(p => !p.eliminated);
  const territoryOwners = new Set(Object.values(gameState.territories).map(t => t.ownerId));

  const updatedPlayers = gameState.players.map(p => {
    if (!p.eliminated && !territoryOwners.has(p.id)) {
      return { ...p, eliminated: true };
    }
    return p;
  });

  const remaining = updatedPlayers.filter(p => !p.eliminated);
  let winner: Player | null = null;

  if (remaining.length === 1) {
    winner = remaining[0];
  } else if (remaining.length === 0 && activePlayers.length > 0) {
    winner = activePlayers[0];
  }

  return { updatedPlayers, winner };
}
