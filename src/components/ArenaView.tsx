import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Swords, ShieldAlert, Zap, Compass, Send, Key, Bug,
  Trophy, CheckCircle, HelpCircle, ChevronRight, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { playAudioCue } from '../utils/audio';

import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';

interface ArenaViewProps {
  onNavigate: (view: 'home' | 'theory' | 'ide' | 'arena' | 'leaderboard') => void;
  onOpenResult: (resultType: 'victory' | 'defeat', data?: any) => void;
  currentUser: any; 
  pendingRoomCode?: string | null;
  setPendingRoomCode?: (code: string | null) => void;
}

export default function ArenaView({ onNavigate, onOpenResult, currentUser, pendingRoomCode, setPendingRoomCode }: ArenaViewProps) {
  const [matchId, setMatchId] = useState<string | null>(null);
  const [queueState, setQueueState] = useState<'lobby' | 'queued' | 'running' | 'error'>('lobby');
  const [opponent, setOpponent] = useState<{ id: string; name: string; school: string; avatar: string } | null>(null);
  const [arenaElo, setArenaElo] = useState<{ player?: number; opponent?: number }>({});

  const [roomCode, setRoomCode] = useState<string>('');
  const [inputRoomCode, setInputRoomCode] = useState<string>('');
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [activeSabotage, setActiveSabotage] = useState<'sương_mù' | null>(null);
  const [incomingSabotage, setIncomingSabotage] = useState<'sương_mù' | null>(null);

  const currentUserId = currentUser?.id || null;


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

  const [opponentTestcaseProgress, setOpponentTestcaseProgress] = useState(0);
  const hasDispatchedPracticeRef = useRef(false);
  const [showAiHint, setShowAiHint] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const hasSubmittedRef = useRef(false);
  const [resultsLogs, setResultsLogs] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Timer synced from server polling
  useEffect(() => {
    if (queueState !== 'running') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [queueState]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleTriggerPowerUp = async (type: 'fog' | 'auto' | 'ai') => {
    playAudioCue('swap');
    if (type === 'fog') {
      setActiveSabotage('sương_mù');
      console.log('TRIGGERING FOG SABOTAGE. matchId =', matchId);
      if (matchId) {
        console.log('SENDING FETCH...');
        fetch(`/api/arena/match/${matchId}/sabotage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'sương_mù' }),
          credentials: 'include'
        }).then(async r => {
          console.log('FETCH RESPONSE:', r.status, await r.text());
        }).catch((err) => {
          console.error('FETCH FAILED:', err);
        });
      } else {
        console.warn('CANNOT SEND SABOTAGE: matchId is null!');
      }
      setTimeout(() => {
        setActiveSabotage(null);
      }, 7000);
    } else if (type === 'ai') {
      setShowAiHint(true);
    } else if (type === 'auto') {
      setSolution(prev => prev.replace('# Viết code xử lý đảo ngược cây nhị phân ở đây', '# Đã tối ưu hóa thuật toán đảo ngược thành công!'));
    }
  };

  const joinQueue = async () => {
    setHasSubmitted(false);
    hasSubmittedRef.current = false;
    if (!currentUserId) {
      setQueueState('error');
      setJoinError('Bạn cần đăng nhập để vào đấu trường 1v1.');
      return;
    }
    setIsJoining(true);
    setJoinError(null);
    try {
      const r = await fetch('/api/arena/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
        credentials: 'include',
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || 'Join queue failed');
      setMatchId(data.matchId || null);
      setQueueState(data.matchId || data.status === 'already-in-match' ? 'running' : 'queued');
    } catch (e: any) {
      setQueueState('error');
      setJoinError(e?.message || 'Không thể vào queue');
    } finally {
      setIsJoining(false);
    }
  };

  useEffect(() => {
    // Join pending room if any
    if (pendingRoomCode) {
      joinRoom(pendingRoomCode);
      if (setPendingRoomCode) setPendingRoomCode(null);
    }
    
    return () => {
      if (!currentUserId || queueState === 'lobby') return;
      fetch('/api/arena/queue/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
        credentials: 'include',
      }).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRoomCode]);

  const createRoom = async () => {
    try {
      setHasSubmitted(false);
      hasSubmittedRef.current = false;
      const res = await fetch('/api/arena/room/create', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.status === 'created') {
        setRoomCode(data.roomCode);
        setMatchId(data.matchId);
        setQueueState('queued');
      }
    } catch(e) {}
  };

  const joinRoom = async (code: string) => {
    if (!code) return;
    try {
      setHasSubmitted(false);
      hasSubmittedRef.current = false;
      const r = await fetch('/api/arena/room/join', { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ roomCode: code }),
        credentials: 'include' 
      });
      const data = await r.json();
      if (data.status === 'joined') {
        setMatchId(data.matchId);
        setQueueState('running');
      } else {
        setJoinError(data.error);
        setQueueState('error');
      }
    } catch(e) {}
  };

  const inviteUser = async (targetUserId: string) => {
    if (!roomCode) return;
    try {
      await fetch('/api/arena/room/invite', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ targetUserId, roomCode }),
        credentials: 'include'
      });
      alert('Đã gửi lời mời thành công!');
    } catch(e) {}
  };

  useEffect(() => {
    if (queueState !== 'lobby' && !roomCode) return;
    let alive = true;
    const fetchOnline = async () => {
      try {
        const r = await fetch('/api/presence/online', { credentials: 'include' });
        const data = await r.json();
        if (alive && data.users) {
          setOnlineUsers(data.users);
        }
      } catch (e) {}
    };
    fetchOnline();
    const interval = setInterval(fetchOnline, 5000);
    return () => { alive = false; clearInterval(interval); };
  }, [queueState, roomCode]);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const url = matchId ? `/api/arena/match/${matchId}` : '/api/arena/status';
        const r = await fetch(url, { method: 'GET', credentials: 'include' });
        if (!alive) return;
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || 'poll failed');

        if (data.matchId && data.matchId !== matchId) {
          setMatchId(data.matchId);
          setHasSubmitted(false);
          hasSubmittedRef.current = false;
        }

        if (data.status === 'running') {
          setQueueState('running');
          if (typeof data.timeLeftSeconds === 'number') {
            setTimeLeft(data.timeLeftSeconds);
          }
          if (data.elo) {
            setArenaElo(data.elo);
          }
          if (data.opponent) {
            setOpponent({
              id: data.opponent.id,
              name: data.opponent.name,
              school: data.opponent.school,
              avatar: data.opponent.avatar,
            });
          }
          // Sync opponent progress from server
          if (data.progress && typeof data.progress.opponent === 'number') {
            setOpponentTestcaseProgress(data.progress.opponent);
          }
          // Sync incoming sabotage (server now handles expiry reliably)
          if (data.sabotage && data.sabotage.type) {
            setIncomingSabotage(data.sabotage.type as any);
          } else {
            setIncomingSabotage(null);
          }
        }

        if (data.status === 'queued') {
          setQueueState('queued');
        }

        if (data.status === 'finished') {
          setQueueState('lobby');
          setMatchId(null);
          if (!hasSubmittedRef.current) {
            const winnerIsPlayer = data.result?.winnerId === currentUserId;
            onOpenResult(winnerIsPlayer ? 'victory' : 'defeat', {
              playerName: currentUser?.name,
              opponentName: opponent?.name || data.opponent?.name || 'Đối thủ',
              playerPassCount: data.progress?.player || 0,
              opponentPassCount: data.progress?.opponent || 0
            });
          }
        }
      } catch {
        // ignore transient errors
      }
    };

    const t = setInterval(poll, 2000);
    poll();
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [matchId, currentUserId, onOpenResult]);

  const handleSubmit = async () => {
    if (!matchId) return;
    if (!currentUserId) return;

    if (isEvaluating) return;
    playAudioCue('click');
    setIsEvaluating(true);
    setResultsLogs([
      '⚙️ Đang gửi code lên Sandbox Server để chấm bài...',
    ]);

    try {
      const r = await fetch(`/api/arena/match/${matchId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: solution }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || 'submit failed');

      // Show server sandbox logs
      if (data.logs && Array.isArray(data.logs)) {
        setResultsLogs(data.logs);
      }

      setIsEvaluating(false);

      if (data.status === 'partial') {
        // Not all tests passed – allow re-submit
        setHasSubmitted(false);
        hasSubmittedRef.current = false;
        playAudioCue('fail');
        return;
      }

      // Full pass (status === 'ok') or match finished
      setHasSubmitted(true);
      hasSubmittedRef.current = true;
      if (data.eloAfter) {
        setArenaElo(data.eloAfter);
      }
      window.dispatchEvent(new CustomEvent('algolearn_award_xp', {
        detail: { amount: data.rewardXp || (data.winnerIsSender ? 500 : 150) },
      }));
      playAudioCue('success');
      if (!hasDispatchedPracticeRef.current) {
        window.dispatchEvent(new CustomEvent('algolearn_practice_completed', {
          detail: { source: 'arena', matchId },
        }));
        hasDispatchedPracticeRef.current = true;
      }
      onOpenResult(data.winnerIsSender ? 'victory' : 'defeat', {
        playerName: currentUser?.name,
        opponentName: opponent?.name || 'Đối thủ',
        playerPassCount: data.passedCount || data.progress?.player || 0,
        opponentPassCount: data.progress?.opponent || 0
      });
    } catch (e) {
      setIsEvaluating(false);
      setResultsLogs(prev => [
        ...prev,
        '❌ Submit thất bại. Vui lòng thử lại.',
      ]);
    }
  };


  return (
    <div id="arena_layout" className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] lg:overflow-hidden bg-[#07090d] text-gray-200 font-sans flex flex-col">

      {queueState === 'lobby' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-xl w-full flex flex-col gap-8 shadow-2xl">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                <Swords className="w-8 h-8 text-indigo-500" /> Sảnh Chờ Đấu Trường
              </h2>
              <p className="text-slate-400 text-sm">Chọn chế độ tham gia đấu trường 1v1 để rèn luyện thuật toán.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={joinQueue}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Tìm Ngẫu Nhiên
              </button>
              <button 
                onClick={createRoom}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Key className="w-5 h-5" />
                Tạo Phòng Kín
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Nhập mã phòng 5 ký tự..." 
                maxLength={5}
                value={inputRoomCode}
                onChange={e => setInputRoomCode(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 uppercase font-mono text-center tracking-widest"
              />
              <button 
                onClick={() => joinRoom(inputRoomCode)}
                disabled={inputRoomCode.length < 5}
                className="bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
              >
                Vào
              </button>
            </div>

            <div className="mt-4 border-t border-slate-800 pt-6">
              <h3 className="text-left font-bold text-slate-300 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Người chơi đang Online ({onlineUsers.length})
              </h3>
              <div className="flex flex-col gap-3 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                {onlineUsers.length === 0 ? (
                  <p className="text-slate-500 text-sm">Chưa có ai khác đang online lúc này.</p>
                ) : (
                  onlineUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-3 text-left">
                        <img src={u.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-700" />
                        <div>
                          <div className="font-semibold text-white text-sm">{u.name}</div>
                          <div className="text-xs text-slate-500">{u.school}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {queueState === 'queued' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <Swords className="w-12 h-12 text-indigo-400 animate-pulse" />
          {roomCode ? (
            <>
              <h2 className="text-2xl font-bold text-white">Phòng Kín Của Bạn</h2>
              <div className="bg-slate-900 border border-indigo-500/30 px-8 py-4 rounded-xl flex items-center justify-center">
                <span className="text-4xl font-mono tracking-[0.5em] text-indigo-400 font-black">{roomCode}</span>
              </div>
              <p className="text-sm text-gray-500 max-w-md">Hãy gửi mã này cho bạn bè hoặc mời những người đang online để bắt đầu trận đấu.</p>
              
              <div className="mt-8 w-full max-w-md">
                <h3 className="text-left font-bold text-slate-300 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Mời bạn bè Online ({onlineUsers.length})
                </h3>
                <div className="flex flex-col gap-3 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                  {onlineUsers.length === 0 ? (
                    <p className="text-slate-500 text-sm text-left">Không có ai online để mời.</p>
                  ) : (
                    onlineUsers.map(u => (
                      <div key={u.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-3 text-left">
                          <img src={u.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-700" />
                          <div>
                            <div className="font-semibold text-white text-sm">{u.name}</div>
                            <div className="text-xs text-slate-500 truncate w-32">{u.school}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => inviteUser(u.id)}
                          disabled={u.status === 'in-game'}
                          className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors ${
                            u.status === 'in-game' 
                              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {u.status === 'in-game' ? 'Đang trận' : 'Mời'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button 
                onClick={() => {
                  fetch('/api/arena/queue/leave', { method: 'POST', body: JSON.stringify({ userId: currentUserId }), headers: {'Content-Type': 'application/json'}, credentials: 'include' });
                  setQueueState('lobby');
                  setRoomCode('');
                }}
                className="mt-4 text-rose-400 hover:text-rose-300 text-sm transition-colors"
              >
                Hủy phòng
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white">Đang tìm đối thủ...</h2>
              <p className="text-sm text-gray-500 max-w-md">Hệ thống đang ghép bạn với người chơi khác. Nếu không có ai sau 5 giây, bot sẽ tham gia trận đấu.</p>
            </>
          )}
          {joinError && <p className="text-rose-400 text-sm">{joinError}</p>}
        </div>
      )}

      {queueState === 'error' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-400" />
          <h2 className="text-xl font-bold text-white">Không thể vào đấu trường</h2>
          <p className="text-sm text-gray-500">{joinError || 'Vui lòng đăng nhập và thử lại.'}</p>
        </div>
      )}

      {queueState === 'running' && (
      <>
      
      {/* Competitors Header */}

      <div className="bg-[#0b0e14] border-b border-slate-900 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Player side */}
        <div className="flex items-center space-x-3 text-left">
          <img 
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"} 
            alt="Bạn" 
            className="w-10 h-10 rounded-full border-2 border-indigo-500 object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white">{currentUser?.name || 'Bạn'} (Bạn)</span>
              <span className="bg-[#4f46e5]/20 text-indigo-300 border border-indigo-500/20 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">{arenaElo?.player ? `ELO ${arenaElo.player}` : 'ỦY VIÊN'}</span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">
              Elo: {arenaElo.player ?? 1200} | {hasSubmitted ? 'Đã nộp bài' : 'Đang thi đấu'}
            </p>
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
            src={opponent?.avatar || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80"} 
            alt={opponent?.name || 'Đối thủ'} 
            className="w-10 h-10 rounded-full border-2 border-rose-500 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="md:mr-3">
            <div className="flex items-center md:justify-end space-x-2">
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">ĐỐI THỦ</span>
              <span className="font-extrabold text-white">{opponent?.name || (queueState === 'queued' ? 'Đang tìm...' : '???')}</span>
            </div>
            <p className="text-[10px] text-rose-400 font-mono">
              Elo: {arenaElo.opponent ?? 1200} | {opponentTestcaseProgress}/5 testcase passed
            </p>
          </div>
        </div>
      </div>

      {/* Grid panels */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 pb-36 lg:pb-0 overflow-y-auto lg:overflow-hidden lg:h-full">
        
        {/* Left column - Problem description */}
        <div className="lg:col-span-3 min-w-0 lg:h-full border-r border-slate-900/60 bg-[#06080b] p-6 text-left overflow-y-auto scrollbar-thin">
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
        <div className="lg:col-span-6 min-w-0 lg:h-full lg:overflow-hidden flex flex-col border-r border-[#1a1f2c] bg-[#090b0e]">
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
            {incomingSabotage === 'sương_mù' && (
              <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center">
                <ShieldAlert className="w-16 h-16 text-indigo-500 animate-pulse mb-4" />
                <h3 className="text-xl font-bold text-red-400 mb-2 uppercase tracking-widest text-shadow-glow">CẢNH BÁO: MÀN SƯƠNG MÙ</h3>
                <p className="text-gray-300">Đối thủ đã dùng thẻ cấm lên bạn!</p>
              </div>
            )}
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
        <div className="lg:col-span-3 min-w-0 lg:h-full bg-[#06080b] p-6 text-left flex flex-col justify-between overflow-y-auto scrollbar-thin">
          
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
      </>
      )}
    </div>
  );
}
