import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Search, ChevronRight, Swords, Award, Star, Zap, 
  GraduationCap, Sparkles, Flame, Target, Plus, Minus, CheckCircle, CalendarDays
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { LeaderboardEntry, AppUser } from '../types';

interface LeaderboardViewProps {
  onNavigate: (view: 'home' | 'theory' | 'ide' | 'arena' | 'leaderboard' | 'admin') => void;
  onSelectArenaSimulation: (resultType: 'victory' | 'defeat') => void;
  weeklyHistory?: { date: string; displayDate: string; count: number }[];
  dailyCompleted?: number;
  dailyGoal?: number;
  onManualIncrement?: () => void;
  onManualDecrement?: () => void;
  currentUser?: AppUser | null;
}

const getBadgeFromXp = (xp: number) => {
  if (xp >= 30000) return { name: 'Thách Đấu', color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/20', border: 'border-fuchsia-400/30' };
  if (xp >= 15000) return { name: 'Cao Thủ', color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400/30' };
  if (xp >= 5000) return { name: 'Kim Cương', color: 'text-cyan-400', bg: 'bg-cyan-400/20', border: 'border-cyan-400/30' };
  if (xp >= 2000) return { name: 'Bạch Kim', color: 'text-emerald-400', bg: 'bg-emerald-400/20', border: 'border-emerald-400/30' };
  if (xp >= 500) return { name: 'Vàng', color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400/30' };
  return { name: 'Tân Binh', color: 'text-gray-400', bg: 'bg-gray-400/20', border: 'border-gray-400/30' };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-xl shadow-xl font-sans text-left">
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Hôm: {payload[0].payload.displayDate}</p>
        <p className="text-indigo-400 text-xs font-extrabold mt-0.5">{payload[0].value} bài hoàn thành</p>
      </div>
    );
  }
  return null;
};

export default function LeaderboardView({ 
  onNavigate, 
  onSelectArenaSimulation,
  weeklyHistory = [],
  dailyCompleted = 0,
  dailyGoal = 2,
  onManualIncrement,
  onManualDecrement,
  currentUser
}: LeaderboardViewProps) {
  const [boardMode, setBoardMode] = useState<'xp' | 'arena'>('xp');
  const [filterType, setFilterType] = useState<'all' | 'weekly' | 'schools'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [arenaLeaders, setArenaLeaders] = useState<LeaderboardEntry[]>([]);
  const [dailyLeaders, setDailyLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [arenaLoading, setArenaLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(true);



  React.useEffect(() => {
    let active = true;
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (active && Array.isArray(data)) {
          setLeaders(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to load leaders:", err);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    let active = true;
    setArenaLoading(true);

    fetch('/api/arena/leaderboard', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (active && Array.isArray(data)) {
          setArenaLeaders(data);
          setArenaLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to load arena leaders:", err);
        setArenaLoading(false);
      });

    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    let active = true;
    const date = new Date().toISOString().slice(0, 10);
    setDailyLoading(true);

    fetch(`/api/leaderboard/daily?date=${encodeURIComponent(date)}`)
      .then(res => res.json())
      .then(data => {
        if (active && Array.isArray(data)) {
          setDailyLeaders(data);
          setDailyLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to load daily leaders:", err);
        setDailyLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);


  // Fallback default list if database is still loading or empty
  const defaultLeaders: LeaderboardEntry[] = [
    { rank: 1, name: "Felix Nguyễn", school: "Đại học Bách Khoa Hà Nội (HUST)", xp: 24900, solved: 142, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80", badge: "Đại Cao Thủ" },
    { rank: 2, name: "Sarah Trần", school: "ĐH Công nghệ thông tin - ĐHQG-HCM", xp: 22100, solved: 121, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80", badge: "Cao Thủ" },
    { rank: 3, name: "Alex Lê", school: "ĐH Công nghệ - ĐHQGHN (UET)", xp: 19850, solved: 98, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", badge: "Cao Thủ" },
    { rank: 4, name: "Phạm Minh Đức", school: "Đại học FPT", xp: 17200, solved: 85, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80", badge: "Hành giả tập sự" },
    { rank: 5, name: "Vũ Khánh Linh", school: "Bách Khoa Đà Nẵng (DUT)", xp: 16800, solved: 84, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80", badge: "Hành giả tập sự" },
    { rank: 6, name: "Hoàng Duy Nam", school: "Học viện Bưu chính Viễn thông (PTIT)", xp: 15950, solved: 77, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80", badge: "Hành giả tập sự" },
    { rank: 7, name: "Trần Bảo Long", school: "ĐH Sư Phạm Kỹ Thuật TPHCM (HCMUTE)", xp: 14600, solved: 71, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80", badge: "Hành giả tập sự" }
  ];

  const currentLeadersList = (leaders && leaders.length > 0) ? leaders : defaultLeaders;

  const defaultArenaLeaders: LeaderboardEntry[] = [
    { rank: 1, name: "Felix Nguyễn", school: "Đại học Bách Khoa Hà Nội (HUST)", xp: 1200, solved: 0, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80", badge: "Trưởng lão thuật", elo: 1200, games: 0, wins: 0, losses: 0 },
    { rank: 2, name: "Sarah Trần", school: "ĐH Công nghệ thông tin - ĐHQG-HCM", xp: 1200, solved: 0, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80", badge: "Trưởng lão thuật", elo: 1200, games: 0, wins: 0, losses: 0 },
  ];

  const currentArenaList = (arenaLeaders && arenaLeaders.length > 0) ? arenaLeaders : defaultArenaLeaders;
  const activeList = boardMode === 'arena' ? currentArenaList : currentLeadersList;

  // Map isSelf dynamically (authoritative by user id)
  const mappedLeadersList = activeList.map(leader => {
    const isSelf = currentUser ? leader.id === currentUser.id : false;
    return { ...leader, isSelf };
  });


  // Filter list
  const filteredLeaders = mappedLeadersList.filter(leader => {
    if (leader.isSelf) return false;

    const query = searchQuery.toLowerCase();
    const matchesQuery = leader.name.toLowerCase().includes(query) || leader.school.toLowerCase().includes(query);

    if (boardMode === 'arena') return matchesQuery;

    if (filterType === 'weekly') {
      return matchesQuery && leader.rank <= 5;
    }
    if (filterType === 'schools') {
      return matchesQuery && (leader.school.includes('HUST') || leader.school.includes('ĐHQG-HCM') || leader.school.includes('ĐHQGHN'));
    }
    return matchesQuery;
  });

  // Calculate top 3 dynamically (DAILY)
  const dailyFallback: LeaderboardEntry[] = [
    { rank: 1, name: "Felix Nguyễn", school: "Đại học Bách Khoa Hà Nội (HUST)", xp: dailyCompleted, solved: dailyCompleted, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80", badge: "Đại Cao Thủ" },
    { rank: 2, name: "Sarah Trần", school: "ĐH Công nghệ thông tin - ĐHQG-HCM", xp: Math.max(0, dailyCompleted - 1), solved: Math.max(0, dailyCompleted - 1), avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80", badge: "Cao Thủ" },
    { rank: 3, name: "Alex Lê", school: "ĐH Công nghệ - ĐHQGHN (UET)", xp: Math.max(0, dailyCompleted - 2), solved: Math.max(0, dailyCompleted - 2), avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", badge: "Trưởng lão thuật" },
  ];

  const dailyList = dailyLeaders && dailyLeaders.length > 0 ? dailyLeaders : dailyFallback;
  const top1User = dailyList.find(l => l.rank === 1) || dailyFallback[0];
  const top2User = dailyList.find(l => l.rank === 2) || dailyFallback[1];
  const top3User = dailyList.find(l => l.rank === 3) || dailyFallback[2];


  const selfEntry = mappedLeadersList.find(l => l.isSelf);
  const userRankIndex = selfEntry ? selfEntry.rank : (boardMode === 'arena' ? '—' : 14);
  const selfElo = selfEntry?.elo ?? selfEntry?.xp ?? 1200;

  return (
    <div id="leaderboard_container" className="min-h-[calc(100vh-4rem)] premium-app text-gray-200 font-sans flex flex-col pb-36 sm:pb-48 relative">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 w-full flex-1 flex flex-col space-y-10 text-left">
        
        {/* Leaderboard Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-900">
          <div>
            <div className="inline-flex items-center space-x-2 pill-badge rounded-full px-3 py-1 text-xs font-semibold mb-3">
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Sảnh vinh danh AlgoLearn</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {boardMode === 'arena' ? 'Bảng xếp hạng Arena 1v1' : 'Bảng xếp hạng Toàn quốc'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {boardMode === 'arena'
                ? 'Xếp hạng Elo từ các trận đối kháng thuật toán 1v1 trên AlgoLearn Arena.'
                : 'Nơi vinh danh những kỹ sư thuật toán xuất sắc nhất đến từ hơn 50 trường Đại học ngành CNTT.'}
            </p>
          </div>

          {/* Board mode tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 w-fit">
            {[
              { id: 'xp' as const, label: 'BẢNG XP', icon: Trophy },
              { id: 'arena' as const, label: 'ARENA 1V1 ELO', icon: Swords },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setBoardMode(t.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer select-none flex items-center space-x-1.5 ${
                  boardMode === t.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Quick simulation sandbox */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mr-1">Chạy thử Kỷ lục 1v1:</span>
            <button 
              onClick={() => onSelectArenaSimulation('victory')}
              className="bg-emerald-505/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer active:scale-95 transition flex items-center space-x-1 shadow-lg shadow-emerald-500/10"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Màn Thắng (Victory)</span>
            </button>
            <button 
              onClick={() => onSelectArenaSimulation('defeat')}
              className="bg-rose-505/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer active:scale-95 transition flex items-center space-x-1"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Màn Thua (Defeat)</span>
            </button>
          </div>
        </div>

        {/* TOP 3 PODIUM HERO GRAPHICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 relative items-end">
          
          {/* Rank 2 (Silver) - DAILY */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center text-center order-2 md:order-1 relative group mt-8"
          >

            {/* Rank badge */}
            <div className="absolute top-4 left-4 text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              RANK 2
            </div>

            {/* Glowing avatar frame */}
            <div className="relative w-20 h-20 mb-4">
              <div className="absolute inset-0 bg-slate-500/20 blur-xl rounded-full group-hover:bg-slate-500/40 transition"></div>
              <img 
                src={top2User.avatar} 
                alt={top2User.name} 
                className="w-full h-full rounded-full object-cover border-2 border-slate-400 relative z-10"
                referrerPolicy="no-referrer"
              />
            </div>

            <h3 className="font-extrabold text-white text-lg">{top2User.name}</h3>
            <p className="text-[11px] text-gray-500 flex items-center justify-center space-x-1 min-h-[32px] max-w-[200px] leading-tight">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500 print:hidden shrink-0" />
              <span className="truncate">{top2User.school}</span>
            </p>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 mt-4 w-full grid grid-cols-2 gap-2 text-xs">
              <div className="text-left">
                <p className="text-gray-500 text-[10px]">TỔNG ĐIỂM</p>
                <p className="font-extrabold text-slate-300 font-mono">{top2User.xp.toLocaleString()} XP</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-[10px]">ĐÃ GIẢI</p>
                <p className="font-extrabold text-[#3b82f6] font-mono">{top2User.solved} bài</p>
              </div>
            </div>

            <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-4">
              {top2User.badge || "Cao Thủ"}
            </span>
          </motion.div>

          {/* Rank 1 (Gold) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-8 flex flex-col items-center text-center order-1 md:order-2 relative shadow-2xl shadow-amber-500/5 group scale-105"
          >
            {/* Crown decoration icon */}
            <div className="absolute -top-6 translate-x-0 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 p-2.5 rounded-2xl shadow-lg border border-yellow-300 relative">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>

            <div className="absolute top-4 left-4 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              HẠNG 1 #GOLD
            </div>

            {/* Glowing avatar golden rings */}
            <div className="relative w-24 h-24 mb-4 mt-2">
              <div className="absolute inset-0 bg-amber-500/25 blur-2xl rounded-full group-hover:bg-amber-500/40 transition"></div>
              <img 
                src={top1User.avatar} 
                alt={top1User.name} 
                className="w-full h-full rounded-full object-cover border-4 border-amber-500 relative z-10"
                referrerPolicy="no-referrer"
              />
            </div>

            <h3 className="font-black text-white text-xl flex items-center space-x-1.5 justify-center">
              <span>{top1User.name}</span>
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
            </h3>
            <p className="text-xs text-gray-400 flex items-center justify-center space-x-1 min-h-[32px] leading-tight max-w-[200px]">
              <GraduationCap className="w-4 h-4 text-amber-500 print:hidden shrink-0" />
              <span className="truncate">{top1User.school}</span>
            </p>

            <div className="bg-slate-950 border border-amber-500/20 rounded-xl p-4 mt-4 w-full grid grid-cols-2 gap-2 text-xs">
              <div className="text-left">
                <p className="text-amber-500/60 text-[10px] font-bold">TỔNG ĐIỂM</p>
                <p className="font-extrabold text-amber-400 font-mono text-base">{top1User.xp.toLocaleString()} XP</p>
              </div>
              <div className="text-right">
                <p className="text-amber-500/60 text-[10px] font-bold">ĐÃ GIẢI</p>
                <p className="font-extrabold text-[#edf2f7] font-mono text-base">{top1User.solved} bài</p>
              </div>
            </div>

            <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full mt-5">
              {top1User.badge || "Đại Cao Thủ"}
            </span>
          </motion.div>

          {/* Rank 3 (Bronze) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center text-center order-3 relative group mt-8"
          >
            {/* Rank badge */}
            <div className="absolute top-4 left-4 text-xs font-mono font-bold text-amber-600 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              RANK 3
            </div>

            {/* Glowing avatar frame */}
            <div className="relative w-20 h-20 mb-4">
              <div className="absolute inset-0 bg-amber-700/10 blur-xl rounded-full group-hover:bg-amber-750/30 transition"></div>
              <img 
                src={top3User.avatar} 
                alt={top3User.name} 
                className="w-full h-full rounded-full object-cover border-2 border-amber-600 relative z-10"
                referrerPolicy="no-referrer"
              />
            </div>

            <h3 className="font-extrabold text-white text-lg">{top3User.name}</h3>
            <p className="text-[11px] text-gray-500 flex items-center justify-center space-x-1 min-h-[32px] max-w-[200px] leading-tight">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500 print:hidden shrink-0" />
              <span className="truncate">{top3User.school}</span>
            </p>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 mt-4 w-full grid grid-cols-2 gap-2 text-xs">
              <div className="text-left">
                <p className="text-gray-500 text-[10px]">TỔNG ĐIỂM</p>
                <p className="font-extrabold text-slate-300 font-mono">{top3User.xp.toLocaleString()} XP</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-[10px]">ĐÃ ĐỐI KHÁNG</p>
                <p className="font-extrabold text-[#3b82f6] font-mono">{top3User.solved} bài</p>
              </div>
            </div>

            <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-4">
              {top3User.badge || "Cao Thủ"}
            </span>
          </motion.div>

        </div>

        {/* RECHARTS WEEKLY PROGRESS HERO CARD */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative overflow-hidden">
          {/* Subtle glowing ambient lights background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 blur-3xl rounded-full"></div>

          {/* Left panel: statistics summary and controls */}
          <div className="lg:col-span-1 space-y-5 text-left z-10">
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 rounded-full px-2.5 py-1 text-xs font-semibold mb-2">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                <span>HIỆU SUẤT RÈN LUYỆN</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Thống kê 7 ngày qua</h2>
              <p className="text-xs text-gray-400 mt-1">Ghi nhận lượng bài học và thử thách thuật toán bạn đã hoàn thành hàng ngày.</p>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Tổng bài học</p>
                <p className="text-xl font-extrabold text-indigo-300 font-mono mt-0.5">
                  {weeklyHistory.reduce((sum, item) => sum + item.count, 0)} bài
                </p>
              </div>
              <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Cao nhất</p>
                <p className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
                  {Math.max(...weeklyHistory.map(item => item.count), 0)} bài
                </p>
              </div>
            </div>

            {/* Simulated Increment / Decrement progress controls inside Leaderboard view */}
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">Mục tiêu hôm nay:</span>
                <span className="font-mono text-xs text-gray-400 font-bold">
                  {dailyCompleted}/{dailyGoal} {dailyCompleted >= dailyGoal ? '🎉 ĐẠT' : ''}
                </span>
              </div>
              <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-350 ${
                    dailyCompleted >= dailyGoal ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-indigo-505 bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, (dailyCompleted / dailyGoal) * 100)}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-gray-400">
                <button 
                  onClick={onManualDecrement}
                  disabled={dailyCompleted <= 0}
                  className="flex-1 flex items-center justify-center space-x-1 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 hover:text-white py-1.5 rounded-lg active:scale-95 transition cursor-pointer select-none border border-transparent hover:border-slate-700"
                  title="Giảm lượng bài học hôm nay!"
                >
                  <Minus className="w-3 h-3" />
                  <span>Bớt 1 bài</span>
                </button>
                <button 
                  onClick={onManualIncrement}
                  className="flex-1 flex items-center justify-center space-x-1 bg-indigo-600/35 hover:bg-indigo-600/50 text-indigo-200 hover:text-white border border-indigo-500/20 py-1.5 rounded-lg active:scale-95 transition cursor-pointer select-none font-bold"
                  title="Tăng lượng bài học hôm nay! Pháo hoa sẽ nổ khi bạn chạm mục tiêu."
                >
                  <Plus className="w-3 h-3 text-indigo-300" />
                  <span>Cộng 1 bài</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Recharts area chart */}
          <div className="lg:col-span-2 h-56 md:h-64 sm:p-2 bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between z-10 relative">
            <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold mb-2">
              <span className="uppercase tracking-wider">ĐỒ THỊ HIỆU SUẤT TRONG TUẦN</span>
              <span className="text-indigo-400 font-mono">Recharts Area Chart</span>
            </div>
            
            <div className="w-full h-full min-h-[140px] md:min-h-[180px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyHistory}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} vertical={false} />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#475569" 
                    fontSize={9} 
                    fontFamily="monospace"
                    dy={5}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={9} 
                    fontFamily="monospace"
                    allowDecimals={false}
                    dx={-5}
                    tickLine={false}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#6366f1" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    activeDot={{ r: 6, stroke: '#9333ea', strokeWidth: 1.5, fill: '#ffffff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filter Toolbar and Detailed ranking list */}
        <div className="bg-[#0b0c10] border border-slate-900 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Main Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 w-fit">
              {boardMode === 'xp' ? (
                [
                  { id: 'all', label: 'TẤT CẢ' },
                  { id: 'weekly', label: 'ĐUA TOP TUẦN' },
                  { id: 'schools', label: 'ĐẠI HỌC TOP' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFilterType(t.id as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer select-none ${
                      filterType === t.id 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))
              ) : (
                <span className="px-4 py-2 text-xs font-bold text-rose-400 flex items-center space-x-1.5">
                  <Swords className="w-3.5 h-3.5" />
                  <span>ELO RATING</span>
                </span>
              )}
            </div>

            {/* Simple Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm thí sinh, tên trường..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#12141c] border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs md:text-sm text-gray-200 placeholder-slate-500 outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* List Entries */}
          <div className="overflow-x-auto">
            {(boardMode === 'xp' && loading) || (boardMode === 'arena' && arenaLoading) ? (
              <p className="text-center text-gray-500 text-sm py-8">Đang tải bảng xếp hạng...</p>
            ) : (
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-bold tracking-wider hover:bg-slate-950/20">
                  <th className="py-3.5 pl-4 w-16 text-center">HẠNG</th>
                  <th className="py-3.5">THÍ SINH</th>
                  <th className="py-3.5">TRƯỜNG HOA LÂM</th>
                  {boardMode === 'arena' ? (
                    <>
                      <th className="py-3.5 text-center">TRẬN</th>
                      <th className="py-3.5 text-center">T/H</th>
                      <th className="py-3.5 text-right pr-4">ELO</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3.5 text-center">ĐÃ GIẢI</th>
                      <th className="py-3.5 text-right pr-4">ĐIỂM SỐ</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-gray-300">
                {filteredLeaders.map((leader) => (
                  <tr 
                    key={`${boardMode}-${leader.id || leader.rank}`}
                    className="hover:bg-slate-900/30 transition-all cursor-pointer group"
                  >
                    <td className="py-4 pl-4 text-center font-mono font-bold text-slate-400 text-sm">
                      {leader.rank}
                    </td>
                    <td className="py-4 flex items-center space-x-3">
                      <img 
                        src={leader.avatar} 
                        alt={leader.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex flex-col items-start gap-1">
                          <p className="font-bold text-white leading-snug">{leader.name}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${getBadgeFromXp(leader.xp).bg} ${getBadgeFromXp(leader.xp).color} ${getBadgeFromXp(leader.xp).border}`}>
                            {leader.badge || getBadgeFromXp(leader.xp).name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-gray-400">
                      {leader.school}
                    </td>
                    {boardMode === 'arena' ? (
                      <>
                        <td className="py-4 text-center font-mono text-gray-400">
                          {leader.games ?? 0}
                        </td>
                        <td className="py-4 text-center font-mono text-indigo-400 font-bold">
                          {leader.wins ?? 0}/{leader.losses ?? 0}
                        </td>
                        <td className="py-4 text-right pr-4 font-mono font-extrabold text-rose-400 text-sm">
                          {(leader.elo ?? leader.xp).toLocaleString()}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 text-center font-mono text-indigo-400 font-bold">
                          {leader.solved} bài
                        </td>
                        <td className="py-4 text-right pr-4 font-mono font-extrabold text-white text-sm">
                          {leader.xp.toLocaleString()} XP
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>

        {/* BOTTOM FIXED USER STICKY FOOTER */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-indigo-900/40 to-purple-900/30 border border-indigo-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          {/* Confetti element decoration background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c101b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20"></div>
          
          <div className="flex items-center space-x-4 relative z-10 text-left">
            <span className="font-mono text-lg font-bold text-indigo-300 ml-2">#{userRankIndex}</span>
            
            <div className="relative">
              <img 
                src={currentUser ? currentUser.avatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"} 
                alt={currentUser ? currentUser.name : "Minh Hoàng"} 
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1.5 -right-1 bg-indigo-500 text-white rounded-full p-0.5" title="You">
                <Star className="w-3 h-3 fill-white" />
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <p className="font-extrabold text-white text-base">{currentUser ? `${currentUser.name} (Bạn)` : "Minh Hoàng (Bạn)"}</p>
                <span className={`border text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${getBadgeFromXp(currentUser ? currentUser.xp : 12400).bg} ${getBadgeFromXp(currentUser ? currentUser.xp : 12400).color} ${getBadgeFromXp(currentUser ? currentUser.xp : 12400).border}`}>
                  {getBadgeFromXp(currentUser ? currentUser.xp : 12400).name}
                </span>
              </div>
              <p className="text-xs text-gray-400">{currentUser ? currentUser.school : "ĐH Công nghệ thông tin - ĐHQG-HCM"} | <strong>{currentUser ? currentUser.solved : 63} bài</strong> đã hoàn thành</p>
            </div>
          </div>

          <div className="flex flex-col text-left justify-center space-y-1.5 min-w-[200px] relative z-10">
            <div className="flex items-center justify-between text-xs font-mono">
              {boardMode === 'arena' ? (
                <>
                  <span className="text-rose-400 font-bold">{selfElo.toLocaleString()} ELO</span>
                  <span className="text-slate-500">
                    {selfEntry ? `${selfEntry.wins ?? 0} thắng / ${selfEntry.losses ?? 0} thua` : 'Chưa có trận Arena'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-indigo-400 font-bold">{(currentUser ? currentUser.xp : 12400).toLocaleString()} XP</span>
                  <span className="text-slate-500">Mục tiêu tịnh tiến: 15,000 XP (Để lên rank Cao Thủ)</span>
                </>
              )}
            </div>
            
            {boardMode === 'xp' && (
            <div className="w-full bg-slate-950/80 rounded-full h-2.5 border border-slate-900 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, ((currentUser ? currentUser.xp : 12400) / 15000) * 100)}%` }}></div>
            </div>
            )}
          </div>

          <div className="relative z-10 flex items-center shrink-0">
            <button 
              onClick={() => onNavigate('arena')}
              className="w-full md:w-auto inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition text-white text-xs font-bold px-6 py-3.5 rounded-xl cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>Sảnh Đối Kháng 1v1</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
