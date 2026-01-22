export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string.startsWith('http') ? string : `https://${string}`);
    return true;
  } catch (_) {
    return false;
  }
};

export const isBlockedSite = (url: string, blockedSites: Set<string>): boolean => {
  const domain = url.replace('https://', '').replace('http://', '').split('/')[0];
  return Array.from(blockedSites).some(blocked => domain.includes(blocked));
};

export const formatUrlForDisplay = (url: string): string => {
  return url.replace('https://', '').replace('http://', '');
};

export const generateTabId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};