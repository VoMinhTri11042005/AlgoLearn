import React, { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';

// Import Prism core and the tomorrow-night theme style
import 'prismjs/themes/prism-tomorrow.css';

// Ensure the essential languages are imported for highlighting
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';

import { Copy, Check } from 'lucide-react';

interface CodeHighlightProps {
  code: string;
  language?: string; // 'cpp', 'python', 'java', etc.
  className?: string;
  title?: string;
}

export const CodeHighlight: React.FC<CodeHighlightProps> = ({
  code,
  language = 'cpp',
  className = '',
  title = '',
}) => {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Human friendly language label
  const getLanguageLabel = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'cpp':
      case 'c++':
        return 'C++';
      case 'python':
      case 'py':
        return 'Python';
      case 'java':
        return 'Java';
      case 'javascript':
      case 'js':
        return 'JavaScript';
      default:
        return lang.toUpperCase();
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 font-mono shadow-xl group ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/60 shrink-0 select-none">
        <div className="flex items-center space-x-2">
          {/* Windows-style terminal dots */}
          <div className="flex space-x-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-[10px] bg-slate-800 text-indigo-300 font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border border-slate-700/50">
            {getLanguageLabel(language)}
          </span>
          {title && (
            <span className="text-[10.5px] text-gray-400 font-semibold truncate max-w-xs sm:max-w-md pl-1.5">
              {title}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition duration-200 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/30 hover:border-slate-700/80 rounded-lg px-2 py-1 text-[10.5px] font-bold cursor-pointer"
          title="Sao chép mã nguồn"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-extrabold">Đã sao chép!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Sao chép</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="relative">
        <pre className="!p-4 !m-0 !bg-transparent overflow-x-auto text-xs sm:text-sm leading-relaxed scrollbar-thin">
          <code ref={codeRef} className={`language-${language} block !font-mono !text-zinc-100`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
};
