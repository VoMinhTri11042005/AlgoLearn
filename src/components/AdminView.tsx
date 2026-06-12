import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Users, BookOpen, Database, Plus, Trash2, Edit, Save, 
  RefreshCw, CheckCircle2, AlertCircle, X, ChevronRight, UserMinus, ShieldAlert, BookPlus, TrendingUp
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';

import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/themes/prism-tomorrow.css';

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

interface MockUser {
  id: string;
  name: string;
  school: string;
  xp: number;
  solved: number;
  streak: number;
  role: 'admin' | 'user';
  avatar: string;
}

const DEFAULT_SYLLABUS: Lesson[] = [
  { id: '1', title: 'Bài 1: Tổng quan về Thuật toán & Big O', progress: 100, active: false },
  { id: '2', title: 'Bài 2: Mảng & Danh sách liên kết', progress: 100, active: false },
  { id: '3', title: 'Bài 3: Cấu trúc Đệ quy & Quy hoạch động', progress: 80, active: false },
  { id: '4', title: 'Bài 4: Thuật toán Sắp xếp cơ bản', progress: 100, active: false },
  { id: '5', title: 'Bài 5: Thuật toán Quick Sort', progress: 0, active: true },
  { id: '6', title: 'Bài 6: Sắp xếp trộn Merge Sort', progress: 0, active: false },
  { id: '7', title: 'Bài 7: Tìm kiếm theo Chiều rộng (BFS)', progress: 0, active: false },
];

