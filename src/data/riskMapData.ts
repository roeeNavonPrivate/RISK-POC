import { Continent, Territory } from '../types/risk';

export const CONTINENTS: Record<string, Continent> = {
  north_america: {
    id: 'north_america' as any,
    nameHebrew: 'צפון אמריקה',
    nameEnglish: 'North America',
    bonus: 5,
    color: '#2563eb', // Royal Blue
    territoryIds: [
      'alaska', 'nw_territory', 'greenland', 'alberta', 'ontario',
      'quebec', 'western_us', 'eastern_us', 'central_america'
    ]
  },
  south_america: {
    id: 'south_america' as any,
    nameHebrew: 'דרום אמריקה',
    nameEnglish: 'South America',
    bonus: 2,
    color: '#dc2626', // Crimson Red
    territoryIds: ['venezuela', 'peru', 'brazil', 'argentina']
  },
  europe: {
    id: 'europe' as any,
    nameHebrew: 'אירופה',
    nameEnglish: 'Europe',
    bonus: 5,
    color: '#16a34a', // Emerald Green
    territoryIds: [
      'iceland', 'great_britain', 'scandinavia', 'northern_europe',
      'western_europe', 'southern_europe', 'ukraine'
    ]
  },
  africa: {
    id: 'africa' as any,
    nameHebrew: 'אפריקה',
    nameEnglish: 'Africa',
    bonus: 3,
    color: '#ea580c', // Warm Amber
    territoryIds: [
      'north_africa', 'egypt', 'east_africa', 'congo', 'south_africa', 'madagascar'
    ]
  },
  asia: {
    id: 'asia' as any,
    nameHebrew: 'אסיה',
    nameEnglish: 'Asia',
    bonus: 7,
    color: '#9333ea', // Deep Purple
    territoryIds: [
      'ural', 'siberia', 'yakutsk', 'kamchatka', 'irkutsk',
      'afghanistan', 'china', 'mongolia', 'japan', 'middle_east',
      'india', 'siam'
    ]
  },
  australia: {
    id: 'australia' as any,
    nameHebrew: 'אוסטרליה ואוקיאניה',
    nameEnglish: 'Australia & Oceania',
    bonus: 2,
    color: '#db2777', // Rose
    territoryIds: [
      'indonesia', 'new_guinea', 'western_australia', 'eastern_australia'
    ]
  }
};

