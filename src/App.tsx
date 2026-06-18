import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import HomeView from './components/HomeView';
import TheoryView from './components/TheoryView';
import IdeView from './components/IdeView';
import LeaderboardView from './components/LeaderboardView';
import ArenaView from './components/ArenaView';
import AdminView from './components/AdminView';
import ResultModal from './components/ResultModal';
import AuthModal from './components/AuthModal';
import EditProfileModal from './components/EditProfileModal';
import LandingGate from './components/LandingGate';
import QuickNotesSidebar from './components/QuickNotesSidebar';
import { playAudioCue } from './utils/audio';
import { AppUser } from './types';
import { 
  Brain, Swords, Trophy, Terminal, BookOpen, User, Star, Menu, X, Flame, Target, 
  Plus, Minus, CheckCircle2, ShieldCheck, ShieldAlert, TrendingUp, LogIn, AlertCircle,
  Calendar, FileText, Save, Award, Lock, Sparkles, Zap, Snowflake, Share2, Download, Copy,
  LogOut, Cloud, Pencil, Moon, Sun, Eye, EyeOff, Sliders
} from 'lucide-react';

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'theory' | 'ide' | 'arena' | 'leaderboard' | 'admin'>('home');
  const [resultModalType, setResultModalType] = useState<'victory' | 'defeat' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isQuickNotesOpen, setIsQuickNotesOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('algolearn_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Floating XP mouse coordinates track state
  const [floatingXps, setFloatingXps] = useState<{ id: string; xp: number; x: number; y: number }[]>([]);
  const mouseRef = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Experience and progress states
  const [userXp, setUserXp] = useState<number>(() => {
    try {
      const savedUser = localStorage.getItem('algolearn_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return parsed.xp ?? 12400;
      }
      return parseInt(localStorage.getItem('algolearn_user_xp') || '12400', 10);
    } catch {
      return 12400;
    }
  });

  const [userSolved, setUserSolved] = useState<number>(() => {
    try {
      const savedUser = localStorage.getItem('algolearn_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return parsed.solved ?? 63;
      }
      return parseInt(localStorage.getItem('algolearn_user_solved') || '63', 10);
    } catch {
      return 63;
    }
  });

  const handleAwardXp = (amount: number, solvedIncrement: number = 0) => {
    // Generate a beautiful floating XP popup at mouse cursor position
    const uniqueId = Math.random().toString(36).substring(2, 11);
    setFloatingXps(prev => [
      ...prev,
      {
        id: uniqueId,
        xp: amount,
        x: mouseRef.current.x,
        y: mouseRef.current.y
      }
    ]);
    setTimeout(() => {
      setFloatingXps(prev => prev.filter(item => item.id !== uniqueId));
    }, 1500);

    setUserXp(prev => {
      const nextXp = prev + amount;
      localStorage.setItem('algolearn_user_xp', String(nextXp));
      return nextXp;
    });

    if (solvedIncrement > 0) {
      setUserSolved(prev => {
        const nextSolved = prev + solvedIncrement;
        localStorage.setItem('algolearn_user_solved', String(nextSolved));
        return nextSolved;
      });
    }

    // sync profile if active
    if (currentUser) {
      setCurrentUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = {
          ...prevUser,
          xp: prevUser.xp + amount,
          solved: prevUser.solved + solvedIncrement
        };
        
        try {
          const savedUsersStr = localStorage.getItem('algolearn_users');
          if (savedUsersStr) {
            const users = JSON.parse(savedUsersStr) as AppUser[];
            const idx = users.findIndex(u => u.id === prevUser.id);
            if (idx !== -1) {
              users[idx].xp = updatedUser.xp;
              users[idx].solved = updatedUser.solved;
              localStorage.setItem('algolearn_users', JSON.stringify(users));
            }
          }
        } catch (e) {
          console.error(e);
        }
        
        localStorage.setItem('algolearn_current_user', JSON.stringify(updatedUser));
        return updatedUser;
      });
    }
  };

  const handleAuthSuccess = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem('algolearn_current_user', JSON.stringify(user));
    
    // Sync roles
    setUserRole(user.isAdmin ? 'admin' : 'user');
    localStorage.setItem('algolearn_user_role', user.isAdmin ? 'admin' : 'user');

    // Sync streak and stats
    if (user.streak) {
      setStreak(user.streak);
      localStorage.setItem('algolearn_streak_count', String(user.streak));
    }
    
    setUserXp(user.xp);
    localStorage.setItem('algolearn_user_xp', String(user.xp));
    setUserSolved(user.solved);
    localStorage.setItem('algolearn_user_solved', String(user.solved));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('algolearn_current_user');
    setUserRole('user');
    localStorage.setItem('algolearn_user_role', 'user');
    // reset to guest defaults
    setUserXp(12400);
    setUserSolved(63);
  };

  const handleSaveProfile = (newName: string, newSchool: string, newAvatar: string) => {
    if (!currentUser) return;
    const updatedUser: AppUser = {
      ...currentUser,
      name: newName,
      school: newSchool,
      avatar: newAvatar,
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('algolearn_current_user', JSON.stringify(updatedUser));

    // Also sync inside the registered users database ('algolearn_users')
    try {
      const savedUsersStr = localStorage.getItem('algolearn_users');
      if (savedUsersStr) {
        const users = JSON.parse(savedUsersStr) as AppUser[];
        const idx = users.findIndex(u => u.id === currentUser.id);
        if (idx !== -1) {
          users[idx] = {
            ...users[idx],
            name: newName,
            school: newSchool,
            avatar: newAvatar,
          };
          localStorage.setItem('algolearn_users', JSON.stringify(users));
        }
      }
    } catch (e) {
      console.error(e);
    }

    setIsEditingProfile(false);
  };

  // Active Role State Management (User / Admin Authorization)
  const [userRole, setUserRole] = useState<'user' | 'admin'>(() => {
    try {
      const saved = localStorage.getItem('algolearn_user_role');
      return (saved as 'user' | 'admin') || 'user';
    } catch {
      return 'user';
    }
  });

  const handleUpdateRole = (newRole: 'admin' | 'user') => {
    setUserRole(newRole);
    localStorage.setItem('algolearn_user_role', newRole);
    if (newRole === 'admin') {
      setIsFocusMode(false);
      try {
        localStorage.setItem('algolearn_focus_mode', 'false');
      } catch {}
    }
    if (newRole === 'user' && currentView === 'admin') {
      setCurrentView('home');
    }
  };

  // Trigger amazing customizable particle confetti celebration effect
  const triggerCelebrationConfetti = (type: 'fireworks' | 'pride') => {
    try {
      if (type === 'fireworks') {
        const duration = 4 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => {
          return Math.random() * (max - min) + min;
        };

        const interval: any = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 45 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 200);
      } else {
        // Pride layout
        const duration = 2.5 * 1000;
        const end = Date.now() + duration;
        
        (function frame() {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6']
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      }
    } catch (err) {
      console.error('Confetti error:', err);
    }
  };

  // Daily Streak State and calculation logic
  const [streak, setStreak] = useState<number>(() => {
    try {
      const savedStreak = localStorage.getItem('algolearn_streak_count');
      const lastDateStr = localStorage.getItem('algolearn_last_practice_date');
      const todayStr = getLocalDateString(new Date());
      
      if (!savedStreak || !lastDateStr) {
        // Initialize streak as 1 for first-time visitors
        localStorage.setItem('algolearn_streak_count', '1');
        localStorage.setItem('algolearn_last_practice_date', todayStr);
        return 1;
      }
      
      const lastDate = new Date(lastDateStr + 'T00:00:00');
      const todayDate = new Date(todayStr + 'T00:00:00');
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let currentStreak = parseInt(savedStreak, 10) || 1;
      
      if (diffDays <= 2) {
        // Missed at most 1 day (diffDays is 1 or 2), keep the streak as user is still active!
        return currentStreak;
      } else {
        // 2 or more consecutive days missed, check if Streak Freeze is active
        const hasFreeze = localStorage.getItem('algolearn_streak_freeze_active') === 'true';
        if (hasFreeze) {
          localStorage.setItem('algolearn_streak_freeze_active', 'false');
          // Update the last practice date so user gets a fresh start without reset
          localStorage.setItem('algolearn_last_practice_date', todayStr);
          return currentStreak;
        }
        localStorage.setItem('algolearn_streak_count', '0');
        return 0;
      }
    } catch (e) {
      return 1;
    }
  });

  const [lastPracticeDate, setLastPracticeDate] = useState<string>(() => {
    try {
      return localStorage.getItem('algolearn_last_practice_date') || getLocalDateString(new Date());
    } catch {
      return getLocalDateString(new Date());
    }
  });

  const [showStreakDetails, setShowStreakDetails] = useState(false);
  const [showStreakAchievement, setShowStreakAchievement] = useState(false);
  const [streakRipples, setStreakRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Sync core auth roles and views dynamically to prevent tampering and provide auto-routing
  useEffect(() => {
    if (!currentUser) {
      setUserRole('user');
    } else {
      const role = currentUser.isAdmin ? 'admin' : 'user';
      setUserRole(role);
      localStorage.setItem('algolearn_user_role', role);
      if (role === 'admin') {
        setCurrentView('admin');
      } else if (currentView === 'admin') {
        setCurrentView('home');
      }
    }
  }, [currentUser]);

  // Sync streak changes back into current user and general storage
  useEffect(() => {
    if (currentUser && currentUser.streak !== streak) {
      setCurrentUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, streak };
        localStorage.setItem('algolearn_current_user', JSON.stringify(updated));
        
        try {
          const savedUsersStr = localStorage.getItem('algolearn_users');
          if (savedUsersStr) {
            const users = JSON.parse(savedUsersStr) as AppUser[];
            const idx = users.findIndex(u => u.id === prev.id);
            if (idx !== -1) {
              users[idx].streak = streak;
              localStorage.setItem('algolearn_users', JSON.stringify(users));
            }
          }
        } catch {}
        return updated;
      });
    }
  }, [streak, currentUser]);

  // Synchronize authenticated user's profile changes (XP, solved, streak) to the backend database
  // IMPORTANT: prevent local-only state changes from overwriting server state in tight loops.
  // We only attempt to sync after explicit practice completion / XP award flow.
  const [shouldSyncProfile, setShouldSyncProfile] = useState(false);

  useEffect(() => {
    if (!currentUser || !shouldSyncProfile) return;

    const lastSyncedKey = `algolearn_last_synced_${currentUser.id}`;
    const lastSyncedData = localStorage.getItem(lastSyncedKey);
    const currentDataStr = JSON.stringify({
      xp: currentUser.xp,
      solved: currentUser.solved,
      streak: currentUser.streak,
    });

    if (lastSyncedData === currentDataStr) {
      setShouldSyncProfile(false);
      return;
    }

    fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        xp: currentUser.xp,
        solved: currentUser.solved,
        streak: currentUser.streak,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          localStorage.setItem(lastSyncedKey, currentDataStr);
        }
      })
      .catch((err) => console.error('Failed to sync profile with server', err))
      .finally(() => setShouldSyncProfile(false));
  }, [currentUser, shouldSyncProfile]);


  useEffect(() => {
    if (streakRipples.length > 0) {
      const timer = setTimeout(() => {
        setStreakRipples([]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [streakRipples.length]);

  const handleStreakClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = {
        id: Date.now() + Math.random(),
        x,
        y
      };
      setStreakRipples((prev) => [...prev, newRipple]);
    } catch (err) {
      console.error('Ripple error:', err);
    }
    setShowStreakDetails(true);
  };

  // Daily Goal State & Logic
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    try {
      const savedGoal = localStorage.getItem('algolearn_daily_goal');
      return savedGoal ? parseInt(savedGoal, 10) : 2; // Default goal is 2 lessons/practices
    } catch (e) {
      return 2;
    }
  });

  const [dailyCompleted, setDailyCompleted] = useState<number>(() => {
    try {
      const todayStr = getLocalDateString(new Date());
      const savedDate = localStorage.getItem('algolearn_daily_completed_date');
      const savedCount = localStorage.getItem('algolearn_daily_completed_count');
      
      if (savedDate === todayStr) {
        return savedCount ? parseInt(savedCount, 10) : 0;
      } else {
        localStorage.setItem('algolearn_daily_completed_date', todayStr);
        localStorage.setItem('algolearn_daily_completed_count', '0');
        return 0;
      }
    } catch (e) {
      return 0;
    }
  });

  const [showDailyGoalDetails, setShowDailyGoalDetails] = useState(false);
  const [showDailyGoalCelebration, setShowDailyGoalCelebration] = useState(false);
  const [shareImageSrc, setShareImageSrc] = useState<string | null>(null);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);

  // States for Learning Reminders
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('algolearn_reminders_enabled');
      return saved ? saved === 'true' : false;
    } catch (_) {
      return false;
    }
  });

  const [reminderTime, setReminderTime] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('algolearn_reminder_time');
      return saved || '21:00';
    } catch (_) {
      return '21:00';
    }
  });

  const [showReminderToast, setShowReminderToast] = useState(false);

  // Streak Freeze State and purchasing logic
  const [streakFreezeActive, setStreakFreezeActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('algolearn_streak_freeze_active') === 'true';
    } catch (_) {
      return false;
    }
  });

  const handlePurchaseStreakFreeze = () => {
    const cost = 500;
    const currentXpVal = currentUser ? currentUser.xp : userXp;
    if (currentXpVal < cost) {
      alert("Bạn không đủ XP! Hãy chăm chỉ giải toán hoặc học lý thuyết để đổi lấy Đóng băng chuỗi.");
      return;
    }

    // Deduct 500 XP
    const nextXpVal = currentXpVal - cost;
    setUserXp(nextXpVal);
    localStorage.setItem('algolearn_user_xp', String(nextXpVal));

    if (currentUser) {
      setCurrentUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = {
          ...prevUser,
          xp: Math.max(0, prevUser.xp - cost)
        };
        try {
          const savedUsersStr = localStorage.getItem('algolearn_users');
          if (savedUsersStr) {
            const users = JSON.parse(savedUsersStr) as AppUser[];
            const idx = users.findIndex(u => u.id === prevUser.id);
            if (idx !== -1) {
              users[idx].xp = updatedUser.xp;
              localStorage.setItem('algolearn_users', JSON.stringify(users));
            }
          }
        } catch (e) {
          console.error(e);
        }
        localStorage.setItem('algolearn_current_user', JSON.stringify(updatedUser));
        return updatedUser;
      });
    }

    setStreakFreezeActive(true);
    localStorage.setItem('algolearn_streak_freeze_active', 'true');
    triggerCelebrationConfetti('pride');
  };

  // States for Focus Mode
  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('algolearn_focus_mode');
      return saved === 'true';
    } catch (_) {
      return false;
    }
  });

  const handleToggleFocusMode = () => {
    const nextVal = !isFocusMode;
    setIsFocusMode(nextVal);
    localStorage.setItem('algolearn_focus_mode', String(nextVal));
    if (nextVal) {
      if (currentView !== 'ide' && currentView !== 'arena') {
        setCurrentView('ide');
      }
    }
  };

  // States and Handlers for Night Owl / Dark Reader (Eye Protection Mode)
  const [nightOwlMode, setNightOwlMode] = useState<'off' | 'on' | 'auto'>(() => {
    try {
      const saved = localStorage.getItem('algolearn_night_owl_mode');
      return (saved as 'off' | 'on' | 'auto') || 'auto';
    } catch (_) {
      return 'auto';
    }
  });

  const [nightOwlWarmth, setNightOwlWarmth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('algolearn_night_owl_warmth');
      return saved ? parseInt(saved, 10) : 40;
    } catch (_) {
      return 40;
    }
  });

  const [nightOwlDim, setNightOwlDim] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('algolearn_night_owl_dim');
      return saved ? parseInt(saved, 10) : 10;
    } catch (_) {
      return 10;
    }
  });

  const [isNightOwlActive, setIsNightOwlActive] = useState<boolean>(false);
  const [isNightOwlPanelOpen, setIsNightOwlPanelOpen] = useState<boolean>(false);

  useEffect(() => {
    const checkNightOwl = () => {
      if (nightOwlMode === 'on') {
        setIsNightOwlActive(true);
      } else if (nightOwlMode === 'off') {
        setIsNightOwlActive(false);
      } else {
        // 'auto' mode: check if local hour is between 18:00 (6 PM) and 6:00 AM
        const hour = new Date().getHours();
        setIsNightOwlActive(hour >= 18 || hour < 6);
      }
    };

    checkNightOwl();
    const interval = setInterval(checkNightOwl, 15000); // Check every 15 seconds for reactive update
    return () => clearInterval(interval);
  }, [nightOwlMode]);

  const handleUpdateNightOwlMode = (mode: 'off' | 'on' | 'auto') => {
    setNightOwlMode(mode);
    localStorage.setItem('algolearn_night_owl_mode', mode);
  };

  const handleUpdateNightOwlWarmth = (warmth: number) => {
    setNightOwlWarmth(warmth);
    localStorage.setItem('algolearn_night_owl_warmth', String(warmth));
  };

  const handleUpdateNightOwlDim = (dim: number) => {
    setNightOwlDim(dim);
    localStorage.setItem('algolearn_night_owl_dim', String(dim));
  };

  // Periodic Reminder Checker
  useEffect(() => {
    if (!remindersEnabled) return;

    const checkReminder = () => {
      try {
        const now = new Date();
        const todayStr = getLocalDateString(now);
        const lastTriggered = localStorage.getItem('algolearn_reminder_last_triggered');
        
        if (lastTriggered === todayStr) {
          return;
        }

        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const [remHours, remMinutes] = reminderTime.split(':').map(Number);
        
        if (currentHours > remHours || (currentHours === remHours && currentMinutes >= remMinutes)) {
          if (dailyCompleted < dailyGoal) {
            setShowReminderToast(true);
            localStorage.setItem('algolearn_reminder_last_triggered', todayStr);
            setTimeout(() => {
              setShowReminderToast(false);
            }, 8000);
          }
        }
      } catch (e) {
        console.error("Error checking learning reminder:", e);
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 15000); // Check every 15s when active
    return () => clearInterval(interval);
  }, [remindersEnabled, reminderTime, dailyCompleted, dailyGoal]);

  // States for heatmap day details & persistent custom daily learning notes
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<{
    date: string;
    displayDate: string;
    count: number;
    isToday: boolean;
  } | null>(null);

  const [dayNotes, setDayNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('algolearn_day_notes');
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  const [tempNote, setTempNote] = useState('');

  // Helper to dynamically get realistic completed algorithmic exercises based on daily count and date
  const getExercisesForDay = (dateStr: string, count: number): string[] => {
    if (count <= 0) return [];
    
    const possibleExercises = [
      "Tìm số lớn nhất trong mảng [O(N)]",
      "Đảo ngược Danh sách liên kết đơn",
      "Tính số Fibonacci thứ N bằng Đệ quy có nhớ",
      "Sắp xếp mảng bằng Bubble Sort",
      "Thuật toán Quick Sort phân hoạch Lomuto",
      "Tìm kiếm BFS trên Đồ thị Vô hướng",
      "Bài toán cái túi (Knapsack Problem) - DP",
      "Tìm kiếm phần tử lớn thứ K bằng QuickSelect",
      "Merge hai danh sách liên kết đã sắp xếp",
      "Kiểm tra tính đối xứng của chuỗi (Palindrome)",
      "Giải thuật Dijkstra tìm đường đi ngắn nhất",
      "Duyệt đồ thị Depth First Search (DFS)",
      "Chuỗi con tăng dài nhất (LIS) [O(N^2)]",
      "Xây dựng cây nhị phân tìm kiếm (BST)",
      "Giải thuật Kruskal tìm cây khung nhỏ nhất",
      "Sắp xếp nhanh với 3 phân hoạch (3-way Quick Sort)",
      "Tính tổ hợp chập K của N sử dụng Quy hoạch động",
      "Duyệt cây nhị phân theo thứ tự Inorder",
      "Tìm kiếm nhị phân trên mảng đã sắp xếp",
      "Đếm số lượng thành phần liên thông trong Đồ thị"
    ];
    
    // Hash function to make it completely deterministic for each date string
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash += dateStr.charCodeAt(i);
    }
    
    const list: string[] = [];
    for (let j = 0; j < count; j++) {
      const idx = (hash + j * 9) % possibleExercises.length;
      list.push(possibleExercises[idx]);
    }
    return list;
  };

  const handleSaveDayNote = (date: string) => {
    try {
      const updatedNotes = { ...dayNotes, [date]: tempNote };
      setDayNotes(updatedNotes);
      localStorage.setItem('algolearn_day_notes', JSON.stringify(updatedNotes));
    } catch (e) {
      console.error("Failed to save day note:", e);
    }
  };

  const updateCompletedHistory = (date: string, count: number) => {
    try {
      const saved = localStorage.getItem('algolearn_completed_history');
      let historyMap: Record<string, number> = {};
      if (saved) {
        historyMap = JSON.parse(saved);
      }
      historyMap[date] = count;
      localStorage.setItem('algolearn_completed_history', JSON.stringify(historyMap));
    } catch (e) {
      console.error('Failed to sync history:', e);
    }
  };

  const getWeeklyHistory = (): { date: string; displayDate: string; count: number }[] => {
    const result = [];
    let historyMap: Record<string, number> = {};
    try {
      const saved = localStorage.getItem('algolearn_completed_history');
      if (saved) {
        historyMap = JSON.parse(saved);
      } else {
        const seeded: Record<string, number> = {};
        const today = new Date();
        for (let i = 1; i <= 6; i++) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dStr = getLocalDateString(d);
          seeded[dStr] = Math.floor(Math.random() * 3) + 1; // 1 to 3 completed lessons
        }
        localStorage.setItem('algolearn_completed_history', JSON.stringify(seeded));
        historyMap = seeded;
      }
    } catch (e) {
      historyMap = {};
    }

    const todayStr = getLocalDateString(new Date());
    historyMap[todayStr] = dailyCompleted;

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() - i);
      const dateStr = getLocalDateString(targetDate);
      const count = historyMap[dateStr] ?? 0;
      
      const day = targetDate.getDate().toString().padStart(2, '0');
      const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
      const label = `${day}/${month}`;
      
      result.push({
        date: dateStr,
        displayDate: label,
        count: count
      });
    }
    return result;
  };

  const get30DayHistory = (): { date: string; displayDate: string; count: number; dayOfWeek: number; isToday: boolean }[] => {
    const result = [];
    let historyMap: Record<string, number> = {};
    try {
      const saved = localStorage.getItem('algolearn_completed_history');
      if (saved) {
        historyMap = JSON.parse(saved);
      }
      
      // Ensure we fill up to 30 days of beautiful historic consistency
      const today = new Date();
      let hasModified = false;
      for (let i = 1; i <= 29; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dStr = getLocalDateString(d);
        if (historyMap[dStr] === undefined) {
          const rand = Math.random();
          // Give various shades to different days to look like natural usage
          historyMap[dStr] = rand > 0.65 ? (rand > 0.88 ? 3 : 2) : (rand > 0.35 ? 1 : 0);
          hasModified = true;
        }
      }
      if (hasModified) {
        localStorage.setItem('algolearn_completed_history', JSON.stringify(historyMap));
      }
    } catch (e) {
      historyMap = {};
    }

    const todayStr = getLocalDateString(new Date());
    historyMap[todayStr] = dailyCompleted;

    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() - i);
      const dateStr = getLocalDateString(targetDate);
      const count = historyMap[dateStr] ?? 0;
      
      const day = targetDate.getDate().toString().padStart(2, '0');
      const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
      const label = `${day}/${month}`;
      
      result.push({
        date: dateStr,
        displayDate: label,
        count: count,
        dayOfWeek: targetDate.getDay(),
        isToday: dateStr === todayStr
      });
    }
    return result;
  };

  const incrementDailyCompleted = () => {
    try {
      const todayStr = getLocalDateString(new Date());

      // Anti-double-count: nếu hôm nay đã increment rồi thì bỏ qua.
      const lastIncrementedForToday = localStorage.getItem('algolearn_last_daily_increment_date');
      if (lastIncrementedForToday === todayStr) {
        return;
      }

      localStorage.setItem('algolearn_last_daily_increment_date', todayStr);

      setDailyCompleted((prev) => {
        const nextCompleted = prev + 1;

        localStorage.setItem('algolearn_daily_completed_date', todayStr);
        localStorage.setItem('algolearn_daily_completed_count', String(nextCompleted));
        updateCompletedHistory(todayStr, nextCompleted);

        // Persist daily_history snapshot đúng với nextCompleted (tránh race condition)
        if (currentUser?.id) {
          fetch('/api/leaderboard/daily/record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id,
              date: todayStr,
              completed: nextCompleted,
            }),
          }).catch(() => {
            // Non-blocking
          });
        }

        // Show celebration toast if they reach their target exactly!
        if (nextCompleted === dailyGoal) {
          setShowDailyGoalCelebration(true);
          triggerCelebrationConfetti('fireworks');
          playAudioCue('goal');
          setTimeout(() => setShowDailyGoalCelebration(false), 5000);
        } else {
          playAudioCue('success');
        }

        return nextCompleted;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const recordPractice = (opts?: { force?: boolean }) => {
    try {
      const todayStr = getLocalDateString(new Date());
      const lastDateStr = localStorage.getItem('algolearn_last_practice_date');
      const savedStreak = localStorage.getItem('algolearn_streak_count');

      // Anti-double-count: nếu đã ghi nhận streak hôm nay thì chỉ cho phép bỏ qua
      if (!opts?.force && lastDateStr === todayStr) {
        return;
      }

      let currentStreak = parseInt(savedStreak || '1', 10);

      
      if (!lastDateStr) {
        currentStreak = 1;
      } else {
        const lastDate = new Date(lastDateStr + 'T00:00:00');
        const todayDate = new Date(todayStr + 'T00:00:00');
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1 || diffDays === 2) {
          if (currentStreak === 0) {
            currentStreak = 1;
          } else {
            currentStreak += 1;
          }
        } else if (diffDays > 2) {
          const hasFreeze = localStorage.getItem('algolearn_streak_freeze_active') === 'true';
          if (hasFreeze) {
            localStorage.setItem('algolearn_streak_freeze_active', 'false');
            setStreakFreezeActive(false);
            if (currentStreak === 0) {
              currentStreak = 1;
            } else {
              currentStreak += 1;
            }
          } else {
            currentStreak = 1;
          }
        }
      }
      
      setStreak(currentStreak);
      localStorage.setItem('algolearn_streak_count', String(currentStreak));
      localStorage.setItem('algolearn_last_practice_date', todayStr);
      setLastPracticeDate(todayStr);
      
      // Flash a beautiful congratulations notification and confetti
      setShowStreakAchievement(true);
      triggerCelebrationConfetti('pride');
      const timer = setTimeout(() => {
        setShowStreakAchievement(false);
      }, 5000);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error(e);
    }
  };

  // NOTE: Practice/streak/daily should be recorded ONLY by explicit successful events.
  // Listen to custom events for successful compiler runs or messaging.
  // Guard against multiple dispatches on the same day (anti-double-count).

  useEffect(() => {
    const handlePracticeCompleted = () => {
      // IMPORTANT: streak/daily should be counted only when user is authenticated.
      // This guarantees each userId has exactly 1 daily increment for the day.
      if (!currentUser?.id) return;

      const todayStr = getLocalDateString(new Date());
      const userId = currentUser.id;
      const lastKey = `algolearn_last_daily_practice_event_${userId}_${todayStr}`;

      if (localStorage.getItem(lastKey) === 'done') return;

      recordPractice({ force: false });

      // Update daily counter
      incrementDailyCompleted();
      localStorage.setItem(lastKey, 'done');




      setShouldSyncProfile(true);
    };


    const handleAwardXpEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ amount: number }>;
      if (customEvent.detail && typeof customEvent.detail.amount === 'number') {
        const amount = customEvent.detail.amount;
        // Award XP only. Practice completion + streak/daily counting handled exclusively by
        // algolearn_practice_completed.
        handleAwardXp(amount, 0);
        setShouldSyncProfile(true);
      }
    };

    window.addEventListener('algolearn_practice_completed', handlePracticeCompleted);
    window.addEventListener('algolearn_award_xp', handleAwardXpEvent as EventListener);
    return () => {
      window.removeEventListener('algolearn_practice_completed', handlePracticeCompleted);
      window.removeEventListener('algolearn_award_xp', handleAwardXpEvent as EventListener);
    };
  }, [currentUser]);


  const handleIncrementStreak = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('algolearn_streak_count', String(newStreak));
    const todayStr = getLocalDateString(new Date());
    localStorage.setItem('algolearn_last_practice_date', todayStr);
    setLastPracticeDate(todayStr);
    triggerCelebrationConfetti('pride');
  };

  const handleResetStreak = () => {
    setStreak(1);
    localStorage.setItem('algolearn_streak_count', '1');
    const todayStr = getLocalDateString(new Date());
    localStorage.setItem('algolearn_last_practice_date', todayStr);
    setLastPracticeDate(todayStr);
  };

  // Daily Goal mutation action handlers
  const handleUpdateDailyGoalTarget = (target: number) => {
    setDailyGoal(target);
    localStorage.setItem('algolearn_daily_goal', String(target));
  };

  const handleManualIncrementProgress = () => {
    const nextCompleted = dailyCompleted + 1;
    setDailyCompleted(nextCompleted);
    const todayStr = getLocalDateString(new Date());
    localStorage.setItem('algolearn_daily_completed_date', todayStr);
    localStorage.setItem('algolearn_daily_completed_count', String(nextCompleted));
    updateCompletedHistory(todayStr, nextCompleted);
    if (nextCompleted === dailyGoal) {
      setShowDailyGoalCelebration(true);
      triggerCelebrationConfetti('fireworks');
      playAudioCue('goal');
      setTimeout(() => setShowDailyGoalCelebration(false), 5500);
    } else {
      playAudioCue('success');
    }
  };

  const handleManualDecrementProgress = () => {
    if (dailyCompleted <= 0) return;
    const nextCompleted = dailyCompleted - 1;
    setDailyCompleted(nextCompleted);
    const todayStr = getLocalDateString(new Date());
    localStorage.setItem('algolearn_daily_completed_date', todayStr);
    localStorage.setItem('algolearn_daily_completed_count', String(nextCompleted));
    updateCompletedHistory(todayStr, nextCompleted);
  };

  const handleGenerateShareCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper to draw rounded rectangle
    const drawRoundedRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    };

    // 1. Draw Linear Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 800);
    bgGrad.addColorStop(0, '#090d16'); // Dark cosmic slate
    bgGrad.addColorStop(0.5, '#0b1329'); // Deep twilight indigo
    bgGrad.addColorStop(1, '#1e113a'); // Cyber violet accent
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 800);

    // 2. Draw Decorative Space Grids & Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 40; i < 800; i += 80) {
      for (let j = 40; j < 800; j += 80) {
        ctx.beginPath();
        ctx.arc(i, j, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw circular glowing aurora layers
    const aurora1 = ctx.createRadialGradient(400, 320, 50, 400, 320, 300);
    aurora1.addColorStop(0, 'rgba(99, 102, 241, 0.15)'); // Glow indigo
    aurora1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aurora1;
    ctx.beginPath();
    ctx.arc(400, 320, 300, 0, Math.PI * 2);
    ctx.fill();

    const aurora2 = ctx.createRadialGradient(600, 550, 30, 600, 550, 180);
    aurora2.addColorStop(0, 'rgba(16, 185, 129, 0.1)'); // Glow emerald
    aurora2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aurora2;
    ctx.beginPath();
    ctx.arc(600, 550, 180, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw Premium Border
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, 20, 20, 760, 760, 28);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, 30, 30, 740, 740, 22);
    ctx.stroke();

    // 4. Header: App Branding
    ctx.textAlign = 'center';
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    // Draw code symbol
    ctx.fillText('💻 AlgoLearn', 400, 95);

    ctx.font = '900 12px monospace, system-ui';
    ctx.fillStyle = '#818cf8'; // Indigo-400
    ctx.fillText('HÀNH TRÌNH CHINH PHỤC GIẢI THUẬT', 400, 128);

    // Subtle line divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, 155);
    ctx.lineTo(650, 155);
    ctx.stroke();

    // 5. Hero Streak Graphics
    ctx.font = '85px system-ui, "Apple Color Emoji"';
    ctx.fillText('🔥', 400, 245);

    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#f97316'; // Vivid orange
    ctx.fillText('CHUỖI LIÊN TỤC TIỀN TIẾN', 400, 285);

    ctx.font = '900 68px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#fbbf24'; // Bright gold
    ctx.fillText(`${streak} NGÀY`, 400, 355);

    // 6. Draw User Card Glass Wrapper Box
    const boxX = 90;
    const boxY = 390;
    const boxW = 620;
    const boxH = 265;
    const boxR = 20;

    // Box subtle backing
    ctx.fillStyle = 'rgba(13, 17, 28, 0.82)';
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.22)';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, boxX, boxY, boxW, boxH, boxR);
    ctx.fill();
    ctx.stroke();

    // Box light reflection glow at top edge
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(boxX + boxR, boxY);
    ctx.lineTo(boxX + boxW - boxR, boxY);
    ctx.stroke();

    // Learner Info Left Side
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(currentUser?.name || 'Học Viên Danh Dự', boxX + 40, boxY + 55);

    ctx.font = '500 14px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8'; // Slate slate-400
    ctx.fillText(currentUser?.school || 'Đấu Sĩ Giải Thuật', boxX + 40, boxY + 85);

    // Draw little details row
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#818cf8';
    ctx.fillText(`📊 Đã Giải: ${userSolved} Bài`, boxX + 40, boxY + 128);

    ctx.textAlign = 'right';
    const finalXp = currentUser?.xp ?? userXp;
    ctx.fillText(`✨ Tích Luỹ: ${finalXp.toLocaleString()} XP`, boxX + boxW - 40, boxY + 128);

    // Today's progress row info
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e2e8f0'; // slate-200
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillText('TIẾN ĐỘ HÔM NAY', boxX + 40, boxY + 175);

    // Progress percentage
    const progressRate = Math.min(100, Math.round((dailyCompleted / dailyGoal) * 100));
    ctx.textAlign = 'right';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    if (progressRate >= 100) {
      ctx.fillStyle = '#34d399'; // Emerald light
      ctx.fillText(`✓ Hoàn thành ${dailyCompleted}/${dailyGoal} bài (${progressRate}%)`, boxX + boxW - 40, boxY + 175);
    } else {
      ctx.fillStyle = '#fb923c'; // Orange-400
      ctx.fillText(`${dailyCompleted}/${dailyGoal} bài (${progressRate}%)`, boxX + boxW - 40, boxY + 175);
    }

    // Draw progress bar track
    const barX = boxX + 40;
    const barY = boxY + 195;
    const barW = boxW - 80;
    const barH = 12;

    ctx.fillStyle = '#090d16'; // darker background tracking
    drawRoundedRect(ctx, barX, barY, barW, barH, 6);
    ctx.fill();

    // Draw progress bar fill
    if (progressRate > 0) {
      const fillW = (barW * progressRate) / 100;
      const progressGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
      
      if (progressRate >= 100) {
        progressGrad.addColorStop(0, '#10b981'); // Emerald-500
        progressGrad.addColorStop(1, '#059669'); // Emerald-600
      } else {
        progressGrad.addColorStop(0, '#fb923c'); // Orange-400
        progressGrad.addColorStop(1, '#ea580c'); // Orange-600
      }
      ctx.fillStyle = progressGrad;
      drawRoundedRect(ctx, barX, barY, fillW, barH, 6);
      ctx.fill();
    }

    // 7. Render dynamic seal badge on canvas if completed
    if (progressRate >= 100) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 1.5;
      drawRoundedRect(ctx, boxX + boxW - 200, boxY + 30, boxW - 460, 28, 6);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText('🏆 MỤC TIÊU HOÀN TẤT', boxX + boxW - 120, boxY + 48);
    }

    // 8. Slogan Quote
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569'; // slate-600 text
    ctx.font = 'italic 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('"Thử thách bản thân qua từng thuật giải, rèn chí kiên định mỗi ngày." - AlgoLearn Warrior', 400, 694);

    // 9. QR stamp/logo footnote invitation
    ctx.font = '900 12px monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText('ALGOLEARN • HỌC LẬP TRÌNH CO GIẬT TƯ DUY', 400, 730);

    // Export URL as state and show preview
    try {
      const url = canvas.toDataURL('image/png');
      setShareImageSrc(url);
      setShowSharePreview(true);
    } catch (e) {
      console.error('Failed to generate sharing image:', e);
    }
  };

  const handleCopyShareText = () => {
    const quote = dailyCompleted >= dailyGoal 
      ? `Tôi đã hoàn thành xuất sắc mục tiêu ngày hôm nay (${dailyCompleted}/${dailyGoal} bài tập) và duy trì chuỗi 🔥 ${streak} ngày bền bỉ tại AlgoLearn!`
      : `Tôi đang duy trì chuỗi học tập 🔥 ${streak} ngày liên tiếp tại AlgoLearn! Đang hoàn thành chỉ tiêu ${dailyCompleted}/${dailyGoal} bài học. Hãy đồng hành cùng tôi và rèn luyện tư duy thuật toán đỉnh cao nhé!`;
    
    navigator.clipboard.writeText(`${quote}\n\n👉 Chơi thử ngay tại AlgoLearn! #AlgoLearn #LuyenThuatToan`);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleResetDailyProgress = () => {
    setDailyCompleted(0);
    const todayStr = getLocalDateString(new Date());
    localStorage.setItem('algolearn_daily_completed_date', todayStr);
    localStorage.setItem('algolearn_daily_completed_count', '0');
    updateCompletedHistory(todayStr, 0);
  };

  const handleNavigate = (view: 'home' | 'theory' | 'ide' | 'arena' | 'leaderboard' | 'admin') => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenResultSim = (type: 'victory' | 'defeat') => {
    setResultModalType(type);
  };

  // Keyboard navigation shortcuts listener
  useEffect(() => {
    if (!currentUser) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Alt+N even when a text field is focused (so the user can quickly open notebooks)
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsQuickNotesOpen(prev => !prev);
        return;
      }

      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName;
        if (
          tagName === 'INPUT' || 
          tagName === 'TEXTAREA' || 
          activeEl.hasAttribute('contenteditable') || 
          (activeEl as any).isContentEditable
        ) {
          return;
        }
      }

      // Avoid interrupting standard system combinations
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'h') {
        handleNavigate('home');
      } else if (key === 't') {
        handleNavigate('theory');
      } else if (key === 'i') {
        handleNavigate('ide');
      } else if (key === 'a') {
        handleNavigate('arena');
      } else if (key === 'l') {
        handleNavigate('leaderboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentUser]);

  // Synchronous dual listener for scroll events inside #algolearn_root_wrapper or window
  useEffect(() => {
    if (!currentUser) return;

    const handleScroll = () => {
      const wrapper = document.getElementById('algolearn_root_wrapper');
      const scrollTop = wrapper ? wrapper.scrollTop : 0;
      setIsScrolled(scrollTop > 10 || window.scrollY > 10);
    };

    const wrapper = document.getElementById('algolearn_root_wrapper');
    if (wrapper) {
      wrapper.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Run custom check immediately
    handleScroll();

    // Re-run periodically as views shift or render or container heights update
    const intervalId = setInterval(handleScroll, 200);

    return () => {
      if (wrapper) {
        wrapper.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
      clearInterval(intervalId);
    };
  }, [currentUser, currentView]);

  // Check if user is not authenticated: if so, force LandingGate immediately
  if (!currentUser) {
    return <LandingGate onAuthSuccess={handleAuthSuccess} />;
  }

  const isWorkspaceView = currentView === 'theory' || currentView === 'ide' || currentView === 'arena';

  return (
    <div id="algolearn_root_wrapper" className={`min-h-screen bg-slate-950 text-gray-100 flex flex-col relative font-sans antialiased ${isWorkspaceView ? 'workspace-mode lg:h-screen lg:overflow-hidden' : 'overflow-x-hidden overflow-y-auto'} ${isFocusMode ? 'focus-mode-active' : ''} ${isScrolled ? 'scrolled' : ''}`}>
      
      {/* Night Owl / Dark Reader Eye-Care Overlay Glass Filter */}
      <AnimatePresence>
        {isNightOwlActive && (
          <motion.div 
            id="night_owl_screen_filter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 pointer-events-none z-[999999] mix-blend-multiply"
            style={{
              backgroundColor: `rgba(245, 158, 11, ${nightOwlWarmth * 0.0018})`, // Amber warmth filter layer
              backgroundImage: `linear-gradient(rgba(0,0,0,${nightOwlDim * 0.007}), rgba(0,0,0,${nightOwlDim * 0.007}))`, // Extra dimmer filter layer
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Responsive Navigation: Desktop Header, Mobile Header, & Desktop Sidebar */}
      {!isFocusMode && (
        <>
          {/* 1. Integrated Responsive Top Header Bar */}
          <header className={`fixed top-0 left-0 lg:left-64 right-0 h-16 backdrop-blur-md border-b z-40 px-4 lg:px-6 flex items-center justify-between gap-6 transition-all duration-300 ${isScrolled ? 'border-slate-800 bg-slate-950/95 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.7)]' : 'border-slate-900 bg-slate-950/80'}`}>
            
            {/* Left Portion of Header */}
            <div className="flex items-center min-w-0 shrink-0">
              {/* Mobile-only Logo */}
              <button 
                onClick={() => handleNavigate('home')} 
                className="lg:hidden flex items-center space-x-2 group cursor-pointer text-left select-none animate-fade-in"
              >
                <div className="w-8.5 h-8.5 rounded-lg bg-indigo-600 flex items-center justify-center text-white transition group-hover:rotate-6">
                  <Brain className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <span className="text-sm font-black text-white tracking-wide block">AlgoLearn</span>
                  <span className="text-[9px] text-gray-500 block leading-none font-medium">Làm chủ thuật toán</span>
                </div>
              </button>

              {/* Desktop-only Active Section Navigation Breadcrumbs */}
              <div className="hidden lg:flex items-center space-x-2.5 text-xs text-slate-400 font-bold tracking-wider uppercase whitespace-nowrap min-w-0">
                <Brain className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Không gian học tập</span>
                <span className="text-slate-700">/</span>
                <span className="text-white bg-slate-900/60 border border-slate-850 px-2.5 py-1 rounded-lg whitespace-nowrap overflow-hidden text-ellipsis">
                  {currentView === 'home' && "Dashboard / Trang Chủ"}
                  {currentView === 'theory' && "Lý Thuyết Thuật Toán"}
                  {currentView === 'ide' && "Cơ Khí Lập Trình IDE"}
                  {currentView === 'arena' && "Đấu Trường 1v1"}
                  {currentView === 'leaderboard' && "Bảng Vàng Danh Vọng"}
                  {currentView === 'admin' && "Quản Trị Hệ Thống"}
                </span>
              </div>
            </div>

            {/* Right Portion of Header: Dynamically rendered based on screen size */}
            <div className="shrink-0">
              {/* Desktop-only Horizontal Top Daily Progress indicators */}
              {userRole !== 'admin' && (
                <div className="hidden lg:flex items-center space-x-3.5 whitespace-nowrap">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mr-1 whitespace-nowrap">Tiến Độ Hằng Ngày:</span>

                  {/* Daily Streak Card */}
                  <motion.button 
                    onClick={handleStreakClick}
                    whileHover={{ scale: 1.02, translateY: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="group cursor-pointer flex items-center space-x-2 bg-gradient-to-r from-amber-500/10 to-amber-600/5 hover:from-amber-500/15 hover:to-amber-600/10 border border-amber-500/20 hover:border-amber-500/35 rounded-xl px-3.5 py-1.5 text-amber-400 relative overflow-hidden transition-all duration-200"
                    title="Chuỗi ngày liên tục! Click để cấu hình."
                  >
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-mono font-black">{streak} Ngày Liên Tục</span>
                    {lastPracticeDate === getLocalDateString(new Date()) ? (
                      <span className="bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center space-x-0.5 select-none animate-bounce">
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span>XONG</span>
                      </span>
                    ) : (
                      <span className="bg-slate-900/80 border border-slate-800 text-slate-500 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md select-none">
                        CHƯA
                      </span>
                    )}
                  </motion.button>

                  {/* Daily Goal Card */}
                  <motion.button 
                    onClick={() => setShowDailyGoalDetails(true)}
                    whileHover={{ scale: 1.02, translateY: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group cursor-pointer border rounded-xl px-3.5 py-1.5 flex items-center space-x-2 transition-all duration-200 ${
                      dailyCompleted >= dailyGoal 
                        ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-400 hover:border-emerald-500/40' 
                        : 'bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/35 text-indigo-400'
                    }`}
                    title="Mục tiêu bài đọc! Click để cấu hình."
                  >
                    <Target className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
                    <span className="text-xs font-mono font-black">Mục Tiêu: {dailyCompleted}/{dailyGoal} bài học</span>
                    {dailyCompleted >= dailyGoal ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-950/80 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
                    )}
                  </motion.button>

                  {/* XP Progress Indicator */}
                  <div className="bg-slate-900/40 border border-slate-900/60 rounded-xl px-3.5 py-1.5 flex items-center space-x-2 font-sans text-indigo-300">
                    <Award className="w-4 h-4 text-indigo-300 animate-bounce" />
                    <span className="text-xs font-mono font-black">{(currentUser ? currentUser.xp : userXp).toLocaleString()} XP</span>
                  </div>
                </div>
              )}

              {/* Mobile Quick Metrics */}
              <div className="flex lg:hidden items-center space-x-1.5">
                {currentUser?.isAdmin && (
                  <button 
                    onClick={() => handleUpdateRole(userRole === 'admin' ? 'user' : 'admin')}
                    className={`rounded-lg p-1 px-1.5 flex items-center space-x-0.5 cursor-pointer border shrink-0 text-[10px] ${
                      userRole === 'admin' 
                        ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' 
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                    title="Đổi vai trò nhanh!"
                  >
                    {userRole === 'admin' ? <ShieldCheck className="w-3 h-3 text-rose-400" /> : <User className="w-3 h-3" />}
                    <span>{userRole === 'admin' ? 'Admin' : 'Học viên'}</span>
                  </button>
                )}

                {userRole !== 'admin' && (
                  <>
                    {/* Streak Flame */}
                    <motion.button 
                      onClick={handleStreakClick}
                      whileTap={{ scale: 0.92 }}
                      className="relative overflow-hidden bg-amber-500/10 border border-amber-500/20 rounded-lg p-1 px-1.5 flex items-center space-x-1 text-amber-500 cursor-pointer text-[10px]"
                    >
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="font-mono font-bold">{streak}N</span>
                    </motion.button>

                    {/* Daily Goal */}
                    <button 
                      onClick={() => setShowDailyGoalDetails(true)}
                      className={`rounded-lg p-1 px-1.5 flex items-center space-x-1 cursor-pointer border text-[10px] ${
                        dailyCompleted >= dailyGoal 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-indigo-505/10 border-indigo-500/20 text-indigo-400'
                      }`}
                    >
                      <Target className="w-3 h-3" />
                      <span className="font-mono font-bold">{dailyCompleted}/{dailyGoal}</span>
                    </button>

                    {/* XP */}
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-1 px-1.5 text-[10px] text-indigo-300 font-mono font-bold">
                      {currentUser ? `${Math.round(currentUser.xp / 1000)}K` : `${Math.round(userXp / 1000)}K`}
                    </div>
                  </>
                )}

                {/* Mobile Menu Toggle button */}
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-slate-900/40 rounded-lg transition-all"
                >
                  {mobileMenuOpen ? <X className="w-5.5 h-5.5 animate-spin-once" /> : <Menu className="w-5.5 h-5.5" />}
                </button>
              </div>
            </div>
          </header>

          {/* 2. Premium Desktop Sidebar (lg:flex) */}
          <aside id="main_desktop_sidebar" className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 min-w-[256px] max-w-[256px] bg-[#090b0f]/95 border-r border-slate-900 z-40 p-5 justify-between select-none overflow-y-auto scrollbar-thin">
            {/* Top Branding Section */}
            <div className="space-y-6">
              <button 
                onClick={() => handleNavigate('home')} 
                className="flex items-center space-x-3 group cursor-pointer text-left w-full pb-5 border-b border-slate-900/40"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white transition duration-300 group-hover:rotate-12 group-hover:scale-105 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                  <Brain className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <span className="text-lg font-black text-white tracking-wider block">AlgoLearn</span>
                  <span className="text-[10px] text-indigo-400 block leading-none font-semibold uppercase tracking-widest mt-0.5">Làm chủ thuật toán</span>
                </div>
              </button>

              {/* Navigation Tabs List */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest pl-2.5 mb-2">Học tập & Rèn luyện</p>
                <nav className="space-y-1">
                  {(userRole === 'admin' 
                    ? [{ id: 'admin', label: 'Quản Trị Hệ Thống', icon: <ShieldCheck className="w-4.5 h-4.5 text-amber-500" /> }]
                    : [
                        { id: 'home', label: 'Trang Chủ', icon: <Brain className="w-4.5 h-4.5" />, shortcut: 'h' },
                        { id: 'theory', label: 'Lý Thuyết', icon: <BookOpen className="w-4.5 h-4.5" />, shortcut: 't' },
                        { id: 'ide', label: 'Cơ khí IDE', icon: <Terminal className="w-4.5 h-4.5" />, shortcut: 'i' },
                        { id: 'arena', label: 'Đấu Trường 1v1', icon: <Swords className="w-4.5 h-4.5" />, shortcut: 'a' },
                        { id: 'leaderboard', label: 'Bảng Vàng', icon: <Trophy className="w-4.5 h-4.5" />, shortcut: 'l' },
                      ]
                  ).map((item) => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id as any)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 select-none cursor-pointer group/btn ${
                          isActive 
                            ? 'bg-indigo-650 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] border-l-3 border-indigo-400' 
                            : 'text-gray-400 hover:text-white hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`transition-transform duration-200 group-hover/btn:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover/btn:text-indigo-400'}`}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {'shortcut' in item && item.shortcut && (
                          <kbd className={`hidden lg:inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[8px] font-mono leading-none rounded border select-none uppercase ${
                            isActive 
                              ? 'bg-indigo-800/40 border-indigo-500 text-indigo-200' 
                              : 'bg-slate-900 border-slate-850 text-slate-500 group-hover/btn:text-slate-400'
                          }`}>
                            {item.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </nav>
                
                {/* Visual Custom separator & Quick Notes Trigger Button inside Navigation Panel */}
                <div className="pt-4 mt-3 border-t border-slate-900/60">
                  <button
                    onClick={() => setIsQuickNotesOpen(true)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-slate-900/60 transition-all duration-200 select-none cursor-pointer group/notes"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-400 group-hover/notes:text-indigo-400 transition-transform group-hover/notes:scale-110">
                        <FileText className="w-4.5 h-4.5" />
                      </span>
                      <span>SỔ TAY GHI CHÚ</span>
                    </div>
                    <kbd className="hidden lg:inline-flex items-center justify-center min-w-[34px] h-[16px] px-1 text-[8px] font-mono leading-none rounded border bg-slate-900 border-slate-850 text-slate-500 group-hover/notes:text-slate-400 select-none uppercase">
                      Alt+N
                    </kbd>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Profile / Utility Section */}
            <div className="space-y-4 pt-4 border-t border-slate-900/40">
              {/* Force Profile Switch Role Option (Admin Only) */}
              {currentUser?.isAdmin && (
                <button 
                  onClick={() => handleUpdateRole(userRole === 'admin' ? 'user' : 'admin')}
                  className={`w-full group cursor-pointer select-none rounded-xl p-2.5 flex items-center justify-center space-x-2 transition-all duration-200 text-xs font-extrabold border ${
                    userRole === 'admin' 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/15' 
                      : 'bg-slate-900/60 border-slate-805 text-slate-400 hover:bg-slate-800'
                  }`}
                  title="Đổi cấu hình kiểm soát giữa Admin và Student"
                >
                  {userRole === 'admin' ? (
                    <>
                      <ShieldCheck className="w-4 h-4 fill-rose-500/10 text-rose-400 animate-pulse animate-infinite" />
                      <span>QUẢN TRỊ VIÊN</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      <span>XEM VAI TRÒ HỌC VIÊN</span>
                    </>
                  )}
                </button>
              )}

              {/* Focus Mode button */}
              {userRole !== 'admin' && (
                <button
                  onClick={handleToggleFocusMode}
                  className="w-full group cursor-pointer select-none rounded-xl p-2.5 flex items-center justify-center space-x-2 transition-all text-xs font-extrabold border bg-slate-900/40 border-slate-900 text-slate-400 hover:text-indigo-400 hover:border-slate-800 hover:bg-slate-900/80 active:scale-95"
                  title="Bật Chế độ Tập trung: Ẩn mọi thanh điều hướng để tập trung cao độ khi học!"
                >
                  <Zap className="w-4 h-4 text-indigo-400 group-hover:animate-bounce" />
                  <span>Bật Chế độ Tập trung</span>
                </button>
              )}

              {/* Eye Protection / Night Owl Settings Widget */}
              <div className="w-full bg-slate-900/40 border border-slate-900 rounded-2xl p-2.5 space-y-2">
                <button
                  type="button"
                  onClick={() => setIsNightOwlPanelOpen(!isNightOwlPanelOpen)}
                  className="w-full flex items-center justify-between text-left focus:outline-none select-none cursor-pointer group"
                >
                  <div className="flex items-center space-x-2">
                    {isNightOwlActive ? (
                      <Moon className="w-4 h-4 text-amber-400 animate-pulse animate-infinite" />
                    ) : (
                      <Sun className="w-4 h-4 text-gray-500 group-hover:text-amber-500 transition-colors" />
                    )}
                    <span className="text-[11px] font-extrabold text-slate-300 group-hover:text-white transition-colors uppercase tracking-tight">
                      Cựu Đêm (Eye-Care)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      isNightOwlActive 
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                        : 'bg-slate-950 border border-slate-800 text-gray-500'
                    }`}>
                      {nightOwlMode === 'off' ? 'Tắt' : nightOwlMode === 'on' ? 'Bật' : 'Auto'}
                    </span>
                    <span className="text-[9px] text-gray-500 leading-none">
                      {isNightOwlPanelOpen ? '▲' : '▼'}
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {isNightOwlPanelOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-3 pt-2 text-left"
                    >
                      <div className="border-t border-slate-900/60 pt-2"></div>
                      
                      {/* Subtitle / Hour Status Description */}
                      <p className="text-[9.5px] font-semibold leading-relaxed text-slate-400">
                        {nightOwlMode === 'auto' ? (
                          <>
                            <span className="text-indigo-400 font-bold">Tự động:</span> Kích hoạt khi trời tối (<span className="text-amber-400">18:00 - 06:00</span>) dựa trên giờ địa phương.
                          </>
                        ) : nightOwlMode === 'on' ? (
                          <>
                            Chế độ lọc mỏi mắt đang được <span className="text-emerald-400 font-bold">bắt buộc bật</span> liên tục.
                          </>
                        ) : (
                          <>
                            Bộ lọc đang <span className="text-rose-400 font-bold">tắt</span>. Hãy bật bộ lọc để làm dịu mắt trong bóng tối.
                          </>
                        )}
                      </p>

                      {/* Mode Pills Selector */}
                      <div className="grid grid-cols-3 gap-1">
                        {(['off', 'on', 'auto'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => handleUpdateNightOwlMode(m)}
                            className={`py-1 text-[8.5px] font-black uppercase rounded border transition select-none cursor-pointer tracking-wider text-center ${
                              nightOwlMode === m
                                ? 'bg-indigo-600/10 text-indigo-300 border-indigo-500/40 shadow-inner'
                                : 'bg-slate-950/60 text-gray-500 border-slate-850 hover:text-gray-300 hover:bg-slate-900/40'
                            }`}
                          >
                            {m === 'off' ? 'Tắt' : m === 'on' ? 'Bật' : 'Auto'}
                          </button>
                        ))}
                      </div>

                      {/* Sliders (disabled state if filter is inactive) */}
                      <div className="space-y-2 pt-1">
                        {/* Amber warmth slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-slate-400">Vàng Ấm Ánh Sáng Xanh:</span>
                            <span className="text-amber-400 font-black font-mono">{nightOwlWarmth}%</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Sliders className="w-3 h-3 text-slate-600 shrink-0" />
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={nightOwlWarmth}
                              onChange={(e) => handleUpdateNightOwlWarmth(Number(e.target.value))}
                              disabled={!isNightOwlActive}
                              className={`w-full h-1 rounded-lg appearance-none cursor-pointer outline-none transition ${
                                isNightOwlActive 
                                  ? 'bg-gradient-to-r from-orange-600 to-amber-400 accent-amber-500' 
                                  : 'bg-slate-800 cursor-not-allowed opacity-30'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Extra Dimming slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-slate-400">Độ Phủ Tối Màn Hình:</span>
                            <span className="text-indigo-400 font-black font-mono">{nightOwlDim}%</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Sliders className="w-3 h-3 text-slate-600 shrink-0" />
                            <input
                              type="range"
                              min="0"
                              max="60"
                              value={nightOwlDim}
                              onChange={(e) => handleUpdateNightOwlDim(Number(e.target.value))}
                              disabled={!isNightOwlActive}
                              className={`w-full h-1 rounded-lg appearance-none cursor-pointer outline-none transition ${
                                isNightOwlActive 
                                  ? 'bg-gradient-to-r from-slate-700 to-indigo-500 accent-indigo-400' 
                                  : 'bg-slate-800 cursor-not-allowed opacity-30'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Identity widget */}
              {currentUser ? (
                <div className="relative">
                  {/* Floating Account Dropdown Panel */}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="absolute bottom-16 left-0 right-0 z-50 p-4 bg-[#0a0f1d] border border-indigo-500/20 rounded-2xl shadow-2xl shadow-indigo-950/60 backdrop-blur-md flex flex-col space-y-4 text-left"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">TÀI KHOẢN</p>
                            <p className="text-sm font-black text-white">{currentUser.name}</p>
                            <p className="text-[11px] text-[#818cf8] font-semibold truncate">{currentUser.email}</p>
                          </div>
                          
                          <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-xl w-max">
                            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Đã đồng bộ</span>
                          </div>
                        </div>
                        
                        <div className="border-t border-slate-900/60"></div>
                        
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              setIsEditingProfile(true);
                            }}
                            className="w-full flex items-center space-x-2.5 px-2 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-950/80 rounded-xl transition cursor-pointer font-bold select-none text-left"
                          >
                            <Pencil className="w-4 h-4 text-amber-500" />
                            <span>Chỉnh sửa hồ sơ</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              handleNavigate('leaderboard');
                            }}
                            className="w-full flex items-center space-x-2.5 px-2 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-950/80 rounded-xl transition cursor-pointer font-bold select-none text-left"
                          >
                            <Trophy className="w-4 h-4 text-amber-405 text-amber-400" />
                            <span>Xem Bảng Vinh Danh</span>
                          </button>
                          
                          <div className="border-t border-slate-900/60 my-1"></div>
                          
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center space-x-2.5 px-2 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition cursor-pointer font-bold select-none text-left"
                          >
                            <LogOut className="w-4 h-4 text-rose-450" />
                            <span>Đăng xuất</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                    }}
                    className={`relative flex items-center justify-between p-2 rounded-2xl bg-slate-900/30 border select-none transition cursor-pointer hover:bg-slate-900/50 ${
                      isProfileMenuOpen ? 'border-indigo-500/50 bg-slate-900/60' : 'border-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-inner shrink-0">
                        <img 
                          src={currentUser.avatar} 
                          alt={currentUser.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-0.5 rounded-full border border-slate-900">
                          <Star className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
                        </span>
                      </div>
                      <div className="text-left min-w-0 font-sans">
                        <p className="text-xs font-black text-white truncate max-w-[125px]">{currentUser.name}</p>
                        <p className="text-[10px] text-[#818cf8] font-semibold truncate max-w-[125px]">{currentUser.school.split('(')[0]}</p>
                      </div>
                    </div>

                    <div className="relative p-1">
                      <div className={`p-1 hover:bg-slate-900 rounded-lg text-gray-500 hover:text-white transition cursor-pointer select-none`}>
                        <span className="text-[10px] text-gray-500">▼</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/20 shadow-lg text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer relative overflow-hidden group/btn hover-shake"
                >
                  <LogIn className="w-4 h-4 text-indigo-200" />
                  <span>ĐĂNG NHẬP</span>
                </button>
              )}
            </div>
          </aside>
        </>
      )}

      {/* Mobile Menu (Bottom Bar) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-900">
        <div className="safe-area-bottom px-3 pb-3 pt-2">
          <div className="flex items-center justify-between gap-2">
            {(userRole === 'admin'
              ? [{ id: 'admin', label: 'Admin', icon: <ShieldCheck className="w-4 h-4 text-amber-400" /> }]
              : [
                  { id: 'home', label: 'Home', icon: <Brain className="w-4 h-4 text-indigo-400" /> },
                  { id: 'theory', label: 'Theory', icon: <BookOpen className="w-4 h-4 text-indigo-400" /> },
                  { id: 'ide', label: 'IDE', icon: <Terminal className="w-4 h-4 text-indigo-400" /> },
                  { id: 'arena', label: 'Arena', icon: <Swords className="w-4 h-4 text-indigo-400" /> },
                  { id: 'leaderboard', label: 'Top', icon: <Trophy className="w-4 h-4 text-indigo-400" /> },
                ]
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id as any)}
                className={`flex-1 flex flex-col items-center justify-center py-2 rounded-2xl border transition cursor-pointer select-none ${
                  currentView === item.id
                    ? 'bg-indigo-650/20 border-indigo-500/40'
                    : 'bg-slate-900/30 border-slate-900/60 hover:bg-slate-900/50'
                }`}
              >
                {item.icon}
                <span className="text-[9px] font-extrabold uppercase tracking-wider mt-1 text-gray-400">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsQuickNotesOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/15 transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-300" />
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200">Notes</span>
            </button>

            {currentUser ? (
              <button
                type="button"
                onClick={() => handleLogout()}
                className="w-[86px] flex items-center justify-center py-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-300" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="w-[86px] flex items-center justify-center py-2 rounded-2xl bg-indigo-650/20 border border-indigo-500/30 hover:bg-indigo-650/25 transition cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-indigo-200" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu open dropdown no longer used (bottom bar handles navigation) */}
      {mobileMenuOpen && (
        <div className="hidden" aria-hidden="true" />
      )}

      {/* Main viewport Container screens */}
      <div className={`flex-1 w-full flex flex-col bg-slate-950 transition-all duration-300 ${!isFocusMode ? 'lg:pl-64 pt-16' : ''} ${isWorkspaceView ? 'lg:overflow-hidden' : 'overflow-x-hidden overflow-y-auto'}`}>
        {currentView === 'home' && (
          <HomeView 
            onNavigate={handleNavigate} 
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
          />
        )}
        {currentView === 'theory' && <TheoryView onNavigate={handleNavigate} />}
        {currentView === 'ide' && <IdeView onNavigate={handleNavigate} />}
        {currentView === 'arena' && <ArenaView onNavigate={handleNavigate} onOpenResult={handleOpenResultSim} />}
        {currentView === 'leaderboard' && (
          <LeaderboardView 
            onNavigate={handleNavigate} 
            onSelectArenaSimulation={handleOpenResultSim} 
            weeklyHistory={getWeeklyHistory()}
            dailyCompleted={dailyCompleted}
            dailyGoal={dailyGoal}
            onManualIncrement={handleManualIncrementProgress}
            onManualDecrement={handleManualDecrementProgress}
            currentUser={currentUser}
          />
        )}
        {currentView === 'admin' && (
          <AdminView 
            onNavigate={handleNavigate} 
            currentUserRole={userRole} 
            onUpdateRole={handleUpdateRole} 
          />
        )}
      </div>

      {/* Floating Victory/Defeat Modal Simulation sandboxes */}
      {resultModalType && (
        <ResultModal 
          type={resultModalType} 
          onClose={() => setResultModalType(null)} 
          onNavigateHome={() => handleNavigate('home')}
          onNavigateTheory={() => handleNavigate('theory')}
        />
      )}

      {/* Daily Streak Details Modal */}
      {showStreakDetails && (
        <div id="streak-details-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800/80 p-6 sm:p-8 rounded-2xl max-w-sm w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl relative text-center"
          >
            <button 
              onClick={() => setShowStreakDetails(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/5">
                <Flame className="w-9 h-9 fill-amber-500 text-amber-500 animate-pulse" />
              </div>

              <h3 className="text-xl font-black text-white tracking-tight">CHUỖI LUYỆN TẬP</h3>
              <p className="text-[10px] text-amber-500 font-extrabold tracking-widest uppercase mt-0.5">ALGOLEARN DAILY STREAK</p>
              
              <div className="my-5 bg-slate-950/80 rounded-xl p-4 border border-slate-800 w-full">
                <p className="text-4xl font-black text-amber-400 font-mono tracking-tight">
                  {streak} <span className="text-sm font-sans font-bold text-gray-400 uppercase">Ngày</span>
                </p>
                <p className="text-[10px] text-gray-500 font-medium mt-1">
                  Đã ghi nhận hoạt động hôm nay!
                </p>
              </div>
              
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs mb-6">
                Tuyệt vời! Bạn đang duy trì ngọn lửa kiên trì để biến tư duy thuật toán thành phản xạ tự nhiên. Hãy học lý thuyết hoặc code IDE để giữ vững chuỗi nhé!
              </p>

              {/* Sandbox controls for testing/reviewing streaks easily */}
              <div className="w-full bg-slate-950/40 rounded-xl p-3 border border-slate-800/60 text-left">
                <p className="text-[10px] font-extrabold text-indigo-400 tracking-wider uppercase mb-1 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span>SandBox Simulation (Kiểm thử)</span>
                </p>
                <p className="text-[10px] text-gray-500 mb-3">Tăng giả lập chuỗi để dễ dàng rà soát tính năng:</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold font-sans">
                  <button 
                    onClick={handleIncrementStreak}
                    className="bg-indigo-650 hover:bg-indigo-600 active:scale-95 text-white py-2 rounded-lg cursor-pointer transition select-none flex items-center justify-center space-x-1"
                  >
                    <span>+1 Ngày</span>
                  </button>
                  <button 
                    onClick={handleResetStreak}
                    className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-gray-300 py-2 rounded-lg cursor-pointer transition select-none flex items-center justify-center space-x-1"
                  >
                    <span>Reset về 1</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Daily Goal Details and Configuration Modal */}
      {showDailyGoalDetails && (
        <div id="daily-goal-details-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800/80 p-6 sm:p-8 rounded-2xl max-w-md w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative text-left scrollbar-thin"
          >
            <button 
              onClick={() => {
                setShowDailyGoalDetails(false);
                setSelectedHeatmapDay(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                  <Target className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight uppercase">MỤC TIÊU HÀNG NGÀY</h3>
                  <p className="text-[9px] text-emerald-400 font-extrabold tracking-widest uppercase">AlgoLearn Daily Learning Goal</p>
                </div>
              </div>

              {/* Goal setup percentage bar context */}
              <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800/60 mb-5 relative overflow-hidden">
                <div className="flex justify-between items-end mb-2.5">
                  <div>
                    <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-wider">Tiến độ hôm nay</span>
                    <p className="text-3xl font-mono font-black text-emerald-400 leading-tight">
                      {dailyCompleted} <span className="text-xs font-sans font-bold text-gray-400 uppercase">/ {dailyGoal} Bài tập</span>
                    </p>
                  </div>
                  <span className="text-sm font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-lg">
                    {Math.min(100, Math.round((dailyCompleted / dailyGoal) * 100))}%
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-750"
                    style={{ width: `${Math.min(100, (dailyCompleted / dailyGoal) * 100)}%` }}
                  ></div>
                </div>

                {dailyCompleted >= dailyGoal ? (
                  <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wide mt-3 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-950/30 shrink-0" />
                    <span>Chúc mừng! Bạn đã chinh phục mục tiêu hôm nay! 🎉</span>
                  </p>
                ) : (
                  <div className="space-y-2.5 mt-3">
                    <p className="text-[10px] text-gray-500 font-medium">
                      Hoàn thành thêm <span className="text-emerald-400 font-bold">{Math.max(0, dailyGoal - dailyCompleted)}</span> bài để hoàn tất cột mốc ngày!
                    </p>
                    {new Date().getHours() >= 20 && (
                      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start space-x-2 text-[10px] text-rose-300 font-semibold leading-relaxed">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-450 text-rose-400 shrink-0 mt-0.5" />
                        <span><strong>Nhắc nhở cuối ngày (Sau 20:00):</strong> Bạn chưa đạt mục tiêu học tập hàng ngày hôm nay! Hãy thử giải thêm 1 bài tập nhanh để giữ vững ngọn lửa học tập nhé!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Chia sẻ thành tích Action Block */}
              <div className="mb-5 bg-gradient-to-br from-indigo-950/45 to-slate-950 border border-indigo-500/20 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="text-left">
                  <span className="text-[9.5px] font-black text-indigo-400 uppercase tracking-widest block font-sans">LAN TOẢ ĐỘNG LỰC 🔥</span>
                  <p className="text-[11px] text-gray-300 font-semibold leading-normal mt-0.5 font-sans">
                    Tạo thẻ tóm tắt chuỗi <span className="text-amber-400 font-extrabold font-mono">{streak} ngày</span> và tiến độ học giải thuật để chia sẻ với bạn bè!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateShareCard}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 hover:from-emerald-400 hover:via-indigo-550 hover:to-purple-500 text-white shadow-md shadow-indigo-950/50 transition duration-300 active:scale-95 cursor-pointer shrink-0 flex items-center justify-center gap-1.5 border border-indigo-500/30"
                >
                  <Share2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Chia sẻ ngay</span>
                </button>
              </div>

              {/* Configure Target Goal Block */}
              <div className="mb-5 space-y-2">
                <span className="text-[10px] font-extrabold text-indigo-400 tracking-wider uppercase block">
                  ĐẶT SỐ BÀI TẬP CẦN HOÀN THÀNH MỖI NGÀY:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 5].map((targetVal) => (
                    <button
                      key={targetVal}
                      onClick={() => handleUpdateDailyGoalTarget(targetVal)}
                      className={`py-2 px-3 rounded-lg text-xs font-mono font-bold border transition cursor-pointer select-none active:scale-95 ${
                        dailyGoal === targetVal 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10' 
                          : 'bg-slate-950/80 border-slate-800 text-gray-400 hover:text-white hover:bg-slate-900/60'
                      }`}
                    >
                      {targetVal} Bài
                    </button>
                  ))}
                </div>
              </div>

              {/* Đóng băng chuỗi (Streak Freeze) */}
              <div className="mb-5 bg-gradient-to-br from-sky-950/45 to-slate-950/80 rounded-xl p-4 border border-sky-500/25 space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-sky-500/10 transition-all duration-500"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-2">
                    <span className={`p-1.5 rounded-lg border transition-all duration-300 ${
                      streakFreezeActive 
                        ? 'bg-sky-500/15 border-sky-450/40 text-sky-400 animate-spin-slow' 
                        : 'bg-slate-900 border-slate-800 text-sky-300'
                    }`}>
                      <Snowflake className={`w-4 h-4 ${streakFreezeActive ? 'animate-pulse' : ''}`} />
                    </span>
                    <div>
                      <span className="text-[10px] font-black text-sky-400 tracking-wider uppercase block">
                        ĐÓNG BẰNG CHUỖI (STREAK FREEZE)
                      </span>
                      <span className="text-[9px] text-gray-400 font-medium">Bảo hiểm 1 ngày giữ vững ngọn lửa</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-lg border select-none ${
                    streakFreezeActive 
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' 
                      : 'bg-slate-950/80 border-slate-850 text-gray-500'
                  }`}>
                    {streakFreezeActive ? 'ĐÃ BẬT ❄️' : 'CHƯA BẬT'}
                  </span>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-850 space-y-2.5 relative z-10">
                  <p className="text-[10.5px] text-gray-300 leading-normal font-medium">
                    Ngăn chặn chuỗi ngày học luyện tập (Streak) quý giá bị reset về 0/1 ngày nếu bạn vô tình bận rộn không hoàn thành mục tiêu hôm nay.
                  </p>
                  
                  <div className="flex items-center justify-between text-[9px] font-bold border-t border-slate-900 pt-2 text-gray-500">
                    <span>Sử dụng ngay: <strong className="text-sky-400 font-extrabold font-mono">500 XP</strong></span>
                    <span>Tài khoản: <strong className="text-amber-400 font-extrabold font-mono">{(currentUser ? currentUser.xp : userXp).toLocaleString()} XP</strong></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePurchaseStreakFreeze}
                  disabled={streakFreezeActive || (currentUser ? currentUser.xp : userXp) < 500}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer select-none flex items-center justify-center gap-1.5 border relative z-10 ${
                    streakFreezeActive
                      ? 'bg-sky-500/10 border-sky-500/20 text-sky-300 cursor-not-allowed opacity-80'
                      : (currentUser ? currentUser.xp : userXp) >= 500
                        ? 'bg-sky-600 hover:bg-sky-550 border-sky-500 text-white shadow-lg shadow-sky-600/15'
                        : 'bg-slate-900 border-slate-850 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Snowflake className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {streakFreezeActive 
                      ? 'ĐÃ KÍCH HOẠT ĐÓNG BĂNG ❄️' 
                      : (currentUser ? currentUser.xp : userXp) >= 500 
                        ? 'ĐỔI 500 XP ĐỂ KÍCH HOẠT' 
                        : 'CHƯA ĐỦ XP (CẦN 500 XP)'
                    }
                  </span>
                </button>
              </div>

              {/* Cài đặt Nhắc nhở Học tập (Learning Reminders) */}
              <div className="mb-5 bg-slate-950/80 rounded-xl p-4 border border-slate-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded bg-indigo-500/10 border border-indigo-505/20">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    </span>
                    <span className="text-[10px] font-extrabold text-indigo-400 tracking-wider uppercase block">
                      NHẮC NHỞ HỌC TẬP (REMINDERS):
                    </span>
                  </div>
                  
                  {/* Switch/Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = !remindersEnabled;
                      setRemindersEnabled(next);
                      localStorage.setItem('algolearn_reminders_enabled', String(next));
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                      remindersEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-250 ease-in-out ${
                        remindersEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {remindersEnabled && (
                  <div className="space-y-3 pt-2 border-t border-slate-900/60 animate-fade-in_short">
                    <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center justify-between">
                      <span className="text-[10.5px] text-gray-400 font-medium leading-normal">
                        Nhắc nhở học tập lúc:
                      </span>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Time Picker */}
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(e) => {
                            const val = e.target.value;
                            setReminderTime(val);
                            localStorage.setItem('algolearn_reminder_time', val);
                          }}
                          className="bg-slate-900 border border-slate-800 focus:border-indigo-500 text-xs text-indigo-200 font-mono font-bold rounded-lg px-2.5 py-1 outline-none transition cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                      {['09:00', '12:00', '18:00', '21:00'].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            setReminderTime(time);
                            localStorage.setItem('algolearn_reminder_time', time);
                          }}
                          className={`py-1 px-2 rounded-md text-[10px] font-mono font-bold border transition cursor-pointer select-none ${
                            reminderTime === time
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-slate-900/40 border-slate-800 text-gray-500 hover:text-gray-300 hover:bg-slate-900'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    <p className="text-[9.5px] text-gray-400 leading-normal font-medium bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                      💡 Nhắc nhở ở góc màn hình sẽ hiện lên lúc <strong className="text-indigo-300 font-bold font-mono">{reminderTime}</strong> nếu bạn chưa hoàn tất mục tiêu ngày.
                    </p>

                    {/* Simulating button for testing/reviewing */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowReminderToast(true);
                        setTimeout(() => setShowReminderToast(false), 6000);
                      }}
                      className="w-full py-1.5 px-3 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 text-[9.5px] font-black uppercase rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      Bắn thông báo thử nghiệm 🔔
                    </button>
                  </div>
                )}
              </div>

              {/* Huy hiệu và Danh hiệu danh giá */}
              <div className="mb-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                  <span className="text-[10px] font-extrabold text-amber-400 tracking-wider uppercase flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                    <span>HUY HIỆU DANH GIÁ (BADGES)</span>
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900/60 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                    <span>Đã đạt: {[
                      streak >= 7,
                      userSolved >= 100,
                      dailyCompleted >= dailyGoal,
                      userSolved >= 10
                    ].filter(Boolean).length}/4</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Badge 1: Chuỗi 7 Ngày */}
                  {(() => {
                    const isUnlocked = streak >= 7;
                    return (
                      <div className={`p-3 rounded-xl border flex gap-2.5 items-start transition-all relative overflow-hidden group select-none ${
                        isUnlocked 
                          ? 'bg-gradient-to-br from-orange-950/30 to-amber-900/15 border-orange-500/30 shadow-md shadow-orange-500/5' 
                          : 'bg-slate-950/40 border-slate-800/60 text-gray-500'
                      }`}>
                        {/* Glowing Background Overlay on Unlocked */}
                        {isUnlocked && (
                          <span className="absolute -inset-10 bg-orange-500/5 blur-xl group-hover:bg-orange-500/10 transition-all duration-500 pointer-events-none rounded-full" />
                        )}
                        
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                          isUnlocked 
                            ? 'bg-orange-500/15 border border-orange-500/30 shadow-sm shadow-orange-500/20' 
                            : 'bg-slate-900 border border-slate-800/60'
                        }`}>
                          <Flame className={`w-5 h-5 shrink-0 ${
                            isUnlocked 
                              ? 'text-orange-400 fill-orange-500/30 drop-shadow-[0_0_6px_rgba(249,115,22,0.4)] animate-pulse' 
                              : 'text-gray-600'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                          <div>
                            <p className={`text-[10.5px] font-extrabold truncate uppercase tracking-tight leading-snug ${
                              isUnlocked ? 'text-orange-200' : 'text-gray-400'
                            }`}>
                              Chuỗi 7 Ngày
                            </p>
                            <p className="text-[8.5px] text-gray-500 font-medium leading-none mt-0.5">
                              Học liên tục 7 ngày
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/40">
                            <span className={`text-[9px] font-mono font-bold ${
                              isUnlocked ? 'text-orange-400' : 'text-gray-500'
                            }`}>
                              {streak}/7N
                            </span>
                            {isUnlocked ? (
                              <span className="text-[8px] font-extrabold text-orange-400 bg-orange-500/15 px-1 rounded-md py-0.5">Đã đạt</span>
                            ) : (
                              <Lock className="w-2.5 h-2.5 text-gray-600" />
                            )}
                          </div>

                          {!isUnlocked && (
                            <div className="mt-2 space-y-1">
                              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900/40">
                                <div 
                                  className="bg-gradient-to-r from-orange-600 to-amber-500 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, Math.round((streak / 7) * 100))}%` }}
                                />
                              </div>
                              <span className="text-[7.5px] font-black text-orange-400/80 block text-right">
                                {Math.min(100, Math.round((streak / 7) * 100))}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Badge 2: Hoàn thành 100 bài tập */}
                  {(() => {
                    const isUnlocked = userSolved >= 100;
                    return (
                      <div className={`p-3 rounded-xl border flex gap-2.5 items-start transition-all relative overflow-hidden group select-none ${
                        isUnlocked 
                          ? 'bg-gradient-to-br from-indigo-950/30 to-violet-900/15 border-indigo-500/30 shadow-md shadow-indigo-500/5' 
                          : 'bg-slate-950/40 border-slate-800/60 text-gray-500'
                      }`}>
                        {isUnlocked && (
                          <span className="absolute -inset-10 bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-all duration-500 pointer-events-none rounded-full" />
                        )}
                        
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                          isUnlocked 
                            ? 'bg-indigo-500/15 border border-indigo-500/30 shadow-sm shadow-indigo-500/20' 
                            : 'bg-slate-900 border border-slate-800/60'
                        }`}>
                          <Trophy className={`w-5 h-5 shrink-0 ${
                            isUnlocked 
                              ? 'text-indigo-400 fill-indigo-500/20 drop-shadow-[0_0_6px_rgba(99,102,241,0.4)] animate-bounce' 
                              : 'text-gray-600'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                          <div>
                            <p className={`text-[10.5px] font-extrabold truncate uppercase tracking-tight leading-snug ${
                              isUnlocked ? 'text-indigo-200' : 'text-gray-400'
                            }`}>
                              Vua Giải Thuật
                            </p>
                            <p className="text-[8.5px] text-gray-500 font-medium leading-none mt-0.5">
                              Giải 100 bài tập
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/40">
                            <span className={`text-[9px] font-mono font-bold ${
                              isUnlocked ? 'text-indigo-400' : 'text-gray-500'
                            }`}>
                              {userSolved}/100
                            </span>
                            {isUnlocked ? (
                              <span className="text-[8px] font-extrabold text-indigo-400 bg-indigo-500/15 px-1 rounded-md py-0.5">Đã đạt</span>
                            ) : (
                              <Lock className="w-2.5 h-2.5 text-gray-600" />
                            )}
                          </div>

                          {!isUnlocked && (
                            <div className="mt-2 space-y-1">
                              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900/40">
                                <div 
                                  className="bg-gradient-to-r from-indigo-600 to-violet-500 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, Math.round((userSolved / 100) * 100))}%` }}
                                />
                              </div>
                              <span className="text-[7.5px] font-black text-indigo-400/80 block text-right">
                                {Math.min(100, Math.round((userSolved / 100) * 100))}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Badge 3: Người học chăm chỉ nhất trong ngày */}
                  {(() => {
                    const isUnlocked = dailyCompleted >= dailyGoal;
                    return (
                      <div className={`p-3 rounded-xl border flex gap-2.5 items-start transition-all relative overflow-hidden group select-none ${
                        isUnlocked 
                          ? 'bg-gradient-to-br from-emerald-950/30 to-teal-900/15 border-emerald-500/30 shadow-md shadow-emerald-500/5' 
                          : 'bg-slate-950/40 border-slate-800/60 text-gray-500'
                      }`}>
                        {isUnlocked && (
                          <span className="absolute -inset-10 bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-all duration-500 pointer-events-none rounded-full" />
                        )}
                        
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                          isUnlocked 
                            ? 'bg-emerald-500/15 border border-emerald-500/30 shadow-sm shadow-emerald-500/20' 
                            : 'bg-slate-900 border border-slate-800/60'
                        }`}>
                          <Sparkles className={`w-5 h-5 shrink-0 ${
                            isUnlocked 
                              ? 'text-emerald-400 fill-emerald-500/20 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)] animate-pulse' 
                              : 'text-gray-600'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                          <div>
                            <p className={`text-[10.5px] font-extrabold truncate uppercase tracking-tight leading-snug ${
                              isUnlocked ? 'text-emerald-200' : 'text-gray-400'
                            }`}>
                              Điểm Sáng Ngày
                            </p>
                            <p className="text-[8.5px] text-gray-500 font-medium leading-none mt-0.5">
                              Đạt mục tiêu hôm nay
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/40">
                            <span className={`text-[9px] font-mono font-bold ${
                              isUnlocked ? 'text-emerald-400' : 'text-gray-500'
                            }`}>
                              {dailyCompleted}/{dailyGoal}B
                            </span>
                            {isUnlocked ? (
                              <span className="text-[8px] font-extrabold text-emerald-400 bg-emerald-500/15 px-1 rounded-md py-0.5">Đã đạt</span>
                            ) : (
                              <Lock className="w-2.5 h-2.5 text-gray-600" />
                            )}
                          </div>

                          {!isUnlocked && (
                            <div className="mt-2 space-y-1">
                              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900/40">
                                <div 
                                  className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, Math.round((dailyCompleted / (dailyGoal || 1)) * 100))}%` }}
                                />
                              </div>
                              <span className="text-[7.5px] font-black text-emerald-400/80 block text-right">
                                {Math.min(100, Math.round((dailyCompleted / (dailyGoal || 1)) * 100))}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Badge 4: Vượt mốc 10 bài tập */}
                  {(() => {
                    const isUnlocked = userSolved >= 10;
                    return (
                      <div className={`p-3 rounded-xl border flex gap-2.5 items-start transition-all relative overflow-hidden group select-none ${
                        isUnlocked 
                          ? 'bg-gradient-to-br from-amber-950/30 to-yellow-950/15 border-amber-500/30 shadow-md shadow-amber-500/5' 
                          : 'bg-slate-950/40 border-slate-800/60 text-gray-500'
                      }`}>
                        {isUnlocked && (
                          <span className="absolute -inset-10 bg-amber-500/5 blur-xl group-hover:bg-amber-500/10 transition-all duration-500 pointer-events-none rounded-full" />
                        )}
                        
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                          isUnlocked 
                            ? 'bg-amber-500/15 border border-amber-500/30 shadow-sm shadow-amber-500/20' 
                            : 'bg-slate-900 border border-slate-800/60'
                        }`}>
                          <Zap className={`w-5 h-5 shrink-0 ${
                            isUnlocked 
                              ? 'text-amber-400 fill-amber-500/25 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)] animate-pulse' 
                              : 'text-gray-600'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                          <div>
                            <p className={`text-[10.5px] font-extrabold truncate uppercase tracking-tight leading-snug ${
                              isUnlocked ? 'text-amber-200' : 'text-gray-400'
                            }`}>
                              Tập Sự Bứt Phá
                            </p>
                            <p className="text-[8.5px] text-gray-500 font-medium leading-none mt-0.5">
                              Giải tối thiểu 10 bài
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/40">
                            <span className={`text-[9px] font-mono font-bold ${
                              isUnlocked ? 'text-amber-400' : 'text-gray-500'
                            }`}>
                              {userSolved}/10
                            </span>
                            {isUnlocked ? (
                              <span className="text-[8px] font-extrabold text-amber-500 bg-amber-500/15 px-1 rounded-md py-0.5">Đã đạt</span>
                            ) : (
                              <Lock className="w-2.5 h-2.5 text-gray-600" />
                            )}
                          </div>

                          {!isUnlocked && (
                            <div className="mt-2 space-y-1">
                              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900/40">
                                <div 
                                  className="bg-gradient-to-r from-amber-600 to-yellow-500 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, Math.round((userSolved / 10) * 100))}%` }}
                                />
                              </div>
                              <span className="text-[7.5px] font-black text-amber-400/80 block text-right">
                                {Math.min(100, Math.round((userSolved / 10) * 100))}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 30-Day Consistency Heatmap Block */}
              {(() => {
                const history30Days = get30DayHistory();
                const activeDaysCount = history30Days.filter(h => h.count > 0).length;
                const goalAchievedDaysCount = history30Days.filter(h => h.count >= dailyGoal).length;
                return (
                  <div className="mb-5 bg-slate-950/80 rounded-xl p-4 border border-slate-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-emerald-400 tracking-wider uppercase block">
                        BIỂU ĐỒ CHUYÊN CẦN (30 NGÀY QUA)
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono font-semibold">
                        Đạt mục tiêu: {goalAchievedDaysCount}/30N ({Math.round((goalAchievedDaysCount / 30) * 100)}%)
                      </span>
                    </div>

                    <div className="grid grid-cols-10 gap-1.5 justify-center py-1">
                      {history30Days.map((day, idx) => {
                        const isSelfToday = day.date === getLocalDateString(new Date());
                        const dayCount = isSelfToday ? dailyCompleted : day.count;

                        let colorClass = 'bg-slate-900 border-slate-800 text-gray-600';
                        let levelLabel = 'Chưa học';
                        if (dayCount > 0) {
                          if (dayCount >= dailyGoal) {
                            colorClass = 'bg-emerald-500 border-emerald-400/50 text-white font-extrabold';
                            levelLabel = `Đạt mục tiêu (${dayCount}/${dailyGoal} bài)`;
                          } else {
                            colorClass = 'bg-emerald-800/80 border-emerald-700/60 text-emerald-100';
                            levelLabel = `Đang học (${dayCount}/${dailyGoal} bài)`;
                          }
                        }

                        const isSelected = selectedHeatmapDay?.date === day.date;

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedHeatmapDay(day);
                              setTempNote(dayNotes[day.date] || '');
                            }}
                            title={`Ngày ${day.displayDate}: ${levelLabel}${day.isToday ? ' (Hôm nay)' : ''}`}
                            className={`aspect-square rounded-md border flex flex-col items-center justify-center text-[9px] font-mono select-none transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform hover:scale-120 hover:z-10 hover:shadow-md hover:shadow-indigo-500/30 hover:border-indigo-400 cursor-pointer ${colorClass} ${
                              isSelected 
                                ? 'ring-2 ring-emerald-300 border-transparent scale-110 shadow-lg shadow-emerald-500/20' 
                                : day.isToday 
                                  ? 'ring-2 ring-indigo-500 border-transparent scale-105' 
                                  : 'scale-100'
                            }`}
                          >
                            {day.displayDate.split('/')[0]}
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Heatmap Day Info Detail Section */}
                    <AnimatePresence>
                      {selectedHeatmapDay && (() => {
                        const isSelfToday = selectedHeatmapDay.date === getLocalDateString(new Date());
                        const dayCount = isSelfToday ? dailyCompleted : selectedHeatmapDay.count;
                        const dayExercises = getExercisesForDay(selectedHeatmapDay.date, dayCount);
                        
                        return (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-900/90 border border-indigo-500/25 rounded-xl p-3.5 space-y-3 relative text-left overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedHeatmapDay(null)}
                              className="absolute top-2 right-2 text-gray-450 hover:text-white transition cursor-pointer p-1 text-gray-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            
                            <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800/60 pb-2">
                              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[10.5px] font-extrabold text-gray-200">
                                CHI TIẾT NGÀY {selectedHeatmapDay.displayDate} {selectedHeatmapDay.isToday ? " (HÔM NAY)" : ""}
                              </span>
                            </div>

                            {/* Completed Lessons & Exercises */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">
                                  Bài tập đã hoàn thành ({dayCount}):
                                </span>
                                <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded ${
                                  dayCount >= dailyGoal 
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                    : dayCount > 0 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-slate-950 text-gray-500'
                                }`}>
                                  {dayCount >= dailyGoal ? "ĐẠT MỤC TIÊU 🎉" : dayCount > 0 ? "ĐANG TIẾN HÀNH" : "CHƯA HOÀN THÀNH"}
                                </span>
                              </div>
                              
                              {dayExercises.length > 0 ? (
                                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-0.5 scrollbar-thin">
                                  {dayExercises.map((task, exIdx) => (
                                    <div key={exIdx} className="flex items-center space-x-2 bg-slate-950/80 px-2 py-1.5 rounded-lg border border-slate-900/60 hover:border-slate-800 transition-colors">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                      <span className="text-[10px] text-gray-300 font-medium truncate">{task}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[9.5px] text-gray-500 bg-slate-950/50 p-2.5 rounded-lg text-center leading-normal">
                                  Không ghi nhận bài giải nào trong ngày này. {selectedHeatmapDay.isToday ? "Hãy luyện tập các bài học hoặc tham gia cọ xát tại Đấu Trường ngay!" : "Chăm chỉ rèn luyện mỗi ngày nhé!"}
                                </p>
                              )}
                            </div>

                            {/* Learning diary/notes input */}
                            <div className="space-y-2 pt-2 border-t border-slate-800/40">
                              <div className="flex items-center space-x-1">
                                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">Nhật ký & Ghi chú học tập:</span>
                              </div>
                              
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={tempNote}
                                  onChange={(e) => setTempNote(e.target.value)}
                                  placeholder="Nhập ghi chú quan trọng hôm nay..."
                                  className="flex-1 bg-slate-950 border border-slate-850/80 focus:border-indigo-500 text-[10.5px] text-gray-200 rounded-xl px-3 py-2 outline-none transition"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveDayNote(selectedHeatmapDay.date)}
                                  className="bg-indigo-600 hover:bg-indigo-550 text-white p-2 rounded-xl transition-all shrink-0 active:scale-95 cursor-pointer inline-flex items-center justify-center border border-indigo-500/20 hover:shadow-sm"
                                  title="Lưu ghi chú"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {dayNotes[selectedHeatmapDay.date] ? (
                                <div className="text-[10px] text-gray-300 leading-normal bg-indigo-500/5 border border-indigo-500/10 p-2.5 rounded-xl flex items-start gap-1.5">
                                  <span className="text-amber-400">📝</span>
                                  <p className="flex-1 min-w-0 break-words font-medium">
                                    <strong className="text-indigo-300 font-bold block mb-0.5 text-[9px] uppercase tracking-wider">Đã ghi chép:</strong>
                                    {dayNotes[selectedHeatmapDay.date]}
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>

                    {/* Heatmap Legend */}
                    <div className="flex items-center justify-between pt-1 text-[8px] text-gray-500 font-bold border-t border-slate-900">
                      <div className="flex items-center space-x-1">
                        <span>Ít</span>
                        <span className="w-2.5 h-2.5 rounded bg-slate-900 border border-slate-800"></span>
                        <span className="w-2.5 h-2.5 rounded bg-emerald-800 border border-emerald-700/60"></span>
                        <span className="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-400/50"></span>
                        <span>Nhiều</span>
                      </div>
                      <div className="font-sans text-gray-400 flex items-center space-x-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                        <span>Đã học {activeDaysCount}/30 ngày qua</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Top Learners Today Section */}
              {(() => {
                const mockDailyUsers = [
                  { name: "Felix Nguyễn", school: "HUST", count: 4, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&auto=format&fit=crop&q=80", isSelf: false },
                  { name: "Sarah Trần", school: "ĐHQG-HCM", count: 3, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80", isSelf: false },
                  { name: "Alex Lê", school: "UET", count: 2, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80", isSelf: false },
                  { name: "Hoàng Duy Nam", school: "PTIT", count: 1, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80", isSelf: false }
                ];

                const todayRankings = [
                  {
                    name: currentUser?.name || "Bạn (Học viên)",
                    school: currentUser?.school ? currentUser.school.split('(')[0].trim() : "Trường của bạn",
                    count: dailyCompleted,
                    avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80",
                    isSelf: true
                  },
                  ...mockDailyUsers
                ].sort((a, b) => b.count - a.count);

                return (
                  <div className="mb-5 bg-slate-950/80 rounded-xl p-4 border border-slate-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-indigo-400">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] font-extrabold text-indigo-300 tracking-wider uppercase block">
                          TOP NGƯỜI HỌC HÔM NAY
                        </span>
                      </div>
                      <span className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-400 font-bold uppercase tracking-wider">
                        Bảng xếp hạng ngày
                      </span>
                    </div>

                    <p className="text-[9.5px] text-gray-500 leading-normal">
                      Cạnh tranh tích cực cùng các học viên khác bằng cách chăm chỉ tích lũy bài giải! Bảng xếp hạng cập nhật liên tục hôm nay.
                    </p>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5 scrollbar-thin">
                      {todayRankings.map((user, idx) => {
                        const rank = idx + 1;
                        let rankBadge = '';
                        let rankBg = 'bg-slate-900 border-slate-800 text-gray-400';
                        if (rank === 1) {
                          rankBadge = '🥇';
                          rankBg = 'bg-amber-500/15 border-amber-500/35 text-amber-300 font-extrabold';
                        } else if (rank === 2) {
                          rankBadge = '🥈';
                          rankBg = 'bg-slate-300/15 border-slate-300/35 text-gray-300 font-extrabold';
                        } else if (rank === 3) {
                          rankBadge = '🥉';
                          rankBg = 'bg-amber-800/15 border-amber-800/35 text-amber-600 font-extrabold';
                        }

                        return (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-300 ${
                              user.isSelf 
                                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-sm shadow-emerald-500/5' 
                                : 'bg-slate-900/40 border-slate-900/60 hover:bg-slate-900 hover:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              {/* Rank position */}
                              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-mono select-none shrink-0 ${rankBg}`}>
                                {rankBadge || rank}
                              </div>
                              
                              {/* Avatar */}
                              <img 
                                src={user.avatar} 
                                alt={user.name} 
                                className={`w-7 h-7 rounded-lg object-cover border shrink-0 ${user.isSelf ? 'border-emerald-500/30' : 'border-slate-850'}`}
                                referrerPolicy="no-referrer"
                              />

                              <div className="min-w-0 text-left">
                                <p className={`text-xs font-bold leading-tight truncate ${user.isSelf ? 'text-emerald-400' : 'text-gray-200'}`}>
                                  {user.name} {user.isSelf && <span className="text-[9px] font-sans text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded-md ml-1 font-bold">Bạn</span>}
                                </p>
                                <p className="text-[9px] text-gray-500 truncate leading-none mt-0.5">{user.school}</p>
                              </div>
                            </div>

                            {/* Completed Today count */}
                            <div className="text-right shrink-0">
                              <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg flex items-center space-x-1 ${
                                user.count > 0 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                                  : 'bg-slate-950 text-gray-650'
                              }`}>
                                <Flame className={`w-3.5 h-3.5 fill-current shrink-0 ${user.count > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-600'}`} />
                                <span>{user.count} bài</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Task hints of how to accumulate goals */}
              <div className="bg-slate-950/30 rounded-xl p-3.5 border border-slate-850/60 mb-5 space-y-2">
                <span className="text-[9px] font-black text-gray-500 tracking-widest uppercase block">Cách tích lũy tiến trình:</span>
                <ul className="text-xs text-gray-400 space-y-2 font-medium">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mt-1.5 shrink-0"></span>
                    <span><strong>Học lý thuyết</strong>: Hỏi hoặc giải đáp thắc mắc cùng Algo AI.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 shrink-0"></span>
                    <span><strong>Luyện Code IDE</strong>: Chạy thử nghiệm trình biên dịch code.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e] mt-1.5 shrink-0"></span>
                    <span><strong>Thách đấu Arena</strong>: Xem kết quả chấm bài thi đấu 1v1.</span>
                  </li>
                </ul>
              </div>

              {/* Sandbox controls for manual tracking adjustment */}
              <div className="w-full bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 text-left">
                <p className="text-[10px] font-extrabold text-[#10b981] tracking-wider uppercase mb-1 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Sandbox Simulation (Kiểm thử Mục tiêu)</span>
                </p>
                <p className="text-[10px] text-gray-500 mb-3.5">
                  Tăng/giảm giả lập số lượng bài đã học hôm nay để kiểm tra:
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold font-sans">
                  <button 
                    onClick={handleManualIncrementProgress}
                    className="bg-[#10b981]/15 hover:bg-[#10b981]/25 active:scale-95 text-emerald-400 border border-emerald-500/20 py-2 rounded-lg cursor-pointer transition select-none flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+1 Bài</span>
                  </button>
                  <button 
                    onClick={handleManualDecrementProgress}
                    disabled={dailyCompleted <= 0}
                    className="bg-slate-805/80 border border-slate-800 hover:bg-slate-800 active:scale-95 text-slate-300 py-2 rounded-lg cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition select-none flex items-center justify-center space-x-1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>-1 Bài</span>
                  </button>
                  <button 
                    onClick={handleResetDailyProgress}
                    className="bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 active:scale-95 py-2 rounded-lg cursor-pointer transition select-none flex items-center justify-center space-x-1"
                  >
                    <span>Reset</span>
                  </button>
                </div>
                
                <div className="mt-3.5 pt-3 border-t border-slate-900 flex justify-between items-center gap-2">
                  <span className="text-[9px] text-[#10b981] font-bold">Giả lập Đóng băng:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !streakFreezeActive;
                        setStreakFreezeActive(nextVal);
                        localStorage.setItem('algolearn_streak_freeze_active', String(nextVal));
                      }}
                      className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition select-none cursor-pointer ${
                        streakFreezeActive 
                          ? 'bg-sky-500/25 border-sky-500/40 text-sky-450 text-sky-300' 
                          : 'bg-slate-900 border-slate-800 text-gray-500'
                      }`}
                    >
                      {streakFreezeActive ? 'Đang Frozen ❄️' : 'Đang Bình thường 🔥'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Gift 500 XP to test purchasing
                        handleAwardXp(500);
                      }}
                      className="px-2.5 py-1 text-[9px] font-bold bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-505/20 text-indigo-300 uppercase rounded transition cursor-pointer"
                      title="Nạp nhanh 500 XP để test tính năng đổi quà"
                    >
                      +500 XP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating Active Streak Reward Notification toast */}
      <AnimatePresence>
        {showStreakAchievement && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-55 bg-slate-900 border-2 border-amber-500/40 p-4 rounded-xl shadow-2xl flex items-center space-x-3.5 max-w-sm w-[90vw] md:w-auto text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 border border-amber-500/30 animate-pulse">
              <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <div className="text-left font-sans">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">CHUỖI TĂNG NHIỆT 🔥</h4>
              <p className="text-xs text-white">Bạn vừa khẳng định chuỗi <span className="font-extrabold text-amber-400 font-mono text-sm">{streak} ngày</span> học giải thuật!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Learning Reminder Notification toast */}
      <AnimatePresence>
        {showReminderToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 md:bottom-20 right-6 z-55 bg-slate-900 border-2 border-indigo-500/40 p-4 rounded-xl shadow-2xl flex items-center space-x-3.5 max-w-sm w-[90vw] md:w-auto text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0 border border-indigo-500/30 animate-pulse">
              <Calendar className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="text-left font-sans flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">NHẮC NHỞ HỌC TẬP 🔔</h4>
                <button 
                  onClick={() => setShowReminderToast(false)}
                  className="text-gray-500 hover:text-white pb-1 ml-2 cursor-pointer focus:outline-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-white leading-snug mt-1">
                Đã đến giờ nhắc nhở ({reminderTime})! Bạn mới hoàn thành <span className="font-extrabold text-amber-400 font-mono text-sm">{dailyCompleted}/{dailyGoal} bài</span>. Hãy học thêm một chút nhé!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Daily Goal Reached Reward Notification toast */}
      <AnimatePresence>
        {showDailyGoalCelebration && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-55 bg-slate-900 border-2 border-emerald-500/40 p-4 rounded-xl shadow-2xl flex items-center space-x-3.5 max-w-sm w-[90vw] md:w-auto text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 border border-emerald-500/30 animate-pulse">
              <Target className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-left font-sans">
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">MỤC TIÊU HOÀN THÀNH 🎯</h4>
              <p className="text-xs text-white">
                Chúc mừng! Bạn đã hoàn tất xuất sắc mục tiêu <span className="font-extrabold text-emerald-400 font-mono text-sm">{dailyGoal}/{dailyGoal} bài tập</span> hôm nay!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Focus Mode toolbar */}
      <AnimatePresence>
        {isFocusMode && (
          <motion.div 
            initial={{ opacity: 0, y: 30, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-55 bg-slate-900/90 backdrop-blur-md border border-indigo-500/40 p-2.5 px-4 rounded-xl shadow-2xl flex items-center justify-between gap-4 text-xs font-sans max-w-sm sm:max-w-md w-[92vw] sm:w-auto"
          >
            <div className="flex items-center space-x-1.5 border-r border-slate-800/80 pr-3.5 select-none shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-extrabold text-emerald-400 tracking-wider uppercase">TẬP TRUNG</span>
            </div>

            {/* View selectors to easily swap between IDE and Arena without leaving Focus Mode */}
            <div className="flex items-center space-x-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-850">
              <button
                onClick={() => setCurrentView('ide')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                  currentView === 'ide' 
                    ? 'bg-indigo-650 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Chuyển sang Cơ khí IDE"
              >
                IDE
              </button>
              <button
                onClick={() => setCurrentView('arena')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                  currentView === 'arena' 
                    ? 'bg-indigo-650 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Chuyển sang Đấu Trường 1v1"
              >
                Đấu trường
              </button>
            </div>

            <button 
              onClick={() => {
                setIsFocusMode(false);
                localStorage.setItem('algolearn_focus_mode', 'false');
              }}
              className="bg-rose-500/10 hover:bg-rose-500/15 text-rose-400 font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-lg border border-rose-500/25 active:scale-95 transition cursor-pointer flex items-center space-x-1 shrink-0"
              title="Thoát Chế độ Tập trung để hiển thị lại Menu"
            >
              <X className="w-3.5 h-3.5" />
              <span>Thoát</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Card Preview Sub-modal */}
      <AnimatePresence>
        {showSharePreview && (
          <div id="share-card-preview-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800/90 p-5 sm:p-7 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-center scrollbar-thin space-y-4"
            >
              <button
                onClick={() => {
                  setShowSharePreview(false);
                  setShareImageSrc(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
                title="Đóng xem trước"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-white tracking-tight uppercase mt-2 font-sans">ẢNH CHIA SẺ THÀNH TÍCH MỸ LỆ</h3>
                <p className="text-[10px] text-gray-400 font-medium font-sans">Lan toả chuỗi nhiệt luyện thuật toán cực xịn</p>
              </div>

              {shareImageSrc ? (
                <div className="relative group max-w-sm mx-auto overflow-hidden rounded-2xl border border-indigo-500/25 shadow-xl shadow-indigo-950/40">
                  <img 
                    src={shareImageSrc} 
                    alt="AlgoLearn Share Card" 
                    className="w-full h-auto object-contain rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center pointer-events-none">
                    <p className="text-white text-[10px] font-bold font-sans bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl">
                      💡 Nhấn giữ hình ảnh để tải về trên điện thoại di động!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-slate-950/60 rounded-2xl flex items-center justify-center border border-slate-850 animate-pulse text-xs text-gray-500">
                  Đang khởi tạo hình ảnh thành tích...
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                {shareImageSrc && (
                  <a
                    href={shareImageSrc}
                    download={`AlgoLearn_Chuoi_Lien_Tuc_${streak}_Ngay.png`}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-550 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-500 shadow-lg shadow-emerald-950/20 text-center"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>Lưu Hình Ảnh</span>
                  </a>
                )}
                
                <button
                  type="button"
                  onClick={handleCopyShareText}
                  className="flex-1 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider rounded-xl border border-indigo-500/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {copyStatus ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-emerald-400 font-bold">Đã Sao Chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-gray-500 font-medium leading-relaxed font-sans">
                Lưu thẻ này để cài màn hình khóa, khoe trên mạng xã hội Facebook, Instagram hay nhóm học tập của bạn để duy trì áp lực rèn luyện hoàn hảo!
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />

      <EditProfileModal 
        isOpen={isEditingProfile} 
        onClose={() => setIsEditingProfile(false)} 
        currentUser={currentUser}
        onSave={handleSaveProfile}
      />

      <QuickNotesSidebar 
        isOpen={isQuickNotesOpen} 
        onClose={() => setIsQuickNotesOpen(false)} 
        userRole={userRole}
      />

      {/* Floating Quick Notes Trigger Button */}
      <motion.button
        id="floating_notes_trigger"
        onClick={() => setIsQuickNotesOpen(true)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-4 bottom-4 sm:bottom-6 z-40 bg-gradient-to-r from-indigo-650 to-indigo-600 hover:from-indigo-600 hover:to-indigo-550 border border-indigo-500/25 p-3 sm:py-2.5 sm:px-4 text-white rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_15px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(79,70,229,0.4)] cursor-pointer flex items-center space-x-2 transition-all group select-none"
        title="Sổ tay ghi chú thuật toán nhanh (Alt + N)"
      >
        <FileText className="w-5 h-5 group-hover:rotate-6 transition-transform text-indigo-200 group-hover:text-white" />
        <span className="hidden sm:inline text-xs font-black uppercase tracking-wider">Sổ tay ghi chú</span>
        <kbd className="hidden md:inline-flex items-center justify-center bg-indigo-800/65 border border-indigo-500/30 text-[9px] font-mono leading-none rounded-md px-1 py-0.5 select-none uppercase text-indigo-200">
          Alt+N
        </kbd>
      </motion.button>

      {/* Floating Mouse pointer XP badges with physics upward waves */}
      <AnimatePresence shrink={false}>
        {floatingXps.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.3, x: item.x - 40, y: item.y - 12 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0.6, 1.25, 1, 0.85], 
              y: item.y - 140, 
              x: item.x - 40 + (Math.sin(parseInt(item.id.slice(-2), 36) || 0) * 35)
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="fixed pointer-events-none z-[999999] flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-full shadow-[0_12px_28px_-4px_rgba(245,158,11,0.5),0_0_15px_rgba(234,179,8,0.3)] border border-yellow-300"
          >
            <Star className="w-3.5 h-3.5 fill-current text-slate-950 stroke-[2.5]" />
            <span className="font-mono tracking-tight font-extrabold text-[11px]">+{item.xp} XP</span>
          </motion.div>
        ))}
      </AnimatePresence>

    </div>
  );
}
