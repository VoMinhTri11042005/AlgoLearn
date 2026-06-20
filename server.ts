import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import pg from "pg";
import cookieParser from "cookie-parser";
import session from "express-session";
import bcrypt from "bcryptjs";
import { exec } from "child_process";

// Session typing for TypeScript
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
  }
}

const { Pool } = pg;



dotenv.config();

const DB_FILE = path.join(process.cwd(), "db.json");

interface DailyHistoryItem {
  id: string;
  user_id: string;
  user_name: string;
  user_school?: string;
  user_avatar?: string;
  date: string; // YYYY-MM-DD
  completed: number;
  createdAt: string; // ISO
}

interface DBUser {

  id: string;
  name: string;
  email: string;
  school: string;
  avatar: string;
  xp: number;
  solved: number;
  streak: number;
  createdAt: string;
  isAdmin: boolean;
  password?: string;
}

interface Lesson {
  id: string;
  title: string;
  progress: number;
  active: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
  markdownContent?: string;
  codeSnippet?: string;
}

interface DB {
  users: DBUser[];
  syllabus: Lesson[];
  // Arena 1v1 (MVP, local fallback)
  arena_queue?: string[]; // userIds waiting
  arena_matches?: ArenaMatch[];
  arena_ratings?: ArenaRating[]; // elo per user
}

type ArenaMatchStatus = 'waiting' | 'running' | 'finished';

interface ArenaMatch {
  id: string;
  createdAt: string;
  status: ArenaMatchStatus;
  playerId: string;
  opponentId: string | null;
  opponentAssignedAt?: string;
  submittedBy?: 'player' | 'opponent';
  finishedAt?: string;
  winnerId?: string;
  // MVP scoring: victory/defeat only (no real testcase runner yet)
  playerResult?: 'victory' | 'defeat';
  opponentResult?: 'victory' | 'defeat';
  // store a snapshot for leaderboard/debug
  eloBefore?: { player: number; opponent: number };
  eloAfter?: { player: number; opponent: number };
  playerPassCount?: number;
  opponentPassCount?: number;
  isOpponentBot?: boolean;
}

interface ArenaRating {
  userId: string;
  elo: number;
  games: number;
  wins: number;
  losses: number;
  updatedAt: string;
}


const DEFAULT_SYLLABUS: Lesson[] = [
  { id: '1', title: 'Bài 1: Tổng quan về Thuật toán & Big O', progress: 100, active: false, difficulty: 'easy' },
  { id: '2', title: 'Bài 2: Mảng & Danh sách liên kết', progress: 100, active: false, difficulty: 'easy' },
  { id: '3', title: 'Bài 3: Cấu trúc Đệ quy & Quy hoạch động', progress: 80, active: false, difficulty: 'hard' },
  { id: '4', title: 'Bài 4: Thuật toán Sắp xếp cơ bản', progress: 100, active: false, difficulty: 'easy' },
  { id: '5', title: 'Bài 5: Thuật toán Quick Sort', progress: 0, active: true, difficulty: 'medium' },
  { id: '6', title: 'Bài 6: Sắp xếp trộn Merge Sort', progress: 0, active: false, difficulty: 'medium' },
  { id: '7', title: 'Bài 7: Tìm kiếm theo Chiều rộng (BFS)', progress: 0, active: false, difficulty: 'medium' },
];

const INITIAL_USERS: DBUser[] = [
  {
    id: 'admin-id-default',
    name: 'Đại Ca Admin',
    email: 'admin@algolearn.vn',
    school: 'Hệ Thống Trực Tuyến AlgoLearn',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    xp: 99999,
    solved: 500,
    streak: 100,
    createdAt: new Date().toISOString(),
    isAdmin: true,
    // NOTE: passwords in INITIAL_USERS are kept plaintext only for initial development seeding.
    // They will be hashed before insertion.
    password: 'admin123'
  },
  {
    id: 'felix',
    name: "Felix Nguyễn",
    email: "felix@algolearn.vn",
    school: "Đại học Bách Khoa Hà Nội (HUST)",
    xp: 24900,
    solved: 142,
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
    streak: 88,
    createdAt: new Date().toISOString(),
    isAdmin: false,
    password: 'user123'
  },
  {
    id: 'sarah',
    name: "Sarah Trần",
    email: "sarah@algolearn.vn",
    school: "ĐH Công nghệ thông tin - ĐHQG-HCM",
    xp: 22100,
    solved: 121,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    streak: 64,
    createdAt: new Date().toISOString(),
    isAdmin: false,
    password: 'user123'
  },
  {
    id: 'alex',
    name: "Alex Lê",
    email: "alex@algolearn.vn",
    school: "ĐH Công nghệ - ĐHQGHN (UET)",
    xp: 19850,
    solved: 98,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    streak: 45,
    createdAt: new Date().toISOString(),
    isAdmin: false,
    password: 'user123'
  },
  {
    id: 'minh-duc',
    name: "Phạm Minh Đức",
    email: "minhduc@algolearn.vn",
    school: "Đại học FPT",
    xp: 17200,
    solved: 85,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    streak: 30,
    createdAt: new Date().toISOString(),
    isAdmin: false,
    password: 'user123'
  },
  {
    id: 'khanh-linh',
    name: "Vũ Khánh Linh",
    email: "khanhlinh@algolearn.vn",
    school: "Bách Khoa Đà Nẵng (DUT)",
    xp: 16800,
    solved: 84,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80",
    streak: 28,
    createdAt: new Date().toISOString(),
    isAdmin: false,
    password: 'user123'
  },
  {
    id: 'duy-nam',
    name: "Hoàng Duy Nam",
    email: "duynam@algolearn.vn",
    school: "Học viện Bưu chính Viễn thông (PTIT)",
    xp: 15950,
    solved: 77,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    streak: 21,
    createdAt: new Date().toISOString(),
    isAdmin: false,
    password: 'user123'
  },
  {
    id: 'bao-long',
    name: "Trần Bảo Long",
    email: "baolong@algolearn.vn",
    school: "ĐH Sư Phạm Kỹ Thuật TPHCM (HCMUTE)",
    xp: 14600,
    solved: 71,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    streak: 18,
    createdAt: new Date().toISOString(),
    isAdmin: false,
    password: 'user123'
  },
  {
    id: 'hutech-sv-default',
    name: "Sinh Viên HUTECH",
    email: "hutech_sv@algolearn.vn",
    school: "Đại học Công nghệ TP.HCM (HUTECH)",
    xp: 12500,
    solved: 55,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    streak: 5,
    createdAt: new Date().toISOString(),
    isAdmin: false,
    password: 'hutech123'
  }
];

function isBcryptHash(value?: string): boolean {
  return !!value && (value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$'));
}

function publicUser(user: DBUser) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function usersForClient(users: DBUser[]) {
  return users.map(u => ({
    ...publicUser(u),
    role: u.isAdmin ? 'admin' : 'user',
  }));
}

function hashSeedUsers(users: DBUser[]): DBUser[] {
  return users.map(user => ({
    ...user,
    password: isBcryptHash(user.password) ? user.password : bcrypt.hashSync(user.password || '', 10),
  }));
}

// Local JSON Fallback Handling
function initDB(): DB {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const db = JSON.parse(data) as DB;
      let changed = false;
      // Ensure hutech student exists in the database
      const hasHutech = db.users.some(u => u.email.toLowerCase() === 'hutech_sv@algolearn.vn');
      if (!hasHutech) {
        const hutechUser = INITIAL_USERS.find(u => u.email.toLowerCase() === 'hutech_sv@algolearn.vn');
        if (hutechUser) {
          db.users.push({
            ...hutechUser,
            password: bcrypt.hashSync(hutechUser.password || '', 10),
          });
          changed = true;
        }
      }
      for (const user of db.users) {
        if (user.password && !isBcryptHash(user.password)) {
          user.password = bcrypt.hashSync(user.password, 10);
          changed = true;
        }
      }
      if (!Array.isArray((db as any).daily_history)) {
        (db as any).daily_history = [];
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
      }
      return db;
    } catch (e) {
      console.error("Failed to parse db.json, recreating...", e);
    }
  }

  const defaultDB: DB = {
    users: hashSeedUsers(INITIAL_USERS),
    syllabus: DEFAULT_SYLLABUS
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), "utf-8");
  return defaultDB;
}

