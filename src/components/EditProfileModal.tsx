import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, GraduationCap, CheckCircle2, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { AppUser } from '../types';
import { getSoundEnabled, setSoundEnabled, playAudioCue } from '../utils/audio';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onSave: (newName: string, newSchool: string, newAvatar: string) => void;
}

const AVATAR_PRESETS = [
  { id: 'avi-1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', label: 'Tech Maker' },
  { id: 'avi-2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', label: 'Sys Dev' },
  { id: 'avi-3', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', label: 'DB Master' },
  { id: 'avi-4', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', label: 'Design Lead' },
  { id: 'avi-5', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', label: 'Algorithmic Boy' },
  { id: 'avi-6', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', label: 'Data Maven' }
];

const POPULAR_SCHOOLS = [
  "Đại học Bách Khoa Hà Nội (HUST)",
  "Đại học Bách Khoa - ĐHQG TPHCM (HCMUT)",
  "Đại học Công nghệ thông tin - ĐHQG TPHCM (UIT)",
  "Đại học Công nghệ - ĐHQG Hà Nội (UET)",
  "Đại học FPT (FPTU)",
  "Đại học Sư phạm Kỹ thuật TPHCM (HCMUTE)",
  "Học viện Công nghệ Bưu chính Viễn thông (PTIT)",
  "Đại học Công nghệ TP.HCM (HUTECH)",
  "Đại học Cần Thơ (CTU)",
  "Đại học Khoa học Tự nhiên - ĐHQG TPHCM (HCMUS)"
];

const ALL_VIETNAM_IT_SCHOOLS = [
  "Đại học Bách Khoa Hà Nội (HUST)",
  "Đại học Bách Khoa - ĐHQG TPHCM (HCMUT)",
  "Đại học Công nghệ thông tin - ĐHQG TPHCM (UIT)",
  "Đại học Công nghệ - ĐHQG Hà Nội (UET)",
  "Đại học FPT (FPTU)",
  "Đại học Công nghệ TP.HCM (HUTECH)",
  "Đại học Sư phạm Kỹ thuật TPHCM (HCMUTE)",
  "Đại học Khoa học Tự nhiên - ĐHQG TPHCM (HCMUS)",
  "Học viện Công nghệ Bưu chính Viễn thông Hà Nội (PTIT)",
  "Học viện Công nghệ Bưu chính Viễn thông TPHCM (PTIT)",
  "Đại học Tôn Đức Thắng (TDTU)",
  "Đại học CNTT & Truyền thông Việt - Hàn (VKU)",
  "Học viện Kỹ thuật Quân sự (MTA)",
  "Học viện Kỹ thuật Mật mã (KMA)",
  "Đại học Bách Khoa - Đại học Đà Nẵng (DUT)",
  "Đại học Sư phạm Kỹ thuật Đà Nẵng (UTEDN)",
  "Đại học Cần Thơ (CTU)",
  "Đại học Sài Gòn (SGU)",
  "Đại học Công nghiệp TPHCM (IUH)",
  "Đại học Công nghiệp Hà Nội (HaUI)",
  "Đại học Kinh tế Quốc dân (NEU)",
  "Đại học Ngoại thương (FTU)",
  "Đại học Kinh tế TPHCM (UEH)",
  "Đại học Quốc tế - ĐHQG TPHCM (IU)",
  "Đại học RMIT Việt Nam (RMIT)",
  "Đại học Duy Tân (DTU)",
  "Đại học Văn Lang (VLU)",
  "Đại học Nguyễn Tất Thành (NTTU)",
  "Đại học Thủy Lợi (TLU)",
  "Đại học Giao thông Vận tải Hà Nội (UTC)",
  "Đại học Giao thông Vận tải TPHCM (UT)",
  "Đại học Kiến trúc Hà Nội (HAU)",
  "Đại học Kiến trúc TPHCM (UAH)",
  "Đại học Mở Hà Nội (HOU)",
  "Đại học Mở TPHCM (OU)",
  "Đại học Ngoại ngữ Tin học TPHCM (HUFLIT)",
  "Đại học Điện lực (EPU)",
  "Đại học Mỏ - Địa chất (HUMG)",
  "Đại học Xây dựng Hà Nội (HUCE)",
  "Đại học Phenikaa (PKA)",
  "Đại học Hoa Sen (HSU)",
  "Đại học Khoa học và Công nghệ Hà Nội (USTH)",
  "Đại học Việt Đức (VGU)",
  "Đại học Sư phạm Hà Nội (HNUE)",
  "Đại học Sư phạm TPHCM (HCMUE)",
  "Đại học Sư phạm Kỹ thuật Hưng Yên (UTEHY)",
  "Đại học Sư phạm Kỹ thuật Vinh (VUTED)",
  "Đại học Thái Nguyên (TNU)",
  "Đại học CNTT & Truyền thông - ĐH Thái Nguyên (ICTU)",
  "Đại học Quy Nhơn (QNU)",
  "Đại học Nha Trang (NTU)",
  "Đại học Vinh (VU)",
  "Đại học Đà Lạt (DLU)",
  "Đại học Thủ Dầu Một (TDMU)",
  "Đại học Lạc Hồng (LHU)",
  "Đại học An Giang (AGU)",
  "Đại học Trà Vinh (TVU)",
  "Đại học Swinburne Việt Nam (Swinburne)",
  "Đại học Greenwich Việt Nam (Greenwich)",
  "Đại học Đông Á (UDA)",
  "Đại học Phú Xuân (PXU)",
  "Đại học Công nghệ Đông Á (EAUT)",
  "Học viện Ngân hàng (BA)",
  "Học viện Tài chính (AOF)",
  "Đại học Kinh tế - Kỹ thuật Công nghiệp (UNETI)",
  "Đại học Nam Cần Thơ (DNC)",
  "Đại học Bình Dương (BDU)",
  "Đại học Quốc tế Hồng Bàng (HIU)",
  "Đại học Phan Thiết (UPT)"
];

export default function EditProfileModal({ isOpen, onClose, currentUser, onSave }: EditProfileModalProps) {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [error, setError] = useState('');
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setSchool(currentUser.school);
      setSelectedAvatar(currentUser.avatar);
      setSoundEnabledState(getSoundEnabled());
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Vui lòng nhập họ và tên!');
      return;
    }
    if (!school.trim()) {
      setError('Vui lòng nhập hoặc chọn trường học!');
      return;
    }

    setSoundEnabled(soundEnabled);
    onSave(name.trim(), school.trim(), selectedAvatar);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl max-w-lg w-full shadow-2xl relative text-left overflow-y-auto max-h-[90vh] scrollbar-thin space-y-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer select-none"
            title="Đóng chỉnh sửa"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Header */}
          <div className="flex items-center space-x-3 border-b border-slate-805 pb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight uppercase">CHỈNH SỬA HỒ SƠ</h3>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Thay đổi thông tin học viên của bạn</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs py-2 px-3.5 rounded-lg flex items-center space-x-2 font-medium">
                <span className="shrink-0">•</span>
                <span>{error}</span>
              </div>
            )}

            {/* Avatar Select Section */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-extrabold text-[#818cf8] tracking-widest uppercase block">
                CHỌN ẢNH ĐẠI DIỆN:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = selectedAvatar === preset.url;
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => setSelectedAvatar(preset.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition active:scale-95 cursor-pointer flex items-center justify-center bg-slate-950 ${
                        isSelected ? 'border-indigo-500 shadow-md shadow-indigo-600/30' : 'border-slate-800 hover:border-slate-700'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-indigo-400 fill-slate-950/80" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-extrabold text-[#818cf8] tracking-widest uppercase block">
                Họ và Tên học viên:
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full bg-[#05070a]/90 hover:bg-[#07090d] focus:bg-[#07090d] border border-slate-800 focus:border-indigo-500 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-200"
                />
              </div>
            </div>

            {/* School Input with Auto-complete Dropdown */}
            <div className="space-y-1.5 text-left relative" id="school_selector_container">
              <label className="text-[10px] font-extrabold text-[#818cf8] tracking-widest uppercase block">
                Trường học của bạn:
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={school}
                  onFocus={() => setIsSchoolDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsSchoolDropdownOpen(false), 250)}
                  onChange={(e) => {
                    setSchool(e.target.value);
                    setIsSchoolDropdownOpen(true);
                  }}
                  placeholder="Nhập hoặc tìm kiếm trường đại học..."
                  className="w-full bg-[#05070a]/90 hover:bg-[#07090d] focus:bg-[#07090d] border border-slate-800 focus:border-indigo-500 pl-10 pr-9 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-200"
                />
                {school && (
                  <button
                    type="button"
                    onClick={() => {
                      setSchool('');
                      setIsSchoolDropdownOpen(true);
                    }}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-white transition cursor-pointer"
                    title="Xóa chữ"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown List */}
              <AnimatePresence>
                {isSchoolDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-[70] p-1.5 scrollbar-thin divide-y divide-slate-900/60"
                  >
                    {(() => {
                      const searchTerm = school.trim().toLowerCase();
                      const filtered = ALL_VIETNAM_IT_SCHOOLS.filter(s => {
                        if (!searchTerm) return true;
                        return s.toLowerCase().includes(searchTerm);
                      });

                      if (filtered.length > 0) {
                        return filtered.map((item) => {
                          const isSelected = school.trim().toLowerCase() === item.toLowerCase();
                          return (
                            <div
                              key={item}
                              onMouseDown={() => {
                                setSchool(item);
                                setIsSchoolDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 text-xs rounded-lg transition cursor-pointer select-none flex items-center justify-between ${
                                isSelected 
                                  ? 'bg-indigo-600/15 text-indigo-300 font-bold' 
                                  : 'text-gray-300 hover:bg-slate-900 hover:text-white'
                              }`}
                            >
                              <span className="truncate">{item}</span>
                              {isSelected && <span className="text-[9px] bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-400 font-extrabold uppercase shrink-0">Đang chọn</span>}
                            </div>
                          );
                        });
                      } else {
                        return (
                          <div className="p-3 text-center text-xs text-gray-500 font-medium">
                            Không tìm thấy trường nào phù hợp. Bạn vẫn có thể tiếp tục tự nhập tự do!
                          </div>
                        );
                      }
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Preset Buttons (Popular Colleges) */}
              <div className="pt-1.5">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1 font-bold">Gợi ý nhanh (IT Việt Nam):</span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SCHOOLS.map((sug) => {
                    const abbreviation = sug.split('(')[1]?.replace(')', '') || sug;
                    const isSelected = school === sug || school.includes(abbreviation);
                    return (
                      <button
                        type="button"
                        key={sug}
                        onClick={() => {
                          setSchool(sug);
                          setIsSchoolDropdownOpen(false);
                        }}
                        className={`text-[9.5px] font-bold px-2 py-1 rounded bg-slate-950 border transition select-none cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500/50 text-indigo-400 bg-indigo-950/20' 
                            : 'border-slate-850 text-gray-500 hover:text-gray-300 hover:bg-slate-900/60'
                        }`}
                      >
                        {abbreviation}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Audio Setting Section */}
            <div id="sound_settings_section" className="space-y-2 pt-2">
              <label className="text-[10px] font-extrabold text-[#818cf8] tracking-widest uppercase block">
                Cài đặt âm thanh:
              </label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center space-x-3 text-left">
                  <div className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 bg-slate-900'}`}>
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Âm thanh phản hồi (Audio Cues)</p>
                    <p className="text-[10px] text-gray-500">Phát âm thanh nhẹ nhàng khi hoàn thành bài tập hoặc đạt mục tiêu ngày.</p>
                  </div>
                </div>
                
                {/* Custom Interactive Toggle Switch */}
                <button
                  type="button"
                  id="sound_toggle_switch"
                  onClick={() => {
                    const nextVal = !soundEnabled;
                    setSoundEnabledState(nextVal);
                    if (nextVal) {
                      // Momentarily save setting to play the preview chord
                      localStorage.setItem('algolearn_sound_enabled', 'true');
                      playAudioCue('success');
                    } else {
                      localStorage.setItem('algolearn_sound_enabled', 'false');
                    }
                  }}
                  className={`w-10 h-6 shrink-0 rounded-full transition-colors relative cursor-pointer outline-none focus:ring-1 focus:ring-indigo-500 ${
                    soundEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}
                  aria-label="Toggle Audio Cues"
                >
                  <span
                    className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ${
                      soundEnabled ? 'transform translate-x-4' : ''
                    }`}
                  />
                </button>
              </div>
              {soundEnabled && (
                <button
                  type="button"
                  id="preview_victory_jingle_btn"
                  onClick={() => {
                    playAudioCue('goal');
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-indigo-950/10 hover:bg-indigo-950/20 border border-indigo-500/20 hover:border-indigo-500/40 text-[11px] font-bold text-indigo-300 hover:text-indigo-200 transition duration-200 cursor-pointer select-none active:scale-95 mt-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Nghe thử Nhạc chiến thắng (Victory Jingle) 🏆</span>
                </button>
              )}
            </div>

            <div className="border-t border-slate-805 pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-bold text-gray-400 hover:text-white bg-slate-805/40 hover:bg-slate-800 rounded-xl transition cursor-pointer active:scale-95 select-none text-center"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-indigo-650 hover:bg-indigo-600 rounded-xl shadow-lg shadow-indigo-950/40 transition duration-200 cursor-pointer active:scale-95 select-none text-center"
              >
                Lưu hồ sơ
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