// 42 Real-World Countries & Key Strategic Regions with National Flags
export const TERRITORIES: Territory[] = [
  // --- North America (9) ---
  {
    id: 'alaska',
    nameHebrew: 'אלסקה (ארה״ב)',
    nameEnglish: 'Alaska (USA)',
    continent: 'north_america',
    adjacentIds: ['nw_territory', 'alberta', 'kamchatka'],
    x: 80,
    y: 115,
    flag: '🇺🇸'
  },
  {
    id: 'nw_territory',
    nameHebrew: 'צפון קנדה',
    nameEnglish: 'North Canada',
    continent: 'north_america',
    adjacentIds: ['alaska', 'alberta', 'ontario', 'greenland'],
    x: 165,
    y: 100,
    flag: '🇨🇦'
  },
  {
    id: 'greenland',
    nameHebrew: 'גרינלנד',
    nameEnglish: 'Greenland',
    continent: 'north_america',
    adjacentIds: ['nw_territory', 'quebec', 'ontario', 'iceland'],
    x: 335,
    y: 65,
    flag: '🇬🇱'
  },
  {
    id: 'alberta',
    nameHebrew: 'מערב קנדה (אלברטה)',
    nameEnglish: 'Western Canada',
    continent: 'north_america',
    adjacentIds: ['alaska', 'nw_territory', 'ontario', 'western_us'],
    x: 145,
    y: 160,
    flag: '🇨🇦'
  },
  {
    id: 'ontario',
    nameHebrew: 'מרכז קנדה (אונטריו)',
    nameEnglish: 'Central Canada',
    continent: 'north_america',
    adjacentIds: ['nw_territory', 'alberta', 'quebec', 'western_us', 'eastern_us', 'greenland'],
    x: 215,
    y: 165,
    flag: '🇨🇦'
  },
  {
    id: 'quebec',
    nameHebrew: 'מזרח קנדה (קוויבק)',
    nameEnglish: 'Eastern Canada',
    continent: 'north_america',
    adjacentIds: ['ontario', 'greenland', 'eastern_us'],
    x: 280,
    y: 170,
    flag: '🇨🇦'
  },
  {
    id: 'western_us',
    nameHebrew: 'מערב ארה״ב (קליפורניה)',
    nameEnglish: 'Western USA',
    continent: 'north_america',
    adjacentIds: ['alberta', 'ontario', 'eastern_us', 'central_america'],
    x: 160,
    y: 225,
    flag: '🇺🇸'
  },
  {
    id: 'eastern_us',
    nameHebrew: 'מזרח ארה״ב (ניו יורק)',
    nameEnglish: 'Eastern USA',
    continent: 'north_america',
    adjacentIds: ['western_us', 'ontario', 'quebec', 'central_america'],
    x: 228,
    y: 235,
    flag: '🇺🇸'
  },
  {
    id: 'central_america',
    nameHebrew: 'מקסיקו ומרכז אמריקה',
    nameEnglish: 'Mexico & Central America',
    continent: 'north_america',
    adjacentIds: ['western_us', 'eastern_us', 'venezuela'],
    x: 185,
    y: 290,
    flag: '🇲🇽'
  },

  // --- South America (4) ---
  {
    id: 'venezuela',
    nameHebrew: 'ונצואלה וקולומביה',
    nameEnglish: 'Venezuela & Colombia',
    continent: 'south_america',
    adjacentIds: ['central_america', 'peru', 'brazil'],
    x: 265,
    y: 360,
    flag: '🇻🇪'
  },
  {
    id: 'peru',
    nameHebrew: 'פרו והאנדים',
    nameEnglish: 'Peru & Andes',
    continent: 'south_america',
    adjacentIds: ['venezuela', 'brazil', 'argentina'],
    x: 250,
    y: 425,
    flag: '🇵🇪'
  },
  {
    id: 'brazil',
    nameHebrew: 'ברזיל',
    nameEnglish: 'Brazil',
    continent: 'south_america',
    adjacentIds: ['venezuela', 'peru', 'argentina', 'north_africa'],
    x: 330,
    y: 410,
    flag: '🇧🇷'
  },
  {
    id: 'argentina',
    nameHebrew: 'ארגנטינה וצ׳ילה',
    nameEnglish: 'Argentina & Chile',
    continent: 'south_america',
    adjacentIds: ['peru', 'brazil'],
    x: 285,
    y: 495,
    flag: '🇦🇷'
  },

  // --- Europe (7) ---
  {
    id: 'iceland',
    nameHebrew: 'איסלנד',
    nameEnglish: 'Iceland',
    continent: 'europe',
    adjacentIds: ['greenland', 'great_britain', 'scandinavia'],
    x: 435,
    y: 108,
    flag: '🇮🇸'
  },
  {
    id: 'great_britain',
    nameHebrew: 'בריטניה (אנגליה)',
    nameEnglish: 'Great Britain',
    continent: 'europe',
    adjacentIds: ['iceland', 'scandinavia', 'northern_europe', 'western_europe'],
    x: 468,
    y: 156,
    flag: '🇬🇧'
  },
  {
    id: 'scandinavia',
    nameHebrew: 'סקנדינביה (שוודיה ונורווגיה)',
    nameEnglish: 'Scandinavia',
    continent: 'europe',
    adjacentIds: ['iceland', 'great_britain', 'northern_europe', 'ukraine'],
    x: 515,
    y: 115,
    flag: '🇸🇪'
  },
  {
    id: 'northern_europe',
    nameHebrew: 'גרמניה ומרכז אירופה',
    nameEnglish: 'Germany & Central Europe',
    continent: 'europe',
    adjacentIds: ['great_britain', 'scandinavia', 'western_europe', 'southern_europe', 'ukraine'],
    x: 515,
    y: 180,
    flag: '🇩🇪'
  },
  {
    id: 'western_europe',
    nameHebrew: 'צרפת וספרד',
    nameEnglish: 'France & Spain',
    continent: 'europe',
    adjacentIds: ['great_britain', 'northern_europe', 'southern_europe', 'north_africa'],
    x: 472,
    y: 235,
    flag: '🇫🇷'
  },
  {
    id: 'southern_europe',
    nameHebrew: 'איטליה ויוון',
    nameEnglish: 'Italy & Greece',
    continent: 'europe',
    adjacentIds: ['western_europe', 'northern_europe', 'ukraine', 'north_africa', 'egypt', 'middle_east'],
    x: 522,
    y: 242,
    flag: '🇮🇹'
  },
  {
    id: 'ukraine',
    nameHebrew: 'אוקראינה ומזרח אירופה',
    nameEnglish: 'Ukraine & East Europe',
    continent: 'europe',
    adjacentIds: ['scandinavia', 'northern_europe', 'southern_europe', 'ural', 'afghanistan', 'middle_east'],
    x: 575,
    y: 165,
    flag: '🇺🇦'
  },

  // --- Africa (6) ---
  {
    id: 'north_africa',
    nameHebrew: 'צפון אפריקה (מרוקו ואלג׳יריה)',
    nameEnglish: 'North Africa',
    continent: 'africa',
    adjacentIds: ['western_europe', 'southern_europe', 'brazil', 'egypt', 'east_africa', 'congo'],
    x: 465,
    y: 340,
    flag: '🇲🇦'
  },
  {
    id: 'egypt',
    nameHebrew: 'מצרים',
    nameEnglish: 'Egypt',
    continent: 'africa',
    adjacentIds: ['north_africa', 'southern_europe', 'middle_east', 'east_africa'],
    x: 535,
    y: 335,
    flag: '🇪🇬'
  },
  {
    id: 'east_africa',
    nameHebrew: 'מזרח אפריקה (אתיופיה וקניה)',
    nameEnglish: 'East Africa',
    continent: 'africa',
    adjacentIds: ['egypt', 'north_africa', 'congo', 'south_africa', 'madagascar', 'middle_east'],
    x: 580,
    y: 395,
    flag: '🇪🇹'
  },
  {
    id: 'congo',
    nameHebrew: 'קונגו ומרכז אפריקה',
    nameEnglish: 'Congo & Central Africa',
    continent: 'africa',
    adjacentIds: ['north_africa', 'east_africa', 'south_africa'],
    x: 530,
    y: 425,
    flag: '🇨🇩'
  },
  {
    id: 'south_africa',
    nameHebrew: 'דרום אפריקה',
    nameEnglish: 'South Africa',
    continent: 'africa',
    adjacentIds: ['congo', 'east_africa', 'madagascar'],
    x: 535,
    y: 500,
    flag: '🇿🇦'
  },
  {
    id: 'madagascar',
    nameHebrew: 'מדגסקר',
    nameEnglish: 'Madagascar',
    continent: 'africa',
    adjacentIds: ['east_africa', 'south_africa'],
    x: 620,
    y: 480,
    flag: '🇲🇬'
  },

  // --- Asia (12) ---
  {
    id: 'ural',
    nameHebrew: 'הרי אורל (רוסיה)',
    nameEnglish: 'Ural (Russia)',
    continent: 'asia',
    adjacentIds: ['ukraine', 'siberia', 'china', 'afghanistan'],
    x: 630,
    y: 135,
    flag: '🇷🇺'
  },
  {
    id: 'siberia',
    nameHebrew: 'סיביר (צפון רוסיה)',
    nameEnglish: 'Siberia (Russia)',
    continent: 'asia',
    adjacentIds: ['ural', 'yakutsk', 'irkutsk', 'mongolia', 'china'],
    x: 685,
    y: 110,
    flag: '🇷🇺'
  },
  {
    id: 'yakutsk',
    nameHebrew: 'יקוטסק (צפון-מזרח רוסיה)',
    nameEnglish: 'Yakutsk (Russia)',
    continent: 'asia',
    adjacentIds: ['siberia', 'kamchatka', 'irkutsk'],
    x: 765,
    y: 85,
    flag: '🇷🇺'
  },
  {
    id: 'kamchatka',
    nameHebrew: 'קמצ׳טקה (מזרח רוסיה)',
    nameEnglish: 'Kamchatka',
    continent: 'asia',
    adjacentIds: ['yakutsk', 'irkutsk', 'mongolia', 'japan', 'alaska'],
    x: 845,
    y: 95,
    flag: '🇷🇺'
  },
  {
    id: 'irkutsk',
    nameHebrew: 'מרכז סיביר (אירקוטסק)',
    nameEnglish: 'Irkutsk (Russia)',
    continent: 'asia',
    adjacentIds: ['siberia', 'yakutsk', 'kamchatka', 'mongolia'],
    x: 755,
    y: 150,
    flag: '🇷🇺'
  },
  {
    id: 'afghanistan',
    nameHebrew: 'אפגניסטן ומרכז אסיה',
    nameEnglish: 'Afghanistan & Central Asia',
    continent: 'asia',
    adjacentIds: ['ukraine', 'ural', 'china', 'india', 'middle_east'],
    x: 630,
    y: 215,
    flag: '🇦🇫'
  },
  {
    id: 'china',
    nameHebrew: 'סין',
    nameEnglish: 'China',
    continent: 'asia',
    adjacentIds: ['afghanistan', 'ural', 'siberia', 'mongolia', 'siam', 'india'],
    x: 725,
    y: 240,
    flag: '🇨🇳'
  },
  {
    id: 'mongolia',
    nameHebrew: 'מונגוליה',
    nameEnglish: 'Mongolia',
    continent: 'asia',
    adjacentIds: ['siberia', 'irkutsk', 'kamchatka', 'japan', 'china'],
    x: 750,
    y: 195,
    flag: '🇲🇳'
  },
  {
    id: 'japan',
    nameHebrew: 'יפן',
    nameEnglish: 'Japan',
    continent: 'asia',
    adjacentIds: ['kamchatka', 'mongolia'],
    x: 860,
    y: 210,
    flag: '🇯🇵'
  },
  {
    id: 'middle_east',
    nameHebrew: 'המזרח התיכון וישראל',
    nameEnglish: 'Middle East & Israel',
    continent: 'asia',
    adjacentIds: ['southern_europe', 'ukraine', 'afghanistan', 'india', 'egypt', 'east_africa'],
    x: 585,
    y: 285,
    flag: '🇮🇱'
  },
  {
    id: 'india',
    nameHebrew: 'הודו',
    nameEnglish: 'India',
    continent: 'asia',
    adjacentIds: ['middle_east', 'afghanistan', 'china', 'siam'],
    x: 680,
    y: 305,
    flag: '🇮🇳'
  },
  {
    id: 'siam',
    nameHebrew: 'דרום-מזרח אסיה (תאילנד)',
    nameEnglish: 'Southeast Asia',
    continent: 'asia',
    adjacentIds: ['india', 'china', 'indonesia'],
    x: 755,
    y: 330,
    flag: '🇹🇭'
  },

  // --- Australia & Oceania (4) ---
  {
    id: 'indonesia',
    nameHebrew: 'אינדונזיה',
    nameEnglish: 'Indonesia',
    continent: 'australia',
    adjacentIds: ['siam', 'new_guinea', 'western_australia'],
    x: 765,
    y: 415,
    flag: '🇮🇩'
  },
  {
    id: 'new_guinea',
    nameHebrew: 'פפואה גינאה החדשה',
    nameEnglish: 'New Guinea',
    continent: 'australia',
    adjacentIds: ['indonesia', 'eastern_australia', 'western_australia'],
    x: 860,
    y: 395,
    flag: '🇵🇬'
  },
  {
    id: 'western_australia',
    nameHebrew: 'מערב אוסטרליה',
    nameEnglish: 'Western Australia',
    continent: 'australia',
    adjacentIds: ['indonesia', 'new_guinea', 'eastern_australia'],
    x: 815,
    y: 490,
    flag: '🇦🇺'
  },
  {
    id: 'eastern_australia',
    nameHebrew: 'מזרח אוסטרליה (סידני)',
    nameEnglish: 'Eastern Australia',
    continent: 'australia',
    adjacentIds: ['western_australia', 'new_guinea'],
    x: 875,
    y: 475,
    flag: '🇦🇺'
  }
];

