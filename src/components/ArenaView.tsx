import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Swords, ShieldAlert, Zap, Compass, Send, Key, Bug,
  Trophy, CheckCircle, HelpCircle, ChevronRight, AlertTriangle, Eye, EyeOff
} from 'lucide-react';

import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';

interface ArenaViewProps {
  onNavigate: (view: 'home' | 'theory' | 'ide' | 'arena' | 'leaderboard') => void;
  onOpenResult: (resultType: 'victory' | 'defeat') => void;
}

export default function ArenaView({ onNavigate, onOpenResult }: ArenaViewProps) {
  const [timeLeft, setTimeLeft] = useState(892); // 14 minutes 52 seconds
  const [solution, setSolution] = useState(`class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def invertTree(self, root: TreeNode) -> TreeNode:
        # Viết code xử lý đảo ngược cây nhị phân ở đây
        if root is None:
            return None
            
        # Thao tác hoán đổi đệ quy
        temp = root.left
        root.left = self.invertTree(root.right)
        root.right = self.invertTree(temp)
        
        return root`);

  const [opponentTestcaseProgress, setOpponentTestcaseProgress] = useState(2); // 2/5 tests passed
  const [activeSabotage, setActiveSabotage] = useState<string | null>(null);
  const [showAiHint, setShowAiHint] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [resultsLogs, setResultsLogs] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Tick Timer down
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Opponent trace: dynamically update opponent progress as time flies
  useEffect(() => {
    const opponentTimer = setInterval(() => {
      setOpponentTestcaseProgress(prev => {
        if (prev < 4) return prev + 1;
        return prev; // stays at 4 until player submits
      });
    }, 15000);
    return () => clearInterval(opponentTimer);
  }, []);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleTriggerPowerUp = (type: 'fog' | 'auto' | 'ai') => {
    if (type === 'fog') {
      setActiveSabotage('sương_mù');
      setTimeout(() => {
        setActiveSabotage(null);
      }, 7000);
    } else if (type === 'ai') {
      setShowAiHint(true);
    } else if (type === 'auto') {
      setSolution(prev => prev.replace('# Viết code xử lý đảo ngược cây nhị phân ở đây', '# Đã tối ưu hóa thuật toán đảo ngược thành công!'));
    }
  };

  const handleSubmit = () => {
    setIsEvaluating(true);
    setResultsLogs([
      "⚙️ Kết nối máy chủ chấm bài Sandbox Server...",
      "⚙️ Đang chạy thử nghiệm Testcase #1 (Cây nhị phân rỗng) -> PASSED",
      "⚙️ Đang chạy thử nghiệm Testcase #2 (Cây nhị phân 1 phần tử) -> PASSED",
      "⚙️ Đang chạy thử nghiệm Testcase #3 (Cây nhị phân hoàn chỉnh cấp 3) -> PASSED"
    ]);

    setTimeout(() => {
      setResultsLogs(prev => [
        ...prev,
        "⚙️ Đang chạy thử nghiệm Testcase #4 (Cây nhị phân lệch phải)...",
        "⚙️ Đang chạy thử nghiệm Testcase #5 (Cây có độ sâu lớn m=100) -> PASSED",
        "✔️ TẤT CẢ 5/5 TESTCASES ĐỀU KHỚP KẾT QUẢ ĐẦU RA!",
        "=================== THI ĐẤU HOÀN TẤT ==================="
      ]);
      setIsEvaluating(false);
      setHasSubmitted(true);

      // Transition to final result shortly
      // If we used speed boost or optimized, let's trigger VICTORY. Otherwise, if we took too long, maybe defeat? Let's give Victory as default or let the user choose!
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('algolearn_practice_completed'));
        onOpenResult('victory');
      }, 3000);
    }, 2000);
  };

  return (
    <div id="arena_layout" className="min-h-screen lg:h-[calc(100vh-4rem)] lg:overflow-hidden bg-[#07090d] text-gray-200 font-sans flex flex-col">
      
      {/* Competitors Header */}
      <div className="bg-[#0b0e14] border-b border-slate-900 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Player side */}
        <div className="flex items-center space-x-3 text-left">
          <img 
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80" 
            alt="Bạn" 
            className="w-10 h-10 rounded-full border-2 border-indigo-500 object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white">Minh Hoàng (Bạn)</span>
              <span className="bg-[#4f46e5]/20 text-indigo-300 border border-indigo-500/20 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">ỦY VIÊN</span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">My Code Status: 4/5 local cases passed</p>
          </div>
        </div>

        {/* Central Timer Match Badge */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2 bg-slate-950 px-4 py-1.5 rounded-full border border-slate-900 shadow-inner">
            <Swords className="w-4 h-4 text-rose-500 animate-pulse" />
            <span className="text-sm font-mono font-black text-rose-400 tracking-wider">THỜI GIAN CÒN LẠI</span>
            <span className="text-gray-500 font-mono">|</span>
            <span className="text-sm font-mono font-black text-white">{formatTime(timeLeft)}</span>
          </div>
          <span className="text-[9px] bg-indigo-505/10 border border-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full mt-1.5">
            Sân đấu: Invert a Binary Tree
          </span>
        </div>

        {/* Rival side */}
        <div className="flex items-center space-x-3 md:flex-row-reverse text-left md:text-right">
          <img 
            src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80" 
            alt="An Nguyễn" 
            className="w-10 h-10 rounded-full border-2 border-rose-500 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="md:mr-3">
            <div className="flex items-center md:justify-end space-x-2">
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">ĐỐI THỦ</span>
              <span className="font-extrabold text-white">An Nguyễn</span>
            </div>
            <p className="text-[10px] text-rose-400 font-mono">Đang chạy chấm bài: {opponentTestcaseProgress}/5 passed</p>
          </div>
        </div>
      </div>

      {/* Grid panels */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto lg:overflow-hidden">
        
        {/* Left column - Problem description */}
        <div className="lg:col-span-3 border-r border-slate-900/60 bg-[#06080b] p-6 text-left overflow-y-auto scrollbar-thin">
          <span className="text-[10px] font-extrabold tracking-widest text-indigo-400 block mb-1">MÔ TẢ BÀI TOÁN</span>
          <h2 className="text-xl font-bold text-white mb-4">Invert a Binary Tree</h2>
          
          <div className="space-y-4 text-xs md:text-sm text-gray-400 leading-relaxed">
            <p>
              Cho gốc (root) của một cây nhị phân, hãy <strong>đảo ngược (invert)</strong> cây đó và trả về nút gốc sau khi hoàn thành.
            </p>
            <p>
              Đảo ngược một cây nhị phân nghĩa là với mỗi nút trong cây, chúng ta hoán đổi toàn bộ nhánh con bên trái (left child) và nhánh con bên phải (right child) cho nhau.
            </p>

            {/* Simulated tree block walkthrough design */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Ví dụ minh họa:</span>
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-gray-500 block mb-1">INPUT TREE:</span>
                  <p className="text-white font-bold">    4</p>
                  <p className="text-white">   / \</p>
                  <p className="text-[#3b82f6]">  2   7</p>
                  <p className="text-gray-500"> / \ / \</p>
                  <p className="text-gray-400">1  3 6  9</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-emerald-400 block mb-1">OUTPUT TREE:</span>
                  <p className="text-white font-bold">    4</p>
                  <p className="text-white">   / \</p>
                  <p className="text-emerald-400">  7   2</p>
                  <p className="text-gray-500"> / \ / \</p>
                  <p className="text-gray-400">9  6 3  1</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 font-mono text-[11px] text-slate-500">
              <p>📌 Constraints (Ràng buộc):</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Số lượng nút trong cây ∈ [0, 100].</li>
                <li>Giá trị nút -100 &lt;= Node.val &lt;= 100.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Center column - Editor */}
        <div className="lg:col-span-6 flex flex-col border-r border-[#1a1f2c] bg-[#090b0e]">
          <div className="bg-[#05070a] px-4 py-2.5 border-b border-[#1a1f2c] flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">solution.py (Python 3)</span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleSubmit}
                disabled={isEvaluating}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-black text-xs px-4 py-1.5 rounded-lg active:scale-95 transition cursor-pointer select-none"
              >
                <span>{isEvaluating ? 'Evaluating...' : 'Nộp bài & Chấm'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Code Editor with VS Code custom colored highlighting */}
          <div className="flex-1 relative flex h-full min-h-0 overflow-y-auto bg-[#090b0e]">
            {/* Simulated Line numbers */}
            <div className="w-10 bg-[#07090d]/65 border-r border-[#1a1f2c]/50 text-right pr-2 select-none text-[11px] font-mono text-slate-500 pt-4 leading-[23px] font-medium text-left shrink-0">
              {Array.from({ length: Math.max(solution.split('\n').length, 1) }).map((_, i) => (
                <div key={i} className="h-[23px] flex items-center justify-end pr-1.5">{i + 1}</div>
              ))}
            </div>

            <div className="flex-1 min-w-0 min-h-full">
              <Editor
                value={solution}
                onValueChange={(code) => setSolution(code)}
                highlight={(code) => Prism.highlight(code, Prism.languages.python || Prism.languages.clike, 'python')}
                padding={16}
                textareaClassName="outline-none focus:outline-none border-none ring-0 focus:ring-0 selection:bg-slate-800"
                preClassName="focus:outline-none focus:ring-0 selection:bg-slate-800"
                disabled={isEvaluating}
                spellCheck={false}
                style={{
                  fontFamily: '"JetBrains Mono", "Courier New", Courier, monospace',
                  fontSize: '12px',
                  lineHeight: '23px',
                  minHeight: '100%',
                }}
                className="w-full h-full text-[#b4f9f8]"
              />
            </div>
          </div>

          {/* Evaluating Output log box */}
          {resultsLogs.length > 0 && (
            <div className="h-44 border-t border-slate-900 bg-slate-950 p-4 font-mono text-[11px] text-left overflow-y-auto space-y-1 scrollbar-thin">
              <p className="text-indigo-400 font-bold uppercase tracking-wider mb-2">CRITICAL SANDBOX RUNTIME REPORT:</p>
              {resultsLogs.map((log, idx) => (
                <p key={idx} className={log.startsWith('✔️') ? 'text-emerald-400 font-bold' : 'text-gray-400'}>
                  {log}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Right column - Rival progress & Powerups */}
        <div className="lg:col-span-3 bg-[#06080b] p-6 text-left flex flex-col justify-between overflow-y-auto scrollbar-thin">
          
          {/* Opponent live progress blur view */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
              <span className="text-[10px] font-extrabold tracking-widest text-[#ef4444] uppercase">ĐỐI THỦ ĐANG GÕ CODE...</span>
              <span className="text-xs bg-[#ef4444]/10 border border-[#ef4444]/20 text-rose-400 px-2 py-0.5 rounded font-mono">Live</span>
            </div>

            {/* Blurry Code Editor Box representing the real opponent active changes */}
            <div className="bg-slate-950 rounded-xl p-4 mt-2 overflow-hidden relative border border-slate-900">
              {activeSabotage === 'sương_mù' ? (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-center z-10 px-4">
                  <ShieldAlert className="w-6 h-6 text-indigo-400 animate-spin mb-1" />
                  <p className="text-xs font-bold text-white uppercase tracking-wider">⚡ MÀN SƯƠNG MÙ ACTIVATED!</p>
                  <p className="text-[10px] text-gray-500 leading-normal">Màn hình đối thủ bị che phủ trong 7 giây.</p>
                </div>
              ) : null}

              <div className="blur-[3px] select-none text-[10px] font-mono leading-relaxed text-indigo-300">
                <p>def invert_tree(root):</p>
                <p className="pl-4">if not root: return None</p>
                <p className="pl-4 text-emerald-300">left_node = invert_tree(root.left)</p>
                <p className="pl-4 text-pink-300">right_node = invert_tree(root.right)</p>
                <p className="pl-4">root.left, root.right = right_node, left_node</p>
                <p className="pl-4">return root</p>
              </div>

              {/* Progress meter of testcases */}
              <div className="border-t border-slate-900/60 pt-3 mt-4 text-[10px]">
                <div className="flex justify-between font-mono mb-1">
                  <span className="text-gray-500">Testcase progress:</span>
                  <span className="text-rose-400 font-bold">{opponentTestcaseProgress}/5 passed</span>
                </div>
                <div className="w-full bg-[#12141c] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-rose-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(opponentTestcaseProgress / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Gamified Powerups and sabotages */}
          <div className="border-t border-slate-900/60 pt-6 mt-6 space-y-4">
            <span className="text-[10px] font-extrabold tracking-widest text-[#4f46e5] uppercase">SỬ DỤNG POWER-UPS / SABOTAGES</span>
            
            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => handleTriggerPowerUp('fog')}
                disabled={activeSabotage !== null}
                className="bg-indigo-650 hover:bg-indigo-600 disabled:opacity-40 text-white font-bold text-xs p-3.5 rounded-xl cursor-pointer select-none text-left flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-white" />
                  <div>
                    <p className="font-bold">Màn Sương Mù (Sabotage)</p>
                    <p className="text-[9px] text-indigo-300 leading-normal font-normal">Làm mờ code của đối phương trong 7 giây.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-300" />
              </button>

              <button
                onClick={() => handleTriggerPowerUp('auto')}
                className="bg-emerald-650 hover:bg-emerald-600 text-white font-bold text-xs p-3.5 rounded-xl cursor-pointer select-none text-left flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-white" />
                  <div>
                    <p className="font-bold">Tăng tốc (Syntax Assist)</p>
                    <p className="text-[9px] text-emerald-300 leading-normal font-normal">Sửa định dạng thụt lề Python siêu tốc tự động.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-300" />
              </button>

              <button
                onClick={() => handleTriggerPowerUp('ai')}
                className="bg-amber-650 hover:bg-amber-600 text-white font-bold text-xs p-3.5 rounded-xl cursor-pointer select-none text-left flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-white" />
                  <div>
                    <p className="font-bold">Cứu viện AI (Clue)</p>
                    <p className="text-[9px] text-amber-300 leading-normal font-normal">Algo AI gợi ý phác thảo định hướng thuật toán.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>

            {/* AI Clue Text box animation */}
            <AnimatePresence>
              {showAiHint && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mt-4 text-[11px] text-gray-400 relative"
                >
                  <p className="font-bold text-amber-400 mb-1 flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-amber-400" />
                    <span>LỜI KHUYÊN TỪ ALGO AI:</span>
                  </p>
                  <p className="leading-relaxed">
                    Đảo ngược cây nhị phân thực chất là duyệt qua từng Node (DFS/BFS), sau đó thực hiện hoán đổi nút con trái `node.left` và nút con phải `node.right` đổi chỗ cho nhau.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
