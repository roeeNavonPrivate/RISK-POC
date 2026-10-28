import { Continent, Territory } from '../types/risk';

export const CONTINENTS: Record<string, Continent> = {
  north_america: {
    id: 'north_america',
    nameHebrew: 'צפון אמריקה',
    nameEnglish: 'North America',
    bonus: 5,
    color: '#3b82f6', // Blue
    territoryIds: [
      'alaska', 'nw_territory', 'greenland', 'alberta', 'ontario',
      'quebec', 'western_us', 'eastern_us', 'central_america'
    ]
  },
  south_america: {
    id: 'south_america',
    nameHebrew: 'דרום אמריקה',
    nameEnglish: 'South America',
    bonus: 2,
    color: '#eab308', // Yellow/Gold
    territoryIds: ['venezuela', 'peru', 'brazil', 'argentina']
  },
  europe: {
    id: 'europe',
    nameHebrew: 'אירופה',
    nameEnglish: 'Europe',
    bonus: 5,
    color: '#10b981', // Green
    territoryIds: [
      'iceland', 'great_britain', 'scandinavia', 'northern_europe',
      'western_europe', 'southern_europe', 'ukraine'
    ]
  },
  africa: {
    id: 'africa',
    nameHebrew: 'אפריקה',
    nameEnglish: 'Africa',
    bonus: 3,
    color: '#f97316', // Orange
    territoryIds: [
      'north_africa', 'egypt', 'east_africa', 'congo', 'south_africa', 'madagascar'
    ]
  },
  asia: {
    id: 'asia',
    nameHebrew: 'אסיה',
    nameEnglish: 'Asia',
    bonus: 7,
    color: '#a855f7', // Purple
    territoryIds: [
      'ural', 'siberia', 'yakutsk', 'kamchatka', 'irkutsk',
      'afghanistan', 'china', 'mongolia', 'japan', 'middle_east',
      'india', 'siam'
    ]
  },
  australia: {
    id: 'australia',
    nameHebrew: 'אוסטרליה',
    nameEnglish: 'Australia',
    bonus: 2,
    color: '#ec4899', // Pink
    territoryIds: [
      'indonesia', 'new_guinea', 'western_australia', 'eastern_australia'
    ]
  }
};

