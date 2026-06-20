import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, LogIn, UserPlus, ShieldAlert, CheckCircle2, Mail, Lock, 
  User as UserIcon, GraduationCap, Eye, EyeOff, Brain, BookOpen, 
  Terminal, Swords, Trophy, Play, ArrowRight, Code, ChevronRight, Flame, X
} from 'lucide-react';
import { AppUser } from '../types';

interface LandingGateProps {
  onAuthSuccess: (user: AppUser) => void;
}

const AVATAR_PRESETS = [
  { id: 'avi-1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', label: 'Tech Maker' },
  { id: 'avi-2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', label: 'Sys Dev' },
  { id: 'avi-3', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', label: 'DB Master' },
  { id: 'avi-4', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', label: 'Design Lead' },
  { id: 'avi-5', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', label: 'Algorithmic' },
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
  "Đại học Công Nghệ TPHCM (HUTECH)",

  "ĐH Quốc tế - ĐHQG-HCM (IU)",
  "ĐH Bách Khoa TP.HCM (HCMUT)",
  "ĐH Khoa học Tự nhiên - ĐHQG-Hà Nội (US)",
  "ĐH Công nghệ thông tin & Truyền thông Thái Nguyên (ICTU)",
  "ĐH Công nghiệp Hà Nội (HAUI)",
  "ĐH Công nghiệp TP.HCM (IUH)",
  "ĐH Thái Nguyên (TNU)",
  "ĐH Tài nguyên & Môi trường Hà Nội",
  "ĐH Giao thông Vận tải (UT)",
  "ĐH Mỏ - Địa chất (UMT)",

  "ĐH Điện lực (EPU)",
  "ĐH Xây dựng (NUCE)",
  "ĐH Quốc gia TP.HCM - Trường ĐH CNTT",
  "ĐH Sư phạm Kỹ thuật Vinh",
  "ĐH Sư phạm Kỹ thuật Đà Nẵng",
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
  "ĐH Luật TP.HCM",
  "ĐH Quốc tế Miền Đông",
  "ĐH Bà Rịa - Vũng Tàu (BVU)",
  "ĐH Tây Nguyên",
  "ĐH Kiến trúc TP.HCM (UAPHCM)",
  "ĐH Bách khoa - ĐH Quốc gia HCM (VNU-HCM)",
  "ĐH Công nghệ Sài Gòn (STU)",
  "ĐH Duy Tân"
];

const FEATURES_LIST = [
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

const TESTIMONIALS_LIST = [
  {
    name: "Nguyễn Văn Minh",
    school: "Đại học Bách Khoa Hà Nội (HUST)",
    quote: "Từ một người cực sợ các bài toán đệ quy và cấu trúc dữ liệu phức tạp, nhờ sơ đồ mô phỏng và phần thi đấu 1v1 của AlgoLearn mà tôi đã vượt qua kỳ thi Algorithms với điểm A tuyệt đối!",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
  },
  {
    name: "Trần Thị Mai",
    school: "Đại học Công nghệ thông tin - ĐHQG-HCM (UIT)",
    quote: "Màn hình đấu 1v1 kịch tính vô cùng! Mình hay rủ bạn bè vào đua code. Giao diện trực quan, phản hồi testcase nhanh và trợ lý AI giải thích dễ hiểu hơn cả giáo trình.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
  },
  {
    name: "Lê Hoàng Nam",
    school: "Đại học Công nghệ - ĐHQGHN (UET)",
    quote: "Tính năng so sánh phức tạp Big O bằng biểu đồ của IDE làm mình cực kỳ ấn tượng. Nó giúp mình hiểu rõ tại sao Quick Sort của mình lại nhanh hơn Bubble Sort thực sự.",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80"
  }
];

export default function LandingGate({ onAuthSuccess }: LandingGateProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(true); // Open centered pop-up automatically to match screenshot
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('online');
  const [isPinging, setIsPinging] = useState(false);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  // Status message state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Server health checker
  const handleCheckServer = async () => {
    setIsPinging(true);
    setError('');
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (err) {
      setServerStatus('offline');
    } finally {
      setTimeout(() => {
        setIsPinging(false);
      }, 500);
    }
  };

  // Run on mount once
  React.useEffect(() => {
    handleCheckServer();
  }, []);

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
    setSuccess('');
    
    const emailToSubmit = loginEmail.trim();
    const passwordToSubmit = loginPassword.trim();

    if (!emailToSubmit || !passwordToSubmit) {
      setError('Vui lòng điền đầy đủ email và mật khẩu!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSubmit, password: passwordToSubmit })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Đăng nhập thành công! Chào mừng ${data.user.isAdmin ? 'Quản Trị Viên' : 'Sĩ tử'} ${data.user.name} 👋`);
        setTimeout(() => {
          onAuthSuccess(data.user);
        }, 1000);
      } else {
        setError(data.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Lỗi kết nối máy chủ full stack!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regPassword || !regSchool) {
      setError('Vui lòng cung cấp đầy đủ thông tin để đăng ký!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setError('Địa chỉ email nhập vào không đúng định dạng!');
      return;
    }

    if (regPassword.length < 5) {
      setError('Mật khẩu tối thiểu phải từ 5 ký tự!');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Xác nhận mật khẩu sai! Mật khẩu gõ lại phải trùng khớp.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        setSuccess('Đăng ký tài khoản thành công! Đang kết nối nền tảng... 🚀');
        setTimeout(() => {
          onAuthSuccess(data.user);
        }, 1200);
      } else {
        setError(data.error || 'Có lỗi xảy ra khi tạo tài khoản.');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Lỗi kết nối máy chủ!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen premium-app text-gray-100 flex flex-col relative font-sans antialiased" id="landing_gate_container">
      <div className="premium-ambient" aria-hidden="true" />
      {/* Dynamic ambient background glowing */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      {/* Guest Navbar Header */}
      <header className="h-16 border-b border-white/[0.06] px-4 md:px-8 flex items-center justify-between relative z-10 glass-header">
        <div className="flex items-center space-x-2.5 select-none text-left">
          <div className="w-9 h-9 rounded-xl brand-mark flex items-center justify-center text-white">
            <Brain className="w-5.5 h-5.5 fill-white" />
          </div>
          <div>
            <span className="text-base font-extrabold text-white tracking-tight block">AlgoLearn</span>
            <span className="text-[10px] gradient-text-gold block leading-none font-medium">Premium Edition</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={() => {
              clearForm();
              setIsAuthModalOpen(true);
            }}
            className="btn-premium-outline inline-flex items-center space-x-1 text-violet-200 font-semibold text-xs p-2 px-3.5 rounded-xl transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng nhập</span>
          </button>
          <div className="text-xs font-mono font-semibold text-emerald-300/90 metric-chip px-3 py-1 rounded-xl">
            <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
            Online
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper layout showing information on the left and workspace preview mockup on the right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left side: Hero, sort preview, features, testimonials, CTA */}
          <div className="lg:col-span-7 space-y-24 text-left">
            
            {/* 1. Hero Left Text */}
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 pill-badge rounded-full px-4 py-1.5 text-xs font-semibold"
              >
                <Sparkles className="w-4 h-4 text-violet-300" />
                <span>Nền tảng học thuật toán thế hệ mới</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
              >
                Làm chủ <span className="gradient-text-premium">thuật toán</span>,
                <br />chinh phục tương lai IT
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-gray-400/90 text-base md:text-lg leading-relaxed max-w-2xl font-light"
              >
                Học cấu trúc dữ liệu và giải thuật (DSA) hoàn toàn trực quan qua đồ họa chuyển động, thử thách 1v1 thời gian thực và sự trợ giúp tức thì từ trí tuệ nhân tạo.
              </motion.p>

              {/* Graphical array simulation */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">quick_sort.cpp - Live Preview Visualizer</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-center space-x-3 h-36 py-2 bg-slate-950/80 rounded-xl border border-slate-800/80 relative">
                    {[
                      { val: 12, h: '40%', state: 'sorted' },
                      { val: 19, h: '65%', state: 'low' },
                      { val: 24, h: '80%', state: 'high' },
                      { val: 8, h: '25%', state: 'active' },
                      { val: 31, h: '100%', state: 'pivot' },
                      { val: 15, h: '50%', state: 'default' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1 max-w-[45px]">
                        <div 
                          className={`w-full rounded-t-md transition-all duration-500 flex items-end justify-center text-[9px] font-mono font-bold pb-1 ${
                            item.state === 'pivot' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' :
                            item.state === 'active' ? 'bg-indigo-500 text-white' :
                            item.state === 'low' ? 'bg-emerald-500 text-slate-950' :
                            item.state === 'high' ? 'bg-rose-500 text-white' :
                            item.state === 'sorted' ? 'bg-slate-700 text-gray-400' : 'bg-slate-800 text-gray-400'
                          }`}
                          style={{ height: item.h }}
                        >
                          {item.val}
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 mt-1.5">
                          {item.state === 'pivot' ? 'K' : `i=${idx}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-805">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="font-mono">Đang hoán đổi vị trí: A[3] ↔ A[5]</span>
                    </div>
                    <div className="flex space-x-1.5 font-mono text-[9px]">
                      <span className="text-blue-400">low=1</span>
                      <span className="text-gray-500">|</span>
                      <span className="text-red-400">high=4</span>
                    </div>
                  </div>
                </div>

                {/* Floating mini bg glow */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full"></div>
              </motion.div>

              {/* School badge highlights */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-6 border-t border-slate-900"
              >
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-4 font-bold">ĐƯỢC TIN DÙNG BỞI SINH VIÊN CÁC TRƯỜNG ĐẠI HỌC TOP ĐẦU</p>
                <div id="school_logos" className="flex flex-wrap gap-x-6 gap-y-3 items-center opacity-60">
                  <span className="text-xs font-black text-slate-400 tracking-wider">HUST (Bách Khoa HN)</span>
                  <span className="text-xs font-black text-slate-400 tracking-wider">HCMUT (Bách Khoa HCM)</span>
                  <span className="text-xs font-black text-slate-400 tracking-wider">UIT (ĐHQG TPHCM)</span>
                  <span className="text-xs font-black text-slate-400 tracking-wider">UET (ĐHQG HN)</span>
                  <span className="text-xs font-black text-slate-400 tracking-wider">ĐẠI HỌC FPT</span>
                  <span className="text-xs font-black text-slate-400 tracking-wider">HCMUTE</span>
                </div>
              </motion.div>
            </div>

            {/* 2. Grid of features section */}
            <div className="pt-12 border-t border-slate-900 relative">
              <div className="text-left mb-10 space-y-3">
                <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold">CÔNG CỤ HỌC TẬP ĐỈNH CAO CHO DEV VIỆT</h2>
                <p className="text-3xl font-extrabold text-white">Chúng tôi định nghĩa lại cách bạn tiếp thu Thuật Toán</p>
                <p className="text-gray-400 text-sm max-w-2xl">Không còn phải vật lộn với những dòng mã khô khan trên sách vở. Trực quan hóa mọi thứ trong môi trường tối tân nhất.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {FEATURES_LIST.map((feat, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ y: -5, borderColor: 'rgba(99, 102, 241, 0.4)' }}
                    className="bg-slate-900/60 border border-slate-800/85 rounded-2xl p-6 text-left relative group transition-all duration-300 pointer-events-auto"
                  >
                    <div className="inline-flex p-3 bg-slate-950 border border-slate-800 rounded-xl mb-5 text-indigo-400 transition-colors group-hover:bg-indigo-500/10">
                      {feat.icon}
                    </div>
                    <h3 className="text-base font-bold text-gray-100 mb-2">{feat.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">{feat.desc}</p>
                    <span className="absolute top-4 right-4 bg-indigo-500/10 text-indigo-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-500/20">
                      {feat.badge}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 3. Testimonials section */}
            <div className="pt-12 border-t border-slate-900">
              <div className="text-left mb-10 space-y-3">
                <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold">CẢM NHẬN THỰC TẾ</h2>
                <p className="text-3xl font-extrabold text-white">Trải nghiệm xuất sắc từ cộng đồng</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TESTIMONIALS_LIST.map((test, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 flex flex-col justify-between text-left relative"
                  >
                    <div className="space-y-3">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className="text-amber-400 text-sm">★</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-300 italic leading-relaxed">
                        &ldquo;{test.quote}&rdquo;
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3 pt-4 border-t border-slate-800/80 mt-4">
                      <img 
                        src={test.avatar} 
                        alt={test.name} 
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-gray-100">{test.name}</h4>
                        <p className="text-[10px] text-gray-500 leading-tight font-sans">{test.school}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Elegant CTA Banner Box */}
            <div className="pt-4">
              <motion.div 
                whileHover={{ shadow: '0 25px 50px -12px rgba(99, 102, 241, 0.15)' }}
                className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40"></div>
                
                <div className="space-y-5 relative z-10">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">Sẵn sàng nâng tầm tư duy?</h2>
                  <p className="text-gray-300 text-xs max-w-xl mx-auto leading-relaxed">
                    Chỉ cần 15 phút mỗi ngày cùng các bài học trực quan và trận đấu đối kháng, bạn sẽ làm chủ hoàn toàn các cấu trúc dữ liệu kinh điển nhất.
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-xl active:scale-95 transition cursor-pointer shadow-xl flex items-center space-x-1"
                    >
                      <span>Trải nghiệm ngay</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-950" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="bg-indigo-600/35 hover:bg-indigo-600/45 text-indigo-300 border border-indigo-500/40 font-bold text-xs px-6 py-3 rounded-xl active:scale-95 transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <span>Thi Đấu 1v1 Arena</span>
                      <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                  </div>
                </div>
                
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full"></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
              </motion.div>
            </div>

          </div>

          {/* Right side: Stunning preview mockup of the workspace board */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start z-10 w-full flex flex-col items-center mt-8 lg:mt-0 space-y-6">
            <div className="w-full bg-slate-900 border border-slate-805 rounded-3xl overflow-hidden shadow-2xl p-6 relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-slate-805 pb-4 mb-5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
                    WS
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Không gian học tập</h3>
                    <p className="text-[9px] text-gray-400 font-semibold leading-none">AlgoLearn Active Workspace Mockup</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold py-1 px-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Preview
                </span>
              </div>

              <div className="space-y-4">
                {/* User Info card mockup */}
                <div className="bg-slate-950/70 rounded-2xl border border-slate-805 p-4 flex items-center justify-between text-left">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={AVATAR_PRESETS[0].url} 
                      alt="Student" 
                      className="w-10 h-10 rounded-full border border-indigo-500" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-indigo-300">Sĩ tử ẩn danh</h4>
                      <p className="text-[10px] text-gray-500">Chưa kích hoạt tài khoản</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] block font-mono font-bold text-amber-400">🔥 0 Ngày Streak</span>
                    <span className="text-[10px] block text-gray-500">0 XP tích lũy</span>
                  </div>
                </div>

                {/* Progress bars of subjects */}
                <div className="space-y-3 bg-slate-950/40 border border-slate-805 p-4 rounded-2xl text-left">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giáo Trình Thuật Toán (DSA)</h4>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between items-center text-[10px] mb-1">
                        <span className="text-gray-300 font-bold">1. Thiết Kế Thuật Toán Sắp Xếp</span>
                        <span className="text-amber-400 font-extrabold">Locked (Yêu cầu đăng nhập)</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] mb-1">
                        <span className="text-gray-300 font-bold">2. Danh Sách Liên Kết & Ngăn Xếp</span>
                        <span className="text-gray-500 font-extrabold">Locked</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-slate-750 h-1.5 rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Arena leaderboard mockup */}
                <div className="bg-slate-950/40 border border-slate-805 p-4 rounded-2xl text-left">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đấu Trường 1v1 Arena</h4>
                    <span className="text-[9px] font-bold text-indigo-400 animate-pulse">24 người chơi trực tuyến</span>
                  </div>
                  <div className="space-y-2 font-mono text-[10px]">
                    <div className="flex justify-between items-center bg-indigo-950/20 p-2 rounded-lg border border-indigo-500/10">
                      <span className="text-gray-200">⚔️ Nguyễn Bách Khoa</span>
                      <span className="text-emerald-400">Đang tìm trận...</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-805">
                      <span className="text-gray-400">⚔️ Lê Công Nghệ</span>
                      <span className="text-indigo-400">Đang gõ code (+40 XP)</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-550 border-b-2 border-indigo-800 text-white font-extrabold text-xs transition duration-200 shadow-lg active:scale-95 cursor-pointer select-none"
                >
                  👉 XÁC THỰC ĐĂNG NHẬP ĐỂ GIẢI BÀI TẬP
                </button>
              </div>
            </div>

            {/* Quick credentials help box */}
            <div className="w-full bg-slate-900/40 border border-slate-900/60 p-4 rounded-2xl text-left text-[11px] leading-relaxed text-gray-400">
              <span className="font-bold text-amber-400">⚡ Tài khoản học thử nhanh:</span>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300 font-mono text-[9.5px]">
                <li>Admin: <strong className="text-white">admin@algolearn.vn</strong> | MK: <strong className="text-white">admin123</strong></li>
                <li>Học viên: <strong className="text-white">hutech_sv@algolearn.vn</strong> | MK: <strong className="text-white">hutech123</strong></li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* CENTERED POPUP MODAL OVERLAY: CỔNG HỌC VIÊN ĐĂNG NHẬP */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4">
            
            {/* Backdrop Blur Gray Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Center Auth Card Box Container styled EXACTLY as requested */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-md bg-[#0b0f19] border border-slate-800/80 rounded-[28px] overflow-hidden relative shadow-2xl flex flex-col z-10"
            >
              {/* Internal Glow Effects */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 blur-2xl pointer-events-none" />

              {/* Close Button top right */}
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-5 right-5 text-gray-500 hover:text-white p-1 hover:bg-slate-900/60 rounded-lg transition-all cursor-pointer z-20"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="p-6 pb-4 flex items-center space-x-3 border-b border-slate-900/60 text-left relative z-10">
                <span className="p-2 w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-tight leading-tight">Cổng Học Viên Đăng Nhập</h3>
                  <p className="text-[10px] text-gray-400 font-medium leading-normal mt-0.5">Lưu tiến trình học, giải DSA và leo Top toàn bang hội</p>
                </div>
              </div>

              {/* Status Alert Area: Live server verification bar from screenshot */}
              <div className="px-6 pt-3.5 text-left relative z-10">
                {/* Server connectivity block with check button */}
                <div className="p-2.5 bg-amber-500/5 border border-amber-500/20 text-amber-300 text-[11px] rounded-xl flex items-center justify-between font-bold">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isPinging ? 'bg-indigo-400 animate-pulse' : serverStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
                    <span className="font-sans text-amber-300">
                      {isPinging ? 'Đang kiểm tra kết nối với SQL máy chủ...' : serverStatus === 'online' ? 'Máy chủ đang trực tuyến (Ổn định)' : 'Máy chủ đang ngoại tuyến'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckServer}
                    className="border border-amber-500/20 px-2.5 py-0.5 rounded text-[9.5px] bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition cursor-pointer select-none font-extrabold uppercase font-sans tracking-wide outline-none active:scale-95"
                  >
                    {isPinging ? 'Đang quét...' : 'Kiểm tra'}
                  </button>
                </div>
              </div>

              {/* Validation error block shown exactly as the red bar error in your image */}
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

              {/* Login / Signup Tabs inside capsule */}
              <div className="flex px-6 pt-4">
                <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-900 w-full">
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
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
                    type="button"
                    onClick={() => handleTabChange('register')}
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

              {/* Content Form */}
              <div className="p-6 pt-4 flex-1 overflow-y-auto max-h-[420px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'login' ? (
                    <motion.form
                      key="centered-login"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      onSubmit={handleLoginSubmit}
                      className="space-y-4 text-left"
                    >
                      {/* Email address field */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide font-sans">ĐỊA CHỈ EMAIL</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                          <input
                            type="email"
                            placeholder="Sĩ tử: dev@daihoc.edu.vn"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-[#030712] border border-slate-900 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-gray-100 placeholder-slate-600 outline-none focus:border-indigo-500 transition-all font-sans"
                          />
                        </div>
                      </div>

                      {/* Password field */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide font-sans">MẬT KHẨU</label>
                          <span
                            onClick={() => {
                              setLoginEmail('admin@algolearn.vn');
                              setLoginPassword('admin123');
                              setError('');
                            }}
                            className="text-[10px] text-[#6366f1] hover:text-[#818cf8] font-bold cursor-pointer font-sans transition-colors"
                          >
                            Quên mật khẩu?
                          </span>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                          <input
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            disabled={isLoading}
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
                          disabled={isLoading}
                          className="w-full bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.97] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 select-none shadow-md shadow-indigo-650/10 font-sans"
                        >
                          <LogIn className="w-4 h-4" />
                          <span className="uppercase tracking-wider">{isLoading ? 'ĐANG KẾT NỐI HỆ THỐNG...' : 'XÁC NHẬN ĐĂNG NHẬP'}</span>
                        </button>
                      </div>

                      {/* Footer trial account info from screenshot */}
                      <div className="text-center pt-2">
                        <p className="text-[10.5px] text-slate-500 leading-relaxed font-semibold font-sans">
                          Tài khoản dùng thử (Admin & Học viên): <strong className="text-indigo-400 select-all">admin@algolearn.vn</strong> / <strong className="text-indigo-400 select-all">admin123</strong>
                        </p>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="centered-register"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      onSubmit={handleRegisterSubmit}
                      className="space-y-4 text-left font-sans"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide font-sans">HỌ TÊN THÀNH VIÊN</label>
                        <div className="relative">
                          <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Ví dụ: Nguyễn Văn A"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                            disabled={isLoading}
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

                          {regSchool === '__OTHER__' && (
                            <input
                              type="text"
                              placeholder="Nhập tên trường của bạn"
                              value={regSchool}
                              onChange={(e) => setRegSchool(e.target.value)}
                              disabled={isLoading}
                              className="mt-2 w-full bg-[#030712] border border-slate-900 rounded-xl py-2.5 px-3 text-xs font-semibold text-gray-100 placeholder-slate-600 outline-none focus:border-indigo-500 transition-all font-sans"
                              maxLength={60}
                            />
                          )}
                        </div>
                      </div>

                      {/* Character avatar selection */}
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
                              disabled={isLoading}
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
                              disabled={isLoading}
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
                              disabled={isLoading}
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
                          disabled={isLoading}
                          className="w-full bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.97] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 select-none shadow-md border-b border-indigo-800"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span className="uppercase tracking-wider">XÁC NHẬN ĐĂNG KÝ HỌC VIÊN</span>
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comprehensive Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-sm text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-left font-sans">
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">AlgoLearn</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 font-sans">
              Công cụ đồng hành tuyệt vời trong túi của mọi sinh viên Công nghệ thông tin Việt Nam. Master DSA, Master Interviews.
            </p>
          </div>
          <div>
            <h4 className="text-gray-300 font-semibold mb-4 text-xs uppercase tracking-wider font-sans">Học tập</h4>
            <ul className="space-y-2 text-xs font-sans">
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition cursor-pointer text-left">Cây thư mục bài giảng</button></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition cursor-pointer text-left">Mô phỏng đệ quy</button></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition cursor-pointer text-left">Visualizer Quick Sort</button></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition cursor-pointer text-left">Độ phức tạp Big O</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-300 font-semibold mb-4 text-xs uppercase tracking-wider font-sans">Hoạt động</h4>
            <ul className="space-y-2 text-xs font-sans">
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition cursor-pointer text-left">Thử thách 1v1 Arena</button></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition cursor-pointer text-left">Bảng vàng vinh danh</button></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition cursor-pointer text-left">Sảnh danh vọng</button></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition cursor-pointer text-left">Đua Rank Tuần</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-300 font-semibold mb-4 text-xs uppercase tracking-wider font-sans">Hỗ trợ</h4>
            <p className="text-xs text-gray-500 mb-2 font-sans">Liên hệ góp ý sản phẩm:</p>
            <p className="text-xs font-mono text-gray-400">support@algolearn.vn</p>
            <div className="pt-4 text-[10px] font-sans">
              &copy; {new Date().getFullYear()} AlgoLearn. Developed with ⚡ React & Gemini.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