export const TERRITORY_MAP: Record<string, Territory> = TERRITORIES.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<string, Territory>
);

// ============================================================================
// ISRAEL MAP (מערכת ארץ ישראל - 18 גזרות ומחוזות)
// ============================================================================

export const ISRAEL_REGIONS: Record<string, Continent> = {
  il_north: {
    id: 'il_north' as any,
    nameHebrew: 'מחוז הצפון והגולן',
    nameEnglish: 'Northern District & Golan',
    bonus: 4,
    color: '#2563eb', // Royal Blue
    territoryIds: [
      'golan_hermon', 'upper_galilee', 'western_galilee',
      'lower_galilee', 'kinneret_jordan', 'haifa_carmel'
    ]
  },
  il_center: {
    id: 'il_center' as any,
    nameHebrew: 'מחוז המרכז והשרון',
    nameEnglish: 'Center & Coastal District',
    bonus: 3,
    color: '#dc2626', // Crimson Red
    territoryIds: [
      'sharon', 'samaria', 'gush_dan', 'shfela_modiin', 'coastal_south'
    ]
  },
  il_jerusalem: {
    id: 'il_jerusalem' as any,
    nameHebrew: 'מחוז ירושלים ויהודה',
    nameEnglish: 'Jerusalem & Judean District',
    bonus: 3,
    color: '#d97706', // Gold / Amber
    territoryIds: [
      'jerusalem', 'judean_desert', 'gush_etzion'
    ]
  },
  il_south: {
    id: 'il_south' as any,
    nameHebrew: 'מחוז הדרום והנגב',
    nameEnglish: 'Southern District & Negev',
    bonus: 4,
    color: '#059669', // Emerald
    territoryIds: [
      'gaza_envelope', 'beer_sheva', 'central_negev', 'arava_eilat'
    ]
  }
};

