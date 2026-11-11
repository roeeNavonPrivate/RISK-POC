import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Shield, 
  ShieldCheck, 
  ChevronLeft, 
  Info, 
  Bot, 
  Check, 
  Compass,
  AlertTriangle,
  MapPin,
  Flag,
  LogOut
} from 'lucide-react';
import { GameState, Player, TerritoryState } from '../types/risk';
import { 
  getTerritoriesForMap, 
  getContinentsForMap, 
  getTerritoryMapForMap,
  CONTINENTS, 
  ISRAEL_REGIONS 
} from '../data/riskMapData';
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
  onQuitGame?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayerId,
  onPlaceReinforcement,
  onInitiateAttack,
  onStartFortify,
  onNextPhase,
  onEndTurn,
  onAutoPlaceReinforcements,
  onQuitGame
}) => {
  const currentMapType = gameState.mapType || 'world';
  const currentTerritories = getTerritoriesForMap(currentMapType);
  const currentContinents = getContinentsForMap(currentMapType);
  const currentTerritoryMap = getTerritoryMapForMap(currentMapType);

  const activePlayer = gameState.players[gameState.activePlayerIndex];
  
  // Robust check: allow human action if it is human's turn
  const isHumanActive = !activePlayer?.isAi;
  const isMyTurn = isHumanActive && (
    activePlayer?.id === currentPlayerId ||
    gameState.players.filter(p => !p.isAi).length <= 1 ||
    !currentPlayerId
  );

  // Quit modal confirmation state
  const [showQuitModal, setShowQuitModal] = useState(false);

  // Selected territories for interaction
  const [selectedAttackerId, setSelectedAttackerId] = useState<string | null>(null);
  const [selectedFortifySourceId, setSelectedFortifySourceId] = useState<string | null>(null);
  const [hoveredTerritoryId, setHoveredTerritoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'standings' | 'logs' | 'continents'>('standings');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Map background visual customization
  const [mapOpacity, setMapOpacity] = useState<number>(0.9);
  const [showMapSettings, setShowMapSettings] = useState<boolean>(false);

  // Check continent / district control for zone highlights
  const getContinentRuler = (continentId: string): Player | null => {
    const continent = currentContinents[continentId];
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
    setFeedbackMessage('');
  }, [gameState.phase, gameState.activePlayerIndex]);

  // Handle Territory Click based on current phase
  const handleTerritoryClick = (tId: string) => {
    if (!isMyTurn) {
      setFeedbackMessage('המתן לתורך! כעת תורו של ' + activePlayer.name);
      setTimeout(() => setFeedbackMessage(''), 2500);
      return;
    }

    const territoryState = gameState.territories[tId];
    if (!territoryState) return;

    const isOwned = territoryState.ownerId === activePlayer.id;

    // Phase 1: REINFORCEMENT (Backup Phase)
    if (gameState.phase === 'reinforcement') {
      if (isOwned && gameState.reinforcementsRemaining > 0) {
        sound.playPlaceTroop();
        onPlaceReinforcement(tId, 1);
        setFeedbackMessage('');
      } else if (!isOwned) {
        setFeedbackMessage('זוהי טריטוריה של האויב! הצב תגבורות רק בטריטוריות שלך (המסומנות ב-+).');
        setTimeout(() => setFeedbackMessage(''), 3000);
      }
      return;
    }

    // Phase 2: ATTACK
    if (gameState.phase === 'attack') {
      if (isOwned) {
        if (territoryState.armies >= 2) {
          if (selectedAttackerId === tId) {
            setSelectedAttackerId(null);
          } else {
            setSelectedAttackerId(tId);
            sound.playPlaceTroop();
            setFeedbackMessage('בחר טריטוריה שכנה של היריב לתקיפה');
          }
        } else {
          setFeedbackMessage('דרושים לפחות 2 חיילים בטריטוריה כדי לצאת להתקפה (1 חייב להישאר להגן).');
          setTimeout(() => setFeedbackMessage(''), 3000);
        }
      } else {
        if (selectedAttackerId) {
          const attackerDef = currentTerritoryMap[selectedAttackerId];
          if (attackerDef && attackerDef.adjacentIds.includes(tId)) {
            onInitiateAttack(selectedAttackerId, tId);
            setSelectedAttackerId(null);
            setFeedbackMessage('');
          } else {
            setFeedbackMessage('ניתן לתקוף רק טריטוריות שכנות המחוברות בקשר ישיר!');
            setTimeout(() => setFeedbackMessage(''), 2500);
          }
        }
      }
      return;
    }

    // Phase 3: FORTIFY
    if (gameState.phase === 'fortify') {
      if (isOwned) {
        if (!selectedFortifySourceId) {
          if (territoryState.armies > 1) {
            setSelectedFortifySourceId(tId);
            sound.playPlaceTroop();
            setFeedbackMessage('בחר טריטוריה יעד להעברת החיילים');
          } else {
            setFeedbackMessage('חייב להישאר לפחות חייל 1 בכל טריטוריה. בחר טריטוריה עם יותר מחייל 1.');
            setTimeout(() => setFeedbackMessage(''), 3000);
          }
        } else {
          if (tId === selectedFortifySourceId) {
            setSelectedFortifySourceId(null);
            setFeedbackMessage('');
          } else {
            const connected = isPathConnected(
              selectedFortifySourceId,
              tId,
              activePlayer.id,
              gameState.territories,
              currentMapType
            );
            if (connected) {
              onStartFortify(selectedFortifySourceId, tId);
              setSelectedFortifySourceId(null);
              setFeedbackMessage('');
            } else {
              setFeedbackMessage('אין רצף טריטוריות ידידותיות מחוברות בין שני היעדים.');
              setTimeout(() => setFeedbackMessage(''), 3000);
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
    const attackerDef = currentTerritoryMap[selectedAttackerId];
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
      gameState.territories,
      currentMapType
    );
  };

  // Trans-oceanic sea routes (for World Map)
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

  // Render SVG connection lines between adjacent territories
  const renderedConnections = new Set<string>();
  const connectionLines: React.ReactNode[] = [];

  currentTerritories.forEach(t1 => {
    t1.adjacentIds.forEach(adjId => {
      const t2 = currentTerritoryMap[adjId];
      if (!t2) return;

      const key = [t1.id, t2.id].sort().join('--');
      if (renderedConnections.has(key)) return;
      renderedConnections.add(key);

      const isSea = currentMapType === 'world' && SEA_ROUTES.has(key);
      const isWraparound = currentMapType === 'world' && (
        (t1.id === 'alaska' && t2.id === 'kamchatka') ||
        (t1.id === 'kamchatka' && t2.id === 'alaska')
      );

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
        const alaskaPt = t1.id === 'alaska' ? t1 : t2;
        const kamchatkaPt = t1.id === 'kamchatka' ? t1 : t2;

        connectionLines.push(
          <g key="wraparound-routes" pointerEvents="none">
            <path d={`M ${alaskaPt.x} ${alaskaPt.y} L 0 110`} stroke="#162338" strokeWidth="5" strokeLinecap="round" />
            <path
              d={`M ${alaskaPt.x} ${alaskaPt.y} L 0 110`}
              stroke={isAttackerTarget ? '#dc2626' : isHovered ? '#d97706' : '#2563eb'}
              strokeWidth={isAttackerTarget ? 4 : 2.5}
              strokeDasharray="6 3"
            />
            <path d={`M ${kamchatkaPt.x} ${kamchatkaPt.y} L 1000 110`} stroke="#162338" strokeWidth="5" strokeLinecap="round" />
            <path
              d={`M ${kamchatkaPt.x} ${kamchatkaPt.y} L 1000 110`}
              stroke={isAttackerTarget ? '#dc2626' : isHovered ? '#d97706' : '#2563eb'}
              strokeWidth={isAttackerTarget ? 4 : 2.5}
              strokeDasharray="6 3"
            />
          </g>
        );
      } else {
        const strokeColor = isAttackerTarget 
          ? '#dc2626' // Red
          : isFortifyRoute 
            ? '#2563eb' // Blue
            : isHovered 
              ? '#d97706' // Gold
              : isSea 
                ? '#3b82f6' 
                : '#94a3b8';

        const strokeWidth = isAttackerTarget || isFortifyRoute 
          ? 3.8 
          : isHovered 
            ? 3.2 
            : 2.2;

        const dashArray = isAttackerTarget 
          ? '6 3' 
          : isSea 
            ? '6 4' 
            : undefined;

        connectionLines.push(
          <g key={key} pointerEvents="none">
            {/* Underlay shadow */}
            <line
              x1={t1.x}
              y1={t1.y}
              x2={t2.x}
              y2={t2.y}
              stroke="#0f1929"
              strokeWidth={strokeWidth + 2.5}
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Main connection line */}
            <line
              x1={t1.x}
              y1={t1.y}
              x2={t2.x}
              y2={t2.y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeLinecap="round"
              opacity={isAttackerTarget || isFortifyRoute || isHovered ? 1 : 0.75}
            />
          </g>
        );
      }
    });
  });

  return (
    <div className="w-full max-w-[1500px] mx-auto px-2 sm:px-4 py-4 space-y-4">
      {/* Top Strategic Phase & Turn Bar (Primary Red & Blue Theme) */}
      <div className="rounded-2xl border border-[#273d61] bg-[#17253d] p-3 sm:p-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Active Player Indicator */}
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-base shadow-md border-2 border-white/50"
              style={{ backgroundColor: activePlayer?.color }}
            >
              {activePlayer?.isAi ? <Bot className="w-6 h-6" /> : activePlayer?.name.slice(0, 2)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold">תור {gameState.turn}</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-bold" style={{ color: activePlayer?.color }}>
                  {isMyTurn ? 'התור שלך עכשיו!' : `תור של ${activePlayer?.name}`}
                </span>
                {activePlayer?.isAi && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 font-bold border border-blue-700/40">
                    AI חושב
                  </span>
                )}
                <span className="text-slate-500">•</span>
                <span className="text-[11px] text-amber-300 font-bold">
                  {currentMapType === 'israel' ? '🇮🇱 מפת ישראל' : '🌍 מפת העולם'}
                </span>
              </div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>{activePlayer?.name}</span>
                {isMyTurn && (
                  <span className="text-xs px-2.5 py-0.5 rounded bg-[#2563eb] text-white font-bold">
                    אתה משחק
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Phase Steps Indicator (Primary Red & Blue) */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#121c2e] p-1.5 rounded-xl border border-[#223552] self-center">
            {/* Step 1: Reinforcement */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gameState.phase === 'reinforcement'
                ? 'bg-[#2563eb] text-white font-black shadow-md'
                : 'text-slate-400'
            }`}>
              <Shield className="w-3.5 h-3.5" />
              <span>1. תגבורות</span>
              {gameState.phase === 'reinforcement' && (
                <span className="px-1.5 py-0.5 rounded bg-white text-blue-900 font-mono text-xs font-black">
                  {gameState.reinforcementsRemaining}
                </span>
              )}
            </div>

            <ChevronLeft className="w-3.5 h-3.5 text-slate-500 shrink-0" />

            {/* Step 2: Attack */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gameState.phase === 'attack'
                ? 'bg-[#dc2626] text-white font-black shadow-md'
                : 'text-slate-400'
            }`}>
              <Swords className="w-3.5 h-3.5" />
              <span>2. התקפה</span>
            </div>

            <ChevronLeft className="w-3.5 h-3.5 text-slate-500 shrink-0" />

            {/* Step 3: Fortify */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gameState.phase === 'fortify'
                ? 'bg-[#1e40af] text-white font-black shadow-md'
                : 'text-slate-400'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3. ביצור</span>
            </div>
          </div>

          {/* Contextual Action Buttons & Quit Button */}
          <div className="flex items-center gap-2">
            {isMyTurn && (
              <>
                {gameState.phase === 'reinforcement' && (
                  <button
                    onClick={onAutoPlaceReinforcements}
                    className="px-3.5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold transition-all shadow cursor-pointer"
                  >
                    חלק תגבורת אוטומטית לגבולות
                  </button>
                )}

                {gameState.phase === 'attack' && (
                  <button
                    onClick={onNextPhase}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>סיים התקפות ועבור לביצור</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {gameState.phase === 'fortify' && (
                  <button
                    onClick={onEndTurn}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>{gameState.fortifyDoneInTurn ? 'סיים תור' : 'דלג על ביצור וסיים תור'}</span>
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            {/* Quit Game Button */}
            {onQuitGame && (
              <button
                onClick={() => setShowQuitModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#142137] hover:bg-red-950/60 border border-[#273d61] hover:border-red-600/70 text-slate-300 hover:text-red-200 text-xs font-bold transition-all cursor-pointer shadow"
                title="פרישה מהמערכה וחזרה לראשי"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">פרוש</span>
              </button>
            )}
          </div>
        </div>

        {/* Phase Contextual Hint Banner & Feedback Alerts */}
        <div className="mt-2.5 pt-2 border-t border-[#233550] flex flex-wrap items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              {gameState.phase === 'reinforcement' && (
                <>
                  <strong className="text-white">שלב תגבורת (נותרו {gameState.reinforcementsRemaining} חיילים): </strong>
                  לחץ ישירות על כל טריטוריה בשליטתך (המסומנת ב-+) להצבת חייל, או לחץ ״חלק אוטומטית לגבולות״.
                </>
              )}
              {gameState.phase === 'attack' && (
                <>
                  <strong className="text-white">שלב התקפה: </strong>
                  לחץ על טריטוריה שלך עם 2+ חיילים, ולאחר מכן לחץ על טריטוריה מחוברת של היריב לתקיפה.
                </>
              )}
              {gameState.phase === 'fortify' && (
                <>
                  <strong className="text-white">שלב ביצור: </strong>
                  בחר טריטוריה להעברת כוחות, ולאחר מכן בחר טריטוריה ידידותית מחוברת.
                </>
              )}
            </span>
          </div>

          {feedbackMessage && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#dc2626]/20 border border-[#dc2626]/40 text-red-200 text-xs font-bold animate-in fade-in">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>{feedbackMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Strategic Map and Info Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* World / Israel Map Canvas (3 columns) */}
        <div className="lg:col-span-3 rounded-2xl border border-[#273d61] bg-[#121c2e] p-2 sm:p-4 relative shadow-2xl overflow-hidden">
          {/* SVG Map Canvas */}
          <div className="w-full aspect-[1000/580] relative rounded-xl overflow-hidden border border-[#21334f]">
            <svg
              viewBox="0 0 1000 580"
              className="w-full h-full select-none"
            >
              {/* Deep Naval Base Ocean */}
              <rect width="1000" height="580" fill="#142238" />

              {/* WORLD MAP BACKGROUND GRAPHIC */}
              {currentMapType === 'world' && (
                <image
                  href={mapBackground}
                  x="0"
                  y="0"
                  width="1000"
                  height="580"
                  preserveAspectRatio="none"
                  opacity={mapOpacity}
                />
              )}

              {/* ISRAEL MAP DETAILED CARTOGRAPHY VECTOR */}
              {currentMapType === 'israel' && (
                <g id="israel-cartography">
                  {/* Mediterranean Sea Base on West */}
                  <rect x="0" y="0" width="370" height="580" fill="#102540" />
                  <path
                    d={`
                      M 0 0 L 520 0 
                      L 520 90 
                      C 500 120, 480 150, 470 170
                      C 450 190, 440 220, 420 250
                      C 400 280, 380 320, 350 360
                      C 320 400, 300 450, 350 580
                      L 0 580 Z
                    `}
                    fill="#152b47"
                  />
                  <text x="180" y="270" fill="#2d4f7c" fontSize="22" fontWeight="bold" fontFamily="Cinzel" textAnchor="middle" opacity="0.6">
                    MEDITERRANEAN SEA · הים התיכון
                  </text>

                  {/* Sea of Galilee (Kinneret) */}
                  <ellipse cx="680" cy="125" rx="20" ry="26" fill="#1d3d66" stroke="#3b82f6" strokeWidth="1.5" />
                  <text x="680" y="129" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">כנרת</text>

                  {/* Dead Sea (Yam HaMelach) */}
                  <path
                    d="M 685 285 C 695 305, 695 350, 680 375 C 670 350, 670 305, 685 285 Z"
                    fill="#173153"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />
                  <text x="685" y="335" fill="#bae6fd" fontSize="9" fontWeight="bold" textAnchor="middle">ים המלח</text>

                  {/* Red Sea / Gulf of Eilat */}
                  <polygon points="530,550 580,550 570,580 540,580" fill="#1d3d66" stroke="#3b82f6" strokeWidth="1" />
                  <text x="555" y="570" fill="#93c5fd" fontSize="8" fontWeight="bold" textAnchor="middle">ים סוף</text>

                  {/* Topographic Landmass contour for Israel */}
                  <path
                    d={`
                      M 520 20
                      L 740 30
                      L 750 120
                      L 720 180
                      L 700 260
                      L 710 380
                      L 660 420
                      L 580 560
                      L 520 560
                      L 440 450
                      L 360 360
                      C 400 300, 440 240, 460 190
                      C 480 160, 500 120, 520 20 Z
                    `}
                    fill="#1e3250"
                    stroke="#334e77"
                    strokeWidth="2"
                    opacity="0.85"
                  />

                  {/* Geographic Ridge labels */}
                  <text x="600" y="495" fill="#3b5985" fontSize="16" fontWeight="bold" textAnchor="middle" opacity="0.45" letterSpacing="4">
                    הר הנגב והמכתשים
                  </text>
                  <text x="630" y="195" fill="#3b5985" fontSize="13" fontWeight="bold" textAnchor="middle" opacity="0.45">
                    עמק יזרעאל והגליל
                  </text>
                </g>
              )}

              {/* Bold Prominent Connection Lines */}
              <g id="prominent-connection-routes">{connectionLines}</g>

              {/* Strategic Zone / Continent Headers */}
              <g id="continent-headers" pointerEvents="none" opacity="0.95">
                {currentMapType === 'israel' ? (
                  <>
                    <rect x="580" y="25" width="160" height="22" rx="4" fill="#172740" stroke="#2563eb" strokeWidth="1.2" />
                    <text x="660" y="40" fill="#93c5fd" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                      מחוז הצפון והגולן (+4)
                    </text>

                    <rect x="360" y="180" width="150" height="22" rx="4" fill="#172740" stroke="#dc2626" strokeWidth="1.2" />
                    <text x="435" y="195" fill="#fca5a5" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                      מחוז המרכז והשרון (+3)
                    </text>

                    <rect x="640" y="245" width="155" height="22" rx="4" fill="#172740" stroke="#d97706" strokeWidth="1.2" />
                    <text x="717" y="260" fill="#fde68a" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                      מחוז ירושלים ויהודה (+3)
                    </text>

                    <rect x="360" y="470" width="150" height="22" rx="4" fill="#172740" stroke="#16a34a" strokeWidth="1.2" />
                    <text x="435" y="485" fill="#86efac" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                      מחוז הדרום והנגב (+4)
                    </text>
                  </>
                ) : (
                  <>
                    <rect x="115" y="24" width="145" height="22" rx="4" fill="#172740" stroke="#2563eb" strokeWidth="1.2" />
                    <text x="187" y="39" fill="#93c5fd" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                      צפון אמריקה (+5)
                    </text>

                    <rect x="235" y="322" width="135" height="22" rx="4" fill="#172740" stroke="#dc2626" strokeWidth="1.2" />
                    <text x="302" y="337" fill="#fca5a5" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                      דרום אמריקה (+2)
                    </text>

                    <rect x="425" y="44" width="120" height="22" rx="4" fill="#172740" stroke="#16a34a" strokeWidth="1.2" />
                    <text x="485" y="59" fill="#86efac" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                      אירופה (+5)
                    </text>

                    <rect x="425" y="465" width="120" height="22" rx="4" fill="#172740" stroke="#ea580c" strokeWidth="1.2" />
                    <text x="485" y="480" fill="#fdba74" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                      אפריקה (+3)
                    </text>

                    <rect x="680" y="44" width="125" height="22" rx="4" fill="#172740" stroke="#9333ea" strokeWidth="1.2" />
                    <text x="742" y="59" fill="#d8b4fe" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                      אסיה (+7)
                    </text>

                    <rect x="805" y="540" width="130" height="22" rx="4" fill="#172740" stroke="#db2777" strokeWidth="1.2" />
                    <text x="870" y="555" fill="#f9a8d4" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                      אוסטרליה (+2)
                    </text>
                  </>
                )}
              </g>

              {/* Territory Nodes with Flags & Clear Interactive Targets */}
              {currentTerritories.map(t => {
                const state = gameState.territories[t.id];
                const owner = getOwner(t.id);
                const isSelectedAttacker = selectedAttackerId === t.id;
                const isTarget = isValidAttackTarget(t.id);
                const isSelectedFortify = selectedFortifySourceId === t.id;
                const isFortifyTarget = isValidFortifyDestination(t.id);
                const isHovered = hoveredTerritoryId === t.id;
                const isOwned = owner?.id === activePlayer?.id;
                const isReinforceTarget = isMyTurn && gameState.phase === 'reinforcement' && isOwned && gameState.reinforcementsRemaining > 0;

                const armies = state?.armies || 1;
                const ownerColor = owner?.color || '#3b82f6';

                return (
                  <g
                    key={t.id}
                    onClick={() => handleTerritoryClick(t.id)}
                    onMouseEnter={() => setHoveredTerritoryId(t.id)}
                    onMouseLeave={() => setHoveredTerritoryId(null)}
                    className="cursor-pointer transition-transform group"
                  >
                    {/* HUGE INVISIBLE HIT TARGET SO CLICKS NEVER MISS */}
                    <circle
                      cx={t.x}
                      cy={t.y}
                      r="40"
                      fill="#ffffff"
                      opacity="0.001"
                      style={{ pointerEvents: 'all', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTerritoryClick(t.id);
                      }}
                    />

                    {/* REINFORCEMENT HIGHLIGHT: Clear pulsing indicator on all owned territories */}
                    {isReinforceTarget && (
                      <g pointerEvents="none">
                        <circle
                          cx={t.x}
                          cy={t.y}
                          r="28"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="2.5"
                          strokeDasharray="4 2"
                        />
                        {/* Plus badge on top right */}
                        <circle cx={t.x + 14} cy={t.y - 14} r="9" fill="#16a34a" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={t.x + 14} y={t.y - 10} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">+</text>
                      </g>
                    )}

                    {/* Attacker selected ring */}
                    {isSelectedAttacker && (
                      <circle
                        cx={t.x}
                        cy={t.y}
                        r="28"
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="3.5"
                      />
                    )}

                    {/* Attack target ring */}
                    {isTarget && (
                      <circle
                        cx={t.x}
                        cy={t.y}
                        r="26"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                      />
                    )}

                    {/* Fortify selected / destination rings */}
                    {isSelectedFortify && (
                      <circle cx={t.x} cy={t.y} r="26" fill="none" stroke="#2563eb" strokeWidth="3" />
                    )}
                    {isFortifyTarget && (
                      <circle cx={t.x} cy={t.y} r="25" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="3 3" />
                    )}

                    {/* Main Territory Node Circle */}
                    <circle
                      cx={t.x}
                      cy={t.y}
                      r={isHovered ? '22' : '20'}
                      fill={ownerColor}
                      stroke={
                        isSelectedAttacker || isSelectedFortify
                          ? '#ffffff'
                          : isTarget
                            ? '#f59e0b'
                            : isReinforceTarget
                              ? '#22c55e'
                              : '#1e293b'
                      }
                      strokeWidth={isSelectedAttacker || isTarget || isSelectedFortify || isReinforceTarget ? '3.5' : '2'}
                      style={{ pointerEvents: 'all', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTerritoryClick(t.id);
                      }}
                      className="transition-all duration-150"
                    />

                    {/* Army Count */}
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

                    {/* Flag & Name Label under node */}
                    <g
                      style={{ cursor: 'pointer', pointerEvents: 'all' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTerritoryClick(t.id);
                      }}
                    >
                      <rect
                        x={t.x - 48}
                        y={t.y + 24}
                        width="96"
                        height="18"
                        rx="3"
                        fill="#121c2e"
                        stroke={isReinforceTarget ? '#22c55e' : '#273d61'}
                        strokeWidth={isReinforceTarget ? '1.5' : '1'}
                        opacity="0.95"
                      />
                      <text
                        x={t.x}
                        y={t.y + 36}
                        textAnchor="middle"
                        fill={isReinforceTarget ? '#86efac' : '#f1f5f9'}
                        fontSize="8.5"
                        fontWeight="700"
                        style={{ pointerEvents: 'none' }}
                      >
                        {t.flag ? `${t.flag} ` : ''}{t.nameHebrew.split(' ')[0]}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Tactical Side Panel (Standings, Logs, Bonuses) */}
        <div className="rounded-2xl border border-[#273d61] bg-[#17253d] p-4 flex flex-col justify-between shadow-xl space-y-4">
          <div className="space-y-3">
            {/* Quick Reinforcement Panel (shown when it's your turn in reinforcement phase) */}
            {isMyTurn && gameState.phase === 'reinforcement' && (
              <div className="p-3 rounded-xl bg-[#1e3456] border border-[#3b82f6] space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-black text-white">פריסת תגבורות צבא</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#2563eb] text-white font-mono font-black text-xs">
                    נותרו {gameState.reinforcementsRemaining}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onAutoPlaceReinforcements}
                  className="w-full py-2 px-3 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold transition-all shadow cursor-pointer text-center"
                >
                  ⚡ פריסה מהירה שווה בכל הגבולות
                </button>

                <div className="text-[11px] text-slate-300 font-bold border-t border-[#294672] pt-1.5">
                  או לחץ +1 על טריטוריה שלך:
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-0.5">
                  {currentTerritories
                    .filter(t => gameState.territories[t.id]?.ownerId === activePlayer?.id)
                    .map(t => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-[#15233a] border border-[#273e63] hover:border-sky-400 text-xs"
                      >
                        <span className="font-bold text-white truncate max-w-[120px]">
                          {t.flag ? `${t.flag} ` : ''}{t.nameHebrew}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400 text-[11px]">
                            {gameState.territories[t.id]?.armies || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTerritoryClick(t.id)}
                            className="px-2 py-0.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-[11px] cursor-pointer"
                          >
                            +1 חייל
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex rounded-xl bg-[#121c2e] p-1 border border-[#223552]">
              <button
                onClick={() => setActiveTab('standings')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'standings' ? 'bg-[#2563eb] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                מצב כוחות
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'logs' ? 'bg-[#2563eb] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                יומן קרב
              </button>
              <button
                onClick={() => setActiveTab('continents')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'continents' ? 'bg-[#2563eb] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                בונוסים
              </button>
            </div>

            {/* Tab 1: Standings */}
            {activeTab === 'standings' && (
              <div className="space-y-2 max-h-[380px] overflow-y-auto">
                {gameState.players.map(p => {
                  let territoryCount = 0;
                  let armyCount = 0;
                  Object.values(gameState.territories).forEach(t => {
                    if (t.ownerId === p.id) {
                      territoryCount++;
                      armyCount += t.armies;
                    }
                  });

                  const isActive = p.id === activePlayer.id;

                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'border-[#2563eb] bg-[#1d304f]'
                          : p.eliminated
                            ? 'border-transparent bg-[#141e30] opacity-50'
                            : 'border-[#243754] bg-[#142033]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/40"
                            style={{ backgroundColor: p.color }}
                          />
                          <span className="font-bold text-xs text-white">
                            {p.name} {p.id === currentPlayerId ? '(אתה)' : ''}
                          </span>
                        </div>
                        {p.eliminated ? (
                          <span className="text-[10px] text-red-400 font-bold">הודח</span>
                        ) : (
                          isActive && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2563eb] text-white">
                              תור פעיל
                            </span>
                          )
                        )}
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div>
                          <span className="text-slate-400">טריטוריות:</span> <strong>{territoryCount}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">חיילים:</span> <strong>{armyCount}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Logs */}
            {activeTab === 'logs' && (
              <div className="space-y-2 max-h-[380px] overflow-y-auto text-xs">
                {gameState.logs.map(log => (
                  <div key={log.id} className="p-2 rounded-lg bg-[#142033] border border-[#233550] space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>תור {log.turn}</span>
                      <span style={{ color: log.playerColor }}>{log.playerName}</span>
                    </div>
                    <div className="text-slate-200">{log.text}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Continents / District Bonuses */}
            {activeTab === 'continents' && (
              <div className="space-y-2 max-h-[380px] overflow-y-auto text-xs">
                {Object.values(currentContinents).map(c => {
                  const ruler = getContinentRuler(c.id);
                  return (
                    <div key={c.id} className="p-2.5 rounded-lg bg-[#142033] border border-[#233550] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{c.nameHebrew}</span>
                        <span className="font-bold text-amber-400">+{c.bonus} חיילים</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {ruler ? (
                          <span className="text-emerald-400">בשליטה מלאה של {ruler.name}</span>
                        ) : (
                          <span>מחלוקת בין מספר שחקנים</span>
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

      {/* Quit Game Confirmation Modal */}
      {showQuitModal && onQuitGame && (
        <div className="fixed inset-0 z-50 bg-[#0a101a]/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#15233a] border border-[#273e63] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-right animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-[#213554] pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-700/60 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-cinzel">פרישה מהמערכה</h3>
                <p className="text-xs text-slate-400">אישור עזיבת המשחק</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              האם אתה בטוח שברצונך לפרוש מהקרב? המשחק הנוכחי ייפסק ותוחזר לחדר הפיקוד הראשי.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowQuitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#142137] hover:bg-[#1a2b44] text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                המשך במשחק
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuitModal(false);
                  onQuitGame();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black text-xs shadow-md transition-all cursor-pointer"
              >
                פרוש וחזור לראשי
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
