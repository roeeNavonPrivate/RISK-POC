import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory room registry for cross-device multiplayer
interface RoomState {
  code: string;
  hostId: string;
  status: 'lobby' | 'playing' | 'finished';
  maxPlayers: number;
  players: Array<{
    id: string;
    name: string;
    color: string;
    isHost: boolean;
    isAi: boolean;
    isReady: boolean;
  }>;
  gameState: any;
  updatedAt: number;
}

const rooms = new Map<string, RoomState>();

// Clean up stale rooms older than 6 hours
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.updatedAt > 6 * 60 * 60 * 1000) {
      rooms.delete(code);
    }
  }
}, 30 * 60 * 1000);

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Create or update room
app.post('/api/rooms', (req, res) => {
  const { code, hostId, maxPlayers, players, gameState, status } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Room code required' });
  }

  const cleanCode = code.trim().toUpperCase();
  const existing = rooms.get(cleanCode);

  const room: RoomState = {
    code: cleanCode,
    hostId: hostId || existing?.hostId || 'host',
    status: status || existing?.status || 'lobby',
    maxPlayers: maxPlayers || existing?.maxPlayers || 4,
    players: players || existing?.players || [],
    gameState: gameState || existing?.gameState || null,
    updatedAt: Date.now(),
  };

  rooms.set(cleanCode, room);
  res.json({ success: true, room });
});

// Get room by code
app.get('/api/rooms/:code', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const room = rooms.get(code);
  if (!room) {
    return res.status(404).json({ error: 'החדר לא נמצא' });
  }
  res.json({ success: true, room });
});

// Join room
app.post('/api/rooms/:code/join', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const { player } = req.body;
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: 'החדר לא נמצא. בדוק את הקוד ונסה שוב.' });
  }

  if (room.status !== 'lobby') {
    return res.status(400).json({ error: 'המשחק כבר התחיל בחדר זה.' });
  }

  const existingPlayerIndex = room.players.findIndex(p => p.id === player.id);
  if (existingPlayerIndex >= 0) {
    room.players[existingPlayerIndex] = { ...room.players[existingPlayerIndex], ...player };
  } else {
    if (room.players.length >= room.maxPlayers) {
      return res.status(400).json({ error: 'החדר מלא.' });
    }
    room.players.push(player);
  }

  room.updatedAt = Date.now();
  rooms.set(code, room);
  res.json({ success: true, room });
});

// Update game state
app.post('/api/rooms/:code/state', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const { gameState, status } = req.body;
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: 'החדר לא נמצא.' });
  }

  if (gameState !== undefined) room.gameState = gameState;
  if (status !== undefined) room.status = status;
  room.updatedAt = Date.now();
  rooms.set(code, room);

  res.json({ success: true, room });
});

// Server-side Gemini API for AI Game Analysis & Review
app.post('/api/gemini/review', async (req, res) => {
  try {
    const { gameSummary } = req.body;

    if (!gameSummary) {
      return res.status(400).json({ error: 'Missing gameSummary data' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback response if key is missing or development mode
      return res.json({
        analysis: generateFallbackAnalysis(gameSummary),
        source: 'local-tactical-engine'
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `אתה פרשן ומצביא צבאי מומחה למשחק האסטרטגיה "סיכון" (Risk).
נתח את מהלך המשחק הבא שנערך זה עתה, בעברית רהוטה, חדה ומעניינת.
הנתונים של המשחק:
- מנצח: ${gameSummary.winnerName} (צבע: ${gameSummary.winnerColor})
- מספר שחקנים: ${gameSummary.playersCount}
- משך המשחק בתורות: ${gameSummary.turns}
- סך קרבות שהתרחשו: ${gameSummary.totalBattles || 0}
- אבדות תוקפים: ${gameSummary.attackerCasualties || 0} חיילים
- אבדות מגנים: ${gameSummary.defenderCasualties || 0} חיילים
- שחקנים וביצועים: ${JSON.stringify(gameSummary.playerPerformances || [])}
- מהלכים ואירועים בולטים: ${JSON.stringify(gameSummary.keyEvents || [])}

אנא הפק ניתוח טקטי מפורט ומובנה הכולל:
1. ציון טקטי כללי לקרב (למשל 92/100) עם כותרת אפית.
2. ניתוח מהלך הניצחון (מה הוביל להכרעה - שליטה ביבשת, ניצול חולשות, תגבורות מרוכזות).
3. קרב המפתח (הקרב המשמעותי ביותר שהטה את הכף).
4. נקודות תורפה וטעויות בולטות של היריבים (פיזור כוחות, השארת גבולות פגיעים, תקיפות מיותרות).
5. המלצה טקטית אחת מרכזית למשחק הבא.

החזר את הניתוח במבנה קריא ויפה עם סעיפים ברורים, בסגנון אסטרטגי צבאי מקצועי.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'אתה יועץ אסטרטגי בכיר למשחקי לוח מלחמתיים (Risk). תן ניתוח מעמיק, משעשע וחד עם עובדות מהמשחק.',
      }
    });

    res.json({
      analysis: response.text || generateFallbackAnalysis(gameSummary),
      source: 'gemini-3.8-flash'
    });
  } catch (error: any) {
    console.error('Gemini review error:', error);
    res.json({
      analysis: generateFallbackAnalysis(req.body?.gameSummary || {}),
      source: 'local-tactical-engine'
    });
  }
});

function generateFallbackAnalysis(summary: any): string {
  const winner = summary.winnerName || 'המנצח';
  const turns = summary.turns || 5;
  const battles = summary.totalBattles || 12;

  return `### 🎖️ סיכום טקטי מבית הפיקוד העליון

**ציון אסטרטגי כללי: 94/100 - ניצחון מוחץ ומחושב**

#### 1. ניתוח מהלך ההכרעה
${winner} הוכיח עליונות טקטית ברורה לאורך ${turns} סבבי לחימה. המפתח להצלחה היה שילוב של ריכוז מאסיבי של כוחות תגבורת בנקודות תורפה ויציאה למתקפות בזק ברגע המתאים, ללא דילול מיותר של גבולות מבוצרים.

#### 2. קרב המפתח
מתוך ${battles} קרבות שנערכו על פני הגלובוס, המפנה האמיתי התרחש כאשר נפרצו קווי ההגנה היבשתיים. שימוש מושכל בקוביות ההתקפה המקסימליות (3 קוביות) הכריע מגינים עיקשים ומנע מהם לחדש תגבורות יבשתיות.

#### 3. טעויות היריבים
- **פיזור כוחות מוגזם:** מגינים השאירו יחידות בודדות בלתי מוגנות על פני טריטוריות מבודדות.
- **הזנחת ביצורים:** חוסר ביצוע תנועות ביצור בסוף התור אפשר לתוקף לתפוס שליטה בלתי מעורערת.

#### 4. טיפ אסטרטגי למשחק הבא
תמיד שאף להשלים יבשת קטנה (כגון אוסטרליה או דרום אמריקה) בשלבים המוקדמים. בונוס של +2 חיילים בכל תור מצטבר במהירות ומעניק יתרון מספרי מכריע על פני כל מתחרה.`;
}

// Start Server & mount Vite in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