export const TERRITORIES: Territory[] = [
  // --- North America (9) ---
  {
    id: 'alaska',
    nameHebrew: 'אלסקה',
    nameEnglish: 'Alaska',
    continent: 'north_america',
    adjacentIds: ['nw_territory', 'alberta', 'kamchatka'],
    x: 80,
    y: 115,
  },
  {
    id: 'nw_territory',
    nameHebrew: 'הטריטוריה הצפון-מערבית',
    nameEnglish: 'NW Territory',
    continent: 'north_america',
    adjacentIds: ['alaska', 'alberta', 'ontario', 'greenland'],
    x: 165,
    y: 100,
  },
  {
    id: 'greenland',
    nameHebrew: 'גרינלנד',
    nameEnglish: 'Greenland',
    continent: 'north_america',
    adjacentIds: ['nw_territory', 'quebec', 'ontario', 'iceland'],
    x: 335,
    y: 65,
  },
  {
    id: 'alberta',
    nameHebrew: 'אלברטה',
    nameEnglish: 'Alberta',
    continent: 'north_america',
    adjacentIds: ['alaska', 'nw_territory', 'ontario', 'western_us'],
    x: 145,
    y: 160,
  },
  {
    id: 'ontario',
    nameHebrew: 'אונטריו',
    nameEnglish: 'Ontario',
    continent: 'north_america',
    adjacentIds: ['nw_territory', 'alberta', 'quebec', 'western_us', 'eastern_us', 'greenland'],
    x: 215,
    y: 165,
  },
  {
    id: 'quebec',
    nameHebrew: 'קוויבק',
    nameEnglish: 'Quebec',
    continent: 'north_america',
    adjacentIds: ['ontario', 'greenland', 'eastern_us'],
    x: 280,
    y: 170,
  },
  {
    id: 'western_us',
    nameHebrew: 'מערב ארה״ב',
    nameEnglish: 'Western US',
    continent: 'north_america',
    adjacentIds: ['alberta', 'ontario', 'eastern_us', 'central_america'],
    x: 160,
    y: 225,
  },
  {
    id: 'eastern_us',
    nameHebrew: 'מזרח ארה״ב',
    nameEnglish: 'Eastern US',
    continent: 'north_america',
    adjacentIds: ['western_us', 'ontario', 'quebec', 'central_america'],
    x: 228,
    y: 235,
  },
  {
    id: 'central_america',
    nameHebrew: 'מרכז אמריקה',
    nameEnglish: 'Central America',
    continent: 'north_america',
    adjacentIds: ['western_us', 'eastern_us', 'venezuela'],
    x: 185,
    y: 290,
  },

  // --- South America (4) ---
  {
    id: 'venezuela',
    nameHebrew: 'ונצואלה',
    nameEnglish: 'Venezuela',
    continent: 'south_america',
    adjacentIds: ['central_america', 'peru', 'brazil'],
    x: 265,
    y: 360,
  },
  {
    id: 'peru',
    nameHebrew: 'פרו',
    nameEnglish: 'Peru',
    continent: 'south_america',
    adjacentIds: ['venezuela', 'brazil', 'argentina'],
    x: 255,
    y: 425,
  },
  {
    id: 'brazil',
    nameHebrew: 'ברזיל',
    nameEnglish: 'Brazil',
    continent: 'south_america',
    adjacentIds: ['venezuela', 'peru', 'argentina', 'north_africa'],
    x: 330,
    y: 410,
  },
  {
    id: 'argentina',
    nameHebrew: 'ארגנטינה',
    nameEnglish: 'Argentina',
    continent: 'south_america',
    adjacentIds: ['peru', 'brazil'],
    x: 285,
    y: 495,
  },

  // --- Europe (7) ---
  {
    id: 'iceland',
    nameHebrew: 'איסלנד',
    nameEnglish: 'Iceland',
    continent: 'europe',
    adjacentIds: ['greenland', 'great_britain', 'scandinavia'],
    x: 415,
    y: 105,
  },
  {
    id: 'great_britain',
    nameHebrew: 'בריטניה',
    nameEnglish: 'Great Britain',
    continent: 'europe',
    adjacentIds: ['iceland', 'scandinavia', 'northern_europe', 'western_europe'],
    x: 405,
    y: 185,
  },
  {
    id: 'scandinavia',
    nameHebrew: 'סקנדינביה',
    nameEnglish: 'Scandinavia',
    continent: 'europe',
    adjacentIds: ['iceland', 'great_britain', 'northern_europe', 'ukraine'],
    x: 490,
    y: 110,
  },
  {
    id: 'northern_europe',
    nameHebrew: 'צפון אירופה',
    nameEnglish: 'Northern Europe',
    continent: 'europe',
    adjacentIds: ['great_britain', 'scandinavia', 'western_europe', 'southern_europe', 'ukraine'],
    x: 480,
    y: 185,
  },
  {
    id: 'western_europe',
    nameHebrew: 'מערב אירופה',
    nameEnglish: 'Western Europe',
    continent: 'europe',
    adjacentIds: ['great_britain', 'northern_europe', 'southern_europe', 'north_africa'],
    x: 430,
    y: 240,
  },
  {
    id: 'southern_europe',
    nameHebrew: 'דרום אירופה',
    nameEnglish: 'Southern Europe',
    continent: 'europe',
    adjacentIds: ['western_europe', 'northern_europe', 'ukraine', 'north_africa', 'egypt', 'middle_east'],
    x: 495,
    y: 255,
  },
  {
    id: 'ukraine',
    nameHebrew: 'אוקראינה ומזרח אירופה',
    nameEnglish: 'Ukraine',
    continent: 'europe',
    adjacentIds: ['scandinavia', 'northern_europe', 'southern_europe', 'ural', 'afghanistan', 'middle_east'],
    x: 576,
    y: 165,
  },

  // --- Africa (6) ---
  {
    id: 'north_africa',
    nameHebrew: 'צפון אפריקה',
    nameEnglish: 'North Africa',
    continent: 'africa',
    adjacentIds: ['brazil', 'western_europe', 'southern_europe', 'egypt', 'east_africa', 'congo'],
    x: 455,
    y: 350,
  },
  {
    id: 'egypt',
    nameHebrew: 'מצרים',
    nameEnglish: 'Egypt',
    continent: 'africa',
    adjacentIds: ['north_africa', 'southern_europe', 'middle_east', 'east_africa'],
    x: 530,
    y: 340,
  },
  {
    id: 'east_africa',
    nameHebrew: 'מזרח אפריקה',
    nameEnglish: 'East Africa',
    continent: 'africa',
    adjacentIds: ['egypt', 'north_africa', 'congo', 'south_africa', 'madagascar', 'middle_east'],
    x: 575,
    y: 415,
  },
  {
    id: 'congo',
    nameHebrew: 'קונגו',
    nameEnglish: 'Congo',
    continent: 'africa',
    adjacentIds: ['north_africa', 'east_africa', 'south_africa'],
    x: 520,
    y: 440,
  },
  {
    id: 'south_africa',
    nameHebrew: 'דרום אפריקה',
    nameEnglish: 'South Africa',
    continent: 'africa',
    adjacentIds: ['congo', 'east_africa', 'madagascar'],
    x: 540,
    y: 515,
  },
  {
    id: 'madagascar',
    nameHebrew: 'מדגסקר',
    nameEnglish: 'Madagascar',
    continent: 'africa',
    adjacentIds: ['east_africa', 'south_africa'],
    x: 625,
    y: 480,
  },

  // --- Asia (12) ---
  {
    id: 'ural',
    nameHebrew: 'הרי אורל',
    nameEnglish: 'Ural',
    continent: 'asia',
    adjacentIds: ['ukraine', 'siberia', 'china', 'afghanistan'],
    x: 645,
    y: 145,
  },
  {
    id: 'siberia',
    nameHebrew: 'סיביר',
    nameEnglish: 'Siberia',
    continent: 'asia',
    adjacentIds: ['ural', 'yakutsk', 'irkutsk', 'mongolia', 'china'],
    x: 715,
    y: 110,
  },
  {
    id: 'yakutsk',
    nameHebrew: 'יקוטסק',
    nameEnglish: 'Yakutsk',
    continent: 'asia',
    adjacentIds: ['siberia', 'irkutsk', 'kamchatka'],
    x: 805,
    y: 90,
  },
  {
    id: 'kamchatka',
    nameHebrew: 'קמצ׳טקה',
    nameEnglish: 'Kamchatka',
    continent: 'asia',
    adjacentIds: ['yakutsk', 'irkutsk', 'mongolia', 'japan', 'alaska'],
    x: 890,
    y: 105,
  },
  {
    id: 'irkutsk',
    nameHebrew: 'אירקוטסק',
    nameEnglish: 'Irkutsk',
    continent: 'asia',
    adjacentIds: ['siberia', 'yakutsk', 'kamchatka', 'mongolia'],
    x: 775,
    y: 145,
  },
  {
    id: 'afghanistan',
    nameHebrew: 'אפגניסטן',
    nameEnglish: 'Afghanistan',
    continent: 'asia',
    adjacentIds: ['ukraine', 'ural', 'china', 'india', 'middle_east'],
    x: 648,
    y: 225,
  },
  {
    id: 'china',
    nameHebrew: 'סין',
    nameEnglish: 'China',
    continent: 'asia',
    adjacentIds: ['ural', 'siberia', 'mongolia', 'afghanistan', 'india', 'siam'],
    x: 760,
    y: 240,
  },
  {
    id: 'mongolia',
    nameHebrew: 'מונגוליה',
    nameEnglish: 'Mongolia',
    continent: 'asia',
    adjacentIds: ['siberia', 'irkutsk', 'kamchatka', 'japan', 'china'],
    x: 805,
    y: 195,
  },
  {
    id: 'japan',
    nameHebrew: 'יפן',
    nameEnglish: 'Japan',
    continent: 'asia',
    adjacentIds: ['kamchatka', 'mongolia'],
    x: 885,
    y: 215,
  },
  {
    id: 'middle_east',
    nameHebrew: 'המזרח התיכון',
    nameEnglish: 'Middle East',
    continent: 'asia',
    adjacentIds: ['southern_europe', 'ukraine', 'afghanistan', 'india', 'egypt', 'east_africa'],
    x: 606,
    y: 300,
  },
  {
    id: 'india',
    nameHebrew: 'הודו',
    nameEnglish: 'India',
    continent: 'asia',
    adjacentIds: ['middle_east', 'afghanistan', 'china', 'siam'],
    x: 710,
    y: 315,
  },
  {
    id: 'siam',
    nameHebrew: 'דרום מזרח אסיה',
    nameEnglish: 'SE Asia (Siam)',
    continent: 'asia',
    adjacentIds: ['india', 'china', 'indonesia'],
    x: 790,
    y: 335,
  },

  // --- Australia (4) ---
  {
    id: 'indonesia',
    nameHebrew: 'אינדונזיה',
    nameEnglish: 'Indonesia',
    continent: 'australia',
    adjacentIds: ['siam', 'new_guinea', 'western_australia'],
    x: 810,
    y: 420,
  },
  {
    id: 'new_guinea',
    nameHebrew: 'גינאה החדשה',
    nameEnglish: 'New Guinea',
    continent: 'australia',
    adjacentIds: ['indonesia', 'eastern_australia', 'western_australia'],
    x: 895,
    y: 410,
  },
  {
    id: 'western_australia',
    nameHebrew: 'מערב אוסטרליה',
    nameEnglish: 'Western Australia',
    continent: 'australia',
    adjacentIds: ['indonesia', 'new_guinea', 'eastern_australia'],
    x: 825,
    y: 490,
  },
  {
    id: 'eastern_australia',
    nameHebrew: 'מזרח אוסטרליה',
    nameEnglish: 'Eastern Australia',
    continent: 'australia',
    adjacentIds: ['new_guinea', 'western_australia'],
    x: 895,
    y: 480,
  },
];

