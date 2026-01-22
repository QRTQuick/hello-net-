import React from 'react';
import { Sparkles, Globe } from 'lucide-react';
import { SearchResult } from '../types';

interface AIReaderProps {
  isProcessing: boolean;
  isReadingMode: boolean;
  pageContent: { text: string; sources: SearchResult[] } | null;
  activeTabTitle: string;
}

export const AIReader: React.FC<AIReaderProps> = ({
  isProcessing,
  isReadingMode,
  pageContent,
  activeTabTitle
}) => {
  if (isProcessing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
        <p className="text-slate-400 animate-pulse">Hello Net is analyzing this page...</p>
      </div>
    );
  }

  if (isReadingMode && pageContent) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 mb-6 p-2 bg-indigo-600/10 rounded-full w-fit pr-4">
            <div className="bg-indigo-600 p-1 rounded-full"><Sparkles className="w-3 h-3" /></div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">AI Reading Mode</span>
          </div>
          <h1 className="text-3xl font-bold mb-8 leading-tight">{activeTabTitle}</h1>
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-lg space-y-6">
            {pageContent.text.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          
          {pageContent.sources.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Real-time Sources
              </h3>
              <div className="space-y-3">
                {pageContent.sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    className="block p-4 bg-white/5 rounded-xl border border-white/5 hover:border-indigo-500/50 transition-all active:scale-[0.98]"
                  >
                    <p className="text-sm font-semibold text-white mb-1">{source.title}</p>
                    <p className="text-xs text-slate-500 truncate">{source.uri}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center text-slate-600 italic">
      Switch to AI Reader to analyze this page.
    </div>
  );
};