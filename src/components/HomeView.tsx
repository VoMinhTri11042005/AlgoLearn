import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, Sparkles, Terminal, Trophy, Users, ArrowRight, Code, Play, 
  CheckCircle2, ChevronRight, User, LogIn, LogOut, ShieldCheck, Flame,
  Calendar, TrendingUp, Search, BookOpen, X
} from 'lucide-react';
import { AppUser } from '../types';

interface HomeViewProps {
  onNavigate: (view: 'home' | 'theory' | 'ide' | 'arena' | 'leaderboard' | 'admin') => void;
  currentUser?: AppUser | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export default function HomeView({ 
  onNavigate, 
  currentUser, 
  onOpenAuthModal, 
  onLogout 
}: HomeViewProps) {
  // Search state & configuration
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const SEARCH_DATABASE = [
    {
      id: '1',
      title: 'Độ phức tạp Thuật toán - Big O Notation',
      category: 'theory' as const,
      lessonId: '1',
      description: 'Cách ước lượng thời gian chạy và không gian bộ nhớ của thuật toán.',
      badge: 'Bài 1: Big O',
      keywords: ['big o', 'do phuc tap', 'time complexity', 'space complexity', 'doc phuc tap', 'thuật toán', 'notation']
    },
    {
      id: '1-1',
      title: 'Tìm kiếm tuyến tính (Linear Search)',
      category: 'theory' as const,
      lessonId: '1',
      description: 'Thuật toán tìm kiếm phần tử tuần tự với độ phức tạp O(N).',
      badge: 'Bài 1 / C++',
      keywords: ['linear search', 'tim kiem tuyen tinh', 'tuyen tinh', 'tim kiem', 'search', 'o(n)']
    },
    {
      id: '1-2',
      title: 'Tìm kiếm nhị phân (Binary Search)',
      category: 'theory' as const,
      lessonId: '1',
      description: 'Thuật toán tìm kiếm chia để trị cực tối ưu O(log N) trên mảng đã sắp xếp.',
      badge: 'Bài 1 / C++',
      keywords: ['binary search', 'tim kiem nhi phan', 'nhi phan', 'tim kiem', 'search', 'o(log n)']
    },
    {
      id: '2',
      title: 'Mảng tĩnh & Bộ nhớ liên tiếp (Array)',
      category: 'theory' as const,
      lessonId: '2',
      description: 'Định nghĩa mảng tĩnh, cách cấp phát bộ nhớ RAM liên tục và truy xuất O(1).',
      badge: 'Bài 2: Mảng',
      keywords: ['mang tinh', 'array', 'bo nho', 'nhớ', 'heap', 'ram', 'mảng', 'tĩnh']
    },
    {
      id: '2-1',
      title: 'Danh sách liên kết đơn (Linked List)',
      category: 'theory' as const,
      lessonId: '2',
      description: 'Cấu trúc dữ liệu liên kết động phân tán, thế mạnh chèn xoá đầu O(1).',
      badge: 'Bài 2: Linked List',
      keywords: ['danh sach lien ket', 'linked list', 'node', 'con tro', 'bộ nhớ', 'lien ket']
    },
    {
      id: '3',
      title: 'Quy hoạch động & Cấu trúc Đệ quy',
      category: 'theory' as const,
      lessonId: '3',
      description: 'Cách phân rã bài toán lớn thành bài toán con chồng chéo và giải thuật Fibonacci tối ưu.',
      badge: 'Bài 3: Quy Hoạch Động',
      keywords: ['quy hoach dong', 'de quy', 'recursion', 'dynamic programming', 'fibonacci', 'đệ quy', 'hoạch', 'động']
    },
    {
      id: '3-1',
      title: 'Tháp Hà Nội (Tower of Hanoi)',
      category: 'theory' as const,
      lessonId: '3',
      description: 'Bài toán đệ quy kinh điển chuyển đĩa giữa các cọc với độ phức tạp O(2^N).',
      badge: 'Bài 3 / Đệ quy',
      keywords: ['thap ha noi', 'tower of hanoi', 'ha noi', 'đệ quy', 'dia', 'cọc']
    },
    {
      id: '4',
      title: 'Thuật toán Sắp xếp cơ bản (Bubble, Selection, Insertion)',
      category: 'theory' as const,
      lessonId: '4',
      description: 'So sánh chi tiết các thuật toán sắp xếp nổi bọt, chọn trực tiếp và chèn O(N²).',
      badge: 'Bài 4: Sắp xếp',
      keywords: ['sap xep', 'sorting', 'bubble sort', 'selection sort', 'insertion sort', 'co ban', 'nổi bọt', 'bình phương']
    },
    {
      id: '5',
      title: 'Thuật toán Sắp xếp nhanh (Quick Sort)',
      category: 'theory' as const,
      lessonId: '5',
      description: 'Tìm hiểu phân hoạch Pivot, phân hoạch Lomuto & Hoare với độ phức tạp O(N log N).',
      badge: 'Bài 5: Quick Sort',
      keywords: ['quick sort', 'sap xep nhanh', 'sort', 'hoare', 'lomuto', 'pivot', 'chốt']
    },
    {
      id: '5-1',
      title: 'Phân hoạch Lomuto & Hoare (Quick Sort Pivoting)',
      category: 'theory' as const,
      lessonId: '5',
      description: 'So sánh cơ chế phân hoạch Lomuto và Hoare trong Quick Sort.',
      badge: 'Bài 5 / Pivot',
      keywords: ['lomuto', 'hoare', 'pivot', 'phan hoach', 'chot', 'quick sort']
    },
    {
      id: '5-2',
      title: 'Mô phỏng IDE - quick_sort.cpp',
      category: 'code' as const,
      fileId: 'quick_sort.cpp',
      description: 'Trình biên dịch và mô phỏng từng bước thuật toán Quick Sort Lomuto bằng C++.',
      badge: 'IDE / C++',
      keywords: ['ide', 'cpp', 'code', 'file', 'quick_sort.cpp', 'mo phong', 'run']
    },
    {
      id: '6',
      title: 'Sắp xếp trộn (Merge Sort)',
      category: 'theory' as const,
      lessonId: '6',
      description: 'Sử dụng tư duy chia để trị (Divide and Conquer) gộp mảng con với độ phức tạp ổn định O(N log N).',
      badge: 'Bài 6: Merge Sort',
      keywords: ['merge sort', 'sap xep tron', 'chia de tri', 'divide and conquer', 'gộp', 'trộn']
    },
    {
      id: '6-1',
      title: 'Mô phỏng IDE - merge_sort.cpp',
      category: 'code' as const,
      fileId: 'merge_sort.cpp',
      description: 'Code mẫu và bộ testcase cho thuật toán Merge Sort Chia để trị.',
      badge: 'IDE / C++',
      keywords: ['ide', 'cpp', 'code', 'file', 'merge_sort.cpp', 'mo phong', 'gộp']
    },
    {
      id: '7',
      title: 'Duyệt đồ thị theo chiều rộng (BFS)',
      category: 'theory' as const,
      lessonId: '7',
      description: 'Khám phá các tầng đỉnh kề bằng hàng đợi Queue với ứng dụng tìm đường đi ngắn nhất.',
      badge: 'Bài 7: BFS',
      keywords: ['bfs', 'chieu rong', 'duyet do thi', 'queue', 'hang doi', 'đồ thị', 'rộng', 'ngắn nhất']
    },
    {
      id: '7-1',
      title: 'Cấu trúc dữ liệu Hàng đợi (Queue)',
      category: 'theory' as const,
      lessonId: '7',
      description: 'Cách thức hoạt động theo nguyên lý First-In First-Out (FIFO) ứng dụng trong BFS.',
      badge: 'Bài 7: Queue',
      keywords: ['queue', 'hang doi', 'fifo', 'first in first out', 'vào trước ra trước']
    }
  ];

  const removeVietnameseTones = (str: string) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
    str = str.replace(/\u02C6|\u0306|\u031B/g, "");
    return str;
  };

