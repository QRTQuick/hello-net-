// Frontend-only mode for Vercel deployment
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? null // No backend in production, use direct iframe
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
   * Proxy a website through the Express.js backend (development only)
   */
  async proxyWebsite(url: string): Promise<ProxyResponse> {
    if (!BACKEND_URL) {
      return {
        success: false,
        error: 'Proxy service not available in production. Use direct iframe or run local backend.'
      };
    }

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
   * Extract clean text content from a website (development only)
   */
  async extractContent(url: string): Promise<ExtractedContent | null> {
    if (!BACKEND_URL) {
      // Fallback for production - return basic info
      return {
        url,
        title: 'Content Extraction Unavailable',
        content: 'Content extraction requires the Express.js backend. Run locally for full features.',
        description: '',
        keywords: '',
        author: '',
        length: 0,
        wordCount: 0,
        status: 'backend-unavailable'
      };
    }

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
   * Get website metadata (development only)
   */
  async getMetadata(url: string): Promise<WebsiteMetadata | null> {
    if (!BACKEND_URL) {
      return null;
    }

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
   * Get search suggestions (fallback for production)
   */
  async getSearchSuggestions(query: string): Promise<SearchSuggestions | null> {
    if (!BACKEND_URL) {
      // Simple fallback suggestions for production
      const suggestions = [
        `${query} site:wikipedia.org`,
        `${query} tutorial`,
        `${query} guide`,
        `how to ${query}`,
        `${query} examples`
      ];
      
      return {
        query,
        suggestions,
        timestamp: new Date().toISOString()
      };
    }

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
    if (!BACKEND_URL) {
      return false;
    }

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
    if (!BACKEND_URL) {
      return {
        available: false,
        message: 'Running in frontend-only mode. Start local Express.js server for full features.'
      };
    }

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
        message: 'Backend is not available. Start the Express.js server for full features.'
      };
    }
  }
};