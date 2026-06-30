import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, Lock, User as UserIcon, GraduationCap, Eye, EyeOff, 
  Sparkles, LogIn, UserPlus, ShieldAlert, CheckCircle2, Wifi, WifiOff, Activity
} from 'lucide-react';
import { AppUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AppUser) => void;
}

const AVATAR_PRESETS = [
  { id: 'avi-1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', label: 'Tech Maker' },
  { id: 'avi-2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', label: 'Sys Dev' },
  { id: 'avi-3', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', label: 'DB Master' },
  { id: 'avi-4', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', label: 'Design Lead' },
  { id: 'avi-5', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', label: 'Algorithmic Boy' },
  { id: 'avi-6', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', label: 'Data Maven' }
];

const SCHOOL_SUGGESTIONS = [
  "Đại học Bách Khoa Hà Nội (HUST)",
  "ĐH Công nghệ thông tin - ĐHQG-HCM",
  "ĐH Công nghệ - ĐHQGHN (UET)",
  "Đại học FPT",
  "Bách Khoa Đà Nẵng (DUT)",
  "Học viện Bưu chính Viễn thông (PTIT)",
  "ĐH Sư Phạm Kỹ Thuật TPHCM (HCMUTE)",
  "Đại học Khoa học Tự nhiên - ĐHQG-HCM",
  "Đại học Tôn Đức Thắng (TDTU)",

  // Mở rộng ~50 trường để đủ danh sách lựa chọn
  "ĐH Quốc tế - ĐHQG-HCM (IU)",
  "ĐH Bách Khoa TP.HCM (HCMUT)",
  "ĐH Khoa học Tự nhiên - ĐHQG-Hà Nội (US)",
  "ĐH Công nghệ thông tin & Truyền thông Thái Nguyên (ICTU)",
  "ĐH Công nghiệp Hà Nội (HAUI)",
  "ĐH Công nghiệp TP.HCM (IUH)",
  "ĐH Thái Nguyên (TNU)",
  "ĐH Tài nguyên & Môi trường Hà Nội (huyền thoại)",
  "ĐH Giao thông Vận tải (UT)",
  "ĐH Mỏ - Địa chất (UMT)",
  "ĐH Điện lực (EPU)",
  "ĐH Xây dựng (NUCE)",
  "ĐH Quốc gia TP.HCM - Trường ĐH CNTT (CS)",
  "ĐH Sư phạm Kỹ thuật Vinh (SPKT)",
  "ĐH Sư phạm Kỹ thuật Đà Nẵng (UDS)",
  "ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)",
  "ĐH Khoa học - ĐH Huế (HUS)",
  "ĐH Đà Nẵng (UD)",
  "ĐH Quy Nhơn (QNU)",
  "ĐH Nha Trang (NTU)",
  "ĐH Cần Thơ (CTU)",
  "ĐH Đồng Tháp (DTU)",
  "ĐH Vinh (VNU)",
  "ĐH Huế - CNTT (UIT)",
  "ĐH Bách khoa - ĐH Đà Nẵng (DUT)",
  "ĐH Sài Gòn (US)",
  "ĐH Ngân hàng TP.HCM (UB)",
  "ĐH Văn Lang (VL)",
  "ĐH Hoa Sen (HSU)",
  "ĐH Tương lai (FUT)",
  "ĐH Nguyễn Tất Thành (NTT)",
  "ĐH Kinh tế - Luật (UEL)",
  "ĐH Luật TP.HCM (HCMUL)",
  "ĐH Quốc tế Miền Đông (EIU)",
  "ĐH Bà Rịa - Vũng Tàu (BVU)",
  "ĐH Tây Nguyên (DTU)",
  "ĐH Kiến trúc TP.HCM (UAPHCM)",
  "ĐH Bách khoa - ĐH Quốc gia HCM (VNU-HCM)",
  "ĐH FPT Cần Thơ",
  "ĐH FPT Đà Nẵng",
  "ĐH FPT Hà Nội",
  "ĐH FPT Hồ Chí Minh",
  "ĐH Bách Khoa - Đại học Đà Nẵng (DUT)",
  "ĐH Công nghệ Sài Gòn (STU)",
  "ĐH Duy Tân (DTU - Deutay)",
  "ĐH Đông Á (DAU)",
  "ĐH Sư phạm Kỹ thuật Nam Định (SPKTNĐ)",
];

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Server connection check states
  const [serverCheckStatus, setServerCheckStatus] = useState<'checking' | 'online' | 'offline' | 'idle'>('idle');

  const handleCheckConnection = async () => {
    setServerCheckStatus('checking');
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      const host = window.location.origin;
      const res = await fetch(`${host}/api/health`, { signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        setServerCheckStatus('online');
      } else {
        setServerCheckStatus('offline');
      }
    } catch (e) {
      setServerCheckStatus('offline');
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      handleCheckConnection();
    }
  }, [isOpen]);

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  // Common UI State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  // Helper load all local users
  const getLocalUsers = (): AppUser[] => {
    try {
      const saved = localStorage.getItem('algolearn_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  // Helper save local users list
  const saveLocalUsers = (users: AppUser[]) => {
    try {
      localStorage.setItem('algolearn_users', JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save account:', e);
    }
  };

  const clearForm = () => {
    setError('');
    setSuccess('');
    setLoginPassword('');
    setRegPassword('');
    setRegConfirmPassword('');
  };

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    clearForm();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!loginEmail || !loginPassword) {
      setError('Vui lòng điền đầy đủ email và mật khẩu!');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Chào mừng ${data.user.isAdmin ? 'Quản Trị Viên' : 'học viên'} quay trở lại, ${data.user.name}! 👋`);
        setTimeout(() => {
          onAuthSuccess(data.user);
          onClose();
        }, 1000);
      } else {
        setError(data.error || 'Đăng nhập không thành công, vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Lỗi kết nối đến máy chủ full stack!');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regName.trim() || !regEmail.trim() || !regPassword || !regSchool) {
      setError('Cần cung cấp đầy đủ thông tin: Họ tên, Email, Mật khẩu và Trường Đại học!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setError('Địa chỉ email không chính xác!');
      return;
    }

    if (regPassword.length < 5) {
      setError('Mật khẩu tối thiểu phải từ 5 ký tự!');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Xác nhận mật khẩu chưa chính xác! Vui lòng nhập lại khớp nhau.');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          school: regSchool,
          avatar: selectedAvatar,
          password: regPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Khởi tạo tài khoản Học viên thành công trên server! Đang kết nối... 🚀');
        setTimeout(() => {
          onAuthSuccess(data.user);
          onClose();
        }, 1200);
      } else {
        setError(data.error || 'Đăng ký thất bại, vui lòng kiểm tra thông tin.');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Lỗi kết nối đến máy chủ full stack!');
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-xl"
      />

      {/* Main Dialog Panel */}
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="w-full max-w-md glass-panel rounded-[28px] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto scrollbar-thin relative flex flex-col z-10 border border-white/[0.08]"
      >
        {/* Glow ambient effects */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-violet-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/5 blur-3xl rounded-full pointer-events-none"></div>

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-white/[0.06] relative z-10 text-left">
          <div className="flex items-center space-x-3">
            <span className="p-2 w-9 h-9 rounded-xl brand-mark text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight leading-tight">Cổng học viên</h3>
              <p className="text-[10px] text-gray-400 font-medium leading-normal mt-0.5">Lưu tiến trình, leo top và thi đấu 1v1</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800/80 rounded-lg text-gray-500 hover:text-white transition cursor-pointer select-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Network Status / Server Status Box inside screenshot */}
        <div className="px-6 pt-3.5 text-left">
          <div className="p-2.5 bg-amber-500/5 border border-amber-500/20 text-amber-300 text-[11px] rounded-xl flex items-center justify-between font-bold">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                serverCheckStatus === 'checking' ? 'bg-indigo-400 animate-pulse' :
                serverCheckStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'
              }`}></span>
              <span className="font-sans">
                {serverCheckStatus === 'checking' ? 'Đang kiểm tra kết nối với SQL máy chủ...' :
                 serverCheckStatus === 'online' ? 'Máy chủ đang trực tuyến (Ổn định)' :
                 'Máy chủ đang ngoại tuyến'}
              </span>
            </div>
            <button 
              type="button" 
              onClick={handleCheckConnection}
              className="border border-amber-500/20 px-2.5 py-0.5 rounded text-[9.5px] bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition cursor-pointer select-none font-extrabold uppercase font-sans tracking-wide outline-none"
            >
              {serverCheckStatus === 'checking' ? 'Đang quét...' : 'Kiểm tra'}
            </button>
          </div>
        </div>

        {/* Dynamic Warning Alert Messages - exactly like the red bar in screenshot */}
        <AnimatePresence mode="wait">
          {error && (
            <div className="mx-6 mt-3 p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] rounded-xl flex items-center space-x-2 text-left font-bold font-sans">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mx-6 mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] rounded-xl flex items-center space-x-2 text-left font-bold font-sans">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}
        </AnimatePresence>

        {/* Tab Selection */}
        <div className="flex px-6 pt-4">
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-900 w-full">
            <button
              onClick={() => handleTabChange('login')}
              autoFocus={false}
              className={`flex-1 py-2 text-[10px] font-black tracking-wider uppercase rounded-xl transition-all focus:outline-none flex items-center justify-center space-x-1.5 cursor-pointer select-none ${
                activeTab === 'login' 
                  ? 'bg-indigo-950/80 border border-indigo-500/35 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>ĐĂNG NHẬP</span>
            </button>
            <button
              onClick={() => handleTabChange('register')}
              autoFocus={false}
              className={`flex-1 py-2 text-[10px] font-black tracking-wider uppercase rounded-xl transition-all focus:outline-none flex items-center justify-center space-x-1.5 cursor-pointer select-none ${
                activeTab === 'register' 
                  ? 'bg-indigo-950/80 border border-indigo-500/35 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>ĐĂNG KÝ MỚI</span>
            </button>
          </div>
        </div>

        {/* Tab Contents Frame */}
        <div className="p-6 pt-4 flex-1 overflow-y-auto max-h-[420px]">
          {activeTab === 'login' ? (
            /* LOGIN FORM CONTAINER */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide font-sans">ĐỊA CHỈ EMAIL</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="Sĩ tử: dev@daihoc.edu.vn"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-900 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-gray-100 placeholder-slate-600 outline-none focus:border-indigo-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide font-sans">MẬT KHẨU</label>
                  <span className="text-[10px] text-[#6366f1] hover:text-[#818cf8] font-bold cursor-pointer font-sans transition-colors">Quên mật khẩu?</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-900 rounded-xl py-3 pl-10 pr-10 text-xs text-gray-100 placeholder-slate-600 outline-none focus:border-indigo-500 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.97] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 select-none shadow-md shadow-indigo-650/10 font-sans"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="uppercase tracking-wider">XÁC NHẬN ĐĂNG NHẬP</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-[10.5px] text-slate-500 leading-relaxed font-semibold font-sans">
                  Chưa có tài khoản? Nhấn "Tạo tài khoản mới" để đăng ký ngay.
                </p>
              </div>
            </form>
          ) : (
            /* REGISTER FORM CONTAINER */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide font-sans">HỌ TÊN THÀNH VIÊN</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-gray-100 placeholder-slate-600 outline-none focus:border-indigo-500 transition-all font-sans"
                    maxLength={35}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide font-sans">ĐỊA CHỈ EMAIL</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="dev@daihoc.edu.vn"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-gray-100 placeholder-slate-600 outline-none focus:border-indigo-500 transition-all font-sans font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide font-sans">TRƯỜNG ĐẠI HỌC</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <select
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-gray-100 outline-none focus:border-indigo-500 transition-all font-sans"
                  >

                    <option value="" disabled>
                      Chọn trường đại học (hoặc chọn “Khác...”)
                    </option>
                    {SCHOOL_SUGGESTIONS.map((sc, ix) => (
                      <option key={ix} value={sc}>
                        {sc}
                      </option>
                    ))}
                    <option value="__OTHER__">Khác...</option>
                  </select>

                  {/* If user picks “Khác...”, show an input to type custom school */}
                  {regSchool === '__OTHER__' && (
                    <input
                      type="text"
                      placeholder="Nhập tên trường của bạn"
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      className="mt-2 w-full bg-[#030712] border border-slate-900 rounded-xl py-2.5 px-3 text-xs font-semibold text-gray-100 placeholder-slate-600 outline-none focus:border-indigo-500 transition-all font-sans"
                      maxLength={60}
                    />
                  )}



                </div>
              </div>

              {/* Developer Avatar Picker Grid */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block font-sans">CHỌN LỚP NHÂN VẬT (AVATAR)</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedAvatar(preset.url)}
                      className={`relative w-10 h-10 rounded-full overflow-hidden transition-all duration-150 cursor-pointer max-w-full ${
                        selectedAvatar === preset.url 
                          ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900 border-2 border-indigo-500 scale-105' 
                          : 'opacity-70 hover:opacity-100 border border-slate-800'
                      }`}
                      title={preset.label}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.label} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide font-sans">MẬT KHẨU</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Tối thiểu 5 ký tự"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-[#030712] border border-slate-900 rounded-xl py-2.5 px-3 text-xs text-gray-100 placeholder-slate-600 outline-none focus:border-indigo-500 transition-all font-sans font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide font-sans">XÁC NHẬN</label>
                  <div className="relative">
                    <input
                      type={showRegConfirm ? "text" : "password"}
                      placeholder="Xác nhận"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-[#030712] border border-slate-900 rounded-xl py-2.5 px-3 text-xs text-gray-100 placeholder-slate-600 outline-none focus:border-indigo-500 transition-all font-sans font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirm(!showRegConfirm)}
                      className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showRegConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.97] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 select-none shadow-md border-b border-indigo-800"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="uppercase tracking-wider">XÁC NHẬN ĐĂNG KÝ HỌC VIÊN</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
