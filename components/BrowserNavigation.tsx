import React from 'react';
import { ChevronLeft, ChevronRight, Home, Share, Bookmark, Settings } from 'lucide-react';

interface BrowserNavigationProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  onGoHome: () => void;
  onOpenTabSwitcher: () => void;
  onOpenBookmarks: () => void;
  onOpenSettings: () => void;
  tabsCount: number;
  activeTabUrl: string;
  activeTabTitle: string;
}

export const BrowserNavigation: React.FC<BrowserNavigationProps> = ({
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onGoHome,
  onOpenTabSwitcher,
  onOpenBookmarks,
  onOpenSettings,
  tabsCount,
  activeTabUrl,
  activeTabTitle
}) => {
  const handleShare = () => {
    if (navigator.share && activeTabUrl !== 'hello://home') {
      navigator.share({
        title: activeTabTitle,
        url: activeTabUrl
      });
    }
  };

  return (
    <div className="px-4 py-2 bg-[#0a0a0a] border-t border-white/5 flex flex-col gap-2 pb-safe-area">
      <div className="flex items-center justify-between">
        <button 
          onClick={onGoBack}
          className={`p-3 transition-colors ${canGoBack ? 'text-slate-300 hover:text-white' : 'text-slate-600 opacity-50'}`}
          disabled={!canGoBack}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={onGoForward}
          className={`p-3 transition-colors ${canGoForward ? 'text-slate-300 hover:text-white' : 'text-slate-600 opacity-50'}`}
          disabled={!canGoForward}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        <button 
          onClick={onGoHome}
          className={`p-3 transition-colors ${activeTabUrl === 'hello://home' ? 'text-indigo-500' : 'text-slate-500 hover:text-white'}`}
        >
          <Home className="w-6 h-6" />
        </button>

        <button 
          onClick={onOpenTabSwitcher}
          className="relative p-3 text-slate-500 hover:text-white transition-colors"
        >
          <div className="w-6 h-6 border-2 border-current rounded-md flex items-center justify-center text-[10px] font-bold">
            {tabsCount}
          </div>
        </button>

        <button 
          onClick={onOpenBookmarks}
          className="p-3 text-slate-500 hover:text-white transition-colors"
        >
          <Bookmark className="w-6 h-6" />
        </button>

        <button 
          onClick={onOpenSettings}
          className="p-3 text-slate-500 hover:text-white transition-colors"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>
      
      {/* iOS style home indicator */}
      <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-1 mb-1"></div>
    </div>
  );
};