import React from 'react';
import { CONTINENTS } from '../data/riskMapData';
import { Player } from '../types/risk';

interface WorldMapVectorProps {
  getContinentRuler: (continentId: string) => Player | null;
  showContinentZones: boolean;
  mapOpacity: number;
}

export const WorldMapVector: React.FC<WorldMapVectorProps> = ({
  getContinentRuler,
  showContinentZones,
  mapOpacity,
}) => {
  return (
    <g className="world-map-vector" opacity={mapOpacity}>
      {/* Background Deep Ocean Tint */}
      <rect x="0" y="0" width="1000" height="580" fill="#080d1a" />

      {/* Cartographic Coordinate Graticule Grid */}
      <g stroke="#1e293b" strokeWidth="1" strokeDasharray="3 5" opacity="0.6" pointerEvents="none">
        {/* Latitudes */}
        <line x1="0" y1="90" x2="1000" y2="90" />
        <line x1="0" y1="180" x2="1000" y2="180" />
        <line x1="0" y1="280" x2="1000" y2="280" />
        <line x1="0" y1="380" x2="1000" y2="380" />
        <line x1="0" y1="480" x2="1000" y2="480" />
        {/* Longitudes */}
        <line x1="180" y1="0" x2="180" y2="580" />
        <line x1="360" y1="0" x2="360" y2="580" />
        <line x1="540" y1="0" x2="540" y2="580" />
        <line x1="720" y1="0" x2="720" y2="580" />
        <line x1="900" y1="0" x2="900" y2="580" />
      </g>

      {/* Cartographic Equator Line */}
      <line x1="0" y1="360" x2="1000" y2="360" stroke="#334155" strokeWidth="1.2" strokeDasharray="6 6" opacity="0.7" />
      <text x="15" y="355" fill="#475569" fontSize="8" fontFamily="monospace" fontWeight="bold">0° EQUATOR</text>
      <text x="15" y="85" fill="#475569" fontSize="8" fontFamily="monospace" fontWeight="bold">60° N</text>
      <text x="15" y="475" fill="#475569" fontSize="8" fontFamily="monospace" fontWeight="bold">40° S</text>

      {/* ======================================================== */}
      {/* 1. NORTH AMERICA (Accurate boundaries around nodes)      */}
      {/* Alaska (80,110), NW (165,100), Alberta (155,165),       */}
      {/* Ontario (225,175), Quebec (295,175), W.US (160,245),     */}
      {/* E.US (240,255), Central America (170,330)                */}
      {/* ======================================================== */}
      <g id="continent-north-america">
        {/* Continental Shelf Glow */}
        <path
          d={`
            M 35 110
            C 40 70, 110 50, 175 55
            C 230 55, 275 90, 315 130
            C 340 160, 330 200, 290 230
            C 275 255, 275 285, 250 300
            C 210 325, 190 355, 170 365
            C 145 350, 135 320, 130 280
            C 120 250, 105 200, 75 160
            C 45 140, 25 125, 35 110 Z
          `}
          fill="#172e4d"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Alaska Peninsula & Islands */}
        <path
          d="M 65 110 C 45 105, 20 115, 15 130 C 25 135, 55 125, 75 125 Z"
          fill="#1d3b63"
          stroke="#60a5fa"
          strokeWidth="1.5"
        />

        {/* Greenland Island (345, 75) */}
        <path
          d={`
            M 310 45
            C 335 30, 375 35, 385 65
            C 390 95, 365 125, 340 120
            C 320 110, 305 80, 310 45 Z
          `}
          fill="#22426d"
          stroke="#60a5fa"
          strokeWidth="2"
        />

        {/* Canadian Hudson Bay cut */}
        <ellipse cx="235" cy="120" rx="22" ry="16" fill="#080d1a" opacity="0.9" />
      </g>

      {/* ======================================================== */}
      {/* 2. SOUTH AMERICA                                         */}
      {/* Venezuela (250,385), Peru (245,465), Brazil (325,440),   */}
      {/* Argentina (265,540)                                      */}
      {/* ======================================================== */}
      <g id="continent-south-america">
        <path
          d={`
            M 205 375
            C 230 350, 285 345, 325 365
            C 365 390, 385 425, 380 470
            C 365 515, 330 550, 295 575
            C 270 585, 250 580, 245 550
            C 235 500, 220 460, 205 415
            Z
          `}
          fill="#3b2d10"
          stroke="#eab308"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Cape Horn / Tierra del Fuego */}
        <circle cx="265" cy="578" r="6" fill="#3b2d10" stroke="#eab308" strokeWidth="1.2" />
        {/* Falkland Islands */}
        <circle cx="310" cy="565" r="3.5" fill="#3b2d10" stroke="#eab308" strokeWidth="1" />
      </g>

      {/* ======================================================== */}
      {/* 3. EUROPE                                                */}
      {/* Iceland (420,135), GB (410,215), Scandinavia (505,135),   */}
      {/* N.Europe (490,210), W.Europe (430,280), S.Europe(505,275) */}
      {/* Ukraine (585,180)                                        */}
      {/* ======================================================== */}
      <g id="continent-europe">
        {/* Mainland Europe & Ukraine */}
        <path
          d={`
            M 425 210
            C 445 180, 480 165, 520 170
            C 555 155, 600 145, 635 155
            C 645 190, 630 235, 605 265
            C 575 285, 545 295, 520 305
            C 490 310, 460 300, 435 295
            C 405 295, 400 265, 415 240
            C 405 225, 415 215, 425 210 Z
          `}
          fill="#143525"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Scandinavia Peninsula (505, 135) */}
        <path
          d={`
            M 470 160
            C 475 125, 490 90, 525 80
            C 550 90, 555 125, 535 160
            C 515 175, 485 175, 470 160 Z
          `}
          fill="#143525"
          stroke="#10b981"
          strokeWidth="2"
        />

        {/* British Isles (410, 215) */}
        <path
          d="M 390 185 C 410 175, 430 190, 425 230 C 410 245, 395 230, 390 185 Z"
          fill="#1a4530"
          stroke="#34d399"
          strokeWidth="1.8"
        />
        {/* Ireland */}
        <path
          d="M 370 195 C 385 190, 390 210, 380 220 C 370 215, 365 205, 370 195 Z"
          fill="#1a4530"
          stroke="#34d399"
          strokeWidth="1.4"
        />

        {/* Iceland Island (420, 135) */}
        <path
          d="M 400 115 C 425 105, 445 115, 440 145 C 420 155, 395 145, 400 115 Z"
          fill="#1a4530"
          stroke="#34d399"
          strokeWidth="2"
        />

        {/* Italy Boot (505, 275) */}
        <path
          d="M 485 270 C 495 285, 515 305, 525 320 C 510 325, 490 300, 485 270 Z"
          fill="#143525"
          stroke="#10b981"
          strokeWidth="1.6"
        />
      </g>

      {/* ======================================================== */}
      {/* 4. AFRICA                                                */}
      {/* N.Africa (450,375), Egypt (530,360), East Africa(580,430) */}
      {/* Congo (530,465), S.Africa (540,540), Madagascar (635,530)*/}
      {/* ======================================================== */}
      <g id="continent-africa">
        <path
          d={`
            M 395 350
            C 435 330, 500 320, 565 330
            C 585 350, 625 390, 635 430
            C 625 465, 605 505, 585 540
            C 565 570, 535 580, 515 575
            C 495 550, 485 510, 475 465
            C 460 435, 425 425, 405 395
            C 390 375, 385 355, 395 350 Z
          `}
          fill="#3b210c"
          stroke="#f97316"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Madagascar Island (635, 530) */}
        <path
          d="M 620 490 C 635 480, 650 500, 645 550 C 630 565, 615 540, 620 490 Z"
          fill="#3b210c"
          stroke="#fb923c"
          strokeWidth="2"
        />
      </g>

      {/* ======================================================== */}
      {/* 5. ASIA                                                  */}
      {/* Ural (660,160), Siberia (725,130), Yakutsk (815,105),    */}
      {/* Kamchatka (900,110), Irkutsk (795,185), Afghan (660,245) */}
      {/* China (775,275), Mongolia (800,220), Japan (910,240),    */}
      {/* Middle East (610,320), India (730,335), Siam (810,365)   */}
      {/* ======================================================== */}
      <g id="continent-asia">
        <path
          d={`
            M 635 155
            C 675 120, 735 90, 795 70
            C 845 55, 915 65, 965 80
            C 980 110, 955 150, 935 185
            C 940 220, 910 260, 885 295
            C 860 325, 840 370, 835 410
            C 810 405, 785 380, 765 350
            C 750 375, 720 405, 695 385
            C 675 355, 665 320, 635 295
            C 610 305, 580 340, 565 345
            C 555 315, 570 280, 585 245
            C 610 215, 625 180, 635 155 Z
          `}
          fill="#2b143d"
          stroke="#a855f7"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Kamchatka Peninsula (900, 110) */}
        <path
          d="M 915 85 C 935 95, 940 135, 920 160 C 905 145, 905 110, 915 85 Z"
          fill="#34184a"
          stroke="#c084fc"
          strokeWidth="2"
        />

        {/* Japan Islands Arc (910, 240) */}
        <path
          d="M 905 195 C 925 210, 930 250, 910 270 C 895 255, 900 220, 905 195 Z"
          fill="#3a1b54"
          stroke="#c084fc"
          strokeWidth="2"
        />

        {/* Indian Subcontinent Triangle (730, 335) */}
        <path
          d="M 695 305 C 730 295, 765 315, 755 365 C 735 395, 705 385, 695 345 Z"
          fill="#2b143d"
          stroke="#a855f7"
          strokeWidth="2"
        />

        {/* Arabian Peninsula (610, 320) */}
        <path
          d="M 585 300 C 625 285, 645 325, 635 360 C 610 375, 585 345, 585 300 Z"
          fill="#2b143d"
          stroke="#a855f7"
          strokeWidth="1.8"
        />
      </g>

      {/* ======================================================== */}
      {/* 6. AUSTRALIA & OCEANIA                                   */}
      {/* Indonesia (815,450), New Guinea (910,440),               */}
      {/* W.Australia (840,535), E.Australia (915,520)             */}
      {/* ======================================================== */}
      <g id="continent-australia">
        {/* Mainland Australia */}
        <path
          d={`
            M 800 485
            C 835 460, 885 460, 935 475
            C 960 500, 955 545, 930 575
            C 895 585, 845 575, 815 555
            C 785 530, 785 500, 800 485 Z
          `}
          fill="#3b132a"
          stroke="#ec4899"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Indonesia Islands (815, 450) */}
        <path
          d="M 770 435 C 805 425, 845 440, 835 460 C 800 465, 770 445, 770 435 Z"
          fill="#3b132a"
          stroke="#f472b6"
          strokeWidth="2"
        />

        {/* New Guinea Island (910, 440) */}
        <path
          d="M 875 420 C 915 410, 945 425, 935 450 C 900 455, 870 435, 875 420 Z"
          fill="#3b132a"
          stroke="#f472b6"
          strokeWidth="2"
        />

        {/* New Zealand */}
        <path
          d="M 970 520 C 985 510, 990 540, 980 560 C 970 550, 960 535, 970 520 Z"
          fill="#3b132a"
          stroke="#f472b6"
          strokeWidth="1.5"
        />
      </g>

      {/* Decorative Compass Rose in mid Atlantic */}
      <g transform="translate(355, 290)" opacity="0.4" pointerEvents="none">
        <circle cx="0" cy="0" r="20" fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M 0 -28 L 5 -5 L 28 0 L 5 5 L 0 28 L -5 5 L -28 0 L -5 -5 Z" fill="#eab308" fillOpacity="0.25" stroke="#eab308" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="3" fill="#eab308" />
        <text x="0" y="-31" textAnchor="middle" fill="#eab308" fontSize="9" fontWeight="900" fontFamily="sans-serif">N</text>
        <text x="0" y="38" textAnchor="middle" fill="#eab308" fontSize="8" fontWeight="bold" fontFamily="sans-serif">S</text>
        <text x="36" y="3" textAnchor="middle" fill="#eab308" fontSize="8" fontWeight="bold" fontFamily="sans-serif">E</text>
        <text x="-36" y="3" textAnchor="middle" fill="#eab308" fontSize="8" fontWeight="bold" fontFamily="sans-serif">W</text>
      </g>

      {/* Continent Ruler Active Banner Badges */}
      {showContinentZones && (
        <g pointerEvents="none">
          {Object.values(CONTINENTS).map(c => {
            const ruler = getContinentRuler(c.id);
            if (!ruler) return null;

            const pos =
              c.id === 'north_america' ? { x: 190, y: 205 } :
              c.id === 'south_america' ? { x: 290, y: 460 } :
              c.id === 'europe' ? { x: 500, y: 220 } :
              c.id === 'africa' ? { x: 520, y: 440 } :
              c.id === 'asia' ? { x: 770, y: 210 } : { x: 865, y: 515 };

            return (
              <g key={`ruler-${c.id}`} className="animate-pulse">
                <rect
                  x={pos.x - 75}
                  y={pos.y - 12}
                  width="150"
                  height="24"
                  rx="6"
                  fill="#020617"
                  fillOpacity="0.85"
                  stroke={ruler.color}
                  strokeWidth="1.5"
                />
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  fill={ruler.color}
                  fontSize="10"
                  fontWeight="900"
                  fontFamily="sans-serif"
                >
                  ★ {c.nameHebrew} נשלטת (+{c.bonus}) ★
                </text>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};
