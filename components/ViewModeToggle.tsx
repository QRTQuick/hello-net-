import React, { useState, useEffect } from 'react';
import { Globe, Sparkles, RefreshCw, ExternalLink, Bookmark, Share2, Download, Eye, EyeOff, Zap } from 'lucide-react';
import { proxyService } from '../services/proxyService';

interface ViewModeToggleProps {
  viewMode: 'web' | 'ai';
  onSetViewMode: (mode: 'web' | 'ai') => void;
  onSwitchToAI: () => void;
  onRefresh: () => void;
  activeTabUrl: string;
  activeTabTitle: string;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onSetViewMode,
  onSwitchToAI,
  onRefresh,
  activeTabUrl,
  activeTabTitle
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showReaderMode, setShowReaderMode] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check backend status
  useEffect(() => {
    const checkStatus = async () => {
      const status = await proxyService.getStatus();
      setBackendStatus(status.available ? 'online' : 'offline');
    };
    checkStatus();
  }, []);

  // Check if page is bookmarked
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('hello-net-bookmarks') || '[]');
    setIsBookmarked(bookmarks.some((b: any) => b.url === activeTabUrl));
  }, [activeTabUrl]);

  // Check if reader mode should be available
  useEffect(() => {
    setShowReaderMode(activeTabUrl !== 'hello://home' && !activeTabUrl.includes('search://'));
  }, [activeTabUrl]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('hello-net-bookmarks') || '[]');
    
    if (isBookmarked) {
      const filtered = bookmarks.filter((b: any) => b.url !== activeTabUrl);
      localStorage.setItem('hello-net-bookmarks', JSON.stringify(filtered));
      setIsBookmarked(false);
    } else {
      const newBookmark = {
        url: activeTabUrl,
        title: activeTabTitle,
        timestamp: new Date().toISOString()
      };
      bookmarks.unshift(newBookmark);
      localStorage.setItem('hello-net-bookmarks', JSON.stringify(bookmarks.slice(0, 50))); // Keep only 50 bookmarks
      setIsBookmarked(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeTabTitle,
          url: activeTabUrl
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(activeTabUrl);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadPage = async () => {
    try {
      const result = await proxyService.extractContent(activeTabUrl);
      if (result) {
        const content = `# ${result.title}\n\n${result.description}\n\n${result.content}`;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download page:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-[#0a0a0a] border-b border-white/5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSetViewMode('web')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
            viewMode === 'web' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-3 h-3" />
          Web View
        </button>
        
        {showReaderMode && (
          <button
            onClick={onSwitchToAI}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              viewMode === 'ai' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            AI Reader
          </button>
        )}

        {/* Backend Status Indicator */}
        <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
          backendStatus === 'online' ? 'bg-green-600/20 text-green-400' :
          backendStatus === 'offline' ? 'bg-red-600/20 text-red-400' :
          'bg-yellow-600/20 text-yellow-400'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            backendStatus === 'online' ? 'bg-green-400' :
            backendStatus === 'offline' ? 'bg-red-400' :
            'bg-yellow-400 animate-pulse'
          }`} />
          {backendStatus === 'online' ? 'Online' : 
           backendStatus === 'offline' ? 'Offline' : 'Checking'}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {/* Bookmark Button */}
        {activeTabUrl !== 'hello://home' && (
          <button
            onClick={toggleBookmark}
            className={`p-2 transition-colors ${
              isBookmarked ? 'text-yellow-400' : 'text-slate-400 hover:text-white'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Download Button */}
        {activeTabUrl !== 'hello://home' && (
          <button
            onClick={downloadPage}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Download page content"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Share Button */}
        {activeTabUrl !== 'hello://home' && (
          <button
            onClick={handleShare}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Share page"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title="Refresh page"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* External Link Button */}
        {activeTabUrl !== 'hello://home' && (
          <button
            onClick={() => window.open(activeTabUrl, '_blank')}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};