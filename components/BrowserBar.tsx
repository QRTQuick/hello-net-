import React, { useState, useEffect, useRef } from 'react';
import { Search, ShieldCheck, X, MoreHorizontal, Clock, TrendingUp } from 'lucide-react';
import { proxyService } from '../services/proxyService';

interface BrowserBarProps {
  activeTabUrl: string;
  inputValue: string;
  setInputValue: (value: string) => void;
  onNavigate: (input: string) => void;
}

export const BrowserBar: React.FC<BrowserBarProps> = ({
  activeTabUrl,
  inputValue,
  setInputValue,
  onNavigate
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hello-net-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Get search suggestions
  useEffect(() => {
    const getSuggestions = async () => {
      if (inputValue.length > 2 && !inputValue.includes('.')) {
        try {
          const result = await proxyService.getSearchSuggestions(inputValue);
          if (result) {
            setSuggestions(result.suggestions);
          }
        } catch (error) {
          console.error('Failed to get suggestions:', error);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(getSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (value: string) => {
    // Save to recent searches if it's a search query
    if (!value.includes('.')) {
      const newRecent = [value, ...recentSearches.filter(s => s !== value)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('hello-net-recent-searches', JSON.stringify(newRecent));
    }
    
    onNavigate(value);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSubmit(suggestion);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('hello-net-recent-searches');
  };

  return (
    <div className="pt-safe-area bg-[#0a0a0a] border-b border-white/5 px-4 py-3 flex items-center gap-3 relative">
      <div className="flex-1 relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          {activeTabUrl === 'hello://home' ? (
            <Search className="w-4 h-4 text-slate-500" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          )}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(inputValue); }}>
          <input 
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={(e) => {
              e.target.select();
              setShowSuggestions(true);
            }}
            placeholder="Search or enter address"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:bg-white/10 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
          />
        </form>
        {inputValue && (
           <button 
            onClick={() => setInputValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white z-10"
           >
             <X className="w-4 h-4" />
           </button>
        )}

        {/* Search Suggestions Dropdown */}
        {showSuggestions && (inputValue.length > 0 || recentSearches.length > 0) && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && inputValue.length === 0 && (
              <div className="p-3 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Recent</span>
                  </div>
                  <button 
                    onClick={clearRecentSearches}
                    className="text-xs text-slate-500 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Suggestions</span>
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Search className="w-3 h-3 text-slate-500" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <button className="p-2 text-slate-400 hover:text-white transition-colors">
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
  );
};