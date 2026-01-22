import React, { useRef, useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, ExternalLink, AlertCircle } from 'lucide-react';
import { Tab } from '../types';
import { proxyService } from '../services/proxyService';

interface WebViewProps {
  activeTab: Tab;
  iframeError: boolean;
  isBlockedSite: (url: string) => boolean;
  onSwitchToAI: () => void;
  onTabUpdate: (updates: Partial<Tab>) => void;
  onIframeError: (error: boolean) => void;
}

export const WebView: React.FC<WebViewProps> = ({
  activeTab,
  iframeError,
  isBlockedSite,
  onSwitchToAI,
  onTabUpdate,
  onIframeError
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [useProxy, setUseProxy] = useState(false);
  const [proxyContent, setProxyContent] = useState<string>('');
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);

  // Check backend availability on mount
  useEffect(() => {
    const checkBackend = async () => {
      const status = await proxyService.getStatus();
      setBackendAvailable(status.available);
    };
    checkBackend();
  }, []);

  // Load content through proxy when needed
  useEffect(() => {
    const loadThroughProxy = async () => {
      if (useProxy && activeTab.url !== 'hello://home' && backendAvailable) {
        onTabUpdate({ isLoading: true });
        
        const result = await proxyService.proxyWebsite(activeTab.url);
        
        if (result.success && result.content) {
          setProxyContent(result.content);
          onIframeError(false);
        } else {
          onIframeError(true);
        }
        
        onTabUpdate({ isLoading: false });
      }
    };

    loadThroughProxy();
  }, [useProxy, activeTab.url, backendAvailable, onTabUpdate, onIframeError]);

  const handleTryProxy = () => {
    setUseProxy(true);
  };

  if (iframeError || isBlockedSite(activeTab.url)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8 text-yellow-500" />
        </div>
        <h3 className="text-xl font-bold mb-4">Enhanced Security Site</h3>
        <p className="text-slate-400 mb-6 max-w-md">
          This site uses enhanced security settings. Choose an option below for the best experience.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={onSwitchToAI}
            className="px-6 py-3 bg-indigo-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Use AI Reader
          </button>
          
          {backendAvailable && !useProxy && (
            <button
              onClick={handleTryProxy}
              className="px-6 py-3 bg-green-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Try Proxy Mode
            </button>
          )}
          
          <button
            onClick={() => window.open(activeTab.url, '_blank')}
            className="px-6 py-3 bg-white/10 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </button>
        </div>
        
        {backendAvailable === false && (
          <div className="mt-6 p-4 bg-orange-600/10 border border-orange-600/20 rounded-xl max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Backend Offline</span>
            </div>
            <p className="text-xs text-slate-400">
              Start the Python backend for enhanced browsing capabilities.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      {activeTab.isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
            <p className="text-slate-400 text-sm">
              Loading {activeTab.url.replace('https://', '').replace('http://', '').split('/')[0]}...
            </p>
          </div>
        </div>
      )}
      
      {useProxy && proxyContent ? (
        <iframe
          ref={iframeRef}
          srcDoc={proxyContent}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          onLoad={() => {
            onTabUpdate({ isLoading: false });
            onIframeError(false);
          }}
          onError={() => {
            onTabUpdate({ isLoading: false });
            onIframeError(true);
          }}
        />
      ) : (
        <iframe
          ref={iframeRef}
          src={activeTab.url}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          allow="geolocation; microphone; camera; midi; encrypted-media; fullscreen"
          loading="lazy"
          onLoad={() => {
            onTabUpdate({ isLoading: false });
            onIframeError(false);
            // Try to get the page title from iframe (if same-origin)
            try {
              const iframeDoc = iframeRef.current?.contentDocument;
              if (iframeDoc?.title) {
                onTabUpdate({ title: iframeDoc.title });
              }
            } catch (e) {
              // Cross-origin, can't access title
            }
          }}
          onError={() => {
            onTabUpdate({ isLoading: false });
            onIframeError(true);
          }}
        />
      )}
    </div>
  );
};