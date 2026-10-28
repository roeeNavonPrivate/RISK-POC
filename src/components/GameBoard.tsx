import React, { useState, useEffect, useRef } from 'react';
import { 
  Swords, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  Award, 
  RotateCcw, 
  ArrowRight,
  Sparkles,
  Bot,
  Activity,
  MapPin,
  Check,
  Eye,
  Sliders,
  Compass
} from 'lucide-react';
import { GameState, Player, TerritoryState } from '../types/risk';
import { CONTINENTS, TERRITORIES, TERRITORY_MAP } from '../data/riskMapData';
import { isPathConnected } from '../utils/gameRules';
import { sound } from '../utils/audio';
import mapBackground from '../assets/images/risk_calibrated_map.jpg';

interface GameBoardProps {
  gameState: GameState;
  currentPlayerId: string;
  onPlaceReinforcement: (territoryId: string, count: number) => void;
  onInitiateAttack: (fromId: string, toId: string) => void;
  onStartFortify: (fromId: string, toId: string) => void;
  onNextPhase: () => void;
  onEndTurn: () => void;
  onAutoPlaceReinforcements?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayerId,
  onPlaceReinforcement,
  onInitiateAttack,
  onStartFortify,
  onNextPhase,
  onEndTurn,
  onAutoPlaceReinforcements
}) => {
  const activePlayer = gameState.players[gameState.activePlayerIndex];
  const isMyTurn = activePlayer?.id === currentPlayerId;

  // Selected territories for interaction
  const [selectedAttackerId, setSelectedAttackerId] = useState<string | null>(null);
  const [selectedFortifySourceId, setSelectedFortifySourceId] = useState<string | null>(null);
  const [hoveredTerritoryId, setHoveredTerritoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'standings' | 'logs' | 'continents'>('standings');

  // Map background visual customization
  const [mapOpacity, setMapOpacity] = useState<number>(0.85);
  const [showMapSettings, setShowMapSettings] = useState<boolean>(false);

  // Check continent control for glowing zone highlights
  const getContinentRuler = (continentId: string): Player | null => {
    const continent = CONTINENTS[continentId];
    if (!continent) return null;
    const owners = new Set(continent.territoryIds.map(id => gameState.territories[id]?.ownerId));
    if (owners.size === 1) {
      const ownerId = Array.from(owners)[0];
      return gameState.players.find(p => p.id === ownerId) || null;
    }
    return null;
  };

  // Reset selections when phase or active player changes
  useEffect(() => {
    setSelectedAttackerId(null);
    setSelectedFortifySourceId(null);
  }, [gameState.phase, gameState.activePlayerIndex]);

  // Handle Territory Click based on current phase
  const handleTerritoryClick = (tId: string) => {
    if (!isMyTurn || activePlayer.isAi) return;

    const territoryState = gameState.territories[tId];
    if (!territoryState) return;

    const isOwned = territoryState.ownerId === activePlayer.id;

    // Phase 1: REINFORCEMENT
    if (gameState.phase === 'reinforcement') {
      if (isOwned && gameState.reinforcementsRemaining > 0) {
        sound.playPlaceTroop();
        onPlaceReinforcement(tId, 1);
      }
      return;
    }

    // Phase 2: ATTACK
    if (gameState.phase === 'attack') {
      if (isOwned) {
        // Select as attacker if has at least 2 armies
        if (territoryState.armies >= 2) {
          if (selectedAttackerId === tId) {
            setSelectedAttackerId(null); // toggle off
          } else {
            setSelectedAttackerId(tId);
            sound.playPlaceTroop();
          }
        }
      } else {
        // Clicked enemy territory: check if adjacent to selected attacker
        if (selectedAttackerId) {
          const attackerDef = TERRITORY_MAP[selectedAttackerId];
          if (attackerDef && attackerDef.adjacentIds.includes(tId)) {
            // Trigger attack dialog!
            onInitiateAttack(selectedAttackerId, tId);
            setSelectedAttackerId(null);
          }
        }
      }
      return;
    }

    // Phase 3: FORTIFY
    if (gameState.phase === 'fortify') {
      if (isOwned) {
        if (!selectedFortifySourceId) {
          // Select source if has > 1 army
          if (territoryState.armies > 1) {
            setSelectedFortifySourceId(tId);
            sound.playPlaceTroop();
          }
        } else {
          // Second click on owned territory
          if (tId === selectedFortifySourceId) {
            setSelectedFortifySourceId(null);
          } else {
            // Check connected path
            const connected = isPathConnected(
              selectedFortifySourceId,
              tId,
              activePlayer.id,
              gameState.territories
            );
            if (connected) {
              onStartFortify(selectedFortifySourceId, tId);
              setSelectedFortifySourceId(null);
            }
          }
        }
      }
      return;
    }
  };

  // Helper to get territory owner player
  const getOwner = (tId: string): Player | undefined => {
    const ownerId = gameState.territories[tId]?.ownerId;
    return gameState.players.find(p => p.id === ownerId);
  };

  // Helper to determine if territory is a valid attack target
  const isValidAttackTarget = (tId: string): boolean => {
    if (!selectedAttackerId) return false;
    const attackerDef = TERRITORY_MAP[selectedAttackerId];
    if (!attackerDef) return false;
    const isAdjacent = attackerDef.adjacentIds.includes(tId);
    const isEnemy = gameState.territories[tId]?.ownerId !== activePlayer.id;
    return isAdjacent && isEnemy;
  };

  // Helper to determine if territory is a valid fortify destination
  const isValidFortifyDestination = (tId: string): boolean => {
    if (!selectedFortifySourceId || tId === selectedFortifySourceId) return false;
    return isPathConnected(
      selectedFortifySourceId,
      tId,
      activePlayer.id,
      gameState.territories
    );
  };

  // Trans-oceanic sea routes
  const SEA_ROUTES = new Set([
    'alaska--kamchatka',
    'greenland--iceland',
    'great_britain--iceland',
    'brazil--north_africa',
    'north_africa--western_europe',
    'north_africa--southern_europe',
    'egypt--southern_europe',
    'middle_east--southern_europe',
    'east_africa--madagascar',
    'madagascar--south_africa',
    'indonesia--siam',
    'indonesia--new_guinea',
    'indonesia--western_australia',
    'eastern_australia--new_guinea',
    'new_guinea--western_australia',
    'japan--kamchatka',
    'japan--mongolia'
  ]);

  // Render SVG connection lines between adjacent territories with bold prominent visuals
  const renderedConnections = new Set<string>();
  const connectionLines: React.ReactNode[] = [];

  TERRITORIES.forEach(t1 => {
    t1.adjacentIds.forEach(adjId => {
      const t2 = TERRITORY_MAP[adjId];
      if (!t2) return;

      const key = [t1.id, t2.id].sort().join('--');
      if (renderedConnections.has(key)) return;
      renderedConnections.add(key);

      const isSea = SEA_ROUTES.has(key);
      const isWraparound = (t1.id === 'alaska' && t2.id === 'kamchatka') ||
                           (t1.id === 'kamchatka' && t2.id === 'alaska');

      // Check dynamic highlighting
      const isAttackerTarget = selectedAttackerId && (
        (selectedAttackerId === t1.id && gameState.territories[t2.id]?.ownerId !== activePlayer.id) ||
        (selectedAttackerId === t2.id && gameState.territories[t1.id]?.ownerId !== activePlayer.id)
      );

      const isFortifyRoute = selectedFortifySourceId && (
        (selectedFortifySourceId === t1.id && gameState.territories[t2.id]?.ownerId === activePlayer.id) ||
        (selectedFortifySourceId === t2.id && gameState.territories[t1.id]?.ownerId === activePlayer.id)
      );

      const isHovered = hoveredTerritoryId && (hoveredTerritoryId === t1.id || hoveredTerritoryId === t2.id);

      if (isWraparound) {
        // Draw two prominent outbound tracks toward left and right edges
        const alaskaPt = t1.id === 'alaska' ? t1 : t2;
        const kamchatkaPt = t1.id === 'kamchatka' ? t1 : t2;

        connectionLines.push(
          <g key="wraparound-routes" pointerEvents="none">
            {/* Alaska outbound shadow & line */}
            <path d={`M ${alaskaPt.x} ${alaskaPt.y} L 0 110`} stroke="#020617" strokeWidth="6" strokeLinecap="round" />
            <path
              d={`M ${alaskaPt.x} ${alaskaPt.y} L 0 110`}
              stroke={isAttackerTarget ? '#ef4444' : isHovered ? '#fbbf24' : '#38bdf8'}
              strokeWidth={isAttackerTarget ? 4.5 : isHovered ? 4 : 3.2}
              strokeDasharray="6 3"
              className={isAttackerTarget ? 'animate-pulse' : undefined}
            />
            {/* Kamchatka outbound shadow & line */}
            <path d={`M ${kamchatkaPt.x} ${kamchatkaPt.y} L 1000 110`} stroke="#020617" strokeWidth="6" strokeLinecap="round" />
            <path
              d={`M ${kamchatkaPt.x} ${kamchatkaPt.y} L 1000 110`}
              stroke={isAttackerTarget ? '#ef4444' : isHovered ? '#fbbf24' : '#38bdf8'}
              strokeWidth={isAttackerTarget ? 4.5 : isHovered ? 4 : 3.2}
              strokeDasharray="6 3"
              className={isAttackerTarget ? 'animate-pulse' : undefined}
            />
            {/* Route Edge Badges */}
            <rect x="2" y="98" width="56" height="18" rx="4" fill="#020617" stroke="#38bdf8" strokeWidth="1.2" opacity="0.95" />
            <text x="30" y="111" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">⟵ קמצ׳טקה</text>

            <rect x="942" y="98" width="56" height="18" rx="4" fill="#020617" stroke="#38bdf8" strokeWidth="1.2" opacity="0.95" />
            <text x="970" y="111" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">אלסקה ⟶</text>
          </g>
        );
      } else {
        // Prominent Dual-layer stroke (Dark Shadow/Casing + High-Visibility Line)
        const strokeColor = isAttackerTarget 
          ? '#ef4444' 
          : isFortifyRoute 
            ? '#10b981' 
            : isHovered 
              ? '#fbbf24' 
              : isSea 
                ? '#38bdf8' 
                : '#cbd5e1';

        const strokeWidth = isAttackerTarget || isFortifyRoute 
          ? 4.5 
          : isHovered 
            ? 3.8 
            : isSea 
              ? 2.8 
              : 2.6;

        const dashArray = isAttackerTarget 
          ? '8 4' 
          : isSea 
            ? '7 4' 
            : '5 3';

        connectionLines.push(
          <g key={key} pointerEvents="none">
            {/* Underlay dark casing line to create maximum contrast against any map backdrop */}
            <line
              x1={t1.x}
              y1={t1.y}
              x2={t2.x}
              y2={t2.y}
              stroke="#020617"
              strokeWidth={strokeWidth + 3.2}
              strokeLinecap="round"
              opacity="0.95"
            />
            {/* Main high-visibility prominent connection route */}
            <line
              x1={t1.x}
              y1={t1.y}
              x2={t2.x}
              y2={t2.y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeLinecap="round"
              opacity={isAttackerTarget || isFortifyRoute || isHovered ? 1 : 0.9}
              className={isAttackerTarget ? 'animate-pulse' : undefined}
            />
          </g>
        );
      }
    });
  });

  return (
    <div className="w-full max-w-[1500px] mx-auto px-2 sm:px-4 py-4 space-y-4">
      {/* Top Strategic Phase & Turn Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Active Player Indicator */}
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-lg border-2 border-white/40 ring-2 ring-slate-800"
              style={{ backgroundColor: activePlayer?.color }}
            >
              {activePlayer?.isAi ? <Bot className="w-6 h-6" /> : activePlayer?.name.slice(0, 2)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">תור {gameState.turn}</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-amber-400 font-bold">
                  {isMyTurn ? 'התור שלך עכשיו!' : `תור של ${activePlayer?.name}`}
                </span>
                {activePlayer?.isAi && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                    AI חושב
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>{activePlayer?.name}</span>
                {isMyTurn && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    אתה משחק
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Phase Steps Indicator */}
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800 self-center">
            {/* Step 1: Reinforcement */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gameState.phase === 'reinforcement'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400'
            }`}>
              <Shield className="w-3.5 h-3.5" />
              <span>1. תגבורות</span>
              {gameState.phase === 'reinforcement' && (
                <span className="px-1.5 py-0.2 rounded bg-slate-950 text-amber-400 font-mono text-[11px] font-black">
                  {gameState.reinforcementsRemaining}
                </span>
              )}
            </div>

            <ChevronLeft className="w-3.5 h-3.5 text-slate-600 shrink-0" />

            {/* Step 2: Attack */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gameState.phase === 'attack'
                ? 'bg-red-600 text-white font-black shadow-md'
                : 'text-slate-400'
            }`}>
              <Swords className="w-3.5 h-3.5" />
              <span>2. התקפה</span>
            </div>

            <ChevronLeft className="w-3.5 h-3.5 text-slate-600 shrink-0" />

            {/* Step 3: Fortify */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gameState.phase === 'fortify'
                ? 'bg-emerald-600 text-white font-black shadow-md'
                : 'text-slate-400'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3. ביצור</span>
            </div>
          </div>

          {/* Contextual Action Buttons */}
          <div className="flex items-center gap-2">
            {isMyTurn && !activePlayer.isAi && (
              <>
                {gameState.phase === 'reinforcement' && (
                  <button
                    onClick={onAutoPlaceReinforcements}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    חלק אוטומטית לגבולות
                  </button>
                )}

                {gameState.phase === 'attack' && (
                  <button
                    onClick={onNextPhase}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>סיים התקפות ועבור לביצור</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {gameState.phase === 'fortify' && (
                  <button
                    onClick={onEndTurn}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>{gameState.fortifyDoneInTurn ? 'סיים תור' : 'דלג על ביצור וסיים תור'}</span>
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Phase Contextual Hint Banner */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              {gameState.phase === 'reinforcement' && (
                <>לחץ על טריטוריה בשליטתך להצבת חיילי תגבורת (נותרו עוד {gameState.reinforcementsRemaining} להצבה).</>
              )}
              {gameState.phase === 'attack' && (
                selectedAttackerId ? (
                  <>בחר טריטוריה עוינת סמוכה המודגשת באדום כדי לפתוח בקרב קוביות!</>
                ) : (
                  <>בחר טריטוריה שלך עם 2 חיילים ומעלה כדי לתקוף ממנה.</>
                )
              )}
              {gameState.phase === 'fortify' && (
                selectedFortifySourceId ? (
                  <>בחר טריטוריית יעד מחוברת בשליטתך להעברת צבאות.</>
                ) : (
                  <>באפשרותך לבחור טריטוריה אחת להעברת כוחות לטריטוריה מחוברת אחרת, או לדלג.</>
                )
              )}
            </span>
          </div>

          {hoveredTerritoryId && TERRITORY_MAP[hoveredTerritoryId] && (
            <div className="hidden sm:flex items-center gap-2 text-slate-400 font-mono text-[11px]">
              <span>{TERRITORY_MAP[hoveredTerritoryId].nameHebrew} ({CONTINENTS[TERRITORY_MAP[hoveredTerritoryId].continent].nameHebrew})</span>
              <span>•</span>
              <span style={{ color: getOwner(hoveredTerritoryId)?.color }}>
                {getOwner(hoveredTerritoryId)?.name}: {gameState.territories[hoveredTerritoryId]?.armies} חיילים
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Strategic Map and Info Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* World Map Container (3 columns on large screen) */}
        <div className="lg:col-span-3 rounded-3xl border border-slate-800 bg-slate-950/90 p-2 sm:p-4 relative shadow-2xl overflow-hidden">
          {/* Map background & visualization settings toolbar */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-xs text-slate-200">
            <button
              onClick={() => setShowMapSettings(!showMapSettings)}
              className="flex items-center gap-1.5 hover:text-amber-400 font-bold transition-colors cursor-pointer"
              title="התאם מפת רקע"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>מפת רקע</span>
            </button>

            {showMapSettings && (
              <div className="flex items-center gap-2.5 border-r border-slate-700 pr-2.5 mr-1 animate-in fade-in duration-150">
                <span className="text-[11px] text-slate-400 font-medium">בהירות מפה:</span>
                {[0.4, 0.75, 0.95].map((op) => (
                  <button
                    key={op}
                    onClick={() => setMapOpacity(op)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      mapOpacity === op 
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {Math.round(op * 100)}%
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SVG Map Canvas */}
          <div className="w-full aspect-[1000/580] relative rounded-2xl overflow-hidden border border-slate-800/80">
            <svg
              viewBox="0 0 1000 580"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}
            >
              {/* Defs & Filters */}
              <defs>
                <radialGradient id="vignetteGrad" cx="50%" cy="50%" r="65%">
                  <stop offset="60%" stopColor="#020617" stopOpacity="0" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0.75" />
                </radialGradient>
              </defs>

              {/* Deep Ocean Base */}
              <rect width="1000" height="580" fill="#0b1728" />

              {/* Calibrated Risk World Map Graphic Image */}
              <image
                href={mapBackground}
                x="0"
                y="0"
                width="1000"
                height="580"
                preserveAspectRatio="none"
                opacity={mapOpacity}
              />

              {/* Vignette Edge Shading for depth and board focus */}
              <rect width="1000" height="580" fill="url(#vignetteGrad)" pointerEvents="none" />

              {/* Bold Prominent Connection Lines */}
              <g id="prominent-connection-routes">{connectionLines}</g>

              {/* Continent Strategic Bonus Headers placed on geographic positions */}
              <g id="continent-headers" pointerEvents="none" opacity="0.9">
                {/* North America */}
                <rect x="115" y="24" width="145" height="22" rx="6" fill="#020617" fillOpacity="0.82" stroke="#3b82f6" strokeWidth="1.2" />
                <text x="187" y="39" fill="#93c5fd" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                  צפון אמריקה (+5) {getContinentRuler('north_america') ? `👑 ${getContinentRuler('north_america')?.name}` : ''}
                </text>

                {/* South America */}
                <rect x="235" y="322" width="135" height="22" rx="6" fill="#020617" fillOpacity="0.82" stroke="#eab308" strokeWidth="1.2" />
                <text x="302" y="337" fill="#fde047" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                  דרום אמריקה (+2) {getContinentRuler('south_america') ? `👑 ${getContinentRuler('south_america')?.name}` : ''}
                </text>

                {/* Europe */}
                <rect x="425" y="44" width="120" height="22" rx="6" fill="#020617" fillOpacity="0.82" stroke="#10b981" strokeWidth="1.2" />
                <text x="485" y="59" fill="#86efac" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                  אירופה (+5) {getContinentRuler('europe') ? `👑 ${getContinentRuler('europe')?.name}` : ''}
                </text>

                {/* Africa */}
                <rect x="425" y="465" width="120" height="22" rx="6" fill="#020617" fillOpacity="0.82" stroke="#f97316" strokeWidth="1.2" />
                <text x="485" y="480" fill="#fdba74" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                  אפריקה (+3) {getContinentRuler('africa') ? `👑 ${getContinentRuler('africa')?.name}` : ''}
                </text>

                {/* Asia */}
                <rect x="680" y="44" width="125" height="22" rx="6" fill="#020617" fillOpacity="0.82" stroke="#a855f7" strokeWidth="1.2" />
                <text x="742" y="59" fill="#d8b4fe" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                  אסיה (+7) {getContinentRuler('asia') ? `👑 ${getContinentRuler('asia')?.name}` : ''}
                </text>

                {/* Australia */}
                <rect x="805" y="540" width="130" height="22" rx="6" fill="#020617" fillOpacity="0.82" stroke="#ec4899" strokeWidth="1.2" />
                <text x="870" y="555" fill="#f9a8d4" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                  אוסטרליה (+2) {getContinentRuler('australia') ? `👑 ${getContinentRuler('australia')?.name}` : ''}
                </text>
              </g>

              {/* Territory Nodes */}
              {TERRITORIES.map(t => {
                const state = gameState.territories[t.id];
                const owner = getOwner(t.id);
                const isSelectedAttacker = selectedAttackerId === t.id;
                const isTarget = isValidAttackTarget(t.id);
                const isSelectedFortify = selectedFortifySourceId === t.id;
                const isFortifyTarget = isValidFortifyDestination(t.id);
                const isHovered = hoveredTerritoryId === t.id;

                const armies = state?.armies || 1;
                const ownerColor = owner?.color || '#64748b';

                return (
                  <g
                    key={t.id}
                    onClick={() => handleTerritoryClick(t.id)}
                    onMouseEnter={() => setHoveredTerritoryId(t.id)}
                    onMouseLeave={() => setHoveredTerritoryId(null)}
                    className="cursor-pointer transition-transform group"
                  >
                    {/* Pulsing Highlight ring if selected as attacker or target */}
                    {isSelectedAttacker && (
                      <circle
                        cx={t.x}
                        cy={t.y}
                        r="28"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3"
                        className="animate-ping opacity-75"
                      />
                    )}

                    {isTarget && (
                      <circle
                        cx={t.x}
                        cy={t.y}
                        r="26"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                        className="animate-spin"
                        style={{ transformOrigin: `${t.x}px ${t.y}px` }}
                      />
                    )}

                    {isSelectedFortify && (
                      <circle
                        cx={t.x}
                        cy={t.y}
                        r="26"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        className="animate-ping opacity-75"
                      />
                    )}

                    {isFortifyTarget && (
                      <circle
                        cx={t.x}
                        cy={t.y}
                        r="25"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Main Territory Node Circle */}
                    <circle
                      cx={t.x}
                      cy={t.y}
                      r={isHovered ? '21' : '19'}
                      fill={ownerColor}
                      stroke={
                        isSelectedAttacker 
                          ? '#ffffff' 
                          : isTarget 
                            ? '#f59e0b' 
                            : isSelectedFortify 
                              ? '#ffffff' 
                              : '#1e293b'
                      }
                      strokeWidth={isSelectedAttacker || isTarget || isSelectedFortify ? '3' : '2'}
                      className="transition-all duration-150"
                      style={{
                        filter: isHovered 
                          ? `drop-shadow(0 0 12px ${ownerColor})` 
                          : `drop-shadow(0 2px 5px rgba(0,0,0,0.6))`
                      }}
                    />

                    {/* Army Count Badge */}
                    <text
                      x={t.x}
                      y={t.y + 5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={armies >= 10 ? '12' : '14'}
                      fontWeight="900"
                      fontFamily="monospace"
                      pointerEvents="none"
                    >
                      {armies}
                    </text>

                    {/* Territory Name Label under node */}
                    <text
                      x={t.x}
                      y={t.y + 28}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="9"
                      fontWeight="700"
                      className="pointer-events-none drop-shadow"
                    >
                      {t.nameHebrew}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Tactical Side Panel (1 column on large screen) */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between shadow-xl space-y-4">
          {/* Tabs header */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('standings')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'standings' 
                  ? 'bg-slate-800 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              שחקנים
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'logs' 
                  ? 'bg-slate-800 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              יומן קרב
            </button>
            <button
              onClick={() => setActiveTab('continents')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'continents' 
                  ? 'bg-slate-800 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              יבשות
            </button>
          </div>

          {/* Tab 1: Players Standings */}
          {activeTab === 'standings' && (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
              <div className="text-xs font-bold text-slate-400">מצב הכוחות בקרב:</div>
              {gameState.players.map((p, idx) => {
                // Count territories and armies
                let playerTerritories = 0;
                let playerArmies = 0;

                for (const tId in gameState.territories) {
                  if (gameState.territories[tId].ownerId === p.id) {
                    playerTerritories++;
                    playerArmies += gameState.territories[tId].armies;
                  }
                }

                const isActive = gameState.activePlayerIndex === idx;

                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      p.eliminated
                        ? 'opacity-40 bg-slate-950 border-slate-900 line-through'
                        : isActive
                          ? 'bg-slate-800/90 border-amber-400/50 shadow-md ring-1 ring-amber-400/20'
                          : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {p.isAi && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300">AI</span>
                          )}
                        </span>
                      </div>

                      {p.eliminated ? (
                        <span className="text-[11px] text-red-400 font-bold">הודח</span>
                      ) : isActive ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          תור פעיל
                        </span>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/60 text-xs">
                      <div>
                        <span className="text-slate-500">טריטוריות:</span>{' '}
                        <span className="font-bold text-white font-mono">{playerTerritories}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">סך צבא:</span>{' '}
                        <span className="font-bold text-amber-400 font-mono">{playerArmies}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Activity / Battle Log */}
          {activeTab === 'logs' && (
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[460px] pr-1">
              <div className="text-xs font-bold text-slate-400">אירועים אחרונים:</div>
              {gameState.logs.map(log => (
                <div 
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1 text-right"
                >
                  <div className="text-slate-200">{log.text}</div>
                  <div className="text-[10px] text-slate-500 font-mono">תור {log.turn}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Continents Cheat Sheet */}
          {activeTab === 'continents' && (
            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[460px] pr-1">
              <div className="text-xs font-bold text-slate-400">בונוסי שליטה מלאה ביבשות:</div>
              {Object.values(CONTINENTS).map(c => {
                // Check who controls it
                const owners = new Set(c.territoryIds.map(tId => gameState.territories[tId]?.ownerId));
                const singleOwnerId = owners.size === 1 ? Array.from(owners)[0] : null;
                const ruler = singleOwnerId ? gameState.players.find(p => p.id === singleOwnerId) : null;

                return (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-right"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span>{c.nameHebrew}</span>
                      </span>
                      <span className="font-black text-amber-400 text-xs">+{c.bonus} חיילים</span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>{c.territoryIds.length} טריטוריות</span>
                      {ruler ? (
                        <span className="font-bold" style={{ color: ruler.color }}>
                          נשלטת ע״י {ruler.name}
                        </span>
                      ) : (
                        <span className="text-slate-500">שליטה מפוצלת</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
