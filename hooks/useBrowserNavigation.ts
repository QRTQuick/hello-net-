import { useState, useCallback, useEffect } from 'react';
import { Tab } from '../types';

export const useBrowserNavigation = (tabs: Tab[], activeTabId: string, setTabs: React.Dispatch<React.SetStateAction<Tab[]>>) => {
  const [historyIndex, setHistoryIndex] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const updateNavigationState = useCallback(() => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) {
      setCanGoBack(historyIndex > 0);
      setCanGoForward(historyIndex < tab.history.length - 1);
    }
  }, [tabs, activeTabId, historyIndex]);

  const updateHistory = useCallback((url: string) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? {
      ...t,
      history: [...t.history.slice(0, historyIndex + 1), url]
    } : t));
    setHistoryIndex(prev => prev + 1);
  }, [activeTabId, historyIndex, setTabs]);

  const goBack = useCallback(() => {
    if (canGoBack && historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const tab = tabs.find(t => t.id === activeTabId);
      if (tab && tab.history[newIndex]) {
        const url = tab.history[newIndex];
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url } : t));
      }
    }
  }, [canGoBack, historyIndex, tabs, activeTabId, setTabs]);

  const goForward = useCallback(() => {
    if (canGoForward) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const tab = tabs.find(t => t.id === activeTabId);
      if (tab && tab.history[newIndex]) {
        const url = tab.history[newIndex];
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url } : t));
      }
    }
  }, [canGoForward, historyIndex, tabs, activeTabId, setTabs]);

  // Update navigation state when dependencies change
  useEffect(() => {
    updateNavigationState();
  }, [updateNavigationState]);

  // Reset history index when switching tabs
  useEffect(() => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) {
      setHistoryIndex(tab.history.length - 1);
    }
  }, [activeTabId, tabs]);

  return {
    historyIndex,
    canGoBack,
    canGoForward,
    updateHistory,
    updateNavigationState,
    goBack,
    goForward,
    setHistoryIndex,
    setCanGoBack,
    setCanGoForward
  };
};