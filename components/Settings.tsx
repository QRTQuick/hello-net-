import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, X, Moon, Sun, Zap, Shield, Download, Trash2, Info, Globe } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingsData {
  theme: 'dark' | 'light' | 'auto';
  proxyMode: 'auto' | 'always' | 'never';
  aiMode: 'auto' | 'manual';
  saveHistory: boolean;
  blockAds: boolean;
  mobileOptimization: boolean;
}

export const Settings: React.FC<SettingsProps> = ({
  isOpen,
  onClose
}) => {
  const [settings, setSettings] = useState<SettingsData>({
    theme: 'dark',
    proxyMode: 'auto',
    aiMode: 'auto',
    saveHistory: true,
    blockAds: true,
    mobileOptimization: true
  });

  const [storageUsage, setStorageUsage] = useState({
    bookmarks: 0,
    history: 0,
    cache: 0
  });

  useEffect(() => {
    if (isOpen) {
      // Load settings
      const saved = localStorage.getItem('hello-net-settings');
      if (saved) {
        setSettings({ ...settings, ...JSON.parse(saved) });
      }

      // Calculate storage usage
      const bookmarks = localStorage.getItem('hello-net-bookmarks') || '[]';
      const history = localStorage.getItem('hello-net-recent-searches') || '[]';
      
      setStorageUsage({
        bookmarks: new Blob([bookmarks]).size,
        history: new Blob([history]).size,
        cache: 0 // Placeholder for cache size
      });
    }
  }, [isOpen]);

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('hello-net-settings', JSON.stringify(newSettings));
  };

  const clearData = (type: 'bookmarks' | 'history' | 'all') => {
    if (type === 'bookmarks' || type === 'all') {
      localStorage.removeItem('hello-net-bookmarks');
    }
    if (type === 'history' || type === 'all') {
      localStorage.removeItem('hello-net-recent-searches');
    }
    
    // Recalculate storage usage
    const bookmarks = type === 'bookmarks' || type === 'all' ? '[]' : localStorage.getItem('hello-net-bookmarks') || '[]';
    const history = type === 'history' || type === 'all' ? '[]' : localStorage.getItem('hello-net-recent-searches') || '[]';
    
    setStorageUsage({
      bookmarks: new Blob([bookmarks]).size,
      history: new Blob([history]).size,
      cache: 0
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in fade-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold">Settings</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Appearance */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-400" />
            Appearance
          </h3>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-slate-400">Choose your preferred theme</p>
              </div>
              <select
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Browsing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Browsing
          </h3>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Proxy Mode</p>
                <p className="text-sm text-slate-400">When to use proxy for blocked sites</p>
              </div>
              <select
                value={settings.proxyMode}
                onChange={(e) => updateSetting('proxyMode', e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
              >
                <option value="auto">Auto</option>
                <option value="always">Always</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mobile Optimization</p>
                <p className="text-sm text-slate-400">Optimize pages for mobile viewing</p>
              </div>
              <button
                onClick={() => updateSetting('mobileOptimization', !settings.mobileOptimization)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.mobileOptimization ? 'bg-indigo-600' : 'bg-slate-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.mobileOptimization ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Block Ads</p>
                <p className="text-sm text-slate-400">Remove advertisements from pages</p>
              </div>
              <button
                onClick={() => updateSetting('blockAds', !settings.blockAds)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.blockAds ? 'bg-indigo-600' : 'bg-slate-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.blockAds ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* AI Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            AI Features
          </h3>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">AI Reader Mode</p>
                <p className="text-sm text-slate-400">Automatically suggest AI reader for complex pages</p>
              </div>
              <select
                value={settings.aiMode}
                onChange={(e) => updateSetting('aiMode', e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
              >
                <option value="auto">Auto</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            Privacy
          </h3>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Save History</p>
                <p className="text-sm text-slate-400">Keep track of your browsing history</p>
              </div>
              <button
                onClick={() => updateSetting('saveHistory', !settings.saveHistory)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.saveHistory ? 'bg-indigo-600' : 'bg-slate-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.saveHistory ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Download className="w-5 h-5 text-orange-400" />
            Storage
          </h3>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Bookmarks</p>
                <p className="text-sm text-slate-400">{formatBytes(storageUsage.bookmarks)}</p>
              </div>
              <button
                onClick={() => clearData('bookmarks')}
                className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Search History</p>
                <p className="text-sm text-slate-400">{formatBytes(storageUsage.history)}</p>
              </div>
              <button
                onClick={() => clearData('history')}
                className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => clearData('all')}
                className="w-full py-2 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            About
          </h3>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-lg mb-2">Hello Net Browser</h4>
              <p className="text-sm text-slate-400 mb-4">
                AI-powered mobile browser with proxy capabilities
              </p>
              <p className="text-xs text-slate-500">
                Version 1.0.0 • Built with React & Express.js
              </p>
            </div>
          </div>
        </div>
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