  // Close search popup on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getFilteredResults = () => {
    if (!searchQuery.trim()) return [];
    const normalizedQuery = removeVietnameseTones(searchQuery.toLowerCase().trim());
    return SEARCH_DATABASE.filter(item => {
      const matchTitle = removeVietnameseTones(item.title.toLowerCase()).includes(normalizedQuery);
      const matchDesc = removeVietnameseTones(item.description.toLowerCase()).includes(normalizedQuery);
      const matchKeyword = item.keywords.some(kw => removeVietnameseTones(kw).includes(normalizedQuery));
      return matchTitle || matchDesc || matchKeyword;
    });
  };

  const handleSelectSearchResult = async (item: typeof SEARCH_DATABASE[0]) => {
    if (item.category === 'theory' && item.lessonId) {
      // 1. Live server active state update
      try {
        await fetch('/api/syllabus/active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.lessonId })
        });
      } catch (err) {
        console.error("Failed to sync active status to server on search select:", err);
      }

      // 2. Fetch current local syllabus and update active flag
      try {
        const saved = localStorage.getItem('algolearn_syllabus');
        const defaultSyllabus = [
          { id: '1', title: 'Bài 1: Tổng quan về Thuật toán & Big O', progress: 100, active: false },
          { id: '2', title: 'Bài 2: Mảng & Danh sách liên kết', progress: 100, active: false },
          { id: '3', title: 'Bài 3: Cấu trúc Đệ quy & Quy hoạch động', progress: 80, active: false },
          { id: '4', title: 'Bài 4: Thuật toán Sắp xếp cơ bản', progress: 100, active: false },
          { id: '5', title: 'Bài 5: Thuật toán Quick Sort', progress: 0, active: true },
          { id: '6', title: 'Bài 6: Sắp xếp trộn Merge Sort', progress: 0, active: false },
          { id: '7', title: 'Bài 7: Tìm kiếm theo Chiều rộng (BFS)', progress: 0, active: false },
        ];
        const syllabusList = saved ? JSON.parse(saved) : defaultSyllabus;
        const updated = syllabusList.map((s: any) => ({
          ...s,
          active: s.id === item.lessonId
        }));
        localStorage.setItem('algolearn_syllabus', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('algolearn_syllabus_updated'));
      } catch (e) {
        console.error("Failed to store local syllabus on search select:", e);
      }

      onNavigate('theory');
    } else if (item.category === 'code' && item.fileId) {
      try {
        localStorage.setItem('algolearn_active_file', item.fileId);
      } catch {}
      onNavigate('ide');
    }
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  // Generate the last 7 days ending with today dynamically for the weekly goal bar chart
  const getWeeklyActivity = () => {
    const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const now = new Date();
    const activityData = [];
    
    // High-fidelity variation based on dynamic distribution matching streak.
    // Index 6 is today, going backwards to 0 (6 days ago).
    const achievements = [100, 50, 100, 150, 0, 100, 50]; // target percentages
    const solvedCounts = [2, 1, 2, 3, 0, 2, 1]; // lessons solved counts
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayLabel = daysOfWeek[d.getDay()];
      const dateLabel = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      const index = 6 - i;
      let percent = achievements[index];
      let count = solvedCounts[index];
      
      // If today is active and user has custom stats, bind dynamically to feel personalized
      if (i === 0) {
        if (currentUser) {
          // tie to user's solves
          count = currentUser.solved > 0 ? (currentUser.solved % 2 === 0 ? 2 : 1) : 0;
          percent = count >= 2 ? 100 : count === 1 ? 50 : 0;
        } else {
          // guest mode default
          count = 1;
          percent = 50;
        }
      } else if (i === 1 && currentUser) {
        // yesterday solved
        count = currentUser.solved > 1 ? 2 : 1;
        percent = count >= 2 ? 100 : 50;
      }
      
      activityData.push({
        day: dayLabel,
        date: dateLabel,
        percent: percent,
        solved: count,
        isToday: i === 0,
      });
    }
    return activityData;
  };

  const features = [
    {
      icon: <Play className="w-6 h-6 text-indigo-400" />,
      title: "Mô phỏng Trực quan",
      desc: "Từng bước chạy của Code được vẽ lại trực quan bằng đồ họa màu sắc giúp bạn dễ dàng nắm bắt tư duy.",
      badge: "Độc quyền"
    },
    {
      icon: <Terminal className="w-6 h-6 text-emerald-400" />,
      title: "IDE Đa năng Tích hợp",
      desc: "Học đi đôi với hành ngay tại trình biên dịch thông minh, hỗ trợ kiểm nghiệm testcase đa dạng.",
      badge: "Cực mượt"
    },
    {
      icon: <Trophy className="w-6 h-6 text-amber-400" />,
      title: "Đấu Trường 1v1",
      desc: "Cạnh tranh thời gian thực với các đối thủ trên toàn quốc để rèn luyện tốc độ gõ code và tư duy logic.",
      badge: "Sôi động"
    },
    {
      icon: <Brain className="w-6 h-6 text-cyan-400" />,
      title: "Trợ lý AI Hỗ trợ 24/7",
      desc: "Sợ tắc đường? Chỉ cần hỏi Algo AI để nhận phân tích tối ưu thời gian và chẩn đoán lỗi trong nháy mắt.",
      badge: "Bản nâng cấp"
    }
  ];



  return (
    <div id="home_container" className="text-gray-100 min-h-screen bg-slate-950 font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-20 md:pb-28">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Texts */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-xs text-indigo-300 font-medium"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>NỀN TẢNG HỌC THUẬT TOÁN THẾ HỆ MỚI</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight"
              >
                Làm chủ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">thuật toán</span>,
                <br />chinh phục tương lai IT
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl"
              >
                Học cấu trúc dữ liệu và giải thuật (DSA) hoàn toàn trực quan qua đồ họa chuyển động, thử thách 1v1 thời gian thực và sự trợ giúp tức thì từ trí tuệ nhân tạo.
              </motion.p>

              {/* Premium search bar */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.22 }}
                className="relative max-w-2xl text-left"
                ref={searchContainerRef}
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className={`w-5 h-5 transition-colors duration-200 ${isSearchFocused ? 'text-indigo-400' : 'text-slate-400'}`} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchFocused(true);
                    }}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="Tìm nhanh thuật toán, lý thuyết, cấu trúc dữ liệu... (ví dụ: Big O, Quick Sort, BFS)"
                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-2xl text-sm text-gray-100 placeholder-slate-400 outline-none transition-all duration-300 shadow-xl focus:shadow-indigo-500/5 focus:ring-1 focus:ring-indigo-500/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition cursor-pointer"
                      title="Xóa tìm kiếm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Popular Keywords Quick Access */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5 px-1">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider font-mono">GỢI Ý TÌM KIẾM:</span>
                  {[
                    { label: 'Big O', query: 'Big O' },
                    { label: 'Quick Sort', query: 'Quick Sort' },
                    { label: 'Danh sách liên kết', query: 'Linked List' },
                    { label: 'Đệ quy', query: 'Đệ quy' },
                    { label: 'BFS', query: 'BFS' }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => {
                        setSearchQuery(chip.query);
                        setIsSearchFocused(true);
                      }}
                      className="text-[10.5px] bg-[#121624] hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-400 px-2.5 py-1 rounded-lg transition duration-200 select-none font-semibold cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Search Results Dropdown Dropdown Panel */}
                <AnimatePresence>
                  {isSearchFocused && searchQuery.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 left-0 right-0 mt-2 bg-[#090d16] border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden max-h-[380px] flex flex-col"
                    >
                      {/* Dropdown Header */}
                      <div className="p-3 bg-slate-950 border-b border-slate-900 text-xs font-bold text-slate-500 flex items-center justify-between">
                        <span className="font-mono">KẾT QUẢ TÌM KIẾM ({getFilteredResults().length})</span>
                        <div className="flex items-center space-x-1.5 text-[10px]">
                          <span className="bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest font-mono">Ý tưởng vàng</span>
                        </div>
                      </div>

                      {/* Results list */}
                      <div className="overflow-y-auto divide-y divide-slate-900/60 flex-1 scrollbar-thin">
                        {getFilteredResults().length > 0 ? (
                          getFilteredResults().map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleSelectSearchResult(item)}
                              className="p-3.5 hover:bg-[#121829] cursor-pointer transition flex items-start space-x-3 text-left group"
                            >
                              <div className="mt-0.5 shrink-0 p-2 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-indigo-500/30 transition text-slate-400 group-hover:text-indigo-400">
                                {item.category === 'theory' ? (
                                  <BookOpen className="w-4 h-4" />
                                ) : (
                                  <Code className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-xs font-extrabold text-white group-hover:text-indigo-400 transition truncate">
                                    {item.title}
                                  </h4>
                                  <span className="shrink-0 text-[9px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full uppercase">
                                    {item.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-400 group-hover:text-gray-300 mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center space-y-3">
                            <span className="inline-flex p-3 bg-red-500/5 rounded-full border border-red-500/10 text-rose-500">
                              <X className="w-5 h-5 pointer-events-none" />
                            </span>
                            <div>
                              <p className="text-xs font-extrabold text-slate-300">Không tìm thấy kết quả nào khớp</p>
                              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">Vui lòng thử từ khóa khác hay gõ không dấu. Hãy bảo đảm bạn gõ đúng từ ngữ thuật thuật học DSA.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Cổng Thành Viên & Quản Trị */}
              {currentUser ? (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-indigo-500/20 shadow-xl space-y-4 relative overflow-hidden max-w-2xl text-left"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none"></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center space-x-3 text-left">
                      <div className="relative">
                        <img 
                          src={currentUser.avatar} 
                          alt={currentUser.name} 
                          className="w-11 h-11 rounded-xl object-cover border-2 border-indigo-500"
                          referrerPolicy="no-referrer"
                        />
                        {currentUser.isAdmin ? (
                          <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-slate-950 text-[7px] font-black px-1 py-0.5 rounded border border-slate-950 uppercase tracking-widest shadow" title="Quản trị tối cao">
                            ADMIN
                          </div>
                        ) : (
                          <div className="absolute -bottom-1.5 -right-1.5 bg-indigo-500 text-white text-[7px] font-black px-1 py-0.5 rounded border border-slate-950 uppercase tracking-widest shadow" title="Học viên">
                            MEMBER
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-sm font-black text-white">{currentUser.name}</h4>
                          {currentUser.isAdmin && (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">Quản Trị</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate max-w-[220px] sm:max-w-[320px]">{currentUser.school}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right font-mono shrink-0">
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-none">CỘT MỐC</p>
                        <p className="text-xs font-black text-indigo-400 mt-1">{currentUser.xp.toLocaleString()} XP</p>
                      </div>
                      <div className="border-l border-slate-800 h-7 shrink-0"></div>
                      <div className="text-right font-mono shrink-0">
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-none">ĐÃ GIẢI</p>
                        <p className="text-xs font-black text-emerald-400 mt-1">{currentUser.solved} bài</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                      <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span>Chuỗi học: <strong className="font-mono text-amber-500">{currentUser.streak} Ngày</strong> liên tục</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {currentUser.isAdmin && (
                        <button 
                          onClick={() => onNavigate('admin')}
                          className="bg-emerald-600/35 hover:bg-emerald-600/50 border border-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          ⚙️ BẢNG QUẢN TRỊ
                        </button>
                      )}
                      {onLogout && (
                        <button 
                          onClick={onLogout}
                          className="bg-slate-900 border border-slate-800 hover:text-rose-400 text-gray-400 text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          🚪 Đăng xuất
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-3.5 relative overflow-hidden max-w-2xl text-left"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none"></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center space-x-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">CỔNG LIÊN KẾT HỌC VIÊN & ADMIN 🤝</h3>
                        <p className="text-xs font-bold text-slate-100 mt-0.5">Lọc dữ liệu rèn luyện, nâng quyền làm chủ giải thuật</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse font-sans"></span>
                      <span className="text-[9px] font-mono font-extrabold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">GUEST MODE (KHÁCH)</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed text-left font-sans">
                    Sĩ tử đăng ký nhanh bằng Email bất kỳ để bật chức năng lưu trữ tiến trình học tập, thi đấu Arena 1v1 hoặc Đăng nhập tài khoản <strong className="text-emerald-400 font-bold">Admin Quản Trị</strong> dùng thử để duyệt/sửa đổi/phân bổ bài giảng!
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {onOpenAuthModal && (
                      <button 
                        onClick={onOpenAuthModal}
                        className="bg-indigo-650 hover:bg-indigo-550 border border-indigo-550/35 hover:scale-[1.02] shadow-lg text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 font-sans"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>🔒 ĐĂNG KÝ / ĐĂNG NHẬP NHANH</span>
                      </button>
                    )}
                    
                    <div className="text-[10px] text-gray-400 flex items-center space-x-1 font-mono bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
                      <span className="text-amber-500 font-bold">Admin Demo:</span>
                      <span className="text-slate-300 font-sans">admin@algolearn.vn</span>
                      <span className="text-gray-600">/</span>
                      <span className="text-slate-300 font-sans">admin123</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Lịch sử Đạt Mục Tiêu 7 Ngày - Consistency Bar Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28 }}
                className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-2xl relative overflow-hidden max-w-2xl text-left"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-xl rounded-full pointer-events-none"></div>
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8.5 h-8.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">Hiệu Suất rèn luyện 7 ngày qua</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">Mục tiêu hằng ngày: Hoàn thành <strong className="text-indigo-300 font-extrabold font-mono">2 bài học</strong> giải thuật.</p>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center space-x-2 bg-slate-950/80 border border-slate-850 px-3 py-1.5 rounded-xl self-start sm:self-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-mono font-bold text-gray-300">Nhất quán: 85%</span>
                  </div>
                </div>

                {/* Interactive SVG / Bar Chart layout */}
                <div className="bg-slate-950/50 rounded-xl border border-slate-900/60 p-4 mb-3.5 relative">
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 items-end justify-items-center h-28 relative pt-4">
                    
                    {/* Horizontal Guideline indicators */}
                    <div className="absolute inset-x-0 top-4 border-b border-dashed border-slate-900/80 pointer-events-none flex justify-between pr-2 z-0">
                      <span className="text-[8px] font-mono text-gray-600 -translate-y-1.5 bg-slate-950/20 px-1">155%</span>
                    </div>
                    <div className="absolute inset-x-0 top-[52px] border-b border-indigo-500/15 pointer-events-none flex justify-between pr-2 z-0">
                      <span className="text-[8px] font-mono text-indigo-400/40 -translate-y-1.5 bg-slate-950/20 px-1">100% (Đạt mục tiêu)</span>
                    </div>
                    <div className="absolute inset-x-0 top-[88px] border-b border-dashed border-slate-900/80 pointer-events-none flex justify-between pr-2 z-0">
                      <span className="text-[8px] font-mono text-gray-600 -translate-y-1.5 bg-slate-950/20 px-1">50%</span>
                    </div>

                    {getWeeklyActivity().map((day, idx) => {
                      // Normalize the bar's display height based on a max scale of 150%
                      const computedHeight = Math.max(8, Math.min(100, (day.percent / 150) * 100));
                      const isComplete = day.percent >= 100;
                      
                      return (
                        <div key={idx} className="flex flex-col items-center w-full group relative z-10 select-none">
                          
                          {/* absolute float hover tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none text-left w-36 z-50">
                            <p className="text-[10px] font-bold text-white border-b border-slate-800 pb-1 mb-1 font-sans">{day.day} ({day.date})</p>
                            <div className="space-y-0.5 text-[9px] font-mono">
                              <p className="flex justify-between text-gray-400">
                                <span className="font-sans">Tiến độ:</span>
                                <span className={`font-bold ${isComplete ? 'text-emerald-400' : day.percent > 0 ? 'text-indigo-450' : 'text-gray-500'}`}>
                                  {day.percent}%
                                </span>
                              </p>
                              <p className="flex justify-between text-gray-400">
                                <span className="font-sans">Bài học:</span>
                                <span className="text-white font-bold">{day.solved}/2 bài</span>
                              </p>
                              <p className="flex justify-between text-gray-450 mt-1 border-t border-slate-850 pt-1 font-sans">
                                <span>Kết quả:</span>
                                <span className={isComplete ? 'text-emerald-400 font-extrabold' : day.percent > 0 ? 'text-indigo-450 font-bold' : 'text-gray-500'}>
                                  {isComplete ? 'Hoàn thành' : day.percent > 0 ? 'Đang học' : 'Chưa luyện'}
                                </span>
                              </p>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-slate-900 border-r border-b border-slate-800 rotate-45"></div>
                          </div>

                          {/* Hoverable Bar Graphic container */}
                          <div className="w-5 sm:w-6.5 h-20 bg-slate-900/70 border border-slate-850 hover:border-slate-700 rounded-md overflow-hidden flex items-end relative shadow-inner cursor-pointer transition-all duration-250">
                            {day.isToday && (
                              <div className="absolute inset-0 bg-indigo-500/10 animate-pulse pointer-events-none"></div>
                            )}
                            
                            {/* Visual Fill bar indicator */}
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${computedHeight}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.05, ease: "easeOut" }}
                              className={`w-full rounded-t-[3px] transition-all duration-300 relative ${
                                isComplete 
                                  ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.25)]' 
                                  : day.percent > 0 
                                  ? 'bg-gradient-to-t from-indigo-650 to-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                                  : 'bg-slate-800/80'
                              }`}
                            >
                              {/* Shiny cap overlay is added for finished items */}
                              {day.percent > 0 && (
                                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-white/30"></div>
                              )}
                            </motion.div>
                          </div>

                          {/* Week Date / Day Label */}
                          <div className="text-center mt-2">
                            <span className={`text-[10px] block font-extrabold leading-none ${day.isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                              {day.day}
                            </span>
                            <span className="text-[8px] font-mono font-extrabold text-slate-650 block mt-0.5">
                              {day.date.split('/')[0]}
                            </span>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legends & Interactive Tip Info footer */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-gray-500 border-t border-slate-900/80 pt-3">
                  <div className="flex flex-wrap gap-x-3.5 gap-y-1 items-center">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 block shrink-0"></span>
                      <span className="text-[9.5px] font-medium leading-none">Hoàn thành (≥100%)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-indigo-650 to-indigo-500 block shrink-0"></span>
                      <span className="text-[9.5px] font-medium leading-none">Tự luyện dở dang</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-800 block shrink-0"></span>
                      <span className="text-[9.5px] font-medium leading-none">Chưa rèn luyện</span>
                    </div>
                  </div>

                  <p className="italic text-indigo-400 text-xs font-bold font-sans self-stretch sm:self-auto text-right">
                    ⚡ Duy trì rèn luyện {currentUser ? `${Math.max(1, 2 - (currentUser.solved % 2))} bài` : 'hôm nay'} để giữ vững áp lực học tập nhé!
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <button 
                  onClick={() => onNavigate('theory')}
                  className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition text-white font-semibold rounded-xl px-8 py-4 space-x-2 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  <span>Bắt đầu học ngay</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onNavigate('ide')}
                  className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 hover:text-white active:scale-95 transition text-gray-300 border border-slate-700 font-semibold rounded-xl px-8 py-4 space-x-2 cursor-pointer"
                >
                  <Code className="w-5 h-5 text-gray-400" />
                  <span>Trải nghiệm IDE thuật toán</span>
                </button>
              </motion.div>

              {/* Badges of Schools */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-6 border-t border-slate-800"
              >
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-4">ĐƯỢC TIN DÙNG BỞI SINH VIÊN CÁC TRƯỜNG ĐẠI HỌC TOP ĐẦU</p>
                <div id="school_logos" className="flex flex-wrap gap-x-6 gap-y-3 items-center opacity-60">
                  <span className="text-sm font-bold text-slate-400 tracking-wider">HUST (Bách Khoa)</span>
                  <span className="text-sm font-bold text-slate-400 tracking-wider">UIT (ĐHQG-HCM)</span>
                  <span className="text-sm font-bold text-slate-400 tracking-wider">UET (ĐHQGHN)</span>
                  <span className="text-sm font-bold text-slate-400 tracking-wider">RMIT VIETNAM</span>
                  <span className="text-sm font-bold text-slate-400 tracking-wider">PTIT</span>
                </div>
              </motion.div>
            </div>

            {/* Right Graphic Mockups */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.7 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden max-w-lg mx-auto"
              >
                {/* Header Dots */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">quick_sort.cpp - Visualizer</span>
                </div>

                {/* Simulated visualizer blocks inside the card */}
                <div className="space-y-6">
                  <p className="text-xs font-mono text-indigo-300">{'// Phân hoạch partition mảng con'}</p>
                  
                  {/* Graphical array simulation */}
                  <div className="flex items-end justify-center space-x-3 h-44 py-4 bg-slate-950/80 rounded-xl border border-slate-800 relative">
                    {[
                      { val: 12, h: '40%', state: 'sorted' },
                      { val: 19, h: '65%', state: 'low' },
                      { val: 24, h: '80%', state: 'high' },
                      { val: 8, h: '25%', state: 'active' },
                      { val: 31, h: '100%', state: 'pivot' },
                      { val: 15, h: '50%', state: 'default' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1 max-w-[50px]">
                        <div 
                          className={`w-full rounded-t-md transition-all duration-500 flex items-end justify-center text-[10px] font-mono font-bold pb-1 ${
                            item.state === 'pivot' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' :
                            item.state === 'active' ? 'bg-indigo-500 text-white' :
                            item.state === 'low' ? 'bg-emerald-500 text-slate-950' :
                            item.state === 'high' ? 'bg-rose-500 text-white' :
                            item.state === 'sorted' ? 'bg-slate-700 text-gray-400' : 'bg-slate-800 text-gray-400'
                          }`}
                          style={{ height: item.h }}
                        >
                          {item.val}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 mt-2">
                          {item.state === 'pivot' ? 'K' : `i=${idx}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Play controller simulation */}
                  <div className="flex items-center justify-between text-xs bg-slate-950 px-4 py-3 rounded-lg border border-slate-800">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-mono text-[11px]">Đang hoán đổi: A[3] ↔ A[5]</span>
                    </div>
                    <div className="flex space-x-1.5 font-mono text-[10px]">
                      <span className="text-blue-400">low=1</span>
                      <span className="text-gray-500">|</span>
                      <span className="text-red-400">high=4</span>
                    </div>
                  </div>
                </div>

                {/* Glow effects */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full"></div>
              </motion.div>

              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-10 -right-2 bg-slate-900 border border-slate-800 shadow-xl rounded-xl p-3 flex items-center space-x-2.5 max-w-[200px]"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Đối kháng 1v1</p>
                  <p className="text-xs font-bold text-gray-200">Bạn đã tăng +500 XP!</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-900/60 relative">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">CÔNG CỤ HỌC TẬP ĐỈNH CAO CHO DEV VIỆT</h2>
          <p className="text-3xl md:text-4xl font-extrabold text-white">Chúng tôi định nghĩa lại cách bạn tiếp thu Thuật Toán</p>
          <p className="text-gray-400">Không còn phải vật lộn với những dòng mã khô khan trên sách vở. Trực quan hóa mọi thứ trong môi trường tối tân nhất.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5, borderColor: 'rgba(99, 102, 241, 0.4)' }}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 text-left relative group transition-all duration-300"
            >
              <div className="inline-flex p-3 bg-slate-950 border border-slate-800 rounded-xl mb-5 text-indigo-400 transition-colors group-hover:bg-indigo-550/10">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{feat.desc}</p>
              <span className="absolute top-4 right-4 bg-indigo-500/10 text-indigo-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-500/20">
                {feat.badge}
              </span>
            </motion.div>
          ))}
        </div>
      </div>



      {/* Call To Action Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div 
          whileHover={{ shadow: '0 25px 50px -12px rgba(99, 102, 241, 0.15)' }}
          className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
        >
          {/* Grid lines or graphics behind */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>
          
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Sẵn sàng nâng tầm tư duy lập trình?</h2>
            <p className="text-gray-300 md:text-lg max-w-2xl mx-auto">
              Chỉ cần 15 phút mỗi ngày cùng các bài học trực quan và trận đấu đối kháng, bạn sẽ làm chủ hoàn toàn các cấu trúc dữ liệu kinh điển nhất.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => onNavigate('theory')}
                className="bg-white hover:bg-slate-100 text-slate-950 font-bold px-8 py-4 rounded-xl active:scale-95 transition cursor-pointer shadow-xl flex items-center space-x-1"
              >
                <span>Học thuật toán ngay</span>
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>
              <button 
                onClick={() => onNavigate('arena')}
                className="bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 font-bold px-8 py-4 rounded-xl active:scale-95 transition cursor-pointer flex items-center space-x-2"
              >
                <span>Đấu 1v1 nhanh</span>
                <Trophy className="w-4 h-4 text-indigo-400" />
              </button>
            </div>
          </div>
          
          {/* Extra shiny floating blobs */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-48 bg-blue-500/20 blur-3xl rounded-full"></div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full"></div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">AlgoLearn</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              Công cụ đồng hành tuyệt vời trong túi của mọi sinh viên Công nghệ thông tin Việt Nam. Master DSA, Master Interviews.
            </p>
          </div>
          <div>
            <h4 className="text-gray-300 font-semibold mb-4 text-xs uppercase tracking-wider">Học tập</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('theory')} className="hover:text-white transition">Cây thư mục bài giảng</button></li>
              <li><button onClick={() => onNavigate('ide')} className="hover:text-white transition">Mô phỏng đệ quy</button></li>
              <li><button onClick={() => onNavigate('ide')} className="hover:text-white transition">Visualizer Quick Sort</button></li>
              <li><button onClick={() => onNavigate('ide')} className="hover:text-white transition">Độ phức tạp Big O</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-300 font-semibold mb-4 text-xs uppercase tracking-wider">Hoạt động</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('arena')} className="hover:text-white transition">Thử thách 1v1 Arena</button></li>
              <li><button onClick={() => onNavigate('leaderboard')} className="hover:text-white transition">Bảng vàng vinh danh</button></li>
              <li><a href="#" className="hover:text-white transition">Sảnh danh vọng (Hall of Fame)</a></li>
              <li><a href="#" className="hover:text-white transition">Đua Rank Tuần</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-300 font-semibold mb-4 text-xs uppercase tracking-wider">Hỗ trợ</h4>
            <p className="text-xs text-gray-500 mb-2">Liên hệ góp ý sản phẩm:</p>
            <p className="text-xs font-mono text-gray-400">support@algolearn.vn</p>
            <div className="pt-4 text-[10px]">
              &copy; {new Date().getFullYear()} AlgoLearn. Developed with ⚡ React & Gemini.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