function saveDB(db: DB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save db.json", e);
  }
}

// PostgreSQL State Management
let dbPool: pg.Pool | null = null;
let usePostgres = false;
let postgresStatus = "Coordinating...";
let postgresErrorMsg: string | null = null;

async function connectPostgres(connectionString?: string): Promise<boolean> {
  const url = connectionString || process.env.DATABASE_URL;
  const sqlHost = process.env.SQL_HOST;
  const sqlUser = process.env.SQL_USER;
  const sqlPassword = process.env.SQL_PASSWORD;
  const sqlDatabase = process.env.SQL_DB_NAME;

  // We are fully eligible if either Cloud SQL environment variables or a direct string is set.
  if (!url && !sqlHost) {
    usePostgres = false;
    postgresStatus = "Chưa kết nối (Đang chạy Chế độ Local - db.json)";
    return false;
  }

  try {
    if (dbPool) {
      await dbPool.end();
    }

    if (sqlHost && sqlUser && sqlPassword && sqlDatabase) {
      // Connect to Cloud SQL using the secure Object Method for configuring pg Pool
      dbPool = new Pool({
        host: sqlHost,
        user: sqlUser,
        password: sqlPassword,
        database: sqlDatabase,
        connectionTimeoutMillis: 15000,
      });
    } else if (url) {
      // Direct connection string fallback
      dbPool = new Pool({
        connectionString: url,
        ssl: url.includes("localhost") || url.includes("127.0.0.1") ? false : { rejectUnauthorized: false }
      });
    } else {
      usePostgres = false;
      postgresStatus = "Không đủ cấu hình kết nối!";
      return false;
    }

    dbPool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL connection client:', err);
    });

    const client = await dbPool.connect();
    client.on('error', (err) => {
      console.error('Database client error during startup/queries:', err);
    });
    postgresStatus = "Đã kết nối PostgreSQL thành công!";
    postgresErrorMsg = null;
    usePostgres = true;
    console.log("PostgreSQL Connected!");

    // Create Tables
    const checkTableExists = async (tableName: string): Promise<boolean> => {
      try {
        const res = await client.query(
          `SELECT EXISTS (
             SELECT FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = $1
           )`,
          [tableName]
        );
        return res.rows[0]?.exists === true;
      } catch (err) {
        console.warn(`Error checking existence of table ${tableName}:`, err);
        return false;
      }
    };

    const hasUsersTable = await checkTableExists('users');
    if (!hasUsersTable) {
      console.log("Table 'users' not found. Attempting to create...");
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            school VARCHAR(255),
            avatar VARCHAR(500),
            xp INTEGER NOT NULL DEFAULT 0,
            solved INTEGER NOT NULL DEFAULT 0,
            streak INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            is_admin BOOLEAN NOT NULL DEFAULT FALSE,
            password VARCHAR(255) NOT NULL
          );
        `);
        console.log("Table 'users' created successfully.");
      } catch (creationErr: any) {
        console.error("Failed to create 'users' table (possibly due to restricted public schema permissions):", creationErr.message || creationErr);
      }
    } else {
      console.log("Table 'users' already exists. Skipping creation.");
    }

    const hasSyllabusTable = await checkTableExists('syllabus');
    if (!hasSyllabusTable) {
      console.log("Table 'syllabus' not found. Attempting to create...");
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS syllabus (
            id VARCHAR(100) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            progress INTEGER NOT NULL DEFAULT 0,
            active BOOLEAN NOT NULL DEFAULT FALSE,
            difficulty VARCHAR(20) DEFAULT 'easy',
            topic VARCHAR(255) DEFAULT '',
            markdown_content TEXT DEFAULT '',
            code_snippet TEXT DEFAULT ''
          );
        `);
        console.log("Table 'syllabus' created successfully.");
      } catch (creationErr: any) {
        console.error("Failed to create 'syllabus' table (possibly due to restricted public schema permissions):", creationErr.message || creationErr);
      }
    } else {
      console.log("Table 'syllabus' already exists. Skipping creation.");
    }

    // Safe inline migrations for existing databases
    try {
      await client.query(`
        ALTER TABLE syllabus ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'easy';
        ALTER TABLE syllabus ADD COLUMN IF NOT EXISTS topic VARCHAR(255) DEFAULT '';
        ALTER TABLE syllabus ADD COLUMN IF NOT EXISTS markdown_content TEXT DEFAULT '';
        ALTER TABLE syllabus ADD COLUMN IF NOT EXISTS code_snippet TEXT DEFAULT '';

        CREATE TABLE IF NOT EXISTS daily_history (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          user_name VARCHAR(255) NOT NULL,
          user_school VARCHAR(255),
          user_avatar VARCHAR(500),
          "date" VARCHAR(10) NOT NULL,
          completed INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE (user_id, "date")
        );

        CREATE INDEX IF NOT EXISTS daily_history_date_idx ON daily_history ("date");
        CREATE INDEX IF NOT EXISTS daily_history_user_idx ON daily_history (user_id);
      `);
    } catch (migrationsErr: any) {
      console.warn("Could not execute inline ALTER TABLE syllabus migrations (might be due to restricted public schema permissions or columns already exist):", migrationsErr.message || migrationsErr);
    }

    // Bootstrap Users Seeding + ensure bcrypt hashes (rehash plaintext seeds if needed)

    try {
      const userCountRes = await client.query("SELECT COUNT(*) FROM users");
      if (parseInt(userCountRes.rows[0].count, 10) === 0) {
        console.log("Seeding initial users into PostgreSQL...");
        for (const u of INITIAL_USERS) {
          // INITIAL_USERS may contain plaintext password for seeding/dev.
          // Always store bcrypt hash into DB.
          const hashed = await bcrypt.hash(u.password || '', 10);
          await client.query(
            `INSERT INTO users (id, name, email, school, avatar, xp, solved, streak, created_at, is_admin, password)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [u.id, u.name, u.email, u.school, u.avatar, u.xp, u.solved, u.streak, u.createdAt, u.isAdmin, hashed]
          );
        }
      }

      // Rehash any plaintext passwords that might already exist in old DBs.
      // Plaintext rows will not start with $2a$/$2b$/$2y$.
      // NOTE: we can only safely rehash rows for users whose expected plaintext is known in INITIAL_USERS.
      const existingUsers = await client.query(
        "SELECT id, email, password FROM users"
      );

      for (const row of existingUsers.rows as any[]) {
        const id = row.id as string;
        const stored = (row.password || '') as string;
        const isBcrypt = stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$');
        if (isBcrypt) continue;

        const seedUser = INITIAL_USERS.find(u => u.id === id || u.email.toLowerCase() === String(row.email || '').toLowerCase());
        if (!seedUser || !seedUser.password) continue;

        const newHash = await bcrypt.hash(seedUser.password, 10);
        await client.query("UPDATE users SET password = $1 WHERE id = $2", [newHash, id]);
      }
    } catch (seedErr: any) {
      console.warn("Could not query or seed users table (perhaps table creation failed):", seedErr.message || seedErr);
    }


    // Bootstrap Syllabus Seeding
    try {
      const syllabusCountRes = await client.query("SELECT COUNT(*) FROM syllabus");
      if (parseInt(syllabusCountRes.rows[0].count, 10) === 0) {
        console.log("Seeding initial syllabus into PostgreSQL...");
        for (const s of DEFAULT_SYLLABUS) {
          await client.query(
            `INSERT INTO syllabus (id, title, progress, active, difficulty, topic, markdown_content, code_snippet)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              s.id, 
              s.title, 
              s.progress, 
              s.active, 
              s.difficulty || 'easy', 
              s.topic || '', 
              s.markdownContent || '', 
              s.codeSnippet || ''
            ]
          );
        }
      }
    } catch (seedErr: any) {
      console.warn("Could not query or seed syllabus table (perhaps table creation failed):", seedErr.message || seedErr);
    }

    client.release();
    return true;
  } catch (error: any) {
    console.error("PostgreSQL Connection Setup Failed:", error);
    postgresStatus = "Không thể kết nối!";
    postgresErrorMsg = error.message || String(error);
    usePostgres = false;
    dbPool = null;
    return false;
  }
}

