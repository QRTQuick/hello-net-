// Use Express.js backend endpoints
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.vercel.app' 
  : 'http://localhost:8000';

export interface ProxyResponse {
  success: boolean;
  content?: string;
  error?: string;
  title?: string;
}

export interface ExtractedContent {
  url: string;
  title: string;
  content: string;
  description: string;
  keywords: string;
  author: string;
  length: number;
  wordCount: number;
  status: string;
  extractedAt?: string;
}

export interface WebsiteMetadata {
  url: string;
  title: string;
  description: string;
  keywords: string;
  author: string;
  image: string;
  siteName: string;
  type: string;
  locale: string;
  favicon: string;
  canonical: string;
  robots: string;
  viewport: string;
  charset: string;
  language: string;
  generator: string;
  theme: string;
  extractedAt: string;
}

export interface SearchSuggestions {
  query: string;
  suggestions: string[];
  timestamp: string;
}

export const proxyService = {
  /**
   * Proxy a website through the Express.js backend
   */
  async proxyWebsite(url: string): Promise<ProxyResponse> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/proxy?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      return {
        success: true,
        content
      };
    } catch (error) {
      console.error('Proxy error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Extract clean text content from a website
   */
  async extractContent(url: string): Promise<ExtractedContent | null> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/extract?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Extract error:', error);
      return null;
    }
  },

  /**
   * Get website metadata (title, description, images, etc.)
   */
  async getMetadata(url: string): Promise<WebsiteMetadata | null> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/metadata?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Metadata error:', error);
      return null;
    }
  },

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string): Promise<SearchSuggestions | null> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Search suggestions error:', error);
      return null;
    }
  },

  /**
   * Check if backend is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get detailed backend status
   */
  async getStatus(): Promise<{ available: boolean; message: string; details?: any }> {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      
      if (response.ok) {
        const details = await response.json();
        return {
          available: true,
          message: 'Express.js backend is running',
          details
        };
      } else {
        return {
          available: false,
          message: 'Backend is not responding'
        };
      }
    } catch (error) {
      return {
        available: false,
        message: 'Backend is not available. Please start the Express.js server.'
      };
    }
  }
};