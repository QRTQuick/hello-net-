
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Home, 
  MoreHorizontal,
  Sparkles,
  X,
  Globe,
  Share,
  Star,
  ShieldCheck,
  Zap,
  ExternalLink,
  RefreshCw,
  Lock
} from 'lucide-react';
import { Tab, ChatMessage, SearchResult } from './types';
import { searchWithGemini, summarizePage } from './services/gemini';

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', url: 'hello://home', title: 'Hello Net', isLoading: false, history: ['hello://home'] }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [isTabSwitcherOpen, setIsTabSwitcherOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [pageContent, setPageContent] = useState<{ text: string; sources: SearchResult[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'web' | 'ai'>('web'); // New state for view mode
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const inputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isValidUrl = (string: string) => {
    try {
      new URL(string.startsWith('http') ? string : `https://${string}`);
      return true;
    } catch (_) {
      return false;
    }
  };

  const updateHistory = (url: string) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? {
      ...t,
      history: [...t.history.slice(0, historyIndex + 1), url]
    } : t));
    setHistoryIndex(prev => prev + 1);
    updateNavigationState();
  };

  const updateNavigationState = () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) {
      setCanGoBack(historyIndex > 0);
      setCanGoForward(historyIndex < tab.history.length - 1);
    }
  };

  const goBack = () => {
    if (canGoBack) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const tab = tabs.find(t => t.id === activeTabId);
      if (tab && tab.history[newIndex]) {
        const url = tab.history[newIndex];
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url } : t));
        setInputValue(url.replace('https://', '').replace('http://', ''));
        updateNavigationState();
      }
    }
  };

  const goForward = () => {
    if (canGoForward) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const tab = tabs.find(t => t.id === activeTabId);
      if (tab && tab.history[newIndex]) {
        const url = tab.history[newIndex];
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url } : t));
        setInputValue(url.replace('https://', '').replace('http://', ''));
        updateNavigationState();
      }
    }
  };

  const refreshPage = () => {
    if (activeTab.url !== 'hello://home') {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: true } : t));
      
      // Force iframe reload
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
      
      setTimeout(() => {
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
      }, 1000);
    }
  };

  const navigateTo = async (input: string) => {
    if (!input.trim()) return;
    
    let targetUrl = input;
    const containsDot = input.includes('.') && !input.includes(' ');
    const isUrl = containsDot || input.startsWith('http');
    
    if (!isUrl) {
      // It's a search query
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(input)}`;
      setViewMode('web');
    } else {
      // It's a URL
      if (!input.startsWith('http')) {
        targetUrl = `https://${input}`;
      }
      setViewMode('web');
    }

    // Update tab immediately
    setTabs(prev => prev.map(t => t.id === activeTabId ? {
      ...t,
      url: targetUrl,
      title: isUrl ? input : `Search: ${input}`,
      isLoading: true
    } : t));

    setInputValue(targetUrl.replace('https://', '').replace('http://', ''));
    setIsReadingMode(false);
    setPageContent(null);
    
    // Add to history if it's a new navigation
    if (targetUrl !== activeTab.url) {
      updateHistory(targetUrl);
    }

    // Simulate loading time
    setTimeout(() => {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
    }, 1500);
  };

  const switchToAIMode = async () => {
    if (activeTab.url === 'hello://home') return;
    
    setViewMode('ai');
    setIsProcessing(true);
    
    const query = activeTab.url.includes('google.com/search') 
      ? decodeURIComponent(activeTab.url.split('q=')[1]?.split('&')[0] || '')
      : `Summarize and explain the website: ${activeTab.url}`;
    
    const result = await searchWithGemini(query);
    setPageContent(result);
    setIsReadingMode(true);
    setIsProcessing(false);
  };

  const createNewTab = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newTab = { id: newId, url: 'hello://home', title: 'New Tab', isLoading: false, history: ['hello://home'] };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setPageContent(null);
    setIsReadingMode(false);
    setInputValue('');
    setIsTabSwitcherOpen(false);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      const newId = Math.random().toString(36).substr(2, 9);
      setTabs([{ id: newId, url: 'hello://home', title: 'Hello Net', isLoading: false, history: ['hello://home'] }]);
      setActiveTabId(newId);
      return;
    }
    const filtered = tabs.filter(t => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[0].id);
    }
  };

  const goHome = () => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: 'hello://home', title: 'Hello Net' } : t));
    setPageContent(null);
    setIsReadingMode(false);
    setViewMode('web');
    setInputValue('');
    setHistoryIndex(0);
    setCanGoBack(false);
    setCanGoForward(false);
  };

  // Update navigation state when active tab changes
  useEffect(() => {
    updateNavigationState();
  }, [activeTabId, historyIndex]);

  // Update input value when tab URL changes
  useEffect(() => {
    if (activeTab.url !== 'hello://home') {
      setInputValue(activeTab.url.replace('https://', '').replace('http://', ''));
    } else {
      setInputValue('');
    }
  }, [activeTab.url]);

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-slate-100 overflow-hidden font-sans">
      
      {/* Top Browser Bar (Omnibox) */}
      <div className="pt-safe-area bg-[#0a0a0a] border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {activeTab.url === 'hello://home' ? (
              <Search className="w-4 h-4 text-slate-500" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); navigateTo(inputValue); }}>
            <input 
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="Search or enter address"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:bg-white/10 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
            />
          </form>
          {inputValue && (
             <button 
              onClick={() => setInputValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
             >
               <X className="w-4 h-4" />
             </button>
          )}
        </div>
        <button className="p-2 text-slate-400">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-black">
        {activeTab.url === 'hello://home' ? (
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
              {[
                { name: 'Google', icon: 'G', color: 'bg-white text-black', url: 'google.com' },
                { name: 'YouTube', icon: 'Y', color: 'bg-red-600 text-white', url: 'youtube.com' },
                { name: 'Twitter', icon: '𝕏', color: 'bg-black border border-white/20', url: 'x.com' },
                { name: 'OpenAI', icon: 'A', color: 'bg-emerald-600', url: 'openai.com' },
                { name: 'Amazon', icon: 'a', color: 'bg-orange-500', url: 'amazon.com' },
                { name: 'Reddit', icon: 'R', color: 'bg-orange-600', url: 'reddit.com' },
                { name: 'Netflix', icon: 'N', color: 'bg-red-700', url: 'netflix.com' },
                { name: 'Github', icon: 'Git', color: 'bg-slate-800', url: 'github.com' },
              ].map(site => (
                <button 
                  key={site.name}
                  onClick={() => navigateTo(site.url)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-14 h-14 ${site.color} rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg group-active:scale-90 transition-transform`}>
                    {site.icon}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{site.name}</span>
                </button>
              ))}
            </div>

            {/* AI Discovery Feed */}
            <div className="px-6 pb-20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Intelligent Discovery</h2>
              </div>
              <div className="space-y-4">
                {[
                  "What's happening in tech today?",
                  "Best productivity hacks for 2024",
                  "Hidden gems in Tokyo",
                  "How does quantum computing work?"
                ].map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => navigateTo(item)}
                    className="w-full text-left p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group active:bg-white/10"
                  >
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{item}</span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col bg-slate-900">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] border-b border-white/5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('web')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'web' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3 h-3 inline mr-1" />
                  Web View
                </button>
                <button
                  onClick={switchToAIMode}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'ai' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  AI Reader
                </button>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={refreshPage}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.open(activeTab.url, '_blank')}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            {viewMode === 'web' ? (
              <div className="flex-1 relative">
                {activeTab.isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
                      <p className="text-slate-400 text-sm">Loading {activeTab.url.replace('https://', '').replace('http://', '').split('/')[0]}...</p>
                    </div>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={activeTab.url}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                  allow="geolocation; microphone; camera; midi; encrypted-media; fullscreen"
                  loading="lazy"
                  onLoad={() => {
                    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
                    // Try to get the page title from iframe (if same-origin)
                    try {
                      const iframeDoc = iframeRef.current?.contentDocument;
                      if (iframeDoc?.title) {
                        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, title: iframeDoc.title } : t));
                      }
                    } catch (e) {
                      // Cross-origin, can't access title
                    }
                  }}
                  onError={() => {
                    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
                  }}
                />
                
                {/* Fallback message for blocked iframes */}
                <div className="absolute bottom-4 left-4 right-4 bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-3 text-xs text-yellow-400 hidden" id="iframe-blocked">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Some sites block embedding. Try opening in a new tab or use AI Reader mode.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {isProcessing ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                    <p className="text-slate-400 animate-pulse">Hello Net is analyzing this page...</p>
                  </div>
                ) : isReadingMode && pageContent ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-2xl mx-auto px-6 py-10">
                      <div className="flex items-center gap-2 mb-6 p-2 bg-indigo-600/10 rounded-full w-fit pr-4">
                        <div className="bg-indigo-600 p-1 rounded-full"><Sparkles className="w-3 h-3" /></div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">AI Reading Mode</span>
                      </div>
                      <h1 className="text-3xl font-bold mb-8 leading-tight">{activeTab.title}</h1>
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
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-600 italic">
                    Switch to AI Reader to analyze this page.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Browser Navigation */}
      <div className="px-4 py-2 bg-[#0a0a0a] border-t border-white/5 flex flex-col gap-2 pb-safe-area">
        <div className="flex items-center justify-between">
          <button 
            onClick={goBack}
            className={`p-3 transition-colors ${canGoBack ? 'text-slate-300 hover:text-white' : 'text-slate-600 opacity-50'}`}
            disabled={!canGoBack}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={goForward}
            className={`p-3 transition-colors ${canGoForward ? 'text-slate-300 hover:text-white' : 'text-slate-600 opacity-50'}`}
            disabled={!canGoForward}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <button 
            onClick={goHome}
            className={`p-3 transition-colors ${activeTab.url === 'hello://home' ? 'text-indigo-500' : 'text-slate-500 hover:text-white'}`}
          >
            <Home className="w-6 h-6" />
          </button>

          <button 
            onClick={() => setIsTabSwitcherOpen(true)}
            className="relative p-3 text-slate-500 hover:text-white transition-colors"
          >
            <div className="w-6 h-6 border-2 border-current rounded-md flex items-center justify-center text-[10px] font-bold">
              {tabs.length}
            </div>
          </button>

          <button 
            onClick={() => {
              if (navigator.share && activeTab.url !== 'hello://home') {
                navigator.share({
                  title: activeTab.title,
                  url: activeTab.url
                });
              }
            }}
            className="p-3 text-slate-500 hover:text-white transition-colors"
          >
            <Share className="w-6 h-6" />
          </button>
        </div>
        
        {/* iOS style home indicator */}
        <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-1 mb-1"></div>
      </div>

      {/* Tab Switcher */}
      {isTabSwitcherOpen && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col p-6 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Tabs</h2>
            <div className="flex items-center gap-2">
               <button 
                onClick={createNewTab}
                className="p-3 bg-white/5 rounded-full text-indigo-400 active:scale-90 transition-transform"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsTabSwitcherOpen(false)}
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
                onClick={() => { setActiveTabId(tab.id); setIsTabSwitcherOpen(false); }}
                className={`group aspect-[3/4.5] rounded-3xl overflow-hidden relative border-2 transition-all active:scale-95 ${activeTabId === tab.id ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-[1.02]' : 'border-white/10'}`}
              >
                {/* Tab Preview Chrome */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 backdrop-blur-md flex items-center justify-between px-3 z-10">
                  <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[80px] text-slate-300">
                    {tab.title}
                  </span>
                  <button 
                    onClick={(e) => closeTab(tab.id, e)}
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
              onClick={() => setIsTabSwitcherOpen(false)}
              className="px-10 py-4 bg-indigo-600 rounded-2xl font-bold shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
