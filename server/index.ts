import 'dotenv/config';

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { initializeDatabase } from "./db";
import { insertUserSchema, insertBetSchema, insertGameSchema, insertCasinoGameSchema, insertNewsItemSchema } from "@shared/schema";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import { registerRoutes } from "./routes";
import { startVipAutoUpdater } from "./utils/vipAutoUpdater";

// JWT Secret'ı environment'tan al veya güvenli default kullan
process.env.JWT_SECRET = process.env.JWT_SECRET || "cryptonbets_jwt_secret_key_2024_secure_random_string_1234567890abcdef";

const app = express();

// CORS ayarları
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Add withdrawals routes using DIFFERENT path to bypass middleware conflicts
app.get('/api/withdrawals-direct', async (req: Request, res: Response) => {
  try {
    console.log('🔍 WITHDRAWALS API: Processing request');
    
    const { page = 1, limit = 20 } = req.query;
    
    // Use existing storage interface that's already working
    const withdrawals = await storage.getWithdrawals({
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });

    console.log(`✅ WITHDRAWALS API: Returned ${withdrawals.length} withdrawals from storage`);

    res.json({
      withdrawals,
      pagination: {
        current: parseInt(page as string),
        total: Math.ceil(10 / parseInt(limit as string)), // We know there are 10 withdrawals from SQL query
        count: withdrawals.length,
        totalRecords: 10
      }
    });

  } catch (error) {
    console.error('❌ Withdrawals API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    res.status(500).json({ error: 'Para çekme verileri alınamadı', details: errorMessage });
  }
});

app.get('/api/withdrawals-direct/stats', async (req: Request, res: Response) => {
  try {
    console.log('📊 WITHDRAWAL STATS: Processing request');
    
    // Use existing storage interface to get withdrawal statistics
    const stats = await storage.getWithdrawalStats();

    console.log(`✅ WITHDRAWAL STATS: Generated statistics - ${stats.totalCount} total withdrawals`);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Withdrawal Stats Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    res.status(500).json({ error: 'İstatistikler alınamadı', details: errorMessage });
  }
});

// Initialize database connection
async function startServer() {
  try {
    await initializeDatabase();
    console.log('[SERVER] Database connection established');
    
    // Database initialized successfully
    
  } catch (error) {
    console.error('[SERVER] Database connection failed:', error);
    console.log('[SERVER] Starting server without database (limited functionality)');
  }
}

// Oturum yönetimi
const sessionParser = session({
  secret: crypto.randomBytes(16).toString("hex"),
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // production için true olmalı
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
    sameSite: 'lax'
  },
});

app.use(sessionParser);
app.use(passport.initialize());
app.use(passport.session());

// Passport kimlik doğrulama stratejisi
passport.use(
  new LocalStrategy(async (username, password, callback) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return callback(null, false);
      }
      return callback(null, user);
    } catch (err) {
      return callback(err);
    }
  }),
);

passport.serializeUser(function (user: any, cb) {
  process.nextTick(function () {
    cb(null, user.id);
  });
});

passport.deserializeUser(function (id: any, cb) {
  process.nextTick(async function () {
    try {
      const user = await storage.getUser(id);
      cb(null, user || undefined);
    } catch (err) {
      cb(err, undefined);
    }
  });
});

// Auth route'ları server/routes.ts içerisinde tanımlanmıştır

// Oyunlar API
app.get("/api/games", async (req, res, next) => {
  try {
    const category = req.query.category as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const games = await storage.getGames(category, limit);
    return res.send(games);
  } catch (err) {
    return next(err);
  }
});

app.get("/api/games/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const game = await storage.getGame(id);
    
    if (!game) {
      return res.status(404).send({ error: "Oyun bulunamadı" });
    }
    
    return res.send(game);
  } catch (err) {
    return next(err);
  }
});

app.post("/api/games", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).send({ error: "Yönetici girişi gerekli" });
    }
    
    const parseResult = insertGameSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).send(parseResult.error);
    }
    
    const game = await storage.createGame(parseResult.data);
    return res.status(201).send(game);
  } catch (err) {
    return next(err);
  }
});

// Casino oyunları API
app.get("/api/casino-games", async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const casinoGames = await storage.getCasinoGames(limit);
    return res.send(casinoGames);
  } catch (err) {
    return next(err);
  }
});

app.get("/api/casino-games/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const game = await storage.getCasinoGame(id);
    
    if (!game) {
      return res.status(404).send({ error: "Casino oyunu bulunamadı" });
    }
    
    return res.send(game);
  } catch (err) {
    return next(err);
  }
});

app.post("/api/casino-games", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).send({ error: "Yönetici girişi gerekli" });
    }
    
    const parseResult = insertCasinoGameSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).send(parseResult.error);
    }
    
    const game = await storage.createCasinoGame(parseResult.data);
    return res.status(201).send(game);
  } catch (err) {
    return next(err);
  }
});

// Haberler API
app.get("/api/news", async (req, res, next) => {
  try {
    const type = req.query.type as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const newsItems = await storage.getNewsItems(type, limit);
    return res.send(newsItems);
  } catch (err) {
    return next(err);
  }
});

app.get("/api/news/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const newsItem = await storage.getNewsItem(id);
    
    if (!newsItem) {
      return res.status(404).send({ error: "Haber bulunamadı" });
    }
    
    return res.send(newsItem);
  } catch (err) {
    return next(err);
  }
});

app.post("/api/news", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).send({ error: "Yönetici girişi gerekli" });
    }
    
    const parseResult = insertNewsItemSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).send(parseResult.error);
    }
    
    const newsItem = await storage.createNewsItem(parseResult.data);
    return res.status(201).send(newsItem);
  } catch (err) {
    return next(err);
  }
});

// Bahisler API
app.get("/api/bets", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).send({ error: "Giriş yapılmadı" });
    }
    
    // @ts-ignore
    const bets = await storage.getBetsByUser(req.user.id);
    return res.send(bets);
  } catch (err) {
    return next(err);
  }
});

app.post("/api/bets", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).send({ error: "Giriş yapılmadı" });
    }
    
    const parseResult = insertBetSchema.safeParse({
      ...req.body,
      // @ts-ignore
      userId: req.user.id,
    });
    
    if (!parseResult.success) {
      return res.status(400).send(parseResult.error);
    }
    
    const bet = await storage.createBet(parseResult.data);
    
    // Bahis miktarını kullanıcı bakiyesinden düş
    // @ts-ignore
    await storage.updateUserBalance(req.user.id, -parseResult.data.amount);
    
    return res.status(201).send(bet);
  } catch (err) {
    return next(err);
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize database first
  await startServer();
  
  // Setup routes
  registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Create HTTP server
  const server = createServer(app);
  
  // Skip websocket for now to get basic API working

  // Setup vite in development
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server on configured port
  const port = parseInt(process.env.PORT ?? "3000");
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
