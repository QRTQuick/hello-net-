import React from 'react';
import { Plus, X, Zap, Star } from 'lucide-react';
import { Tab } from '../types';

interface TabSwitcherProps {
  isOpen: boolean;
  tabs: Tab[];
  activeTabId: string;
  onClose: () => void;
  onCreateNewTab: () => void;
  onSwitchTab: (tabId: string) => void;
  onCloseTab: (tabId: string, e: React.MouseEvent) => void;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({
  isOpen,
  tabs,
  activeTabId,
  onClose,
  onCreateNewTab,
  onSwitchTab,
  onCloseTab
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col p-6 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Tabs</h2>
        <div className="flex items-center gap-2">
           <button 
            onClick={onCreateNewTab}
            className="p-3 bg-white/5 rounded-full text-indigo-400 active:scale-90 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 rounded-full text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 pb-12">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => { onSwitchTab(tab.id); onClose(); }}
            className={`group aspect-[3/4.5] rounded-3xl overflow-hidden relative border-2 transition-all active:scale-95 ${activeTabId === tab.id ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-[1.02]' : 'border-white/10'}`}
          >
            {/* Tab Preview Chrome */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 backdrop-blur-md flex items-center justify-between px-3 z-10">
              <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[80px] text-slate-300">
                {tab.title}
              </span>
              <button 
                onClick={(e) => onCloseTab(tab.id, e)}
                className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            {/* Fake Tab Preview Content */}
            <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center p-4">
              {tab.url === 'hello://home' ? (
                <div className="flex flex-col items-center opacity-40">
                  <Zap className="w-8 h-8 text-indigo-500 mb-2" />
                  <div className="w-12 h-1 bg-white/10 rounded-full"></div>
                </div>
              ) : (
                <div className="w-full h-full pt-12 flex flex-col gap-2 opacity-30">
                   <div className="h-4 w-3/4 bg-white/20 rounded"></div>
                   <div className="h-3 w-full bg-white/10 rounded"></div>
                   <div className="h-3 w-full bg-white/10 rounded"></div>
                   <div className="h-3 w-1/2 bg-white/10 rounded"></div>
                </div>
              )}
            </div>

            {activeTabId === tab.id && (
              <div className="absolute bottom-3 right-3 bg-indigo-500 p-1.5 rounded-full">
                <Star className="w-3 h-3 text-white fill-current" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6 flex justify-center">
        <button 
          onClick={onClose}
          className="px-10 py-4 bg-indigo-600 rounded-2xl font-bold shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};