import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import pg from "pg";

const { Pool } = pg;

dotenv.config();

const DB_FILE = path.join(process.cwd(), "db.json");

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

// Local JSON Fallback Handling
function initDB(): DB {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const db = JSON.parse(data) as DB;
      // Ensure hutech student exists in the database
      const hasHutech = db.users.some(u => u.email.toLowerCase() === 'hutech_sv@algolearn.vn');
      if (!hasHutech) {
        const hutechUser = INITIAL_USERS.find(u => u.email.toLowerCase() === 'hutech_sv@algolearn.vn');
        if (hutechUser) {
          db.users.push(hutechUser);
          fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
        }
      }
      return db;
    } catch (e) {
      console.error("Failed to parse db.json, recreating...", e);
    }
  }

  const defaultDB: DB = {
    users: INITIAL_USERS,
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
      `);
    } catch (migrationsErr: any) {
      console.warn("Could not execute inline ALTER TABLE syllabus migrations (might be due to restricted public schema permissions or columns already exist):", migrationsErr.message || migrationsErr);
    }

    // Bootstrap Users Seeding
    try {
      const userCountRes = await client.query("SELECT COUNT(*) FROM users");
      if (parseInt(userCountRes.rows[0].count, 10) === 0) {
        console.log("Seeding initial users into PostgreSQL...");
        for (const u of INITIAL_USERS) {
          await client.query(
            `INSERT INTO users (id, name, email, school, avatar, xp, solved, streak, created_at, is_admin, password)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [u.id, u.name, u.email, u.school, u.avatar, u.xp, u.solved, u.streak, u.createdAt, u.isAdmin, u.password]
          );
        }
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
        [id, user.name, emailQuery, user.school, user.avatar, 0, 0, 1, createdAt, isAdmin, user.password]
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
    password: user.password
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
        const row = res.rows[0];
        if (row.password === password) {
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
      console.error("PG login user error, fallback to local:", e);
    }
  }
  const currentDb = initDB();
  const found = currentDb.users.find(u => u.email.toLowerCase() === emailQuery && u.password === password);
  return found || null;
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
    res.json({ message: "Syllabus reset to default!", syllabus: updated });
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
    // Exclude password field for general inquiries
    const usersWithoutPassword = users.map(({ password, ...u }) => u);
    res.json(usersWithoutPassword);
  });

  // API Route - Update user role (Admin only)
  app.post("/api/users/update-role", async (req, res) => {
    const { userId, role } = req.body;
    const updatedUser = await updateDBUserRole(userId, role);
    if (updatedUser) {
      res.json({ message: "User role updated!", user: updatedUser });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // API Route - Delete user (Admin only)
  app.post("/api/users/delete", async (req, res) => {
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

    const { password: _, ...userResponse } = newUser;
    res.json({ user: userResponse, message: "Register success!" });
  });

  // API Route - User Auth Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const matchedUser = await loginDBUser(email, password);
    if (matchedUser) {
      const { password: _, ...userResponse } = matchedUser;
      res.json({ user: userResponse, message: "Login success!" });
    } else {
      res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu! Vui lòng kiểm tra kỹ." });
    }
  });

  // API Route - Update profile / XP / Streak
  app.post("/api/auth/update-profile", async (req, res) => {
    const { userId, xp, solved, streak } = req.body;

    const updatedUser = await updateDBProfile(userId, xp, solved, streak);
    if (updatedUser) {
      res.json({ user: updatedUser, message: "Profile updated on server!" });
    } else {
      res.status(404).json({ error: "User not found on database" });
    }
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

  // API routes first
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history, context } = req.body;
      const client = getGeminiClient();
      if (!client) {
        // Fallback response if API key is missing, so the app is always highly functional
        return res.json({
          text: `[Chế độ Offline] Chào bạn! Vì chưa kết nối API Key Gemini, tôi sẽ trả lời tự động dựa trên bài học. Hãy hỏi tôi về Quick Sort hay thuật toán bất kỳ nhé!\n\nVề câu hỏi: "${message}", thuật toán chia để trị (Divide and Conquer) này hoạt động bằng cách chọn một phần tử chốt (pivot), phân chia mảng thành các phần tử nhỏ hơn và lớn hơn chốt, sau đó đệ quy sắp xếp các mảng con.`
        });
      }

      const contents = [];
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
