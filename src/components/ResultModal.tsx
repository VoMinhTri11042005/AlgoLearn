import React from 'react';
import { motion } from 'motion/react';
import { Trophy, RefreshCw, LogOut, Code, AlertTriangle, Sparkles, CheckCircle2, Star, Brain, ArrowRight } from 'lucide-react';

interface ResultModalProps {
  type: 'victory' | 'defeat';
  onClose: () => void;
  onNavigateHome: () => void;
  onNavigateTheory: () => void;
}

export default function ResultModal({ type, onClose, onNavigateHome, onNavigateTheory }: ResultModalProps) {
  const isVictory = type === 'victory';

  return (
    <div id="result_screen_modal" className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`max-w-xl w-full rounded-3xl p-8 relative max-h-[85vh] sm:max-h-[90vh] overflow-y-auto scrollbar-thin text-left shimmer-border ${
          isVictory 
            ? 'glass-panel border-violet-500/20' 
            : 'glass-panel border-rose-500/15'
        }`}
      >
        {/* Shiny abstract visual background patterns */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 -z-10 ${
          isVictory ? 'bg-indigo-500' : 'bg-cyan-500'
        }`}></div>

        {/* Victory Confetti or Defeat Warning Icon Badge */}
        <div className="flex flex-col items-center text-center">
          {isVictory ? (
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg relative"
            >
              <Trophy className="w-8 h-8 text-slate-950" />
              <span className="absolute -top-1 -right-1 bg-white text-indigo-600 rounded-full p-0.5 shadow">
                <Sparkles className="w-3 h-3" />
              </span>
            </motion.div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-505/30 text-rose-400 flex items-center justify-center shadow-md">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
          )}

          <h2 className={`text-3xl font-extrabold tracking-tight mt-6 ${
            isVictory ? 'gradient-text-gold' : 'text-rose-300'
          }`}>
            {isVictory ? 'VICTORY!' : 'DEFEAT'}
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
            {isVictory ? 'CHIẾN THẮNG THÍCH ĐÁNG' : 'THẤT BẠI CẬN KỀ'}
          </p>
        </div>

        {/* Middle Match Summary Metrics info */}
        <div className="bg-slate-950/80 border border-slate-900/60 rounded-xl p-5 mt-6 space-y-4">
          <p className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">BÁO CÁO TỔNG QUAN SKIRMISH</p>
          
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <p className="text-gray-500">WINNER:</p>
              <p className={`font-bold text-sm ${isVictory ? 'text-white' : 'text-slate-400'}`}>
                {isVictory ? 'Minh Hoàng (Bạn)' : 'CodeMaster_99'}
              </p>
              <p className="text-[10px] text-gray-500">Testcases: 5/5 passed</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">LOSER:</p>
              <p className={`font-bold text-sm ${!isVictory ? 'text-white' : 'text-slate-400'}`}>
                {!isVictory ? 'Minh Hoàng (Bạn)' : 'ProCoder_Felix'}
              </p>
              <p className="text-[10px] text-gray-500">Testcases: {isVictory ? '3/5' : '4/5'} passed</p>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">XP Nhận được:</span>
            <span className={`font-mono font-bold text-base ${isVictory ? 'text-amber-400' : 'text-[#3b82f6]'}`}>
              {isVictory ? '+500 XP' : '+150 XP (Cố gắng)'}
            </span>
          </div>

          {/* Interactive XP progress timeline gauge bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-gray-500">Level 8 Progress</span>
              <span className="text-slate-400">{isVictory ? '12,900 / 15,000 XP' : '12,550 / 15,000 XP'}</span>
            </div>
            <div className="w-full bg-[#111] border border-slate-900 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" 
                style={{ width: isVictory ? '86%' : '83.6%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* AI Tip card advice */}
        <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4 mt-4 text-left">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5 mb-1.5">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>ALGO AI COMPASS TIP:</span>
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            {isVictory 
              ? 'Tuyệt vời! Giải thuật đảo ngược cây nhị phân của bạn đã tối ưu tối đa về mặt bộ nhớ với O(1) Auxiliary Space. Hãy thử sức tiếp tục với Merge Sort nhé.'
              : 'Lời khuyên: Bạn bị chậm mất 45 giây vì gõ sai cú pháp gán đồng thời trong Python `root.left, root.right`. Hãy dùng Tăng Tốc (Syntax Assist) trong trận tới để tự động chỉnh lí nhé!'}
          </p>
        </div>

        {/* Controllers Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 mt-2">
          {isVictory ? (
            <button 
              onClick={onClose}
              className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer select-none transition flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-4 h-4 text-white" />
              <span>REMATCH</span>
            </button>
          ) : (
            <button 
              onClick={onClose}
              className="bg-cyan-650 hover:bg-cyan-600 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer select-none transition flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-4 h-4 text-white" />
              <span>REMATCH</span>
            </button>
          )}

          <button 
            onClick={() => {
              onClose();
              onNavigateTheory();
            }}
            className="bg-slate-90 p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs py-3.5 rounded-xl cursor-pointer transition flex items-center justify-center space-x-1"
          >
            <Code className="w-4 h-4" />
            <span>PRACTICE MORE</span>
          </button>

          <button 
            onClick={() => {
              onClose();
              onNavigateHome();
            }}
            className="bg-slate-90 p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs py-3.5 rounded-xl cursor-pointer transition flex items-center justify-center space-x-1"
          >
            <LogOut className="w-4 h-4" />
            <span>EXIT ARENA</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
}
