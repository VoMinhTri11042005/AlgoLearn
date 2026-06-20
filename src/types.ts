export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface AppUser {
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
  password?: string; // stored credentials for full-stack client-side authentication flow
}

export interface CodeFile {
  name: string;
  content: string;
  language: string;
  isOpen: boolean;
  isActive: boolean;
}

export interface LeaderboardEntry {
  id?: string;
  rank: number;
  name: string;
  school: string;
  xp: number;
  solved: number;
  avatar: string;
  badge?: string;
  isSelf?: boolean;
  elo?: number;
  games?: number;
  wins?: number;
  losses?: number;
}

export interface TestcaseResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  runtime: string;
}

export interface AlgorithmicStep {
  array: number[];
  highlights: {
    pivot?: number;
    low?: number;
    high?: number;
    swapping?: [number, number];
    active?: number;
  };
  description: string;
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  code?: string;
  category: 'general' | 'algorithm' | 'complexity' | 'snippet';
  updatedAt: string;
}