// Unified Database Operation Wrappers
async function getDBSyllabus(): Promise<Lesson[]> {
  if (usePostgres && dbPool) {
    try {
      const res = await dbPool.query("SELECT id, title, progress, active, difficulty, topic, markdown_content, code_snippet FROM syllabus ORDER BY id");
      return res.rows.map(row => ({
        id: row.id,
        title: row.title,
        progress: row.progress,
        active: row.active,
        difficulty: row.difficulty,
        topic: row.topic,
        markdownContent: row.markdown_content,
        codeSnippet: row.code_snippet
      }));
    } catch (e) {
      console.error("PG Query error for syllabus, fallback to local:", e);
    }
  }
  const currentDb = initDB();
  return currentDb.syllabus;
}

async function saveDBSyllabus(syllabus: Lesson[]): Promise<Lesson[]> {
  if (usePostgres && dbPool) {
    try {
      const client = await dbPool.connect();
      client.on('error', (err) => {
        console.error('Database client error inside saveDBSyllabus:', err);
      });
      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM syllabus");
        for (const s of syllabus) {
          await client.query(
            "INSERT INTO syllabus (id, title, progress, active, difficulty, topic, markdown_content, code_snippet) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            [
              s.id, 
              s.title, 
              s.progress, 
              s.active, 
              s.difficulty || 'easy', 
              s.topic || '', 
              s.markdownContent || '', 
              s.codeSnippet || ''
            ]
          );
        }
        await client.query("COMMIT");
        const res = await client.query("SELECT id, title, progress, active, difficulty, topic, markdown_content, code_snippet FROM syllabus ORDER BY id");
        client.release();
        return res.rows.map(row => ({
          id: row.id,
          title: row.title,
          progress: row.progress,
          active: row.active,
          difficulty: row.difficulty,
          topic: row.topic,
          markdownContent: row.markdown_content,
          codeSnippet: row.code_snippet
        }));
      } catch (err) {
        await client.query("ROLLBACK");
        client.release();
        throw err;
      }
    } catch (e) {
      console.error("PG update error for syllabus, fallback to local:", e);
    }
  }
  const currentDb = initDB();
  currentDb.syllabus = syllabus;
  saveDB(currentDb);
  return currentDb.syllabus;
}

async function resetDBSyllabus(): Promise<Lesson[]> {
  if (usePostgres && dbPool) {
    try {
      await dbPool.query("DELETE FROM syllabus");
      for (const s of DEFAULT_SYLLABUS) {
        await dbPool.query(
          "INSERT INTO syllabus (id, title, progress, active, difficulty, topic, markdown_content, code_snippet) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [
            s.id, 
            s.title, 
            s.progress, 
            s.active, 
            s.difficulty || 'easy', 
            s.topic || '', 
            s.markdownContent || '', 
            s.codeSnippet || ''
          ]
        );
      }
      const res = await dbPool.query("SELECT id, title, progress, active, difficulty, topic, markdown_content, code_snippet FROM syllabus ORDER BY id");
      return res.rows.map(row => ({
        id: row.id,
        title: row.title,
        progress: row.progress,
        active: row.active,
        difficulty: row.difficulty,
        topic: row.topic,
        markdownContent: row.markdown_content,
        codeSnippet: row.code_snippet
      }));
    } catch (e) {
      console.error("PG reset error, fallback to local:", e);
    }
  }
  const currentDb = initDB();
  currentDb.syllabus = DEFAULT_SYLLABUS;
  saveDB(currentDb);
  return currentDb.syllabus;
}

async function getDBUsers(): Promise<DBUser[]> {
  if (usePostgres && dbPool) {
    try {
      const res = await dbPool.query("SELECT id, name, email, school, avatar, xp, solved, streak, created_at, is_admin, password FROM users");
      return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        school: row.school,
        avatar: row.avatar,
        xp: row.xp,
        solved: row.solved,
        streak: row.streak,
        createdAt: row.created_at,
        isAdmin: row.is_admin,
        password: row.password
      }));
    } catch (e) {
      console.error("PG Query error for users, fallback to local:", e);
    }
  }
  const currentDb = initDB();
  return currentDb.users;
}

