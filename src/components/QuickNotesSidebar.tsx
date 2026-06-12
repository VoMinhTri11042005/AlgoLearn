import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Plus, Trash2, Search, Code, Copy, Check, FileText, 
  ChevronRight, Edit3, Save, Compass, Sparkles, AlertCircle, BookOpen, Clock 
} from 'lucide-react';
import { QuickNote } from '../types';

interface QuickNotesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'general', label: 'Ý tưởng chung', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20' },
  { value: 'algorithm', label: 'Giải thuật', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25 hover:bg-indigo-500/20' },
  { value: 'complexity', label: 'Độ phức tạp', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25 hover:bg-amber-500/20' },
  { value: 'snippet', label: 'Đoạn mã', color: 'bg-sky-500/15 text-sky-400 border-sky-500/25 hover:bg-sky-500/20' }
] as const;

export default function QuickNotesSidebar({ isOpen, onClose }: QuickNotesSidebarProps) {
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Editing / Creation mode states
  const [activeNote, setActiveNote] = useState<QuickNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState<QuickNote['category']>('general');

  // Copy indicator state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initialize and load default notes if local storage is empty
  useEffect(() => {
    try {
      const saved = localStorage.getItem('algolearn_quick_notes');
      if (saved) {
        setNotes(JSON.parse(saved));
      } else {
        const defaultNotes: QuickNote[] = [
          {
            id: 'default-1',
            title: '💡 Hướng dẫn sử dụng Ghi Chú Nhanh',
            content: 'Chào mừng bạn đến với sổ tay AlgoLearn! Tại đây, bạn có thể ghi chép nhanh các ý tưởng thuật toán, ghi chú Big O hoặc lưu các snippet cốt lõi ngay khi đang chạy IDE hay đấu trí 1v1.\n\n• Nhấp vào nút "Thêm ghi chú mới" bên dưới để bắt đầu.\n• Dùng thanh tìm kiếm và bộ lọc để chia phân loại ghi chú dễ dàng.\n• Nhấp chọn từng ghi chú để đọc chi tiết hoặc copy nhanh đoạn mã của nó.',
            category: 'general',
            updatedAt: new Date().toLocaleString('vi-VN')
          },
          {
            id: 'default-2',
            title: '⚡ Mã mẫu phân hoạch Lomuto (Quick Sort)',
            content: 'Lomuto Partition chọn phần tử cuối làm Pivot, quét qua mảng từ trái sang phải, dồn các phần tử nhỏ hơn Pivot về đầu mảng.',
            category: 'algorithm',
            code: 'int partition(int arr[], int low, int high) {\n    int pivot = arr[high];\n    int i = (low - 1);\n    for (int j = low; j < high; j++) {\n        if (arr[j] < pivot) {\n            i++;\n            swap(&arr[i], &arr[j]);\n        }\n    }\n    swap(&arr[i + 1], &arr[high]);\n    return (i + 1);\n}',
            updatedAt: new Date().toLocaleString('vi-VN')
          },
          {
            id: 'default-3',
            title: '📊 Bảng tra cứu độ phức tạp Big-O',
            content: 'Ghi nhớ nhanh các mốc độ phức tạp phổ biến:\n• Binary Search: O(log n)\n• Quick Sort / Merge Sort: O(n log n)\n• Tìm cặp đôi trùng lặp (Nested Loops): O(n²)\n• Quy hoạch động (Knapsack): O(n*W)\n• Sinh nhị phân / hoán vị: O(2ⁿ)',
            category: 'complexity',
            updatedAt: new Date().toLocaleString('vi-VN')
          }
        ];
        setNotes(defaultNotes);
        localStorage.setItem('algolearn_quick_notes', JSON.stringify(defaultNotes));
      }
    } catch (e) {
      console.error('Failed to load quick notes from localStorage:', e);
    }
  }, []);

  // Save notes helper
  const saveNotesToStorage = (updatedNotes: QuickNote[]) => {
    setNotes(updatedNotes);
    try {
      localStorage.setItem('algolearn_quick_notes', JSON.stringify(updatedNotes));
    } catch (e) {
      console.error('Failed to save quick notes to localStorage:', e);
    }
  };

  // Start creating new note
  const handleStartCreate = () => {
    setFormTitle('');
    setFormContent('');
    setFormCode('');
    setFormCategory('general');
    setIsEditing(false);
    setIsCreating(true);
    setActiveNote(null);
  };

  // Start editing existing note
  const handleStartEdit = (note: QuickNote) => {
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormCode(note.code || '');
    setFormCategory(note.category);
    setIsCreating(false);
    setIsEditing(true);
  };

  // Save changes (creates or updates)
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const timestamp = new Date().toLocaleString('vi-VN');

    if (isCreating) {
      const newNote: QuickNote = {
        id: `note-${Date.now()}`,
        title: formTitle.trim(),
        content: formContent.trim(),
        code: formCode.trim() || undefined,
        category: formCategory,
        updatedAt: timestamp
      };
      const updated = [newNote, ...notes];
      saveNotesToStorage(updated);
      setActiveNote(newNote);
      setIsCreating(false);
    } else if (isEditing && activeNote) {
      const updated = notes.map(n => {
        if (n.id === activeNote.id) {
          return {
            ...n,
            title: formTitle.trim(),
            content: formContent.trim(),
            code: formCode.trim() || undefined,
            category: formCategory,
            updatedAt: timestamp
          };
        }
        return n;
      });
      saveNotesToStorage(updated);
      
      const updatedActive = updated.find(n => n.id === activeNote.id) || null;
      setActiveNote(updatedActive);
      setIsEditing(false);
    }
  };

  // Delete note
  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa ghi chú này không?')) return;

    const updated = notes.filter(n => n.id !== id);
    saveNotesToStorage(updated);
    
    if (activeNote?.id === id) {
      setActiveNote(null);
      setIsEditing(false);
    }
  };

  // Copy code utility
  const handleCopyCode = (id: string, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Hot templates generator
  const handleAddTemplate = (type: 'complexity' | 'hashmap' | 'recursion') => {
    const timestamp = new Date().toLocaleString('vi-VN');
    let template: QuickNote;

    if (type === 'complexity') {
      template = {
        id: `note-${Date.now()}`,
        title: '📈 Quy tắc tối ưu và phân tích Big-O',
        content: 'Khi gặp lỗi "Time Limit Exceeded" (TLE) trên AlgoLearn, hãy áp dụng:\n1. N <= 10⁵ -> Thuật toán cần từ O(N) hoặc O(N log N). Tránh vòng lặp lồng n².\n2. N <= 20 -> O(2ᴺ) Brute force sinh nhị phân, quay lui backtracking là khả thi.\n3. Hãy tối ưu bằng cấu trúc dữ liệu thích hợp (Map, Set, Heap) để đưa từ O(N) về O(1) hoặc O(log N).',
        category: 'complexity',
        updatedAt: timestamp
      };
    } else if (type === 'hashmap') {
      template = {
        id: `note-${Date.now()}-2`,
        title: '🔑 Kỹ thuật Dùng Map / Set Tối ưu',
        content: 'Thay vì duyệt lồng O(N²) để kiểm tra phần tử trùng hoặc tìm cặp có tổng bằng S (Two Sum), ta có thể đẩy vào Unordered Set / Map để dò trạng thái chỉ với O(N) thời gian.',
        code: '// Tìm cặp có tổng bằng target\nunordered_map<int, int> seen;\nfor (int i = 0; i < nums.size(); i++) {\n    int diff = target - nums[i];\n    if (seen.count(diff)) {\n        return {seen[diff], i};\n    }\n    seen[nums[i]] = i;\n}',
        category: 'algorithm',
        updatedAt: timestamp
      };
    } else {
      template = {
        id: `note-${Date.now()}-3`,
        title: '🎯 Mô hình đệ quy cơ bản (Backtracking)',
        content: 'Cấu trúc giải thuật quay lui đệ quy tìm kiếm toàn bộ không gian nghiệm của bài toán.',
        category: 'algorithm',
        code: 'void backtrack(int k, State& current_state) {\n    if (is_solution(k, current_state)) {\n        process_solution(current_state);\n        return;\n    }\n    for (auto choice : candidates) {\n        if (is_valid(choice, current_state)) {\n            make_move(choice, current_state);\n            backtrack(k + 1, current_state);\n            undo_move(choice, current_state); // Trả lại trạng thái cũ\n        }\n    }\n}',
        updatedAt: timestamp
      };
    }

    const updated = [template, ...notes];
    saveNotesToStorage(updated);
    setActiveNote(template);
    setIsCreating(false);
    setIsEditing(false);
  };

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (n.code && n.code.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop over current views */}
          <div 
            id="quick_notes_backdrop"
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 transition-opacity"
            onClick={onClose}
          />

          {/* Sliding notes drawer */}
          <motion.div
            id="quick_notes_drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#0a0d14] border-l border-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.85)] z-50 flex flex-col font-sans text-gray-200 overflow-hidden"
          >
            {/* Header section with fancy glow line */}
            <div className="relative px-6 py-4 border-b border-slate-900 bg-[#07090e] shrink-0 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-wider uppercase">Sổ Tay Ghi Chú Nhanh</h3>
                  <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">AlgoLearn Notebook • Lưu trữ cục bộ</p>
                </div>
              </div>

              <button 
                id="close_quiz_notes_btn"
                onClick={onClose}
                className="p-1.5 rounded-lg border border-slate-800 text-gray-400 hover:text-white hover:bg-slate-900 hover:border-slate-700 transition cursor-pointer"
                aria-label="Đóng sổ tay"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inner view body */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Note creator / editor OR listing of notes */}
              {isCreating || isEditing ? (
                /* Note Form Editor Component */
                <form id="quick_note_editor_form" onSubmit={handleSaveNote} className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto scrollbar-thin">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center space-x-1.5 pb-1">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                      <span>{isCreating ? 'Tạo mới ghi chú' : 'Hiệu chỉnh ghi chú'}</span>
                    </span>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setIsEditing(false);
                        if (isEditing) {
                          // restore activeNote details
                        }
                      }}
                      className="text-[10px] py-1 px-2.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 font-bold transition text-gray-400 hover:text-white"
                    >
                      Hủy bỏ
                    </button>
                  </div>

                  {/* Note Title Input */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Tiêu đề ghi chú *</label>
                    <input 
                      type="text"
                      id="note_input_title"
                      required
                      placeholder="e.g. Mẹo khử đệ quy cho cây nhị phân, Cách tính Big O..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-[#0d111a] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 text-xs text-white font-medium placeholder-gray-600 outline-none transition"
                    />
                  </div>

                  {/* Note Category Selection */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Phân loại ghi chú</label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setFormCategory(cat.value)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all select-none ${
                            formCategory === cat.value 
                              ? 'bg-indigo-650 border-indigo-500 text-white shadow-[0_4px_12px_rgba(79,70,229,0.2)]'
                              : 'bg-[#0d111a] border-slate-850 text-gray-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="capitalize">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Note text-area body */}
                  <div className="space-y-1 text-left flex-1 flex flex-col">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Nội dung ghi nhớ *</label>
                    <textarea 
                      placeholder="Ghi lại các ý chính giải thuật hoặc lưu ý độ phức tạp của bạn tại đây..."
                      required
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="w-full flex-1 min-h-[140px] bg-[#0d111a] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-xs text-gray-200 placeholder-gray-650 outline-none transition resize-none font-sans leading-relaxed"
                    />
                  </div>

                  {/* Code snippet field */}
                  <div className="space-y-1 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 flex items-center space-x-1.5">
                        <Code className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Snippet code minh họa (Tùy chọn)</span>
                      </label>
                      {formCode && (
                        <span className="text-[9px] text-gray-500 font-mono">Nhập mã nguồn mẫu</span>
                      )}
                    </div>
                    <textarea 
                      placeholder="// e.g. void bubbleSort() { ... }"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full h-32 bg-[#05070c] border border-slate-850 hover:border-slate-80
                      focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-xs text-indigo-200 font-mono placeholder-slate-700 outline-none transition resize-y leading-relaxed"
                    />
                  </div>

                  {/* Submit save button */}
                  <button
                    type="submit"
                    id="save_notebook_btn"
                    className="w-full bg-indigo-650 hover:bg-indigo-550 active:scale-[0.98] py-3 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/15 flex items-center justify-center space-x-2 cursor-pointer transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu ghi chú của tôi</span>
                  </button>
                </form>
              ) : activeNote ? (
                /* Note Detail Viewer Pane */
                <div id="quick_note_viewer_pane" className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto scrollbar-thin text-left">
                  
                  {/* Back button to list */}
                  <div className="flex items-center justify-between pb-1 border-b border-slate-900/60">
                    <button 
                      onClick={() => setActiveNote(null)}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 transform rotate-180" />
                      <span>Bộ sưu tập sổ tay</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleStartEdit(activeNote)}
                        className="p-1.5 rounded-lg border border-slate-800 text-gray-400 hover:text-indigo-400 hover:bg-slate-900 hover:border-indigo-500/20 transition cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteNote(activeNote.id)}
                        className="p-1.5 rounded-lg border border-slate-800 text-gray-400 hover:text-rose-400 hover:bg-slate-900 hover:border-rose-500/25 transition cursor-pointer"
                        title="Xóa ghi chú này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Category badge */}
                  <div>
                    {CATEGORIES.filter(c => c.value === activeNote.category).map(c => (
                      <span key={c.value} className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest border rounded-md ${c.color.split(' ')[0]} ${c.color.split(' ')[1]} ${c.color.split(' ')[2]}`}>
                        {c.label}
                      </span>
                    ))}
                  </div>

                  {/* Note Title */}
                  <h1 className="text-sm font-black text-white hover:text-indigo-200 transition tracking-wide leading-snug">
                    {activeNote.title}
                  </h1>

                  {/* Timestamp detail */}
                  <div className="flex items-center space-x-1 text-[10px] text-gray-500 font-medium">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span>Lần đầu thay đổi cuối: {activeNote.updatedAt}</span>
                  </div>

                  {/* Note Body Text */}
                  <div className="bg-[#0c0f16]/90 border border-slate-900/40 p-4 rounded-xl text-xs text-gray-300 font-sans leading-relaxed whitespace-pre-wrap select-text">
                    {activeNote.content}
                  </div>

                  {/* Note optional Code block */}
                  {activeNote.code && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-extrabold text-[#818cf8] uppercase tracking-widest flex items-center space-x-1">
                          <Code className="w-3.5 h-3.5" />
                          <span>Mã nguồn đính kèm</span>
                        </span>
                        
                        <button
                          onClick={(e) => handleCopyCode(activeNote.id, activeNote.code!, e)}
                          className={`text-[9px] font-bold border px-2 py-0.5 rounded transition flex items-center space-x-1 ${
                            copiedId === activeNote.id 
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                              : 'bg-slate-900 border-slate-800 text-gray-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {copiedId === activeNote.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Đã sao chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Sao Chép</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="w-full bg-[#05070b] border border-slate-900 rounded-xl px-4 py-3 text-xs text-emerald-400 font-mono overflow-x-auto select-all leading-relaxed whitespace-pre scrollbar-thin">
                        <code>{activeNote.code}</code>
                      </pre>
                    </div>
                  )}

                </div>
              ) : (
                /* Note List Explorer Drawer Pane */
                <div id="quick_note_explorer_pane" className="flex-1 flex flex-col overflow-hidden">
                  
                  {/* Search and Category Filter Widget */}
                  <div className="p-4 border-b border-slate-900/60 bg-[#07090d] shrink-0 space-y-3">
                    {/* Search notes box */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        placeholder="Tìm kiếm ý tưởng, bài học, đoạn code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0b0e15] border border-slate-850 hover:border-slate-80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 rounded-xl pl-9.5 pr-4 py-2 text-xs placeholder-gray-600 outline-none transition"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-2.5 text-xs font-bold text-gray-500 hover:text-white"
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    {/* Horizontal scrollable categories select filter */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1 rounded-full text-[10px] shrink-0 font-extrabold uppercase tracking-wide border transition-all ${
                          selectedCategory === 'all' 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' 
                            : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        Tất cả ({notes.length})
                      </button>
                      {CATEGORIES.map(cat => {
                        const count = notes.filter(n => n.category === cat.value).length;
                        return (
                          <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            className={`px-2.5 py-1 rounded-full text-[10px] shrink-0 font-extrabold uppercase tracking-wide border transition-all ${
                              selectedCategory === cat.value 
                                ? 'bg-indigo-650 border-indigo-500 text-white' 
                                : 'bg-slate-950/40 border-slate-850 text-slate-500 hover:text-white'
                            }`}
                          >
                            {cat.label} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* List collection area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin text-left">
                    {filteredNotes.length === 0 ? (
                      <div className="py-10 text-center px-4 space-y-3">
                        <Compass className="w-8 h-8 text-slate-650 mx-auto animate-spin-slow" />
                        <p className="text-xs text-gray-500 italic">Không tìm thấy ghi chú phù hợp.</p>
                        
                        {/* Auto templates helper when search returns empty or notes are deleted */}
                        <div className="pt-4 border-t border-slate-900/60 max-w-xs mx-auto space-y-1.5 bg-[#0b0e15] p-3 rounded-xl">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">⚡ Sử dụng mẫu nhanh</p>
                          <div className="flex flex-col space-y-1.5 text-left">
                            <button 
                              type="button" 
                              onClick={() => handleAddTemplate('complexity')}
                              className="text-[10px] bg-slate-900 border border-slate-800 hover:border-indigo-500/20 py-1.5 px-2 rounded font-bold transition flex items-center justify-between"
                            >
                              <span>📈 Meo Big-O & Tối ưu bài khó</span>
                              <Plus className="w-3 h-3 text-indigo-400" />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleAddTemplate('hashmap')}
                              className="text-[10px] bg-slate-900 border border-slate-800 hover:border-indigo-500/20 py-1.5 px-2 rounded font-bold transition flex items-center justify-between"
                            >
                              <span>🔑 Kỹ thuật Unordered Map O(N)</span>
                              <Plus className="w-3 h-3 text-pink-400" />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleAddTemplate('recursion')}
                              className="text-[10px] bg-slate-900 border border-slate-800 hover:border-indigo-500/20 py-1.5 px-2 rounded font-bold transition flex items-center justify-between"
                            >
                              <span>🎯 Tìm kiếm đệ quy Backtracking</span>
                              <Plus className="w-3 h-3 text-amber-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      filteredNotes.map(n => (
                        <div
                          key={n.id}
                          onClick={() => setActiveNote(n)}
                          className="group border border-slate-900 hover:border-slate-800 bg-[#0c0f16]/95 hover:bg-[#10141e]/90 p-4 rounded-xl cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-1 mb-1.5">
                            <h4 className="text-xs font-black text-white group-hover:text-indigo-400 transition tracking-wide line-clamp-1 leading-snug">
                              {n.title}
                            </h4>

                            <button
                              onClick={(e) => handleDeleteNote(n.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-450 hover:bg-slate-900 rounded transition"
                              title="Xóa nhanh"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-[11px] text-gray-400 leading-normal line-clamp-2 select-none mb-3">
                            {n.content}
                          </p>

                          <div className="flex items-center justify-between">
                            {/* Inner categories style */}
                            {CATEGORIES.filter(c => c.value === n.category).map(c => (
                              <span key={c.value} className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border shrink-0 ${c.color.split(' ')[0]} ${c.color.split(' ')[1]} ${c.color.split(' ')[2]}`}>
                                {c.label}
                              </span>
                            ))}

                            <div className="flex items-center space-x-1.5 text-[9px] text-[#4d5668] font-bold">
                              <span>{n.updatedAt.split(' ')[1] || n.updatedAt}</span>
                            </div>
                          </div>

                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer toolbar inside notes list list */}
                  <div className="p-4 border-t border-slate-900 bg-[#07090d] shrink-0 sm:flex sm:items-center sm:gap-3">
                    <button
                      type="button"
                      id="create_new_note_btn"
                      onClick={handleStartCreate}
                      className="w-full bg-indigo-650 hover:bg-indigo-550 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-500/10 flex items-center justify-center space-x-2 transition"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>Thêm ghi chú mới</span>
                    </button>
                  </div>

                </div>
              )}

            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
