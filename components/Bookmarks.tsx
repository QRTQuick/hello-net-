import React, { useState, useEffect } from 'react';
import { Bookmark, X, Clock, ExternalLink, Trash2 } from 'lucide-react';

interface BookmarkItem {
  url: string;
  title: string;
  timestamp: string;
}

interface BookmarksProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (url: string) => void;
}

export const Bookmarks: React.FC<BookmarksProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      const saved = JSON.parse(localStorage.getItem('hello-net-bookmarks') || '[]');
      setBookmarks(saved);
    }
  }, [isOpen]);

  const removeBookmark = (url: string) => {
    const filtered = bookmarks.filter(b => b.url !== url);
    setBookmarks(filtered);
    localStorage.setItem('hello-net-bookmarks', JSON.stringify(filtered));
  };

  const clearAllBookmarks = () => {
    setBookmarks([]);
    localStorage.removeItem('hello-net-bookmarks');
  };

  const handleNavigate = (url: string) => {
    onNavigate(url);
    onClose();
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in fade-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-bold">Bookmarks</h2>
          <span className="text-sm text-slate-500">({bookmarks.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {bookmarks.length > 0 && (
            <button
              onClick={clearAllBookmarks}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              title="Clear all bookmarks"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bookmark className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-400 mb-2">No bookmarks yet</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Bookmark your favorite pages by clicking the bookmark icon in the toolbar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleNavigate(bookmark.url)}
                  >
                    <h3 className="font-medium text-white mb-1 group-hover:text-indigo-400 transition-colors">
                      {bookmark.title || 'Untitled'}
                    </h3>
                    <p className="text-sm text-slate-400 mb-2 truncate">
                      {bookmark.url.replace('https://', '').replace('http://', '')}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formatDate(bookmark.timestamp)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => window.open(bookmark.url, '_blank')}
                      className="p-2 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeBookmark(bookmark.url)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove bookmark"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={onClose}
          className="w-full py-3 bg-indigo-600 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};