async function resetDBUsers(): Promise<DBUser[]> {
  if (usePostgres && dbPool) {
    try {
      await dbPool.query("DELETE FROM users");
      for (const u of INITIAL_USERS) {
        const hashed = isBcryptHash(u.password) ? u.password : await bcrypt.hash(u.password || '', 10);
        await dbPool.query(
          `INSERT INTO users (id, name, email, school, avatar, xp, solved, streak, created_at, is_admin, password)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [u.id, u.name, u.email, u.school, u.avatar, u.xp, u.solved, u.streak, u.createdAt, u.isAdmin, hashed]
        );
      }
      const res = await dbPool.query("SELECT id, name, email, school, avatar, xp, solved, streak, created_at, is_admin, password FROM users");
      return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        school: row.school,
        avatar: row.avatar,
        xp: row.xp,
        solved: row.solved,
        streak: row.streak,
        createdAt: row.created_at,
        isAdmin: row.is_admin,
        password: row.password
      }));
    } catch (e) {
      console.error("PG Reset users error, fallback to local:", e);
    }
  }
  const currentDb = initDB();
  currentDb.users = hashSeedUsers(JSON.parse(JSON.stringify(INITIAL_USERS)));
  saveDB(currentDb);
  return currentDb.users;
}

async function updateDBUserRole(userId: string, role: string): Promise<DBUser | null> {
  const isAdmin = role === 'admin';
  if (usePostgres && dbPool) {
    try {
      const res = await dbPool.query(
        "UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING id, name, email, school, avatar, xp, solved, streak, created_at, is_admin",
        [isAdmin, userId]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          name: row.name,
          email: row.email,
          school: row.school,
          avatar: row.avatar,
          xp: row.xp,
          solved: row.solved,
          streak: row.streak,
          createdAt: row.created_at,
          isAdmin: row.is_admin
        };
      }
    } catch (e) {
      console.error("PG update user role error, fallback to local:", e);
    }
  }
  const currentDb = initDB();
  const idx = currentDb.users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    currentDb.users[idx].isAdmin = isAdmin;
    saveDB(currentDb);
    return currentDb.users[idx];
  }
  return null;
}

async function deleteDBUser(userId: string): Promise<boolean> {
  if (usePostgres && dbPool) {
    try {
      await dbPool.query("DELETE FROM users WHERE id = $1", [userId]);
      return true;
    } catch (e) {
      console.error("PG delete user error, fallback to local:", e);
    }
  }
  const currentDb = initDB();
  currentDb.users = currentDb.users.filter(u => u.id !== userId);
  saveDB(currentDb);
  return true;
}

async function registerDBUser(user: Omit<DBUser, "id" | "createdAt" | "isAdmin" | "xp" | "solved" | "streak">): Promise<DBUser | null> {
  const id = "usr_" + Math.random().toString(36).substring(2, 11);
  const emailQuery = user.email.trim().toLowerCase();
  const isAdmin = emailQuery === 'admin@algolearn.vn';
  const createdAt = new Date().toISOString();

  const hashed = isBcryptHash(user.password) ? user.password : await bcrypt.hash(user.password, 10);

  // SECURITY: register luôn lưu bcrypt hash.
  // NOTE: MVP fix auth for local db.json: db.json có thể chứa legacy plaintext.
  // Nếu user.password là plaintext (không bắt đầu bằng $2a/$2b/$2y) thì hash lại để login dùng bcrypt.compare.
  const isBcrypt = (user.password || '').startsWith('$2a$') || (user.password || '').startsWith('$2b$') || (user.password || '').startsWith('$2y$');
  const hashedNormalized = isBcrypt ? user.password : await bcrypt.hash(user.password, 10);






  if (usePostgres && dbPool) {
    try {
      const check = await dbPool.query("SELECT id FROM users WHERE email = $1", [emailQuery]);
      if (check.rows.length > 0) {
        return null;
      }
      const res = await dbPool.query(
        `INSERT INTO users (id, name, email, school, avatar, xp, solved, streak, created_at, is_admin, password)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, name, email, school, avatar, xp, solved, streak, created_at, is_admin`,
        [id, user.name, emailQuery, user.school, user.avatar, 0, 0, 1, createdAt, isAdmin, hashed]
      );

      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          name: row.name,
          email: row.email,
          school: row.school,
          avatar: row.avatar,
          xp: row.xp,
          solved: row.solved,
          streak: row.streak,
          createdAt: row.created_at,
          isAdmin: row.is_admin
        };
      }
    } catch (e) {
      console.error("PG register user error, fallback to local:", e);
    }
  }

  const currentDb = initDB();
  if (currentDb.users.some(u => u.email.toLowerCase() === emailQuery)) {
    return null;
  }
  const newUser: DBUser = {
    id,
    name: user.name,
    email: emailQuery,
    school: user.school,
    avatar: user.avatar,
    xp: 0,
    solved: 0,
    streak: 1,
    createdAt,
    isAdmin,
    password: hashed
  };

  currentDb.users.push(newUser);
  saveDB(currentDb);
  return newUser;
}

async function loginDBUser(email: string, password: string): Promise<DBUser | null> {
  const emailQuery = email.trim().toLowerCase();
  if (usePostgres && dbPool) {
    try {
      const res = await dbPool.query(
        "SELECT id, name, email, school, avatar, xp, solved, streak, created_at, is_admin, password FROM users WHERE email = $1",
        [emailQuery]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0] as any;
        const stored: string = row.password;

        const isBcrypt = stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$');
        const isMatch = isBcrypt
          ? await bcrypt.compare(password, stored)
          : stored === password;



        if (!isMatch) return null;

        return {
          id: row.id,
          name: row.name,
          email: row.email,
          school: row.school,
          avatar: row.avatar,
          xp: row.xp,
          solved: row.solved,
          streak: row.streak,
          createdAt: row.created_at,
          isAdmin: row.is_admin
        };
      }
    } catch (e) {
      console.error("PG login user error, fallback to local:", e);
    }
  }

  const currentDb = initDB();
  const found = currentDb.users.find(u => u.email.toLowerCase() === emailQuery);
  if (!found) return null;

  const stored: string = found.password || '';
  const looksBcrypt = stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$');

  // MVP compatibility: db.json có thể chứa plaintext password.
  // - nếu stored là bcrypt -> bcrypt.compare
  // - nếu stored là plaintext -> so sánh thẳng
  const isMatch = looksBcrypt
    ? await bcrypt.compare(password, stored)
    : stored === password;

  return isMatch ? found : null;

}


async function updateDBProfile(userId: string, xp?: number, solved?: number, streak?: number): Promise<DBUser | null> {
  if (usePostgres && dbPool) {
    try {
      let queryStr = "UPDATE users SET ";
      const params = [];
      const clauses = [];
      let paramCount = 1;

      if (typeof xp === "number") {
        clauses.push(`xp = $${paramCount++}`);
        params.push(xp);
      }
      if (typeof solved === "number") {
        clauses.push(`solved = $${paramCount++}`);
        params.push(solved);
      }
      if (typeof streak === "number") {
        clauses.push(`streak = $${paramCount++}`);
        params.push(streak);
      }

      if (clauses.length > 0) {
        queryStr += clauses.join(", ") + ` WHERE id = $${paramCount} RETURNING id, name, email, school, avatar, xp, solved, streak, created_at, is_admin`;
        params.push(userId);
        const res = await dbPool.query(queryStr, params);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            name: row.name,
            email: row.email,
            school: row.school,
            avatar: row.avatar,
            xp: row.xp,
            solved: row.solved,
            streak: row.streak,
            createdAt: row.created_at,
            isAdmin: row.is_admin
          };
        }
      }
    } catch (e) {
      console.error("PG update profile error, fallback to local:", e);
    }
  }
  const currentDb = initDB();
  const idx = currentDb.users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    if (typeof xp === "number") currentDb.users[idx].xp = xp;
    if (typeof solved === "number") currentDb.users[idx].solved = solved;
    if (typeof streak === "number") currentDb.users[idx].streak = streak;
    saveDB(currentDb);
    return currentDb.users[idx];
  }
  return null;
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Trust first proxy (Render, Heroku, etc.) so secure cookies work behind HTTPS reverse proxy
  app.set('trust proxy', 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev_session_secret_change_me',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  // Very small auth helpers (session-based)
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.session?.userId) return next();
    return res.status(401).json({ error: 'Unauthorized' });
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.session?.isAdmin) return next();
    return res.status(403).json({ error: 'Admin only' });
  };


  // Connect PostgreSQL status on startup
  await connectPostgres();

  // Initialize Gemini client (lazy initialization / safe from empty key errors)
  let ai: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY is not defined. AI features will fallback to preset responses.");
        return null;
      }
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return ai;
  }

  // PostgreSQL Status API
  app.get("/api/postgres/status", (req, res) => {
    res.json({
      usePostgres,
      status: postgresStatus,
      error: postgresErrorMsg,
      hasEnvUrl: !!process.env.DATABASE_URL
    });
  });

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "online" });
  });

  // Hot configure connection string API
  app.post("/api/postgres/configure", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Vui lòng nhập đường dẫn kết nối PostgreSQL URL (DATABASE_URL)." });
    }
    const success = await connectPostgres(url);
    if (success) {
      res.json({ success: true, message: "Kết nối PostgreSQL thành công!", status: postgresStatus });
    } else {
      res.status(400).json({ success: false, error: postgresErrorMsg || "Không thể kết nối đến PostgreSQL với đường dẫn đã cung cấp." });
    }
  });

  // Disconnect Postgres API
  app.post("/api/postgres/disconnect", async (req, res) => {
    usePostgres = false;
    if (dbPool) {
      await dbPool.end();
      dbPool = null;
    }
    postgresStatus = "Chưa kết nối (Đang chạy Chế độ Local - db.json)";
    res.json({ success: true, message: "Đã hủy kết nối PostgreSQL, quay về Chế độ Local.", status: postgresStatus });
  });

  // API Route - Syllabus list
  app.get("/api/syllabus", async (req, res) => {
    const list = await getDBSyllabus();
    res.json(list);
  });

  // API Route - Edit/Add syllabus list (Admin only)
  app.post("/api/syllabus", async (req, res) => {
    const { syllabus } = req.body;
    if (Array.isArray(syllabus)) {
      const updated = await saveDBSyllabus(syllabus);
      res.json({ message: "Syllabus updated successfully!", syllabus: updated });
    } else {
      res.status(400).json({ error: "Syllabus must be an array" });
    }
  });

  // API Route - Reset syllabus list (Admin only)
  app.post("/api/syllabus/reset", async (req, res) => {
    const updated = await resetDBSyllabus();
    const users = await resetDBUsers();
    res.json({ status: "success", syllabus: updated, users: usersForClient(users) });
  });

  // API Route - Set active lesson
  app.post("/api/syllabus/active", async (req, res) => {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Lesson ID is required" });
    }
    const list = await getDBSyllabus();
    const updated = list.map(item => ({
      ...item,
      active: item.id === id
    }));
    const saved = await saveDBSyllabus(updated);
    res.json({ message: "Active lesson updated successfully!", syllabus: saved });
  });

  // API Route - Users List (For admin dashboard or leaderboard compilation)
  app.get("/api/users", async (req, res) => {
    const users = await getDBUsers();
    res.json(usersForClient(users));
  });

  // API Route - Update user role (Admin only)
  app.post("/api/users/update-role", requireAdmin, async (req, res) => {
    const { userId, role } = req.body;
    const updatedUser = await updateDBUserRole(userId, role);

    if (updatedUser) {
      const users = await getDBUsers();
      res.json({
        status: "success",
        users: usersForClient(users),
        user: { ...publicUser(updatedUser), role: updatedUser.isAdmin ? 'admin' : 'user' },
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // API Route - Delete user (Admin only)
  app.post("/api/users/delete", requireAdmin, async (req, res) => {
    const { userId } = req.body;

    await deleteDBUser(userId);
    res.json({ message: "User removed successfully!" });
  });

  // API Route - User Auth Register
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, school, avatar, password } = req.body;

    if (!name || !email || !school || !password) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const newUser = await registerDBUser({ name, email, school, avatar, password });
    if (!newUser) {
      return res.status(400).json({ error: "Địa chỉ email này đã được sử dụng rồi!" });
    }

    req.session.userId = newUser.id;
    req.session.isAdmin = newUser.isAdmin;
    res.json({ user: publicUser(newUser), message: "Register success!" });
  });

  // API Route - User Auth Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    // DEBUG (dev only): helps diagnose why local login fails
    const debug = process.env.NODE_ENV !== 'production';



    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    if (debug) {
      console.log('[DEBUG login]', { email: String(email), passwordProvided: typeof password, passwordLen: String(password || '').length });
    }

    const matchedUser = await loginDBUser(email, password);
    if (debug) {
      console.log('[DEBUG login result]', { matched: !!matchedUser, matchedId: matchedUser?.id });
    }

    if (matchedUser) {

      req.session.userId = matchedUser.id;
      req.session.isAdmin = matchedUser.isAdmin;

      res.json({ user: publicUser(matchedUser), message: "Login success!" });
    } else {

      res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu! Vui lòng kiểm tra kỹ." });
    }
  });

  // API Route - User Auth Status (Get current logged in user from session)
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const users = await getDBUsers();
    const matchedUser = users.find(u => u.id === req.session.userId);
    if (matchedUser) {
      res.json({ user: publicUser(matchedUser) });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // API Route - Update profile / XP / Streak
  app.post("/api/auth/update-profile", requireAuth, async (req, res) => {
    const { userId, xp, solved, streak } = req.body;

    if (req.session?.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedUser = await updateDBProfile(userId, xp, solved, streak);
    if (updatedUser) {
      res.json({ user: publicUser(updatedUser), message: "Profile updated on server!" });
    } else {
      res.status(404).json({ error: "User not found on database" });
    }
  });

  // API Route - Record Daily leaderboard (completed lessons count)
  // POST /api/leaderboard/daily/record { userId, date?: YYYY-MM-DD, completed: number }
  app.post("/api/leaderboard/daily/record", requireAuth, async (req, res) => {
    const { userId, completed } = req.body || {};
    const dateRaw = typeof req.body?.date === 'string' ? req.body.date : undefined;

    if (!userId || typeof completed !== 'number') {
      return res.status(400).json({ error: "userId and completed are required" });
    }

    const date = dateRaw || new Date().toISOString().slice(0, 10);

    // Anti-cheat: if userId doesn't match session userId -> forbid
    if (req.session?.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const completedSafe = Math.max(0, Math.floor(completed));

    if (usePostgres && dbPool) {
      try {
        const pgRes = await dbPool.query(
          `INSERT INTO daily_history (id, user_id, user_name, user_school, user_avatar, "date", completed)
           SELECT $1, u.id, u.name, u.school, u.avatar, $2, $3
           FROM users u
           WHERE u.id = $4
           ON CONFLICT (user_id, "date")
           DO UPDATE SET completed = EXCLUDED.completed, user_name = EXCLUDED.user_name, user_school = EXCLUDED.user_school, user_avatar = EXCLUDED.user_avatar`,
          [
            `dh_${userId}_${date}_${Date.now()}`,
            date,
            completedSafe,
            userId,
          ]
        );

        return res.json({ status: 'success' });
      } catch (e) {
        console.error('PG record daily_history error:', e);
        return res.status(500).json({ error: 'Failed to record daily history' });
      }
    }

    // Local db.json path
    const currentDbAny = initDB() as any;
    if (!Array.isArray(currentDbAny.daily_history)) currentDbAny.daily_history = [];

    const existingIdx = currentDbAny.daily_history.findIndex((it: any) => it.user_id === userId && it.date === date);

    // Find user info for snapshot
    const user = currentDbAny.users?.find((u: any) => u.id === userId);

    const item = {
      id: `dh_${userId}_${date}_${Date.now()}`,
      user_id: userId,
      user_name: user?.name || 'Unknown',
      user_school: user?.school || '',
      user_avatar: user?.avatar || '',
      date,
      completed: completedSafe,
      createdAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      currentDbAny.daily_history[existingIdx] = { ...currentDbAny.daily_history[existingIdx], ...item };
    } else {
      currentDbAny.daily_history.push(item);
    }

    saveDB(currentDbAny);
    return res.json({ status: 'success' });
  });

  // API Route - Daily Leaderboard compilation

  // GET /api/leaderboard/daily?date=YYYY-MM-DD
  app.get("/api/leaderboard/daily", async (req, res) => {
    const qDateRaw = typeof req.query.date === 'string' ? req.query.date : undefined;
    const date = qDateRaw || new Date().toISOString().slice(0, 10);

    // Postgres path
    if (usePostgres && dbPool) {
      try {
        const pgRes = await dbPool.query(
          `SELECT user_id, user_name, user_school, user_avatar, completed
           FROM daily_history
           WHERE "date" = $1
           ORDER BY completed DESC, user_name ASC
           LIMIT 100`,
          [date]
        );

        const rows = pgRes.rows as any[];
        const entries = rows.map((r, idx) => {
          const completed = Number(r.completed || 0);

          let badge = "Hành giả tập sự";
          if (completed >= 6) badge = "Đại Cao Thủ";
          else if (completed >= 4) badge = "Cao Thủ";
          else if (completed >= 2) badge = "Trưởng lão thuật";

          return {
            id: r.user_id,
            rank: idx + 1,
            name: r.user_name,
            school: r.user_school,
            xp: completed, // UI daily only needs completed; keep xp field for compatibility
            solved: completed,
            streak: 0,
            avatar: r.user_avatar,
            badge,
            isAdmin: false
          };
        });

        return res.json(entries);
      } catch (e) {
        console.error("PG daily leaderboard error, fallback to local:", e);
      }
    }

    // Local db.json path
    const currentDbAny = initDB() as any;
    const daily = Array.isArray(currentDbAny.daily_history) ? currentDbAny.daily_history : [];

    const filtered = daily
      .filter((it: any) => it && it.date === date)
      .map((it: any) => ({
        id: it.user_id,
        user_id: it.user_id,
        name: it.user_name,
        school: it.user_school,
        avatar: it.user_avatar,
        completed: Number(it.completed || 0),
      }));

    filtered.sort((a: any, b: any) => b.completed - a.completed || String(a.name).localeCompare(String(b.name)));

    const entries = filtered.slice(0, 100).map((u: any, idx: number) => {
      const completed = Number(u.completed || 0);
      let badge = "Hành giả tập sự";
      if (completed >= 6) badge = "Đại Cao Thủ";
      else if (completed >= 4) badge = "Cao Thủ";
      else if (completed >= 2) badge = "Trưởng lão thuật";

      return {
        id: u.id,
        rank: idx + 1,
        name: u.name,
        school: u.school,
        xp: completed,
        solved: completed,
        streak: 0,
        avatar: u.avatar,
        badge,
        isAdmin: false
      };
    });

    res.json(entries);
  });

  // API Route - Dynamic Leaderboard compilation
  app.get("/api/leaderboard", async (req, res) => {
    const users = await getDBUsers();

    // Sort all users by XP descending
    const sortedUsers = [...users].sort((a, b) => b.xp - a.xp);

    // Build rankings list
    const entries = sortedUsers.map((u, index) => {
      // Establish dynamic visual badge title
      let badge = "Hành giả tập sự";
      if (u.xp >= 20000) badge = "Đại Cao Thủ";
      else if (u.xp >= 15000) badge = "Cao Thủ";
      else if (u.xp >= 10000) badge = "Trưởng lão thuật";

      return {
        id: u.id,
        rank: index + 1,
        name: u.name,
        school: u.school,
        xp: u.xp,
        solved: u.solved,
        streak: u.streak,
        avatar: u.avatar,
        badge: badge,
        isAdmin: u.isAdmin
      };
    });

    res.json(entries);
  });


  // =============================
  // Arena 1v1 MVP (queue + match + Elo, local fallback)
  // =============================

  const runPythonSandbox = (code: string): Promise<{ passedCount: number; totalCount: number; results: any[]; logs: string[] }> => {
    return new Promise((resolve) => {
      const tempDir = path.join(process.cwd(), 'temp_arena');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      const tempFileName = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.py`;
      const tempFilePath = path.join(tempDir, tempFileName);

      // Python test harness code to append
      const harness = `
# Ensure TreeNode and Solution exist
try:
    TreeNode
except NameError:
    class TreeNode:
        def __init__(self, val=0, left=None, right=None):
            self.val = val
            self.left = left
            self.right = right

# Serializer & Deserializer
def deserialize(lst):
    if not lst:
        return None
    root = TreeNode(lst[0])
    queue = [root]
    i = 1
    while queue and i < len(lst):
        curr = queue.pop(0)
        if curr is not None:
            if i < len(lst) and lst[i] is not None:
                curr.left = TreeNode(lst[i])
                queue.append(curr.left)
            else:
                curr.left = None
                queue.append(None)
            i += 1
            if i < len(lst) and lst[i] is not None:
                curr.right = TreeNode(lst[i])
                queue.append(curr.right)
            else:
                curr.right = None
                queue.append(None)
            i += 1
    return root

def serialize(root):
    if not root:
        return []
    result = []
    queue = [root]
    while any(queue):
        curr = queue.pop(0)
        if curr:
            result.append(curr.val)
            queue.append(curr.left)
            queue.append(curr.right)
        else:
            result.append(None)
    while result and result[-1] is None:
        result.pop()
    return result

import json
import sys

# Test cases
testcases = [
    ([], []),
    ([1], [1]),
    ([2, 1, 3], [2, 3, 1]),
    ([4, 2, 7, 1, 3, 6, 9], [4, 7, 2, 9, 6, 3, 1]),
    ([1, 2, None, 3, None, 4], [1, None, 2, None, 3, None, 4])
]

try:
    sol = Solution()
    results = []
    passed_count = 0
    for idx, (inp, exp) in enumerate(testcases):
        try:
            root = deserialize(inp)
            res_tree = sol.invertTree(root)
            out = serialize(res_tree)
            passed = out == exp
            if passed:
                passed_count += 1
            results.append({
                "testcase": idx + 1,
                "passed": passed,
                "input": inp,
                "expected": exp,
                "actual": out
            })
        except Exception as e:
            results.append({
                "testcase": idx + 1,
                "passed": False,
                "input": inp,
                "expected": exp,
                "actual": "Error: " + str(e)
            })
    print(json.dumps({"passed_count": passed_count, "total": len(testcases), "results": results}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

      const fullCode = code + '\n' + harness;
      fs.writeFileSync(tempFilePath, fullCode, 'utf8');

      const cmd = `python "${tempFilePath}"`;
      exec(cmd, { timeout: 3000 }, (error: any, stdout: string, stderr: string) => {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {
          // ignore
        }

        const logs: string[] = [
          "⚙️ Kết nối máy chủ chấm bài Sandbox Server...",
        ];

        if (error && error.killed) {
          logs.push("❌ Quá thời gian thực thi (Timeout 3s). Có thể có vòng lặp vô hạn!");
          return resolve({
            passedCount: 0,
            totalCount: 5,
            results: [],
            logs
          });
        }

        if (stderr) {
          logs.push("❌ Runtime Error / Syntax Error:");
          logs.push(stderr);
          return resolve({
            passedCount: 0,
            totalCount: 5,
            results: [],
            logs
          });
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          if (parsed.error) {
            logs.push(`❌ Lỗi khởi tạo: ${parsed.error}`);
            return resolve({
              passedCount: 0,
              totalCount: 5,
              results: [],
              logs
            });
          }

          const results = parsed.results || [];
          for (const res of results) {
            if (res.passed) {
              logs.push(`⚙️ Đang chạy thử nghiệm Testcase #${res.testcase} (Đầu vào: ${JSON.stringify(res.input)}) -> PASSED`);
            } else {
              logs.push(`⚙️ Đang chạy thử nghiệm Testcase #${res.testcase} (Đầu vào: ${JSON.stringify(res.input)}) -> FAILED`);
              logs.push(`   - Kỳ vọng: ${JSON.stringify(res.expected)}`);
              logs.push(`   - Thực tế: ${JSON.stringify(res.actual)}`);
            }
          }

          if (parsed.passed_count === parsed.total) {
            logs.push("✔️ TẤT CẢ 5/5 TESTCASES ĐỀU KHỚP KẾT QUẢ ĐẦU RA!");
            logs.push("=================== THI ĐẤU HOÀN TẤT ===================");
          } else {
            logs.push(`❌ Kết quả: ${parsed.passed_count}/${parsed.total} testcases vượt qua.`);
          }

          resolve({
            passedCount: parsed.passed_count,
            totalCount: parsed.total,
            results,
            logs
          });
        } catch (e) {
          logs.push("❌ Không thể phân tích kết quả đầu ra của chương trình.");
          logs.push(stdout);
          resolve({
            passedCount: 0,
            totalCount: 5,
            results: [],
            logs
          });
        }
      });
    });
  };

  const getArenaStateLocal = () => {
    const dbAny: any = initDB() as any;
    if (!Array.isArray(dbAny.arena_queue)) dbAny.arena_queue = [];
    if (!Array.isArray(dbAny.arena_matches)) dbAny.arena_matches = [];
    if (!Array.isArray(dbAny.arena_ratings)) dbAny.arena_ratings = [];
    return dbAny;
  };

  const getArenaRatingFromState = (dbAny: any, userId: string): ArenaRating => {
    const existing = (dbAny.arena_ratings as ArenaRating[]).find(r => r.userId === userId);
    if (existing) return existing;

    const now = new Date().toISOString();
    const created: ArenaRating = {
      userId,
      elo: 1200,
      games: 0,
      wins: 0,
      losses: 0,
      updatedAt: now,
    };
    dbAny.arena_ratings.push(created);
    return created;
  };

  const persistArenaLocal = (dbAny: any) => saveDB(dbAny as any);

  const queueJoinTimes: Record<string, number> = {};

  const ensureMatchOpponentPairing = (dbAny: any) => {
    // Pair FIFO for MVP, but avoid pairing same user.
    const queue = dbAny.arena_queue as string[];
    // Remove duplicates while preserving order
    const seen = new Set<string>();
    const deduped = queue.filter((u: string) => {
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    });
    dbAny.arena_queue = deduped;

    // First pair real players
    while (deduped.length >= 2) {
      const playerId = deduped.shift() as string;
      const opponentId = deduped.shift() as string;

      const match: ArenaMatch = {
        id: `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        status: 'running',
        playerId,
        opponentId,
        opponentAssignedAt: new Date().toISOString(),
        playerPassCount: 0,
        opponentPassCount: 0,
        isOpponentBot: false,
      };

      (dbAny.arena_matches as ArenaMatch[]).push(match);
      delete queueJoinTimes[playerId];
      delete queueJoinTimes[opponentId];
    }

    // Check if the remaining single player has been waiting for >= 5s
    if (deduped.length === 1) {
      const playerId = deduped[0];
      const joinedAt = queueJoinTimes[playerId];
      if (joinedAt && Date.now() - joinedAt >= 5000) {
        const users = dbAny.users || [];
        const candidateBots = users.filter((u: any) => u.id !== playerId);
        const botOpponent = candidateBots.length > 0
          ? candidateBots[Math.floor(Math.random() * candidateBots.length)]
          : { id: 'bot_felix', name: 'Felix Bot', school: 'HUST', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80' };

        const match: ArenaMatch = {
          id: `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
          status: 'running',
          playerId,
          opponentId: botOpponent.id,
          opponentAssignedAt: new Date().toISOString(),
          playerPassCount: 0,
          opponentPassCount: 0,
          isOpponentBot: true,
        };

        (dbAny.arena_matches as ArenaMatch[]).push(match);
        deduped.shift(); // remove from queue
        delete queueJoinTimes[playerId];
      }
    }

    dbAny.arena_queue = deduped;
  };

  const eloUpdate = (playerElo: number, opponentElo: number, score: 1 | 0) => {
    // score=1 => player win, score=0 => player lose
    const K = 32;
    const expectedPlayer = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    const expectedOpponent = 1 / (1 + Math.pow(10, (playerElo - opponentElo) / 400));

    const newPlayer = playerElo + K * (score - expectedPlayer);
    const newOpponent = opponentElo + K * ((1 - score) - expectedOpponent);
    return {
      playerElo: Math.round(newPlayer),
      opponentElo: Math.round(newOpponent),
    };
  };

  // POST /api/arena/queue/join
  app.post('/api/arena/queue/join', requireAuth, async (req, res) => {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });
    if (req.session?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    // MVP: local fallback only
    const dbAny: any = getArenaStateLocal();

    // Already in running match?
    const existingRunning = (dbAny.arena_matches as ArenaMatch[]).find(
      (m: ArenaMatch) => m.status === 'running' && (m.playerId === userId || m.opponentId === userId)
    );
    if (existingRunning) {
      return res.json({ status: 'already-in-match', matchId: existingRunning.id });
    }

    if (!(dbAny.arena_queue as string[]).includes(userId)) {
      (dbAny.arena_queue as string[]).push(userId);
      queueJoinTimes[userId] = Date.now();
    }

    ensureMatchOpponentPairing(dbAny);
    persistArenaLocal(dbAny);

    // If pairing created immediately, return the newest match containing this user.
    const matched = (dbAny.arena_matches as ArenaMatch[]).find(
      (m: ArenaMatch) => m.status === 'running' && (m.playerId === userId || m.opponentId === userId)
    );

    return res.json({ status: 'queued', matchId: matched?.id || null });
  });

  // POST /api/arena/queue/leave
  app.post('/api/arena/queue/leave', requireAuth, async (req, res) => {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });
    if (req.session?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const dbAny: any = getArenaStateLocal();
    dbAny.arena_queue = (dbAny.arena_queue as string[]).filter((u: string) => u !== userId);
    delete queueJoinTimes[userId];
    persistArenaLocal(dbAny);

    return res.json({ status: 'left' });
  });

  // GET /api/arena/status
  app.get('/api/arena/status', requireAuth, async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const dbAny: any = getArenaStateLocal();
    ensureMatchOpponentPairing(dbAny);

    const runningMatch = (dbAny.arena_matches as ArenaMatch[]).find(
      (m: ArenaMatch) => m.status === 'running' && (m.playerId === userId || m.opponentId === userId)
    );

    if (runningMatch) {
      const opponentId = runningMatch.playerId === userId ? runningMatch.opponentId : runningMatch.playerId;
      const opponent = dbAny.users?.find((u: any) => u.id === opponentId) || null;
      const playerRating = getArenaRatingFromState(dbAny, runningMatch.playerId);
      const opponentRating = runningMatch.opponentId ? getArenaRatingFromState(dbAny, runningMatch.opponentId) : null;

      // Bot progress simulation: 1 testcase every ~18 seconds
      let botProgress = runningMatch.opponentPassCount || 0;
      if (runningMatch.isOpponentBot && runningMatch.status === 'running' && runningMatch.opponentAssignedAt) {
        const elapsed = (Date.now() - new Date(runningMatch.opponentAssignedAt).getTime()) / 1000;
        botProgress = Math.min(5, Math.floor(elapsed / 18));
        runningMatch.opponentPassCount = botProgress;

        // Bot auto-finishes at 5/5
        if (botProgress >= 5 && !runningMatch.winnerId) {
          const eloBefore = { player: playerRating.elo, opponent: opponentRating?.elo || 1200 };
          const updated = eloUpdate(playerRating.elo, opponentRating?.elo || 1200, 0);
          const now = new Date().toISOString();

          playerRating.elo = updated.playerElo;
          playerRating.games += 1;
          playerRating.losses += 1;
          playerRating.updatedAt = now;

          if (opponentRating) {
            opponentRating.elo = updated.opponentElo;
            opponentRating.games += 1;
            opponentRating.wins += 1;
            opponentRating.updatedAt = now;
          }

          runningMatch.status = 'finished';
          runningMatch.finishedAt = now;
          runningMatch.winnerId = runningMatch.opponentId;
          runningMatch.playerResult = 'defeat';
          runningMatch.opponentResult = 'victory';
          runningMatch.eloBefore = eloBefore;
          runningMatch.eloAfter = { player: updated.playerElo, opponent: updated.opponentElo };
        }
      }

      // Calculate time left based on match creation
      const matchCreatedMs = new Date(runningMatch.createdAt).getTime();
      const elapsedSec = Math.floor((Date.now() - matchCreatedMs) / 1000);
      const timeLeft = Math.max(0, 900 - elapsedSec); // 15 minute match

      persistArenaLocal(dbAny);

      return res.json({
        status: runningMatch.status === 'finished' ? 'finished' : 'running',
        matchId: runningMatch.id,
        opponent: opponent ? publicUser(opponent) : null,
        elo: {
          player: playerRating.elo,
          opponent: opponentRating?.elo || 1200,
        },
        timeLeftSeconds: timeLeft,
        progress: {
          player: runningMatch.playerPassCount || 0,
          opponent: runningMatch.opponentPassCount || 0,
          total: 5,
        },
        isOpponentBot: runningMatch.isOpponentBot || false,
        result: runningMatch.status === 'finished' ? { winnerId: runningMatch.winnerId, playerResult: runningMatch.playerResult, opponentResult: runningMatch.opponentResult } : null,
      });
    }

    const queued = (dbAny.arena_queue as string[]).includes(userId);
    const waitingSince = queueJoinTimes[userId] || null;
    persistArenaLocal(dbAny);

    return res.json({
      status: queued ? 'queued' : 'idle',
      matchId: null,
      opponent: null,
      waitingSince,
    });
  });

  // GET /api/arena/match/:matchId
  app.get('/api/arena/match/:matchId', requireAuth, async (req, res) => {
    const matchId = req.params.matchId;
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const dbAny: any = getArenaStateLocal();
    const match = (dbAny.arena_matches as ArenaMatch[]).find((m: ArenaMatch) => m.id === matchId);
    if (!match) return res.status(404).json({ error: 'match not found' });
    if (match.playerId !== userId && match.opponentId !== userId) return res.status(403).json({ error: 'Forbidden' });

    // Prepare opponent info
    const opponentId = match.playerId === userId ? match.opponentId : match.playerId;
    const opponent = dbAny.users?.find((u: any) => u.id === opponentId) || null;
    const playerRating = getArenaRatingFromState(dbAny, match.playerId);
    const opponentRating = match.opponentId ? getArenaRatingFromState(dbAny, match.opponentId) : null;

    // Bot progress simulation
    if (match.isOpponentBot && match.status === 'running' && match.opponentAssignedAt) {
      const elapsed = (Date.now() - new Date(match.opponentAssignedAt).getTime()) / 1000;
      const botProgress = Math.min(5, Math.floor(elapsed / 18));
      match.opponentPassCount = botProgress;

      // Bot auto-finishes at 5/5
      if (botProgress >= 5 && !match.winnerId) {
        const eloBefore = { player: playerRating.elo, opponent: opponentRating?.elo || 1200 };
        const updated = eloUpdate(playerRating.elo, opponentRating?.elo || 1200, 0);
        const now = new Date().toISOString();

        playerRating.elo = updated.playerElo;
        playerRating.games += 1;
        playerRating.losses += 1;
        playerRating.updatedAt = now;

        if (opponentRating) {
          opponentRating.elo = updated.opponentElo;
          opponentRating.games += 1;
          opponentRating.wins += 1;
          opponentRating.updatedAt = now;
        }

        match.status = 'finished';
        match.finishedAt = now;
        match.winnerId = match.opponentId;
        match.playerResult = 'defeat';
        match.opponentResult = 'victory';
        match.eloBefore = eloBefore;
        match.eloAfter = { player: updated.playerElo, opponent: updated.opponentElo };
      }
    }

    // Dynamic time left
    const matchCreatedMs = new Date(match.createdAt).getTime();
    const elapsedSec = Math.floor((Date.now() - matchCreatedMs) / 1000);
    const timeLeft = Math.max(0, 900 - elapsedSec);

    persistArenaLocal(dbAny);

    return res.json({
      matchId: match.id,
      status: match.status,
      opponent: match.opponentId && opponent ? publicUser(opponent) : null,
      timeLeftSeconds: timeLeft,
      elo: {
        player: playerRating.elo,
        opponent: opponentRating?.elo || 1200,
      },
      progress: {
        player: match.playerPassCount || 0,
        opponent: match.opponentPassCount || 0,
        total: 5,
      },
      isOpponentBot: match.isOpponentBot || false,
      result: match.status === 'finished' ? { winnerId: match.winnerId, playerResult: match.playerResult, opponentResult: match.opponentResult } : null,
    });
  });

  // POST /api/arena/match/:matchId/submit
  app.post('/api/arena/match/:matchId/submit', requireAuth, async (req, res) => {
    const matchId = req.params.matchId;
    const { code } = req.body || {};

    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const dbAny: any = getArenaStateLocal();
    const match = (dbAny.arena_matches as ArenaMatch[]).find((m: ArenaMatch) => m.id === matchId);
    if (!match) return res.status(404).json({ error: 'match not found' });
    if (match.status !== 'running') return res.status(400).json({ error: 'match not running' });
    if (match.playerId !== userId && match.opponentId !== userId) return res.status(403).json({ error: 'Forbidden' });

    // Anti repeat submit after a winner is determined
    if (match.winnerId) return res.json({ status: 'already-finished', winnerId: match.winnerId });

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ error: 'code is required' });
    }

    // Run through Python sandbox
    const sandboxResult = await runPythonSandbox(code);

    const isSenderPlayer = match.playerId === userId;
    // Update player pass count
    if (isSenderPlayer) {
      match.playerPassCount = sandboxResult.passedCount;
    } else {
      match.opponentPassCount = sandboxResult.passedCount;
    }

    // If not all tests passed, allow re-submission
    if (sandboxResult.passedCount < sandboxResult.totalCount) {
      persistArenaLocal(dbAny);
      return res.json({
        status: 'partial',
        passedCount: sandboxResult.passedCount,
        totalCount: sandboxResult.totalCount,
        logs: sandboxResult.logs,
        results: sandboxResult.results,
        progress: {
          player: match.playerPassCount || 0,
          opponent: match.opponentPassCount || 0,
          total: 5,
        },
      });
    }

    // All 5/5 passed → player wins this match
    const playerWins = isSenderPlayer;
    const playerResult: 'victory' | 'defeat' = playerWins ? 'victory' : 'defeat';
    const opponentResult: 'victory' | 'defeat' = playerWins ? 'defeat' : 'victory';

    const playerRating = getArenaRatingFromState(dbAny, match.playerId);
    const opponentRating = match.opponentId ? getArenaRatingFromState(dbAny, match.opponentId) : null;
    if (!match.opponentId || !opponentRating) return res.status(400).json({ error: 'opponent not assigned' });

    const eloBefore = { player: playerRating.elo, opponent: opponentRating.elo };
    const updated = eloUpdate(playerRating.elo, opponentRating.elo, playerWins ? 1 : 0);

    const now = new Date().toISOString();

    playerRating.elo = updated.playerElo;
    playerRating.games += 1;
    playerRating.wins += (playerWins ? 1 : 0);
    playerRating.losses += (playerWins ? 0 : 1);
    playerRating.updatedAt = now;

    opponentRating.elo = updated.opponentElo;
    opponentRating.games += 1;
    opponentRating.wins += (playerWins ? 0 : 1);
    opponentRating.losses += (playerWins ? 1 : 0);
    opponentRating.updatedAt = now;

    match.status = 'finished';
    match.finishedAt = now;
    match.winnerId = playerWins ? match.playerId : match.opponentId;
    match.playerResult = playerResult;
    match.opponentResult = opponentResult;
    match.submittedBy = isSenderPlayer ? 'player' : 'opponent';
    match.eloBefore = eloBefore;
    match.eloAfter = { player: updated.playerElo, opponent: updated.opponentElo };

    persistArenaLocal(dbAny);

    return res.json({
      status: 'ok',
      winnerId: match.winnerId,
      winnerIsPlayer: playerWins,
      eloBefore: match.eloBefore,
      eloAfter: match.eloAfter,
      rewardXp: playerWins ? 500 : 150,
      passedCount: sandboxResult.passedCount,
      totalCount: sandboxResult.totalCount,
      logs: sandboxResult.logs,
      results: sandboxResult.results,
    });
  });

  // GET /api/arena/leaderboard
  app.get('/api/arena/leaderboard', requireAuth, async (req, res) => {
    const dbAny: any = getArenaStateLocal();
    const ratings = Array.isArray(dbAny.arena_ratings) ? (dbAny.arena_ratings as ArenaRating[]) : [];

    // Ensure all users have a rating for consistent leaderboard
    const users: DBUser[] = dbAny.users || [];
    for (const u of users) {
      getArenaRatingFromState(dbAny, u.id);
    }
    persistArenaLocal(dbAny);

    const updatedRatings = (dbAny.arena_ratings as ArenaRating[]).slice();
    updatedRatings.sort((a, b) => b.elo - a.elo || (b.wins - b.losses) - (a.wins - a.losses));

    const entries = updatedRatings.slice(0, 50).map((r, idx) => {
      const user = users.find((u: any) => u.id === r.userId);
      let badge = 'Hành giả tập sự';
      if (r.elo >= 1700) badge = 'Đại Cao Thủ';
      else if (r.elo >= 1400) badge = 'Cao Thủ';
      else if (r.elo >= 1100) badge = 'Trưởng lão thuật';

      return {
        rank: idx + 1,
        id: r.userId,
        name: user?.name || r.userId,
        school: user?.school || '',
        xp: r.elo,
        solved: r.wins,
        avatar: user?.avatar || '',
        badge,
        elo: r.elo,
        games: r.games,
        wins: r.wins,
        losses: r.losses,
      };
    });

    res.json(entries);
  });

  // API routes first
  app.post("/api/gemini/chat", async (req, res) => {

    // NOTE: arena MVP endpoints are injected above.


    try {
      const { message, history, context } = req.body;
      const client = getGeminiClient();
      if (!client) {
        // Fallback response if API key is missing, so the app is always highly functional
        return res.json({
          text: `[Chế độ Offline] Chào bạn! Vì chưa kết nối API Key Gemini, tôi sẽ trả lời tự động dựa trên bài học. Hãy hỏi tôi về Quick Sort hay thuật toán bất kỳ nhé!\n\nVề câu hỏi: "${message}", thuật toán chia để trị (Divide and Conquer) này hoạt động bằng cách chọn một phần tử chốt (pivot), phân chia mảng thành các phần tử nhỏ hơn và lớn hơn chốt, sau đó đệ quy sắp xếp các mảng con.`
        });
      }

      // Help TS infer correct type for Gemini contents
      const contents: any[] = [];

      const systemInstruction = `You are "Algo AI", a friendly, highly intelligent Vietnamese AI Coding Assistant specialized in Data Structures and Algorithms (DSA) on the AlgoLearn interactive hub.
You help Vietnamese IT students master computer science algorithms with deep visual explanations, pseudocode, and optimal complex analysis (Big O).
Always reply in Vietnamese, with modern, encouraging, and clear markdown, using proper code blocks.
Context of Current Screen/Lesson: ${context || "Trang lý thuyết Quick Sort"}.`;

      // Structure format support
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error.message || "Something went wrong" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Render/production: never bind to loopback only. Must listen on 0.0.0.0.
  const rawHost = process.env.HOST || '0.0.0.0';
  const host = (rawHost === '127.0.0.1' || rawHost === 'localhost') ? '0.0.0.0' : rawHost;
  app.listen(PORT, host, () => {
    console.log(`Server running on http://${host}:${PORT}`);
  });

}

// Crash visibility helpers (so we can fix issues like "Server running" but port not actually open)
process.on('uncaughtException', (err) => {
  console.error('[FATAL] uncaughtException:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] unhandledRejection:', reason);
});


startServer().catch((err) => {
  console.error('[FATAL] startServer failed:', err);
});
