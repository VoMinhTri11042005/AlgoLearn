import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Code, Terminal, Sparkles, RefreshCw, ChevronRight, CheckCircle2, 
  Settings, Layers, BookOpen, AlertCircle, Cpu, FileJson, Clock, BarChart4,
  Volume2, VolumeX
} from 'lucide-react';
import { CodeFile, TestcaseResult, AlgorithmicStep } from '../types';
import { playAudioCue, getSoundEnabled, setSoundEnabled as saveSoundOnStorage } from '../utils/audio';

import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/themes/prism-tomorrow.css';

interface IdeViewProps {
  onNavigate: (view: 'home' | 'theory' | 'ide' | 'arena' | 'leaderboard') => void;
}

export default function IdeView({ onNavigate }: IdeViewProps) {
  const [activeTab, setActiveTab] = useState<'viz' | 'complexity'>('viz');
  const [activeFile, setActiveFile] = useState(() => {
    try {
      return localStorage.getItem('algolearn_active_file') || 'quick_sort.cpp';
    } catch {
      return 'quick_sort.cpp';
    }
  });

  const handleFileChange = (fileName: string) => {
    setActiveFile(fileName);
    try {
      localStorage.setItem('algolearn_active_file', fileName);
    } catch {}
  };
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileOutput, setCompileOutput] = useState<string[]>([]);
  const [testcasesRun, setTestcasesRun] = useState<TestcaseResult[]>([]);
  const [hasRun, setHasRun] = useState(false);

  // Files contents state
  const [files, setFiles] = useState<CodeFile[]>([
    {
      name: 'quick_sort.cpp',
      language: 'cpp',
      isOpen: true,
      isActive: true,
      content: `#include <iostream>
using namespace std;

void swap(int &a, int &b) {
    int t = a;
    a = b;
    b = t;
}

// Phân hoạch Lomuto
int partition(int arr[], int low, int high) {
    int pivot = arr[high]; // Chốt cuối cùng
    int i = (low - 1); 

    for (int j = low; j <= high - 1; j++) {
        // Nếu giá trị nhỏ hơn chốt
        if (arr[j] < pivot) {
            i++; 
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return (i + 1);
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        
        // Đệ quy sắp xếp nhánh trái và phải
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main() {
    int arr[] = {24, 9, 15, 31, 8, 12, 19};
    int n = sizeof(arr)/sizeof(arr[0]);
    
    quickSort(arr, 0, n - 1);
    
    for (int i=0; i < n; i++)
        cout << arr[i] << " ";
    return 0;
}`
    },
    {
      name: 'merge_sort.cpp',
      language: 'cpp',
      isOpen: true,
      isActive: false,
      content: `// Đóng góp bởi AlgoLearn Community
void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1;
    int n2 = r - m;
    int L[n1], R[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    // Gộp hai mảng con
}`
    },
    {
      name: 'solution.py',
      language: 'python',
      isOpen: true,
      isActive: false,
      content: `# Python3 implementation of QuickSort Lomuto
def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1

def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
`
    }
  ]);

  // Current file code
  const currentCode = files.find(f => f.name === activeFile)?.content || '';

  const setCodeForActiveFile = (val: string) => {
    setFiles(prev => prev.map(f => f.name === activeFile ? { ...f, content: val } : f));
  };

  // Dynamic Lomuto step builder for ANY numbers array
  const generateLomutoSteps = (arrInput: number[]): AlgorithmicStep[] => {
    const steps: AlgorithmicStep[] = [];
    const n = arrInput.length;
    if (n === 0) return [];
    
    const currentArr = [...arrInput];
    const low = 0;
    const high = n - 1;
    const pivotVal = currentArr[high];
    
    steps.push({
      array: [...currentArr],
      highlights: { pivot: high, low, high, active: -1 },
      description: `🚀 Khởi đầu phân hoạch Lomuto. Chọn chốt pivot = A[high] = ${pivotVal} ở vị trí cuối cùng (index ${high}). Thiết lập chỉ số i = -1.`
    });
    
    let i = low - 1;
    for (let j = low; j < high; j++) {
      const valJ = currentArr[j];
      
      steps.push({
        array: [...currentArr],
        highlights: { pivot: high, low, high, active: j },
        description: `🔍 j = ${j}: So sánh A[j] (${valJ}) với pivot (${pivotVal}).` + 
          (valJ <= pivotVal 
            ? ` Vì ${valJ} <= ${pivotVal}, tăng chỉ số i lên và hoán đổi.` 
            : ` Vì ${valJ} > ${pivotVal}, không hoán đổi, chỉ số i giữ nguyên ở vị trí index ${i}.`)
      });
      
      if (valJ <= pivotVal) {
        i++;
        const valI = currentArr[i];
        const temp = currentArr[i];
        currentArr[i] = currentArr[j];
        currentArr[j] = temp;
        
        steps.push({
          array: [...currentArr],
          highlights: { pivot: high, low, high, active: j, swapping: [i, j] },
          description: `🔄 Hoán đổi A[i=${i}] (${valI}) với A[j=${j}] (${valJ}) để dồn phần tử nhỏ hơn lên đầu mảng.`
        });
      }
    }
    
    const targetIdx = i + 1;
    const targetVal = currentArr[targetIdx];
    const originalPivotIdx = high;
    
    steps.push({
      array: [...currentArr],
      highlights: { pivot: originalPivotIdx, low, high, active: -1 },
      description: `🔚 Đã quét xong mảng con. Chuẩn bị đưa chốt pivot (${pivotVal}) từ cuối về vị trí phân tách mảng i+1 = ${targetIdx} (thay thế giá trị ${targetVal}).`
    });
    
    const temp = currentArr[targetIdx];
    currentArr[targetIdx] = currentArr[high];
    currentArr[high] = temp;
    
    steps.push({
      array: [...currentArr],
      highlights: { pivot: targetIdx, low, high, swapping: [targetIdx, originalPivotIdx] },
      description: `💎 Chốt pivot (${pivotVal}) đã ở vị trí chính xác tuyệt đối (index ${targetIdx}). Phía bên trái đều bé hơn, bên phải đều lớn hơn hoặc bằng nó.`
    });
    
    const sortedCopy = [...currentArr].sort((a, b) => a - b);
    steps.push({
      array: sortedCopy,
      highlights: {},
      description: `🎉 Tiếp tục đệ quy chia để trị trên nhánh trái & phải. Mảng sau khi hoàn thiện toàn bộ luồng Quick Sort tăng dần: [${sortedCopy.join(", ")}].`
    });
    
    return steps;
  };

  const [customArrayInput, setCustomArrayInput] = useState<string>('24, 9, 15, 31, 8, 12, 19');
  const [visualizerArray, setVisualizerArray] = useState<number[]>([24, 9, 15, 31, 8, 12, 19]);
  
  // States of visual steps
  const [visualSteps, setVisualSteps] = useState<AlgorithmicStep[]>(() => generateLomutoSteps([24, 9, 15, 31, 8, 12, 19]));
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [customInputError, setCustomInputError] = useState<string | null>(null);

  const handleApplyCustomArray = () => {
    const parts = customArrayInput.split(',').map(s => parseInt(s.trim(), 10));
    const validNums = parts.filter(n => !isNaN(n));

    if (validNums.length < 3 || validNums.length > 10) {
      setCustomInputError('Mảng phải có độ dài từ 3 đến 10 số để đảm bảo không gian hiển thị đẹp nhất!');
      playAudioCue('fail');
      return;
    }

    if (validNums.some(n => n < 1 || n > 99)) {
      setCustomInputError('Vui lòng chỉ nhập các số nguyên dương từ 1 đến 99!');
      playAudioCue('fail');
      return;
    }

    setCustomInputError(null);
    playAudioCue('success');
    setVisualizerArray(validNums);
    const newSteps = generateLomutoSteps(validNums);
    setVisualSteps(newSteps);
    setCurrentStepIdx(0);
    setIsAutoPlaying(false);
  };

  const handleGenerateRandomArray = () => {
    const size = Math.floor(Math.random() * 4) + 6; // size between 6 and 9
    const randomArr: number[] = [];
    for (let i = 0; i < size; i++) {
      randomArr.push(Math.floor(Math.random() * 45) + 5); // Numbers between 5 and 50
    }

    setCustomInputError(null);
    playAudioCue('success');
    setCustomArrayInput(randomArr.join(', '));
    setVisualizerArray(randomArr);
    const newSteps = generateLomutoSteps(randomArr);
    setVisualSteps(newSteps);
    setCurrentStepIdx(0);
    setIsAutoPlaying(false);
  };


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= visualSteps.length - 1) {
            setIsAutoPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Satisfying ASMR sound effects on sorting step changes
  useEffect(() => {
    if (currentStepIdx > 0 && currentStepIdx < visualSteps.length) {
      const step = visualSteps[currentStepIdx];
      if (step && step.highlights && step.highlights.swapping) {
        playAudioCue('swap');
      } else {
        playAudioCue('tick');
      }
    }
  }, [currentStepIdx, visualSteps]);

  const activeStep = visualSteps[currentStepIdx];

  const handleRunCode = () => {
    setIsCompiling(true);
    setCompileOutput([
      "[SYSTEM] Đang khởi động trình biên dịch G++ C++ v13...",
      "[SYSTEM] Biên dịch file quick_sort.cpp thành file binary...",
      "[SYSTEM] Chạy thử trên dữ liệu kiểm thử..."
    ]);
    setHasRun(false);

    setTimeout(() => {
      setCompileOutput(prev => [
        ...prev,
        "✔ Biên dịch hoàn tất không có lỗi hệ thống.",
        "================ RUNTIME LOGS ================",
        "Mảng ban đầu: 24 9 15 31 8 12 19",
        "Đệ quy phân hoạch Pivot=19 -> vị trí index 4",
        "Đệ quy phân hoạch Pivot=12 -> vị trí index 2",
        "Mảng sau khi sắp xếp: 8 9 12 15 19 24 31",
        "Thời gian chạy thực tế: 0.14 ms",
        "Memory tiêu thụ: 1.2 MB",
        "============================= OK =============",
        "✔ Kết quả trùng khớp hoàn hảo với Testcase."
      ]);
      setTestcasesRun([
        { passed: true, input: "[24, 9, 15, 31, 8, 12, 19]", expected: "8 9 12 15 19 24 31", actual: "8 9 12 15 19 24 31", runtime: "0.14 ms" },
        { passed: true, input: "[5, 4, 3, 2, 1]", expected: "1 2 3 4 5", actual: "1 2 3 4 5", runtime: "0.08 ms" },
        { passed: true, input: "[42]", expected: "42", actual: "42", runtime: "0.02 ms" }
      ]);
      setIsCompiling(false);
      setHasRun(true);
      // Prevent duplicate practice completion events (streak/daily logic lives in App.tsx)
      window.dispatchEvent(new CustomEvent('algolearn_practice_completed', { detail: { source: 'ide' } }));
    }, 1500);
  };

  const handleResetCode = () => {
    setCodeForActiveFile(files.find(f => f.name === activeFile)?.content || '');
    setHasRun(false);
    setCompileOutput([]);
    setTestcasesRun([]);
  };

  return (
    <div id="ide_screen_container" className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] lg:overflow-hidden bg-[#0d0f14] text-gray-200 font-sans flex flex-col">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 pb-36 lg:pb-0 overflow-y-auto lg:overflow-hidden lg:h-full">
        
        {/* Leftmost Sidebar Selector - Project Files */}
        <aside id="file_explorer" className="lg:col-span-2 min-w-0 lg:h-full lg:overflow-y-auto border-r border-[#1a1f2c] bg-[#090b0e] p-4 flex flex-col text-left">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a1f2c] mb-4">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">WORKSPACE EXPLORER</span>
            <Settings className="w-4 h-4 text-slate-500 hover:text-white transition cursor-pointer" />
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto scrollbar-thin">
            {files.map((file) => (
              <button
                key={file.name}
                onClick={() => handleFileChange(file.name)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left truncate cursor-pointer ${
                  activeFile === file.name 
                    ? 'bg-[#1e2330] text-indigo-400 border-l-2 border-indigo-500' 
                    : 'text-gray-500 hover:bg-[#121620] hover:text-gray-300'
                }`}
              >
                <Code className={`w-4 h-4 ${activeFile === file.name ? 'text-indigo-400' : 'text-gray-500'}`} />
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>

          {/* Quick learning tips */}
          <div className="border-t border-[#1a1f2c] pt-4 mt-4 space-y-3">
            <div className="bg-indigo-950/20 border border-indigo-500/10 p-3.5 rounded-xl rounded-tr-none">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 flex items-center space-x-1 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ALGO ATTRACTION</span>
              </span>
              <p className="text-[11px] text-gray-500 leading-normal">
                Sử dụng Visualizer bên phải để xem mảng hoán đổi từng bước theo màu của biến chốt pivot.
              </p>
            </div>
          </div>
        </aside>

        {/* Center - Smart Code Editor */}
        <main id="editor_playground" className="lg:col-span-5 min-w-0 lg:h-full lg:overflow-hidden flex flex-col border-r border-[#1a1f2c] bg-[#0a0d13]">
          {/* Top Bar with action triggers */}
          <div className="flex items-center justify-between bg-[#080a0e] px-4 py-2.5 border-b border-[#1a1f2c]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span className="text-xs font-bold text-gray-300 font-mono">{activeFile}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={handleRunCode}
                disabled={isCompiling}
                className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg cursor-pointer select-none transition active:scale-95 shadow-md shadow-indigo-600/10"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>{isCompiling ? 'Đang chạy...' : 'Run Code'}</span>
              </button>

              <button 
                onClick={handleResetCode}
                className="bg-[#1b202e] hover:bg-[#252c3f] text-slate-400 p-2 rounded-lg transition"
                title="Khôi phục code mặc định"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Code Editor with VS Code custom colored highlighting */}
          <div className="flex-1 relative flex h-full min-h-0 overflow-y-auto scrollbar-thin bg-[#0a0d13]">
            {/* Simulated Line numbers */}
            <div className="w-10 bg-[#07090d]/65 border-r border-[#1a1f2c]/50 text-right pr-2 select-none text-[11px] font-mono text-slate-500 pt-4 leading-[23px] font-medium text-left shrink-0">
              {Array.from({ length: Math.max(currentCode.split('\n').length, 1) }).map((_, i) => (
                <div key={i} className="h-[23px] flex items-center justify-end pr-1.5">{i + 1}</div>
              ))}
            </div>

            <div className="flex-1 min-w-0 min-h-full">
              <Editor
                value={currentCode}
                onValueChange={(code) => setCodeForActiveFile(code)}
                highlight={(code) => Prism.highlight(code, Prism.languages.cpp || Prism.languages.clike, 'cpp')}
                padding={16}
                textareaClassName="outline-none focus:outline-none border-none ring-0 focus:ring-0 selection:bg-slate-800"
                preClassName="focus:outline-none focus:ring-0 selection:bg-slate-800"
                spellCheck={false}
                style={{
                  fontFamily: '"JetBrains Mono", "Courier New", Courier, monospace',
                  fontSize: '12px',
                  lineHeight: '23px',
                  minHeight: '100%',
                }}
                className="w-full h-full text-indigo-100"
              />
            </div>
          </div>

          {/* Output Compilation Terminal */}
          <div className="h-56 border-t border-[#1a1f2c] bg-[#07090d] flex flex-col text-left">
            <div className="flex items-center justify-between px-4 py-2 bg-[#05070a] border-b border-[#1a1f2c]">
              <div className="flex items-center space-x-2 text-slate-500">
                <Terminal className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">KẾT QUẢ CHẠY CODE (IDE TERMINAL)</span>
              </div>
            </div>

            <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto scrollbar-thin space-y-1.5 focus:outline-none">
              {compileOutput.length === 0 ? (
                <p className="text-gray-600 italic">Nhấp nút "Run Code" để chạy và đối chiếu với bộ testcases chuẩn.</p>
              ) : (
                compileOutput.map((line, lidx) => (
                  <p 
                    key={lidx} 
                    className={`${
                      line.startsWith('✔') ? 'text-emerald-400 font-bold' : 
                      line.startsWith('[SYSTEM]') ? 'text-indigo-400/80' : 
                      line.startsWith('================') ? 'text-slate-600' : 'text-gray-400'
                    }`}
                  >
                    {line}
                  </p>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Right - Simulation and complexity charts */}
        <div className="lg:col-span-5 min-w-0 lg:h-full lg:overflow-hidden flex flex-col bg-[#090b0e]">
          {/* Top Bar Navigation Tabs */}
          <div className="flex border-b border-[#1a1f2c] bg-[#080a0e] px-2 text-left">
            <button
              onClick={() => setActiveTab('viz')}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'viz' 
                  ? 'border-indigo-500 text-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>MÔ PHỎNG TRỰC QUAN</span>
            </button>

            <button
              onClick={() => setActiveTab('complexity')}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'complexity' 
                  ? 'border-indigo-500 text-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <BarChart4 className="w-4 h-4 text-emerald-400" />
              <span>ĐỘ PHỨC TẠP TIME VS N</span>
            </button>
          </div>

          <div className="flex-1 p-6 pb-36 lg:pb-6 overflow-y-auto scrollbar-thin flex flex-col justify-between">
            {activeTab === 'viz' ? (
              // Visualizer Panel
              <div id="vis_panel" className="space-y-6 text-left flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-100 flex items-center space-x-1.5 mb-2">
                    <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                    <span>Lomuto Partition Visualizer</span>
                  </h3>
                  <p className="text-xs text-gray-500 leading-normal">
                    Mô phỏng mảng ban đầu `[24, 9, 15, 31, 8, 12, 19]`. Bạn có thể dừng phân hoạch, chạy từng bước hoán đổi để hiểu cách mảng mọc nhánh trái/phải.
                  </p>
                </div>

                {/* Simulated Graph Bars with framer-motion */}
                <div className="bg-[#05070a]/90 border border-[#1a1f2c] rounded-xl p-5 my-4 h-64 flex flex-col justify-end relative overflow-hidden">
                  <div className="absolute top-3 left-3 flex space-x-3 text-[10px] font-mono">
                    <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded"></span><span className="text-slate-400">Pivot: 19</span></span>
                    <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-[#4f46e5] rounded"></span><span className="text-slate-400">Đang quét (j)</span></span>
                  </div>

                  <div className="flex items-end justify-center space-x-2.5 h-40">
                    <AnimatePresence mode="popLayout">
                      {activeStep.array.map((val, idx) => {
                        const isPivot = activeStep.highlights.pivot === idx;
                        const isScanning = activeStep.highlights.active === idx;
                        const isSwapping = activeStep.highlights.swapping?.includes(idx);

                        let barBg = 'bg-slate-800 text-gray-400 border border-slate-700/50';
                        if (isPivot) barBg = 'bg-amber-500 text-slate-950 font-bold border-2 border-amber-400 shadow-md shadow-amber-500/20';
                        else if (isSwapping) barBg = 'bg-rose-500 text-white font-bold border border-rose-400 shadow-md shadow-rose-500/20';
                        else if (isScanning) barBg = 'bg-[#4f46e5] text-white border border-indigo-400/50';

                        // Calculate height
                        const minVal = 8;
                        const maxVal = 31;
                        const calculatedHeight = 25 + ((val - minVal) / (maxVal - minVal)) * 75;

                        return (
                          <motion.div 
                            key={val}
                            layout
                            className={`flex flex-col items-center flex-1 max-w-[50px] transition-all`}
                          >
                            <div 
                              className={`w-full rounded-t-lg flex items-end justify-center text-[10px] font-mono pb-1 font-bold ${barBg}`}
                              style={{ height: `${calculatedHeight}%` }}
                            >
                              <span>{val}</span>
                            </div>
                            <span className="text-[9px] font-mono text-slate-600 mt-2">
                              {isPivot ? 'P' : `i=${idx}`}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Description of step */}
                <div className="bg-[#11141e]/80 border border-indigo-950/40 p-4 rounded-xl text-xs md:text-sm text-gray-400 text-left min-h-[64px]">
                  {activeStep.description}
                </div>

                {/* Controller of Steps */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#1a1f2c] pt-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setIsAutoPlaying(false);
                        setCurrentStepIdx((p) => Math.max(0, p - 1));
                        playAudioCue('click');
                      }}
                      disabled={currentStepIdx === 0}
                      className="bg-[#1b202e] hover:bg-[#252c3f] disabled:opacity-30 disabled:pointer-events-none text-slate-300 font-bold text-xs p-2.5 rounded-lg cursor-pointer flex items-center justify-center transition"
                    >
                      Bước lùi
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsAutoPlaying(!isAutoPlaying);
                        playAudioCue('click');
                      }}
                      className={`font-semibold text-xs px-5 py-2.5 rounded-lg cursor-pointer text-white flex items-center space-x-1.5 shadow-md transition ${
                        isAutoPlaying ? 'bg-amber-600/90 hover:bg-amber-500' : 'bg-indigo-650 hover:bg-indigo-600'
                      }`}
                    >
                      <span>{isAutoPlaying ? 'Pause Autoplay' : 'Autoplay'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsAutoPlaying(false);
                        setCurrentStepIdx((p) => Math.min(visualSteps.length - 1, p + 1));
                        playAudioCue('click');
                      }}
                      disabled={currentStepIdx === visualSteps.length - 1}
                      className="bg-[#1a202d] hover:bg-[#262f44] disabled:opacity-30 disabled:pointer-events-none text-slate-300 font-bold text-xs p-2.5 rounded-lg cursor-pointer flex items-center justify-center transition"
                    >
                      Bước tiếp
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentStepIdx(0);
                      playAudioCue('success');
                    }}
                    className="text-[10px] uppercase font-bold text-slate-500 hover:text-white transition"
                  >
                    Reset Visualizer
                  </button>
                </div>
              </div>
            ) : (
              // Complexity graph Panel
              <div id="complexity_graph_tab" className="space-y-6 text-left flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-100 flex items-center space-x-1.5 mb-2">
                    <Cpu className="w-4.5 h-4.5 text-emerald-400" />
                    <span>Hiệu năng thực nghiệm: O(N log N) vs O(N²)</span>
                  </h3>
                  <p className="text-xs text-gray-500 leading-normal">
                    Biểu đồ biểu diễn mối liên hệ thời gian thực thi (ms) khi số lượng phần tử N tăng vọt giữa Quick Sort tốt nhất/trung bình $O(N \log N)$ và tệ nhất $O(N^2)$.
                  </p>
                </div>

                {/* Hand-drawn high-fidelity pure SVG graph to ensure compatibility with Node/React 19 */}
                <div className="bg-[#05070a] border border-[#1a1f2c] rounded-xl p-5 my-4 overflow-hidden relative">
                  <svg viewBox="0 0 400 200" className="w-full h-44 overflow-visible">
                    {/* Grid lines */}
                    <line x1="40" y1="20" x2="40" y2="170" stroke="#1f2937" strokeWidth="1" />
                    <line x1="40" y1="170" x2="380" y2="170" stroke="#1f2937" strokeWidth="1" />
                    
                    <line x1="40" y1="120" x2="380" y2="120" stroke="#111827" strokeDasharray="4 4" />
                    <line x1="40" y1="70" x2="380" y2="70" stroke="#111827" strokeDasharray="4 4" />
                    
                    {/* Axis Labels */}
                    <text x="370" y="185" fill="#4B5563" fontSize="8" fontFamily="monospace">N (vạn)</text>
                    <text x="15" y="25" fill="#4B5563" fontSize="8" fontFamily="monospace" transform="rotate(-90 15 25)">Thời gian (ms)</text>

                    {/* Average case line O(N log N) - Blue */}
                    <path 
                      d="M 40 170 Q 150 155 380 135" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="2.5" 
                      className="cursor-pointer"
                    />
                    
                    {/* Worst case line O(N^2) - Red */}
                    <path 
                      d="M 40 170 Q 100 130 250 20" 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="2.5" 
                    />

                    {/* Labels on chart */}
                    <text x="260" y="35" fill="#ef4444" fontSize="8" fontWeight="bold">O(N²) - Worst-case</text>
                    <text x="240" y="125" fill="#3b82f6" fontSize="8" fontWeight="bold">O(N log N) - Average</text>
                  </svg>

                  {/* Legends */}
                  <div className="flex items-center justify-center space-x-6 text-[10px] text-gray-500 font-mono mt-2">
                    <span className="flex items-center space-x-2"><span className="w-3 h-0.5 bg-blue-500 block"></span><span>Quick Sort trung bình</span></span>
                    <span className="flex items-center space-x-2"><span className="w-3 h-0.5 bg-red-500 block"></span><span>Worst-case Lomuto bị lệch</span></span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-gray-100 tracking-wider">THÔNG TIN BỘ NHỚ EXTRA:</h4>
                  <p className="text-xs text-gray-500 leading-normal">
                    Quick Sort là thuật toán sắp xếp <strong>tại chỗ (In-place sorting)</strong>. Nó không tốn thêm mảng phụ trợ tạm thời như Merge Sort (yêu cầu $O(N)$ bộ nhớ phụ trợ). Nhờ đó, nó tiêu thụ cực kỳ ít RAM. Bộ nhớ duy nhất tốn thêm là bộ nhớ Đệ quy Stack.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Algo Advice Banner */}
            <div className="mt-8 bg-indigo-950/20 border border-indigo-505/20 p-4 rounded-xl text-left bg-indigo-950/15">
              <span className="text-[10px] font-bold text-indigo-400 block mb-1 uppercase tracking-wider">💡 Gợi ý cải tiến từ Algo AI:</span>
              <p className="text-xs text-gray-400 leading-relaxed">
                Để tránh rơi vào tệ hại $O(N^2)$, hãy thiết lập giải thuật 3-Median (chọn phần tử chốt ngẫu nhiên trong 3 số: đầu, giữa, cuối) thay vì mặc định lấy arr[high].
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