const INITIAL_MOCK_USERS: MockUser[] = [
  { id: '1', name: 'Võ Minh Trí', school: 'Đại Học Công Nghệ TPHCM', xp: 12400, solved: 42, streak: 5, role: 'admin', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120' },
  { id: '2', name: 'Nguyễn Văn Minh', school: 'Đại Học Bách Khoa', xp: 11200, solved: 39, streak: 12, role: 'user', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120' },
  { id: '3', name: 'Trần Thị Hồng', school: 'Đại Học Khoa Học Tự Nhiên', xp: 9800, solved: 31, streak: 8, role: 'user', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120' },
  { id: '4', name: 'Phạm Đức Duy', school: 'Đại Học Quốc Tế - VNU', xp: 8750, solved: 29, streak: 4, role: 'user', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120' },
  { id: '5', name: 'Lê Thùy Dương', school: 'Học Viện Công Nghệ BCVT', xp: 7200, solved: 22, streak: 15, role: 'user', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120' },
];

interface AdminViewProps {
  onNavigate: (view: 'home' | 'theory' | 'ide' | 'arena' | 'leaderboard' | 'admin') => void;
  currentUserRole: 'admin' | 'user';
  onUpdateRole: (role: 'admin' | 'user') => void;
}

export default function AdminView({ onNavigate, currentUserRole, onUpdateRole }: AdminViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'syllabus' | 'users' | 'system'>('dashboard');
  
  // Syllabus state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  // Users state
  const [mockUsers, setMockUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedProgress, setEditedProgress] = useState(0);
  const [editedDifficulty, setEditedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [editedTopic, setEditedTopic] = useState('');
  const [editedMarkdown, setEditedMarkdown] = useState('');
  const [editedCodeSnippet, setEditedCodeSnippet] = useState('');

  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonProgress, setNewLessonProgress] = useState(0);
  const [newLessonDifficulty, setNewLessonDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [newLessonTopic, setNewLessonTopic] = useState('');
  const [newLessonMarkdown, setNewLessonMarkdown] = useState('');
  const [newLessonCodeSnippet, setNewLessonCodeSnippet] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [pgStatus, setPgStatus] = useState<{
    usePostgres: boolean;
    status: string;
    error: string | null;
    hasEnvUrl: boolean;
  }>({
    usePostgres: false,
    status: 'Đang kiểm tra...',
    error: null,
    hasEnvUrl: false
  });
  const [customPgUrl, setCustomPgUrl] = useState('');
  const [pgConfiguring, setPgConfiguring] = useState(false);

  const fetchPgStatus = async () => {
    try {
      const res = await fetch('/api/postgres/status');
      const data = await res.json();
      setPgStatus({
        usePostgres: data.usePostgres,
        status: data.status,
        error: data.error,
        hasEnvUrl: data.hasEnvUrl
      });
    } catch (e) {
      console.error("Failed to fetch Postgres status:", e);
    }
  };

  const handleConfigurePg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPgUrl.trim()) return;
    setPgConfiguring(true);
    try {
      const res = await fetch('/api/postgres/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: customPgUrl.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("Đã chuyển đổi hệ thống sang PostgreSQL thành công!");
        setCustomPgUrl('');
        await Promise.all([fetchSyllabus(), fetchUsers(), fetchPgStatus()]);
      } else {
        alert(data.error || "Không thể kết nối đến PostgreSQL!");
        await fetchPgStatus();
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + (err.message || String(err)));
    } finally {
      setPgConfiguring(false);
    }
  };

  const handleDisconnectPg = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn ngắt kết nối PostgreSQL và trở về sử dụng tệp tin JSON cục bộ?")) return;
    try {
      const res = await fetch('/api/postgres/disconnect', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("Đã phục hồi hệ thống về Chế độ Lưu trữ cục bộ!");
        await Promise.all([fetchSyllabus(), fetchUsers(), fetchPgStatus()]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSyllabus = async () => {
    try {
      const res = await fetch('/api/syllabus');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLessons(data);
      }
    } catch (err) {
      console.error("Failed to fetch syllabus:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMockUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchSyllabus(), fetchUsers(), fetchPgStatus()]).finally(() => {
      setLoading(false);
    });
  }, []);

  // Update current user's role in Mock list
  useEffect(() => {
    if (mockUsers.length > 0) {
      setMockUsers(prev => {
        return prev.map(u => {
          const isSelf = u.id === '1' || u.name === 'Võ Minh Trí';
          return isSelf ? { ...u, role: currentUserRole } : u;
        });
      });
    }
  }, [currentUserRole]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Syllabus functions
  const saveSyllabus = async (updatedLessons: Lesson[]) => {
    setLessons(updatedLessons);
    try {
      const res = await fetch('/api/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syllabus: updatedLessons })
      });
      const data = await res.json();
      const list = data.syllabus || data;
      if (res.ok && Array.isArray(list)) {
        setLessons(list);
      }
      window.dispatchEvent(new CustomEvent('algolearn_syllabus_updated'));
    } catch (err) {
      console.error("Failed to save syllabus:", err);
    }
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    const newLesson: Lesson = {
      id: String(Date.now()),
      title: `Bài ${lessons.length + 1}: ${newLessonTitle.trim()}`,
      progress: Math.min(100, Math.max(0, newLessonProgress)),
      active: false,
      difficulty: newLessonDifficulty,
      topic: newLessonTopic.trim(),
      markdownContent: newLessonMarkdown.trim(),
      codeSnippet: newLessonCodeSnippet.trim()
    };

    const nextLessons = [...lessons, newLesson];
    saveSyllabus(nextLessons);
    setNewLessonTitle('');
    setNewLessonProgress(0);
    setNewLessonDifficulty('easy');
    setNewLessonTopic('');
    setNewLessonMarkdown('');
    setNewLessonCodeSnippet('');
    triggerToast('Thêm bài học mới thành công!');
  };

  const handleDeleteLesson = (id: string) => {
    const nextLessons = lessons.filter(l => l.id !== id);
    // Recalculate lesson indexes titles
    const normalizedLessons = nextLessons.map((l, index) => {
      const cleanTitle = l.title.replace(/^Bài \d+:\s*/, '');
      return {
        ...l,
        title: `Bài ${index + 1}: ${cleanTitle}`
      };
    });
    saveSyllabus(normalizedLessons);
    triggerToast('Đã xóa bài học khỏi giáo trình!');
  };

  const startEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    const cleanTitle = lesson.title.replace(/^Bài \d+:\s*/, '');
    setEditedTitle(cleanTitle);
    setEditedProgress(lesson.progress);
    setEditedDifficulty(lesson.difficulty || 'easy');
    setEditedTopic(lesson.topic || '');
    setEditedMarkdown(lesson.markdownContent || '');
    setEditedCodeSnippet(lesson.codeSnippet || '');
  };

  const handleSaveEditLesson = (id: string, index: number) => {
    if (!editedTitle.trim()) return;
    const nextLessons = lessons.map(l => {
      if (l.id === id) {
        return {
          ...l,
          title: `Bài ${index + 1}: ${editedTitle.trim()}`,
          progress: Math.min(100, Math.max(0, editedProgress)),
          difficulty: editedDifficulty,
          topic: editedTopic.trim(),
          markdownContent: editedMarkdown.trim(),
          codeSnippet: editedCodeSnippet.trim()
        };
      }
      return l;
    });
    saveSyllabus(nextLessons);
    setEditingLessonId(null);
    triggerToast('Cập nhật bài học thành công!');
  };

  // Toggle active lesson
  const handleToggleActiveLesson = (id: string) => {
    const nextLessons = lessons.map(l => ({
      ...l,
      active: l.id === id
    }));
    saveSyllabus(nextLessons);
    triggerToast('Đã đổi bài học đang giảng dạy hoạt động!');
  };

  // User Role Management
  const handleUpdateUserRoleInList = async (userId: string, newRole: 'admin' | 'user') => {
    // Optimistic state update
    const nextUsers = mockUsers.map(u => {
      const match = u.id === userId || (u as any)._id === userId;
      if (match) {
        if (u.id === '1' || u.name === 'Võ Minh Trí') {
          onUpdateRole(newRole);
        }
        return { ...u, role: newRole };
      }
      return u;
    });
    setMockUsers(nextUsers);

    try {
      const res = await fetch('/api/users/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.users)) {
        setMockUsers(data.users);
      }
      triggerToast(`Đã chuyển đổi quyền hành học viên thành công!`);
    } catch (err) {
      console.error("Failed to update user role on server:", err);
    }
  };

  // Reset to default
  const handleSystemRestoreDefault = async () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục dữ liệu hệ thống về trạng thái gốc không?')) {
      try {
        const res = await fetch('/api/syllabus/reset', {
          method: 'POST'
        });
        const data = await res.json();
        if (data.status === 'success') {
          setLessons(data.syllabus);
          setMockUsers(data.users);
          onUpdateRole('admin'); // Stay as admin for the panel preview
          window.dispatchEvent(new CustomEvent('algolearn_syllabus_updated'));
          triggerToast('Hệ thống đã khôi phục dữ liệu ban đầu hoàn tất!');
        }
      } catch (err) {
        console.error("Failed to restore default syllabus:", err);
      }
    }
  };

  // Stats aggregate helpers
  const totalStudents = mockUsers.length || INITIAL_MOCK_USERS.length;
  const adminCount = mockUsers.length ? mockUsers.filter(u => u.role === 'admin').length : 1;
  const userCount = mockUsers.length ? mockUsers.filter(u => u.role === 'user').length : 4;
  const averageXp = mockUsers.length 
    ? Math.round(mockUsers.reduce((sum, u) => sum + u.xp, 0) / mockUsers.length)
    : 11400;

  return (
    <div id="admin_portal_layout" className="min-h-screen bg-slate-950 text-gray-200 pt-20 px-4 md:px-8 pb-12">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-[#10b981] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 font-semibold text-xs border border-emerald-400/20"
          >
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Portal Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div className="text-left">
            <p className="text-xs text-amber-500 font-extrabold tracking-widest uppercase flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 fill-amber-500/10 text-amber-500" />
              <span>HỆ THỐNG PHÂN QUYỀN & QUẢN TRỊ</span>
            </p>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Admin Portal Controls & Database Role
            </h1>
          </div>

          <div className="flex items-center space-x-3 self-start">
            <span className="text-xs text-gray-400 font-semibold">Quyền hiện tại:</span>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-1.5 px-3 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-amber-400 capitalize">{currentUserRole} Mode</span>
            </div>
            
            <button 
              onClick={() => handleUpdateUserRoleInList('1', currentUserRole === 'admin' ? 'user' : 'admin')}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold py-2 px-3.5 rounded-xl cursor-pointer transition select-none flex items-center space-x-1.5"
            >
              <span>Giả lập Thử vai {currentUserRole === 'admin' ? 'Học viên' : 'Admin'}</span>
            </button>
          </div>
        </div>

        {/* Aggregate Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tổng Học Viên', value: totalStudents, desc: `${userCount} sinh viên - ${adminCount} quản trị`, icon: <Users className="text-indigo-400 w-5 h-5" />, bg: 'bg-indigo-500/5 border-indigo-500/15' },
            { label: 'Số Lượng Bài Học', value: lessons.length, desc: 'Bài học thuật toán', icon: <BookOpen className="text-emerald-400 w-5 h-5" />, bg: 'bg-emerald-500/5 border-emerald-500/15' },
            { label: 'XP Trung Bình học viên', value: `${averageXp.toLocaleString()} XP`, desc: 'Kỷ lục năng lực', icon: <Database className="text-purple-400 w-5 h-5" />, bg: 'bg-purple-500/5 border-purple-500/15' },
            { label: 'Cốt lõi Cơ sở dữ liệu', value: 'LocalStore & Dev', desc: 'Sẵn sàng SQL/Firestore', icon: <ShieldCheck className="text-amber-400 w-5 h-5" />, bg: 'bg-amber-500/5 border-amber-500/15' },
          ].map((stat, i) => (
            <div key={i} className={`p-4 border rounded-2xl ${stat.bg} text-left relative overflow-hidden flex items-center justify-between`}>
              <div>
                <span className="text-[10px] text-gray-500 font-extrabold tracking-wider uppercase block">{stat.label}</span>
                <span className="text-2xl font-black text-white font-mono block mt-1 tracking-tight">{stat.value}</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">{stat.desc}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Portal Inner Tabs */}
        <div className="flex border-b border-slate-900 space-x-6 pb-0.5">
          {[
            { id: 'dashboard', label: 'Bảng Thống Kê (Dashboard)', icon: <TrendingUp className="w-4.5 h-4.5 text-amber-500" /> },
            { id: 'syllabus', label: 'Quản Lý Giáo Trình (Syllabus)', icon: <BookOpen className="w-4.5 h-4.5" /> },
            { id: 'users', label: 'Quản Lý Học Viên & Roles', icon: <Users className="w-4.5 h-4.5" /> },
            { id: 'system', label: 'Bảo Trì & Dịch Vụ Hệ Thống', icon: <Database className="w-4.5 h-4.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
                activeSubTab === tab.id 
                  ? 'border-indigo-500 text-white font-bold' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Modules Viewport */}
        <div className="grid grid-cols-1">
          
          {/* TAB 0: ADMINISTRATIVE ANALYTICS DASHBOARD */}
          {activeSubTab === 'dashboard' && (
            <AdminDashboard users={mockUsers} lessons={lessons} />
          )}
          
          {/* TAB 1: SYLLABUS LESSONS MANAGER */}
          {activeSubTab === 'syllabus' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Lesson Tree and Modifiers */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-900/60 border border-slate-901 border-slate-900 rounded-2xl p-5 text-left">
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Giáo trình huấn luyện chính thức</h3>
                      <p className="text-[10px] text-gray-500 font-medium">Thay đổi thứ tự hoặc xóa bài học. Học viên sẽ thấy cập nhật này lập tức.</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {lessons.map((lesson, idx) => (
                      <div 
                        key={lesson.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                          lesson.active 
                            ? 'bg-indigo-650/10 border-indigo-550/40 text-indigo-300' 
                            : 'bg-slate-950/60 border-slate-900 text-gray-300 hover:border-slate-800'
                        }`}
                      >
                        {editingLessonId === lesson.id ? (
                          // Inline editing interface
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="space-y-1 text-left">
                                <label className="text-gray-400 font-bold block">Tên bài học:</label>
                                <input 
                                  type="text"
                                  value={editedTitle}
                                  onChange={(e) => setEditedTitle(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div className="space-y-1 text-left">
                                <label className="text-gray-400 font-bold block">Chủ đề:</label>
                                <input 
                                  type="text"
                                  value={editedTopic}
                                  onChange={(e) => setEditedTopic(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                  placeholder="e.g. Quy hoạch động, Đồ thị..."
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="space-y-1 text-left">
                                <label className="text-gray-400 font-bold block">Độ khó:</label>
                                <select 
                                  value={editedDifficulty}
                                  onChange={(e) => setEditedDifficulty(e.target.value as any)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                                >
                                  <option value="easy">Easy (Dễ)</option>
                                  <option value="medium">Medium (Trung bình)</option>
                                  <option value="hard">Hard (Khó)</option>
                                </select>
                              </div>
                              <div className="space-y-1 text-left">
                                <label className="text-gray-400 font-bold block">Tiến độ mặc định (%):</label>
                                <input 
                                  type="number"
                                  value={editedProgress}
                                  onChange={(e) => setEditedProgress(parseInt(e.target.value) || 0)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                                  min="0"
                                  max="100"
                                />
                              </div>
                            </div>

                            <div className="space-y-1 text-left text-xs">
                              <label className="text-gray-400 font-bold block">Nội dung bài học (Markdown):</label>
                              <textarea
                                value={editedMarkdown}
                                onChange={(e) => setEditedMarkdown(e.target.value)}
                                placeholder="Nhập lý thuyết bài học dạng Markdown..."
                                className="w-full h-24 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                              />
                            </div>

                            <div className="space-y-1 text-left text-xs">
                              <label className="text-gray-400 font-bold block">Mã nguồn minh họa:</label>
                              <textarea
                                value={editedCodeSnippet}
                                onChange={(e) => setEditedCodeSnippet(e.target.value)}
                                placeholder="Nhập code mẫu (C++, Python, Java...)..."
                                className="w-full h-20 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-indigo-300 focus:outline-none focus:border-indigo-500 font-mono"
                              />
                            </div>

                            <div className="flex justify-end space-x-2 pt-1.5 border-t border-slate-850">
                              <button 
                                onClick={() => handleSaveEditLesson(lesson.id, idx)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded p-1 px-3.5 py-1 font-bold cursor-pointer transition text-[11px]"
                              >
                                Lưu Thay Đổi
                              </button>
                              <button 
                                onClick={() => setEditingLessonId(null)}
                                className="bg-slate-800 hover:bg-slate-700 text-gray-300 rounded p-1 px-3.5 py-1 font-medium cursor-pointer transition text-[11px]"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Normal Display interface
                          <>
                            <div className="flex-1 text-left space-y-1.5">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-mono text-xs font-black text-indigo-400">
                                  Bài {idx + 1}:
                                </span>

                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                  lesson.difficulty === 'hard' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                                  lesson.difficulty === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                                  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                }`}>
                                  {lesson.difficulty === 'hard' ? 'Hard' : lesson.difficulty === 'medium' ? 'Medium' : 'Easy'}
                                </span>

                                {lesson.topic && (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                                    {lesson.topic}
                                  </span>
                                )}

                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  lesson.progress === 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                  lesson.progress > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-900 text-slate-500 border border-slate-800'
                                }`}>
                                  {lesson.progress === 100 ? 'Đã học xong' : lesson.progress > 0 ? `Tiến độ ${lesson.progress}%` : 'Chưa học'}
                                </span>
                                
                                {lesson.active && (
                                  <span className="bg-indigo-600 text-white font-black text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded animate-pulse">
                                    Đang học
                                  </span>
                                )}
                              </div>

                              <p className="text-sm font-black text-white">{lesson.title.replace(/^Bài \d+:\s*/, '')}</p>

                              {(lesson.markdownContent || lesson.codeSnippet) && (
                                <div className="mt-2.5 pt-2.5 border-t border-slate-950/60 space-y-2">
                                  {lesson.markdownContent && (
                                    <div className="bg-slate-950/45 p-2.5 text-[11px] rounded-lg border border-slate-900">
                                      <span className="text-[8.5px] uppercase font-black text-indigo-400 tracking-wider block mb-0.5">Lý thuyết tóm tắt (Markdown):</span>
                                      <p className="text-gray-400 italic font-mono leading-relaxed whitespace-pre-wrap">{lesson.markdownContent}</p>
                                    </div>
                                  )}
                                  {lesson.codeSnippet && (
                                    <div className="bg-slate-950/80 p-2.5 text-[10px] rounded-lg border border-slate-900 font-mono text-zinc-100 overflow-x-auto">
                                      <span className="text-[8.5px] uppercase font-black text-cyan-400 tracking-wider block mb-0.5">Mã nguồn mẫu:</span>
                                      <pre 
                                        className="max-h-24 overflow-y-auto leading-normal whitespace-pre text-left"
                                        dangerouslySetInnerHTML={{
                                          __html: Prism.highlight(lesson.codeSnippet, Prism.languages.cpp || Prism.languages.clike, 'cpp')
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0 self-start sm:self-center mt-2 sm:mt-0">
                              <button 
                                onClick={() => handleToggleActiveLesson(lesson.id)}
                                disabled={lesson.active}
                                className={`text-[10px] p-1.5 px-2.5 rounded-lg font-bold select-none cursor-pointer border transition ${
                                  lesson.active 
                                    ? 'bg-slate-900 border-indigo-500/10 text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-650/20'
                                }`}
                                title="Đặt làm bài học hoạt động để học viên thực tập"
                              >
                                {lesson.active ? 'Mục Hoạt động' : 'Kích hoạt'}
                              </button>
                              <button 
                                onClick={() => startEditLesson(lesson)}
                                className="bg-slate-900 hover:bg-slate-850 p-2 text-gray-400 hover:text-white rounded-lg border border-slate-800 transition cursor-pointer"
                                title="Sửa bài giảng"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="bg-rose-500/10 hover:bg-rose-500/15 p-2 text-rose-400 hover:text-rose-300 rounded-lg border border-rose-500/20 transition cursor-pointer"
                                title="Xóa bài học"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Add Lesson Template */}
              <div className="space-y-4 text-left">
                <form 
                  onSubmit={handleAddLesson}
                  className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <BookPlus className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Đăng Bài Học Mới</h3>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-bold">Tiêu đề bài học:</label>
                    <input 
                      type="text" 
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="e.g. Cấu trúc Giải thuật Stack & Queue"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400 font-bold">Chủ đề (Topic):</label>
                      <input 
                        type="text" 
                        value={newLessonTopic}
                        onChange={(e) => setNewLessonTopic(e.target.value)}
                        placeholder="e.g. Thao tác Stack"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400 font-bold">Tiến độ mặc định (%):</label>
                      <input 
                        type="number" 
                        value={newLessonProgress}
                        onChange={(e) => setNewLessonProgress(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-bold block bg-transparent">Độ khó bài viết (Difficulty):</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'easy', label: 'Easy (Dễ)', bgActive: 'bg-emerald-600 border-emerald-500 text-white', bgInactive: 'bg-slate-950 border-slate-800 text-emerald-400 hover:bg-emerald-500/5' },
                        { id: 'medium', label: 'Medium', bgActive: 'bg-amber-600 border-amber-500 text-white', bgInactive: 'bg-slate-950 border-slate-800 text-amber-400 hover:bg-amber-500/5' },
                        { id: 'hard', label: 'Hard (Khó)', bgActive: 'bg-rose-600 border-rose-500 text-white', bgInactive: 'bg-slate-950 border-slate-800 text-rose-400 hover:bg-rose-500/5' }
                      ].map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setNewLessonDifficulty(d.id as any)}
                          className={`py-2 px-2.5 rounded-xl text-[10.5px] font-bold border transition text-center focus:outline-none cursor-pointer ${
                            newLessonDifficulty === d.id ? d.bgActive : d.bgInactive
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-bold">Nội dung bài học (Markdown):</label>
                    <textarea 
                      value={newLessonMarkdown}
                      onChange={(e) => setNewLessonMarkdown(e.target.value)}
                      placeholder="### Lý thuyết cơ bản...&#10;- Ngăn xếp hoạt động theo cơ chế LIFO...&#10;- Hàng đợi hoạt động theo FIFO..."
                      className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-bold">Mã nguồn minh họa (Code):</label>
                    <textarea 
                      value={newLessonCodeSnippet}
                      onChange={(e) => setNewLessonCodeSnippet(e.target.value)}
                      placeholder="// Code mẫu minh họa bằng C++/Python/Java...&#10;#include <iostream>&#10;int main() { ... }"
                      className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-cyan-300 focus:outline-none focus:border-indigo-500 font-mono leading-normal"
                    />
                  </div>

                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-850/60 text-xs text-gray-500 leading-snug">
                    <p className="font-bold text-gray-400">Đồng bộ hóa dữ liệu học:</p>
                    <p className="mt-1">
                      Các bài học đã đăng mới sẽ được lưu cục bộ hoặc đồng bộ lên máy chủ Postgres live (nếu bật). Học viên sẽ thấy bài giảng xuất hiện lập tức trên Tab Lý Thuyết.
                    </p>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-indigo-650 hover:bg-indigo-600 active:scale-95 text-white font-bold text-xs py-3 rounded-xl cursor-pointer transition flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-950/45"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lưu Giáo Trình & Xuất Bản</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED STUDENTS & USER ROLE MANAGER */}
          {activeSubTab === 'users' && (
            <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 text-left space-y-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">Danh sách Học viên & Role Phân quyền</h3>
                <p className="text-[10px] text-gray-500 font-medium">Bảng theo dõi phân cấp tài khoản hệ thống của AlgoLearn. Bạn có thể thay đổi quyền hạn của bất kỳ học viên nào để kiểm thử.</p>
              </div>

              <div className="overflow-x-auto border border-slate-850 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-850 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Học Viên</th>
                      <th className="p-4">Trường Đào Tạo</th>
                      <th className="p-4 font-mono text-center">Năng lực (XP)</th>
                      <th className="p-4 text-center">Bài Đã Học</th>
                      <th className="p-4 text-center">Chuỗi Ngày</th>
                      <th className="p-4">Trạng thái vai trò (Role)</th>
                      <th className="p-4 text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {mockUsers.map((user) => (
                      <tr 
                        key={user.id}
                        className={`hover:bg-slate-900/40 divide-slate-900 transition ${user.id === '1' ? 'bg-indigo-500/5' : ''}`}
                      >
                        <td className="p-4 flex items-center space-x-3">
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-8 h-8 rounded-full shrink-0 border border-slate-800 object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-extrabold text-white text-xs flex items-center space-x-1.5">
                              <span>{user.name}</span>
                              {user.id === '1' && (
                                <span className="bg-indigo-650 text-white text-[8px] px-1 rounded-sm uppercase tracking-wide font-black">Bạn</span>
                              )}
                            </p>
                            <p className="text-[10px] text-gray-500">ID: u-00{user.id}</p>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400 font-medium">{user.school}</td>
                        <td className="p-4 font-mono font-bold text-center text-indigo-400">
                          {user.xp.toLocaleString()} XP
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-gray-300">
                          {user.solved} bài
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-amber-500/10 text-amber-500 rounded-lg p-1 px-2 text-[11px] font-mono font-black" title="Streak">
                            🔥 {user.streak} ngày
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            {user.role === 'admin' ? (
                              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-1.5 px-3 flex items-center space-x-1 hover:bg-rose-500/15 transition cursor-pointer select-none">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Admin</span>
                              </div>
                            ) : (
                              <div className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 px-3 flex items-center space-x-1 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition cursor-pointer select-none">
                                <Users className="w-3.5 h-3.5 text-indigo-400 font-medium" />
                                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Học viên</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateUserRoleInList(user.id, e.target.value as any)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-bold"
                          >
                            <option value="user">Gán Học Viên (User)</option>
                            <option value="admin">Gán Quản Trị (Admin)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 flex items-start space-x-3 text-xs text-gray-400">
                <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-gray-300">Cơ chế bảo vệ dữ liệu khóa (Role Lockout Rescue):</p>
                  <p>
                    Bạn cấu hình vai trò của mình (<span className="text-indigo-400 font-bold">Võ Minh Trí</span>) trực tiếp trong danh sách này. Nếu tự chuyển về học viên, bạn sẽ lập tức mất quyền quản lý thêm bài học, mô phỏng đúng cấu trúc ủy quyền bảo mật!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM MAINTENANCE & DEMO STATS CONSOLE */}
          {activeSubTab === 'system' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left animate-fade-in">
              
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-900 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight font-sans flex items-center space-x-2">
                    <Database className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span>Cơ sở dữ liệu & Cấu hình PostgreSQL</span>
                  </h3>
                  <p className="text-[10px] text-gray-500 font-medium">Quản lý kết nối PostgreSQL live hoặc khôi phục dữ liệu hệ thống.</p>
                </div>

                {/* PostgreSQL Connection State Panel */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-850">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {pgStatus.usePostgres ? (
                          <>
                            <span className="flex h-3.5 w-3.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="flex h-3 w-3 relative">
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                            </span>
                          </>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400">Trạng thái kết nối hiện tại:</p>
                        <p className="text-sm font-black text-white mt-0.5">{pgStatus.status}</p>
                      </div>
                    </div>

                    {pgStatus.usePostgres && (
                      <button
                        onClick={handleDisconnectPg}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-[10px] font-bold p-1.5 px-3.5 rounded-lg cursor-pointer transition select-none flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Ngắt kết nối / Trở về Local</span>
                      </button>
                    )}
                  </div>

                  {/* Troubleshoot / Connect Input box */}
                  {!pgStatus.usePostgres ? (
                    <form onSubmit={handleConfigurePg} className="space-y-3 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-extrabold tracking-wider uppercase">
                          Nhập chuỗi kết nối PostgreSQL URL (DATABASE_URL):
                        </label>
                        <input
                          type="text"
                          value={customPgUrl}
                          onChange={(e) => setCustomPgUrl(e.target.value)}
                          placeholder="postgres://user:password@host:port/database?sslmode=require"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 font-mono"
                          disabled={pgConfiguring}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <p className="text-[10px] text-gray-500 max-w-sm">
                          Hỗ trợ kết nối mọi nền tảng SQL (Mã nguồn Neon, Supabase, Aiven hay Local Postgres). Sau khi kết nối, hệ thống sẽ tự sinh bảng cấu trúc và đồng bộ hóa.
                        </p>
                        <button
                          type="submit"
                          disabled={pgConfiguring || !customPgUrl.trim()}
                          className={`shrink-0 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition flex items-center space-x-1.5 ${
                            (pgConfiguring || !customPgUrl.trim()) && "opacity-50 cursor-not-allowed"
                          }`}
                        >
                          {pgConfiguring ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Đang kết nối...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Kích hoạt PostgreSQL</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-400 leading-relaxed font-semibold">
                      <p className="flex items-center space-x-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Hệ thống cơ sở dữ liệu đã liên kết hoàn toàn qua PostgreSQL!</span>
                      </p>
                      <p className="mt-1 text-[11px] text-emerald-400/80 font-medium">
                        Tất cả các hành động thêm mới / cập nhật bài giảng học thuật, sắp xếp vị trí bảng xếp hạng cũng như bảo lưu tài khoản học viên đều được ghi nhận trực tiếp vào các bảng quan hệ SQL trên máy chủ của bạn một cách an toàn.
                      </p>
                    </div>
                  )}

                  {/* Pg connection error diagnostics block */}
                  {pgStatus.error && (
                    <div className="bg-rose-950/25 border border-rose-500/20 p-3.5 rounded-xl text-xs text-rose-300 leading-relaxed space-y-1">
                      <p className="font-extrabold text-rose-400 uppercase tracking-widest text-[10px] flex items-center space-x-1">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>Nhật ký lỗi PostgreSQL cuối cùng:</span>
                      </p>
                      <p className="font-mono text-[11px] bg-slate-900 border border-slate-800/60 p-2 rounded text-rose-300/90 break-all">
                        {pgStatus.error}
                      </p>
                      <p className="text-[10px] text-gray-400 pt-1 leading-normal">
                        <strong>Mẹo sửa chữa:</strong> Đảm bảo chuỗi kết nối chứa đúng mật khẩu, cho phép quyền truy cập bên ngoài của cơ sở dữ liệu (IP Whitelist 0.0.0.0/0) và sử dụng tùy chọn tham số <code className="text-amber-400 font-mono text-[10px]">?sslmode=require</code> nếu là máy chủ Cloud Postgres.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Local Backups */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-between text-left">
                    <div>
                      <p className="text-xs font-bold text-white uppercase flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span>Sao lưu JSON Local</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed font-medium">
                        Khi cơ sở dữ liệu SQL ngoại vi không kết nối, tệp tin bản ghi sao lưu <code className="text-indigo-400 font-mono text-[10px]">db.json</code> sẽ đóng vai trò phụ tải để ứng dụng luôn duy trì hoạt động mượt mà.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-900">
                      <span className="text-[10px] text-emerald-400 font-extrabold tracking-wider uppercase flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SAO LƯU ONLINE AN TOÀN</span>
                      </span>
                    </div>
                  </div>

                  {/* Seed & State recovery */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-850/60 flex flex-col justify-between text-left">
                    <div>
                      <p className="text-xs font-bold text-slate-200 uppercase flex items-center space-x-1.5">
                        <RefreshCw className="w-4 h-4 text-rose-400" />
                        <span>Khởi tạo lại trạng thái</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed font-medium">
                        Làm sạch toàn bộ bộ nhớ máy, gỡ các bài giảng đã lưu trữ tùy chỉnh và đưa tất cả tài khoản học viên và bảng xếp hạng về cấu hình xuất xưởng.
                      </p>
                    </div>
                    <button 
                      onClick={handleSystemRestoreDefault}
                      className="mt-4 bg-slate-905 bg-slate-900 hover:bg-slate-850 active:scale-95 text-rose-400 border border-rose-500/20 py-2 rounded-xl text-xs font-bold cursor-pointer transition select-none flex items-center justify-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                      <span>Xóa Cache & Đưa Về Gốc</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                  <span className="text-[10px] text-indigo-400 font-extrabold tracking-wider uppercase block">
                    Nhật ký kết xuất hệ thống (System & SQL logs)
                  </span>
                  <div className="font-mono text-[10px] space-y-1.5 text-gray-500 overflow-y-auto max-h-[120px] pr-2">
                    <p className="text-gray-400">[SYSTEM] Initialization completed on 2026-06-08T15:07Z</p>
                    <p className="text-indigo-400">[AUTH_ROLE] Active session verified user Võ Minh Trí role matches ID config: "admin"</p>
                    {pgStatus.usePostgres ? (
                      <>
                        <p className="text-emerald-400 font-bold">[POSTGRES] Connected to active client pool successfully.</p>
                        <p className="text-emerald-400">[POSTGRES] Tables verified: "users", "syllabus" are healthy.</p>
                      </>
                    ) : (
                      <>
                        <p className="text-amber-500">[POSTGRES] No active database URL provided. Fallback to storage file active.</p>
                        <p className="text-gray-500">[LOCAL_DB] Loaded records correctly from db.json backup.</p>
                      </>
                    )}
                    <p className="text-gray-500">[HMR] Dev servers routing client payload correctly through reverse-proxy on Port 3000</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-950/20 to-slate-900 border border-slate-900 rounded-2xl p-5 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/25">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">Quy trình Phân Quyền SQL</h4>
                  <p className="text-xs text-gray-400 leading-relaxed mt-1">
                    Cấu trúc bảo mật được thực thi chặt chẽ từ tầng Client đến Server PostgreSQL:
                  </p>
                </div>
                <ul className="text-xs text-gray-400 space-y-2.5 font-medium border-t border-slate-850 pt-3">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                    <span><strong>Quyền Học viên (User)</strong>: Đọc thông tin bài học từ bảng <code className="text-indigo-300">syllabus</code>, gửi tin AI, cập nhật <code className="text-indigo-300">xp</code>/<code className="text-indigo-300">streak</code> cá nhân vào bảng <code className="text-indigo-300">users</code>.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                    <span><strong>Quyền Quản trị (Admin)</strong>: Thay đổi, xóa bản ghi tùy ý trên các bảng cơ sở dữ liệu quan hệ, trực tiếp gán phân loại quyền cho học viên học thuật.</span>
                  </li>
                </ul>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