export const ISRAEL_TERRITORIES: Territory[] = [
  // --- מחוז הצפון (6) ---
  {
    id: 'golan_hermon',
    nameHebrew: 'רמת הגולן והחרמון',
    nameEnglish: 'Golan Heights & Hermon',
    continent: 'il_north',
    adjacentIds: ['upper_galilee', 'kinneret_jordan'],
    x: 710,
    y: 80,
    flag: '🏔️'
  },
  {
    id: 'upper_galilee',
    nameHebrew: 'גליל עליון ואצבע הגליל',
    nameEnglish: 'Upper Galilee',
    continent: 'il_north',
    adjacentIds: ['golan_hermon', 'western_galilee', 'lower_galilee'],
    x: 620,
    y: 85,
    flag: '🌲'
  },
  {
    id: 'western_galilee',
    nameHebrew: 'גליל מערבי ועכו',
    nameEnglish: 'Western Galilee & Acre',
    continent: 'il_north',
    adjacentIds: ['upper_galilee', 'lower_galilee', 'haifa_carmel'],
    x: 540,
    y: 115,
    flag: '🏰'
  },
  {
    id: 'lower_galilee',
    nameHebrew: 'גליל תחתון ועמק יזרעאל',
    nameEnglish: 'Lower Galilee & Valleys',
    continent: 'il_north',
    adjacentIds: ['upper_galilee', 'western_galilee', 'haifa_carmel', 'kinneret_jordan', 'sharon', 'samaria'],
    x: 620,
    y: 145,
    flag: '🌾'
  },
  {
    id: 'kinneret_jordan',
    nameHebrew: 'סובב כנרת ועמק הירדן',
    nameEnglish: 'Sea of Galilee & Jordan Valley',
    continent: 'il_north',
    adjacentIds: ['golan_hermon', 'lower_galilee', 'samaria'],
    x: 700,
    y: 155,
    flag: '🌊'
  },
  {
    id: 'haifa_carmel',
    nameHebrew: 'חיפה, הקריות והכרמל',
    nameEnglish: 'Haifa & Carmel',
    continent: 'il_north',
    adjacentIds: ['western_galilee', 'lower_galilee', 'sharon'],
    x: 480,
    y: 165,
    flag: '⚓'
  },

  // --- מחוז המרכז (5) ---
  {
    id: 'sharon',
    nameHebrew: 'השרון, נתניה ועמק חפר',
    nameEnglish: 'Sharon Plain',
    continent: 'il_center',
    adjacentIds: ['haifa_carmel', 'lower_galilee', 'samaria', 'gush_dan', 'shfela_modiin'],
    x: 460,
    y: 220,
    flag: '🍊'
  },
  {
    id: 'samaria',
    nameHebrew: 'שומרון ובקעת הירדן',
    nameEnglish: 'Samaria & Rift Valley',
    continent: 'il_center',
    adjacentIds: ['kinneret_jordan', 'lower_galilee', 'sharon', 'shfela_modiin', 'jerusalem', 'judean_desert'],
    x: 620,
    y: 225,
    flag: '⛰️'
  },
  {
    id: 'gush_dan',
    nameHebrew: 'גוש דן ותל אביב-יפו',
    nameEnglish: 'Gush Dan & Tel Aviv',
    continent: 'il_center',
    adjacentIds: ['sharon', 'shfela_modiin', 'coastal_south'],
    x: 430,
    y: 265,
    flag: '🏙️'
  },
  {
    id: 'shfela_modiin',
    nameHebrew: 'שפלת יהודה, מודיעין ורמלה',
    nameEnglish: 'Shfela & Modiin',
    continent: 'il_center',
    adjacentIds: ['sharon', 'gush_dan', 'samaria', 'jerusalem', 'gush_etzion', 'coastal_south', 'beer_sheva'],
    x: 520,
    y: 285,
    flag: '🛡️'
  },
  {
    id: 'coastal_south',
    nameHebrew: 'אשדוד, אשקלון ויבנה',
    nameEnglish: 'Southern Coast',
    continent: 'il_center',
    adjacentIds: ['gush_dan', 'shfela_modiin', 'gaza_envelope', 'beer_sheva'],
    x: 390,
    y: 315,
    flag: '🚢'
  },

  // --- מחוז ירושלים ויהודה (3) ---
  {
    id: 'jerusalem',
    nameHebrew: 'ירושלים ובירת ישראל',
    nameEnglish: 'Jerusalem',
    continent: 'il_jerusalem',
    adjacentIds: ['samaria', 'shfela_modiin', 'gush_etzion', 'judean_desert'],
    x: 600,
    y: 305,
    flag: '🦁'
  },
  {
    id: 'judean_desert',
    nameHebrew: 'ים המלח ומדבר יהודה',
    nameEnglish: 'Dead Sea & Judean Desert',
    continent: 'il_jerusalem',
    adjacentIds: ['samaria', 'jerusalem', 'gush_etzion', 'central_negev', 'arava_eilat'],
    x: 680,
    y: 335,
    flag: '🏜️'
  },
  {
    id: 'gush_etzion',
    nameHebrew: 'הרי יהודה וגוש עציון',
    nameEnglish: 'Judean Hills & Etzion',
    continent: 'il_jerusalem',
    adjacentIds: ['jerusalem', 'shfela_modiin', 'judean_desert', 'beer_sheva'],
    x: 560,
    y: 355,
    flag: '🍇'
  },

  // --- מחוז הדרום (4) ---
  {
    id: 'gaza_envelope',
    nameHebrew: 'עוטף עזה ומערב הנגב',
    nameEnglish: 'Western Negev & Envelope',
    continent: 'il_south',
    adjacentIds: ['coastal_south', 'beer_sheva'],
    x: 360,
    y: 380,
    flag: '🌾'
  },
  {
    id: 'beer_sheva',
    nameHebrew: 'באר שבע וצפון הנגב',
    nameEnglish: 'Be\'er Sheva & North Negev',
    continent: 'il_south',
    adjacentIds: ['coastal_south', 'gaza_envelope', 'shfela_modiin', 'gush_etzion', 'central_negev'],
    x: 470,
    y: 410,
    flag: '🐪'
  },
  {
    id: 'central_negev',
    nameHebrew: 'הר הנגב, מצפה רמון והמכתשים',
    nameEnglish: 'Central Negev & Craters',
    continent: 'il_south',
    adjacentIds: ['beer_sheva', 'judean_desert', 'arava_eilat'],
    x: 490,
    y: 485,
    flag: '🌋'
  },
  {
    id: 'arava_eilat',
    nameHebrew: 'הערבה ואילת (מפרץ ים סוף)',
    nameEnglish: 'Arava & Eilat',
    continent: 'il_south',
    adjacentIds: ['central_negev', 'judean_desert'],
    x: 550,
    y: 545,
    flag: '☀️'
  }
];

