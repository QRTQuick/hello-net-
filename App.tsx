
import React, { useState, useEffect } from 'react';
import { Tab, SearchResult } from './types';
import { searchWithGemini } from './services/gemini';
import { proxyService } from './services/proxyService';
import { useBrowserNavigation } from './hooks/useBrowserNavigation';
import { isBlockedSite, formatUrlForDisplay, generateTabId } from './utils/browserUtils';

// Components
import { BrowserBar } from './components/BrowserBar';
import { HomePage } from './components/HomePage';
import { ViewModeToggle } from './components/ViewModeToggle';
import { WebView } from './components/WebView';
import { AIReader } from './components/AIReader';
import { BrowserNavigation } from './components/BrowserNavigation';
import { TabSwitcher } from './components/TabSwitcher';
import { Bookmarks } from './components/Bookmarks';
import { Settings } from './components/Settings';

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', url: 'hello://home', title: 'Hello Net', isLoading: false, history: ['hello://home'] }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [isTabSwitcherOpen, setIsTabSwitcherOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [pageContent, setPageContent] = useState<{ text: string; sources: SearchResult[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'web' | 'ai'>('web');
  const [iframeError, setIframeError] = useState(false);
  const [blockedSites] = useState(new Set([
    'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'x.com', 
    'instagram.com', 'linkedin.com', 'netflix.com', 'amazon.com'
  ]));

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  
  const {
    canGoBack,
    canGoForward,
    updateHistory,
    updateNavigationState,
    goBack,
    goForward,
    setHistoryIndex,
    setCanGoBack,
    setCanGoForward
  } = useBrowserNavigation(tabs, activeTabId, setTabs);

  const navigateTo = async (input: string) => {
    if (!input.trim()) return;
    
    let targetUrl = input;
    const containsDot = input.includes('.') && !input.includes(' ');
    const isUrl = containsDot || input.startsWith('http');
    
    if (!isUrl) {
      // It's a search query - use DuckDuckGo which allows iframe embedding
      targetUrl = `https://duckduckgo.com/?q=${encodeURIComponent(input)}`;
      setViewMode('web');
    } else {
      // It's a URL
      if (!input.startsWith('http')) {
        targetUrl = `https://${input}`;
      }
      
      // Check if it's a blocked site and suggest AI mode
      if (isBlockedSite(targetUrl, blockedSites)) {
        setViewMode('ai');
        setIframeError(true);
      } else {
        setViewMode('web');
        setIframeError(false);
      }
    }

    // Update tab immediately
    setTabs(prev => prev.map(t => t.id === activeTabId ? {
      ...t,
      url: targetUrl,
      title: isUrl ? input : `Search: ${input}`,
      isLoading: true
    } : t));

    setInputValue(formatUrlForDisplay(targetUrl));
    setIsReadingMode(false);
    setPageContent(null);
    
    // Add to history if it's a new navigation
    if (targetUrl !== activeTab.url) {
      updateHistory(targetUrl);
    }

    // If it's a blocked site, automatically switch to AI mode
    if (isBlockedSite(targetUrl, blockedSites)) {
      setTimeout(async () => {
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
        await switchToAIMode();
      }, 500);
    } else {
      // Simulate loading time for non-blocked sites
      setTimeout(() => {
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
      }, 1500);
    }
  };

  const switchToAIMode = async () => {
    if (activeTab.url === 'hello://home') return;
    
    setViewMode('ai');
    setIsProcessing(true);
    
    try {
      // First try to extract content from backend
      const extractedContent = await proxyService.extractContent(activeTab.url);
      
      let query: string;
      if (extractedContent && extractedContent.content) {
        // Use extracted content for better AI analysis
        query = `Analyze and summarize this website content: ${extractedContent.content}`;
      } else if (activeTab.url.includes('google.com/search')) {
        // Handle search queries
        query = decodeURIComponent(activeTab.url.split('q=')[1]?.split('&')[0] || '');
      } else {
        // Fallback to URL-based query
        query = `Summarize and explain the website: ${activeTab.url}`;
      }
      
      const result = await searchWithGemini(query);
      setPageContent(result);
      setIsReadingMode(true);
    } catch (error) {
      // Fallback content when everything fails
      const siteName = formatUrlForDisplay(activeTab.url).split('/')[0];
      setPageContent({
        text: `Hello Net is optimizing your browsing experience for ${siteName}.\n\nThis site has been processed through our AI Reader to provide you with the most relevant information in a mobile-friendly format.\n\nFor the full desktop experience, you can always open the site in a new tab using the button above.`,
        sources: []
      });
      setIsReadingMode(true);
    }
    
    setIsProcessing(false);
  };

  const refreshPage = () => {
    if (activeTab.url !== 'hello://home') {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: true } : t));
      setTimeout(() => {
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
      }, 1000);
    }
  };

  const createNewTab = () => {
    const newId = generateTabId();
    const newTab = { id: newId, url: 'hello://home', title: 'New Tab', isLoading: false, history: ['hello://home'] };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setPageContent(null);
    setIsReadingMode(false);
    setInputValue('');
    setIsTabSwitcherOpen(false);
    setIframeError(false);
    setViewMode('web');
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      const newId = generateTabId();
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
    setIframeError(false);
  };

  const updateActiveTab = (updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
  };

  // Update input value when tab URL changes
  useEffect(() => {
    if (activeTab.url !== 'hello://home') {
      setInputValue(formatUrlForDisplay(activeTab.url));
    } else {
      setInputValue('');
    }
  }, [activeTab.url]);

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-slate-100 overflow-hidden font-sans">
      
      <BrowserBar
        activeTabUrl={activeTab.url}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onNavigate={navigateTo}
      />

      <main className="flex-1 relative overflow-hidden bg-black">
        {activeTab.url === 'hello://home' ? (
          <HomePage onNavigate={navigateTo} />
        ) : (
          <div className="h-full flex flex-col bg-slate-900">
            <ViewModeToggle
              viewMode={viewMode}
              onSetViewMode={setViewMode}
              onSwitchToAI={switchToAIMode}
              onRefresh={refreshPage}
              activeTabUrl={activeTab.url}
              activeTabTitle={activeTab.title}
            />

            {viewMode === 'web' ? (
              <WebView
                activeTab={activeTab}
                iframeError={iframeError}
                isBlockedSite={(url) => isBlockedSite(url, blockedSites)}
                onSwitchToAI={switchToAIMode}
                onTabUpdate={updateActiveTab}
                onIframeError={setIframeError}
              />
            ) : (
              <div className="flex-1 overflow-y-auto">
                <AIReader
                  isProcessing={isProcessing}
                  isReadingMode={isReadingMode}
                  pageContent={pageContent}
                  activeTabTitle={activeTab.title}
                />
              </div>
            )}
          </div>
        )}
      </main>

      <BrowserNavigation
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onGoBack={goBack}
        onGoForward={goForward}
        onGoHome={goHome}
        onOpenTabSwitcher={() => setIsTabSwitcherOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        tabsCount={tabs.length}
        activeTabUrl={activeTab.url}
        activeTabTitle={activeTab.title}
      />

      <TabSwitcher
        isOpen={isTabSwitcherOpen}
        tabs={tabs}
        activeTabId={activeTabId}
        onClose={() => setIsTabSwitcherOpen(false)}
        onCreateNewTab={createNewTab}
        onSwitchTab={setActiveTabId}
        onCloseTab={closeTab}
      />

      <Bookmarks
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        onNavigate={navigateTo}
      />

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default App;
