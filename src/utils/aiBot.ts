import { GameState, TerritoryState } from '../types/risk';
import { TERRITORY_MAP, CONTINENTS } from '../data/riskMapData';
import { resolveBattle, checkGameEndConditions, calculateReinforcements, isPathConnected } from './gameRules';
import { sound } from './audio';

// AI decision maker with delay for human players to observe
export async function executeAiTurn(
  initialState: GameState,
  onStateUpdate: (state: GameState) => void,
  isCancelled: () => boolean
): Promise<void> {
  let state = { ...initialState };
  const aiPlayer = state.players[state.activePlayerIndex];
  if (!aiPlayer || !aiPlayer.isAi || aiPlayer.eliminated) return;

  const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

  // --- Step 1: Reinforce Phase ---
  await wait(600);
  if (isCancelled()) return;

  while (state.reinforcementsRemaining > 0) {
    if (isCancelled()) return;

    // Pick best territory to reinforce:
    // Prefer border territories with high enemy neighbor count
    const ownedTerritoryIds = Object.keys(state.territories).filter(
      id => state.territories[id].ownerId === aiPlayer.id
    );

    if (ownedTerritoryIds.length === 0) break;

    let bestTargetId = ownedTerritoryIds[0];
    let highestScore = -999;

    for (const tId of ownedTerritoryIds) {
      const def = TERRITORY_MAP[tId];
      if (!def) continue;

      let enemyNeighbors = 0;
      let minEnemyArmies = 999;

      for (const adjId of def.adjacentIds) {
        if (state.territories[adjId]?.ownerId !== aiPlayer.id) {
          enemyNeighbors++;
          const enemyArmies = state.territories[adjId]?.armies || 1;
          if (enemyArmies < minEnemyArmies) minEnemyArmies = enemyArmies;
        }
      }

      // Bonus if this territory helps secure a continent
      let continentBonusScore = 0;
      const continent = CONTINENTS[def.continent];
      if (continent) {
        const ownedInContinent = continent.territoryIds.filter(
          id => state.territories[id]?.ownerId === aiPlayer.id
        ).length;
        if (ownedInContinent >= continent.territoryIds.length - 1) {
          continentBonusScore = 15;
        }
      }

      let score = (enemyNeighbors * 5) + (continentBonusScore) - (state.territories[tId].armies * 0.5);
      if (aiPlayer.aiPersonality === 'defensive') {
        // Defensive AI strongly fortifies borders and endangered territories
        score = (enemyNeighbors * 8) - (state.territories[tId].armies * 0.8) + (minEnemyArmies > 3 ? 10 : 0);
      } else if (aiPlayer.aiPersonality === 'aggressive') {
        // Aggressive AI packs troops onto offensive launchpads
        const canCrushEnemy = minEnemyArmies <= 2 ? 12 : 0;
        score = (enemyNeighbors * 6) + canCrushEnemy + (state.territories[tId].armies * 0.3);
      }

      if (score > highestScore) {
        highestScore = score;
        bestTargetId = tId;
      }
    }

    const armiesToPlace = state.reinforcementsRemaining;
    state = {
      ...state,
      reinforcementsRemaining: 0,
      territories: {
        ...state.territories,
        [bestTargetId]: {
          ...state.territories[bestTargetId],
          armies: state.territories[bestTargetId].armies + armiesToPlace
        }
      },
      logs: [
        {
          id: 'log_' + Date.now() + Math.random(),
          turn: state.turn,
          playerId: aiPlayer.id,
          playerName: aiPlayer.name,
          playerColor: aiPlayer.color,
          text: `${aiPlayer.name} הציב ${armiesToPlace} תגבורות ב${TERRITORY_MAP[bestTargetId]?.nameHebrew || bestTargetId}.`,
          type: 'reinforce',
          timestamp: Date.now()
        },
        ...state.logs.slice(0, 40)
      ]
    };

    sound.playPlaceTroop();
    onStateUpdate(state);
    await wait(600);
  }

  // --- Step 2: Transition to Attack Phase ---
  state = {
    ...state,
    phase: 'attack'
  };
  onStateUpdate(state);
  await wait(500);

  // AI executes attacks based on personality
  let attacksMade = 0;
  const maxAttacks = aiPlayer.aiPersonality === 'aggressive' ? 7 : (aiPlayer.aiPersonality === 'defensive' ? 2 : 4);

  while (attacksMade < maxAttacks) {
    if (isCancelled()) return;

    // Look for favorable attack
    let bestAttack: { fromId: string; toId: string; ratio: number } | null = null;
    let maxRatio = -1;

    const ownedTerritories = Object.keys(state.territories).filter(
      id => state.territories[id].ownerId === aiPlayer.id && state.territories[id].armies >= 2
    );

    for (const fromId of ownedTerritories) {
      const fromArmies = state.territories[fromId].armies;
      const def = TERRITORY_MAP[fromId];
      if (!def) continue;

      for (const toId of def.adjacentIds) {
        const targetTerritory = state.territories[toId];
        if (targetTerritory && targetTerritory.ownerId !== aiPlayer.id) {
          const toArmies = targetTerritory.armies;
          // Must have advantage based on personality
          const threshold = aiPlayer.aiPersonality === 'aggressive' 
            ? 1.05 
            : (aiPlayer.aiPersonality === 'defensive' ? 1.6 : 1.3);

          if (fromArmies > toArmies * threshold || (fromArmies >= 3 && toArmies === 1)) {
            const ratio = fromArmies / (toArmies || 1);
            if (ratio > maxRatio) {
              maxRatio = ratio;
              bestAttack = { fromId, toId, ratio };
            }
          }
        }
      }
    }

    if (!bestAttack) break; // No good attack available

    const { fromId, toId } = bestAttack;
    let fromArmies = state.territories[fromId].armies;
    let toArmies = state.territories[toId].armies;

    // Simulate dice roll
    const attackerDiceCount = Math.min(3, fromArmies - 1);
    const defenderDiceCount = Math.min(2, toArmies);

    sound.playDiceRoll();
    await wait(500);
    if (isCancelled()) return;

    const { attackerDice, defenderDice, attackerLosses, defenderLosses } = resolveBattle(
      attackerDiceCount,
      defenderDiceCount
    );

    fromArmies -= attackerLosses;
    toArmies -= defenderLosses;

    const defenderPlayer = state.players.find(p => p.id === state.territories[toId].ownerId);

    // Apply casualties
    if (toArmies <= 0) {
      // Conquered!
      sound.playConquer();
      // Origin territory must keep at least 1 army
      const maxCanMove = Math.max(1, fromArmies - 1);
      const armiesToMove = Math.min(maxCanMove, Math.max(1, attackerDiceCount));
      const remainingInOrigin = fromArmies - armiesToMove;

      // Check win or elimination
      const simulatedTerritories = {
        ...state.territories,
        [fromId]: { ...state.territories[fromId], armies: remainingInOrigin },
        [toId]: { ownerId: aiPlayer.id, armies: armiesToMove }
      };

      const { updatedPlayers, winner } = checkGameEndConditions({
        ...state,
        territories: simulatedTerritories
      });

      const defenderNow = updatedPlayers.find(p => p.id === defenderPlayer?.id);
      const wasEliminated = defenderNow?.eliminated && !defenderPlayer?.eliminated;

      const newLogs = [...state.logs];
      if (wasEliminated && defenderNow) {
        newLogs.unshift({
          id: 'log_elim_' + Date.now() + Math.random(),
          turn: state.turn,
          playerId: defenderNow.id,
          playerName: defenderNow.name,
          playerColor: defenderNow.color,
          text: `💀 ${defenderNow.name} הודח מהמשחק לאחר שאיבד את כל הטריטוריות שלו!`,
          type: 'eliminate',
          timestamp: Date.now()
        });
      }

      newLogs.unshift({
        id: 'log_' + Date.now() + Math.random(),
        turn: state.turn,
        playerId: aiPlayer.id,
        playerName: aiPlayer.name,
        playerColor: aiPlayer.color,
        text: `🚩 ${aiPlayer.name} כבש את ${TERRITORY_MAP[toId]?.nameHebrew || toId} מידי ${defenderPlayer?.name || 'היריב'}!`,
        type: 'conquer',
        timestamp: Date.now()
      });

      state = {
        ...state,
        territories: simulatedTerritories,
        players: updatedPlayers,
        logs: newLogs.slice(0, 45)
      };

      if (winner) {
        state.winnerId = winner.id;
        state.phase = 'game_over';
        onStateUpdate(state);
        return;
      }
    } else {
      // Attacked with casualties
      sound.playBattleClash();
      state = {
        ...state,
        territories: {
          ...state.territories,
          [fromId]: { ...state.territories[fromId], armies: fromArmies },
          [toId]: { ...state.territories[toId], armies: toArmies }
        },
        logs: [
          {
            id: 'log_' + Date.now() + Math.random(),
            turn: state.turn,
            playerId: aiPlayer.id,
            playerName: aiPlayer.name,
            playerColor: aiPlayer.color,
            text: `⚔️ קרב על ${TERRITORY_MAP[toId]?.nameHebrew || toId}: ${aiPlayer.name} איבד ${attackerLosses}, ${defenderPlayer?.name} איבד ${defenderLosses}.`,
            type: 'attack',
            timestamp: Date.now()
          },
          ...state.logs.slice(0, 40)
        ]
      };
    }

    onStateUpdate(state);
    attacksMade++;
    await wait(600);
  }

  // --- Step 3: Fortify Phase ---
  state = {
    ...state,
    phase: 'fortify'
  };
  onStateUpdate(state);
  await wait(500);
  if (isCancelled()) return;

  // Move troops from an interior territory (no enemy borders) to a border territory
  const interiorTerritories = Object.keys(state.territories).filter(id => {
    if (state.territories[id].ownerId !== aiPlayer.id || state.territories[id].armies <= 1) return false;
    const def = TERRITORY_MAP[id];
    if (!def) return false;
    // Check if completely safe (surrounded only by self)
    return def.adjacentIds.every(adjId => state.territories[adjId]?.ownerId === aiPlayer.id);
  });

  if (interiorTerritories.length > 0) {
    const sourceId = interiorTerritories[0];
    const sourceArmies = state.territories[sourceId].armies;
    
    // Find border territory connected through friendly path
    const borderTerritory = Object.keys(state.territories).find(id => {
      if (state.territories[id].ownerId !== aiPlayer.id || id === sourceId) return false;
      const def = TERRITORY_MAP[id];
      const isBorder = def?.adjacentIds.some(adjId => state.territories[adjId]?.ownerId !== aiPlayer.id);
      return isBorder && isPathConnected(sourceId, id, aiPlayer.id, state.territories);
    });

    if (borderTerritory) {
      const moveCount = sourceArmies - 1;
      state = {
        ...state,
        territories: {
          ...state.territories,
          [sourceId]: { ...state.territories[sourceId], armies: 1 },
          [borderTerritory]: { ...state.territories[borderTerritory], armies: state.territories[borderTerritory].armies + moveCount }
        },
        logs: [
          {
            id: 'log_' + Date.now() + Math.random(),
            turn: state.turn,
            playerId: aiPlayer.id,
            playerName: aiPlayer.name,
            playerColor: aiPlayer.color,
            text: `🛡️ ${aiPlayer.name} ביצר: העביר ${moveCount} חיילים ל${TERRITORY_MAP[borderTerritory]?.nameHebrew || borderTerritory}.`,
            type: 'fortify',
            timestamp: Date.now()
          },
          ...state.logs.slice(0, 40)
        ]
      };
      sound.playPlaceTroop();
      onStateUpdate(state);
      await wait(500);
    }
  }

  if (isCancelled()) return;

  // --- Step 4: End AI Turn & Advance to next player ---
  let nextIndex = (state.activePlayerIndex + 1) % state.players.length;
  let safetyCounter = 0;
  while (state.players[nextIndex].eliminated && safetyCounter < state.players.length) {
    nextIndex = (nextIndex + 1) % state.players.length;
    safetyCounter++;
  }

  const nextPlayer = state.players[nextIndex];
  const nextTurn = nextIndex === 0 ? state.turn + 1 : state.turn;
  const { total: nextReinforcements } = calculateReinforcements(nextPlayer.id, state.territories);

  state = {
    ...state,
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
      ...state.logs.slice(0, 40)
    ]
  };

  onStateUpdate(state);
}