export const TERRITORY_MAP: Record<string, Territory> = TERRITORIES.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<string, Territory>
);

// High-contrast, distinguished strategic color schemes for players
export interface PlayerColorDef {
  id: string;
  name: string;
  hex: string;
  glow: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  accentClass: string;
}

export const PLAYER_COLORS: PlayerColorDef[] = [
  {
    id: 'red',
    name: 'אדום קיסרי',
    hex: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.6)',
    bgClass: 'bg-red-600',
    borderClass: 'border-red-500',
    textClass: 'text-red-400',
    accentClass: 'hover:bg-red-700'
  },
  {
    id: 'blue',
    name: 'כחול מלכותי',
    hex: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.6)',
    bgClass: 'bg-blue-600',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-400',
    accentClass: 'hover:bg-blue-700'
  },
  {
    id: 'green',
    name: 'ירוק יער',
    hex: '#10b981',
    glow: 'rgba(16, 185, 129, 0.6)',
    bgClass: 'bg-emerald-600',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-400',
    accentClass: 'hover:bg-emerald-700'
  },
  {
    id: 'yellow',
    name: 'זהב מדברי',
    hex: '#eab308',
    glow: 'rgba(234, 179, 8, 0.6)',
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-400',
    textClass: 'text-amber-300',
    accentClass: 'hover:bg-amber-600'
  },
  {
    id: 'purple',
    name: 'סגול לגיונר',
    hex: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.6)',
    bgClass: 'bg-purple-600',
    borderClass: 'border-purple-500',
    textClass: 'text-purple-400',
    accentClass: 'hover:bg-purple-700'
  },
  {
    id: 'teal',
    name: 'טורקיז ימי',
    hex: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.6)',
    bgClass: 'bg-cyan-600',
    borderClass: 'border-cyan-500',
    textClass: 'text-cyan-400',
    accentClass: 'hover:bg-cyan-700'
  }
];

export const AI_BOT_NAMES = [
  { name: 'גנרל ברזל', personality: 'aggressive' as const, desc: 'תוקף בעוצמה שואף לכבוש יבשות שלמות' },
  { name: 'טקטיקן זהיר', personality: 'defensive' as const, desc: 'בונה חומות הגנה עבות וממתין לטעויות' },
  { name: 'מצביא מאוזן', personality: 'balanced' as const, desc: 'מאזן בין תגבור נקודות תורפה להתקפות מחושבות' },
  { name: 'נפוליאון בוט', personality: 'aggressive' as const, desc: 'מאמין במתקפות פתע מרוכזות' },
  { name: 'קיסר המזרח', personality: 'balanced' as const, desc: 'שואף לשלוט באסיה ובאוסטרליה' },
];