export const ISRAEL_TERRITORY_MAP: Record<string, Territory> = ISRAEL_TERRITORIES.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<string, Territory>
);

// Map Selectors Helper
export function getTerritoriesForMap(mapType: 'world' | 'israel' = 'world'): Territory[] {
  return mapType === 'israel' ? ISRAEL_TERRITORIES : TERRITORIES;
}

export function getContinentsForMap(mapType: 'world' | 'israel' = 'world'): Record<string, Continent> {
  return mapType === 'israel' ? ISRAEL_REGIONS : CONTINENTS;
}

export function getTerritoryMapForMap(mapType: 'world' | 'israel' = 'world'): Record<string, Territory> {
  return mapType === 'israel' ? ISRAEL_TERRITORY_MAP : TERRITORY_MAP;
}

export interface PlayerColorDef {
  id: string;
  name: string;
  hex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export const PLAYER_COLORS: PlayerColorDef[] = [
  {
    id: 'red',
    name: 'אדום קרבי',
    hex: '#dc2626',
    bgClass: 'bg-red-600',
    borderClass: 'border-red-500',
    textClass: 'text-red-400'
  },
  {
    id: 'blue',
    name: 'כחול מלכותי',
    hex: '#2563eb',
    bgClass: 'bg-blue-600',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-400'
  },
  {
    id: 'gold',
    name: 'זהב צבאי',
    hex: '#d97706',
    bgClass: 'bg-amber-600',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-400'
  },
  {
    id: 'green',
    name: 'ירוק זית',
    hex: '#16a34a',
    bgClass: 'bg-emerald-600',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-400'
  },
  {
    id: 'navy',
    name: 'כחול עמוק',
    hex: '#1d4ed8',
    bgClass: 'bg-indigo-600',
    borderClass: 'border-indigo-500',
    textClass: 'text-indigo-400'
  },
  {
    id: 'crimson',
    name: 'בורדו פלדה',
    hex: '#991b1b',
    bgClass: 'bg-rose-700',
    borderClass: 'border-rose-600',
    textClass: 'text-rose-400'
  }
];

export const AI_BOT_NAMES = [
  { name: 'גנרל ברק', title: 'אסטרטג שדה' },
  { name: 'קולונל אש', title: 'מפקד שריון' },
  { name: 'פילדמרשל נץ', title: 'מומחה מבצעים' },
  { name: 'סגן מפקד סער', title: 'טקטיקן בזק' },
  { name: 'אלוף גולן', title: 'מפקד חזית' }
];
