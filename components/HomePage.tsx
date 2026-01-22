import React from 'react';
import { Zap, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: (input: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const shortcuts = [
    { name: 'DuckDuckGo', icon: 'D', color: 'bg-orange-600 text-white', url: 'duckduckgo.com' },
    { name: 'Wikipedia', icon: 'W', color: 'bg-slate-700 text-white', url: 'wikipedia.org' },
    { name: 'Stack Overflow', icon: 'SO', color: 'bg-orange-500 text-white', url: 'stackoverflow.com' },
    { name: 'MDN', icon: 'M', color: 'bg-blue-600 text-white', url: 'developer.mozilla.org' },
    { name: 'Google*', icon: 'G', color: 'bg-white text-black', url: 'google.com' },
    { name: 'GitHub*', icon: 'Git', color: 'bg-slate-800 text-white', url: 'github.com' },
    { name: 'YouTube*', icon: 'Y', color: 'bg-red-600 text-white', url: 'youtube.com' },
    { name: 'Reddit*', icon: 'R', color: 'bg-orange-600 text-white', url: 'reddit.com' },
  ];

  const discoveryItems = [
    "What's happening in tech today?",
    "Best productivity hacks for 2024",
    "Hidden gems in Tokyo",
    "How does quantum computing work?"
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-gradient-to-b from-[#0a0a0a] to-black">
      {/* Branding */}
      <div className="flex flex-col items-center pt-16 pb-12 px-8 text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-indigo-600/20 ring-1 ring-white/10">
          <Zap className="w-10 h-10 text-white fill-current" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Hello Net</h1>
        <p className="text-slate-500 text-sm max-w-[240px]">The browser that thinks before it renders.</p>
      </div>

      {/* Speed Dial / Favorites */}
      <div className="grid grid-cols-4 gap-y-8 gap-x-4 px-6 mb-12">
        {shortcuts.map(site => (
          <button 
            key={site.name}
            onClick={() => onNavigate(site.url)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`w-14 h-14 ${site.color} rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg group-active:scale-90 transition-transform relative`}>
              {site.icon}
              {site.name.includes('*') && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-black font-bold">!</span>
                </div>
              )}
            </div>
            <span className="text-[11px] font-medium text-slate-400">{site.name.replace('*', '')}</span>
          </button>
        ))}
      </div>

      {/* Info about blocked sites */}
      <div className="px-6 mb-8">
        <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-400">Smart Browsing</span>
          </div>
          <p className="text-xs text-slate-500">
            Sites marked with ! automatically use AI Reader for the best experience.
          </p>
        </div>
      </div>

      {/* AI Discovery Feed */}
      <div className="px-6 pb-20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Intelligent Discovery</h2>
        </div>
        
        <div className="space-y-4">
          {discoveryItems.map((item, i) => (
            <button 
              key={i}
              onClick={() => onNavigate(item)}
              className="w-full text-left p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group active:bg-white/10"
            >
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{item}</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};