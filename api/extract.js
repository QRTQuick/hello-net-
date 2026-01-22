import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function extractTextContent(html) {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Remove script and style elements
    const elementsToRemove = document.querySelectorAll('script, style, nav, header, footer, aside');
    elementsToRemove.forEach(el => el.remove());
    
    // Get title
    const titleElement = document.querySelector('title');
    const title = titleElement ? titleElement.textContent.trim() : 'Untitled';
    
    // Try to find main content areas
    const contentSelectors = [
      'main', 'article', '.content', '.main-content', 
      '.post-content', '.entry-content', '#content', '#main'
    ];
    
    let mainContent = '';
    
    for (const selector of contentSelectors) {
      const contentElement = document.querySelector(selector);
      if (contentElement) {
        mainContent = contentElement.textContent || '';
        break;
      }
    }
    
    // Fallback to body content
    if (!mainContent) {
      const body = document.querySelector('body');
      if (body) {
        mainContent = body.textContent || '';
      }
    }
    
    // Clean up text
    mainContent = mainContent
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit content length
    if (mainContent.length > 5000) {
      mainContent = mainContent.substring(0, 5000) + '...';
    }
    
    return {
      title,
      content: mainContent,
      length: mainContent.length
    };
  } catch (error) {
    console.error('Error extracting content:', error);
    return {
      title: 'Error',
      content: 'Failed to extract content from this page.',
      length: 0
    };
  }
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'OK' });
  }
  
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ 
      error: 'URL parameter is required',
      usage: '/api/extract?url=https://example.com'
    });
  }
  
  try {
    // Validate and normalize URL
    let targetUrl = url;
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://${targetUrl}`;
    }
    
    // Fetch the website
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HelloNet/1.0; +https://hello-net.vercel.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 30000,
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/html')) {
      const html = await response.text();
      const extracted = extractTextContent(html);
      
      return res.json({
        url: targetUrl,
        title: extracted.title,
        content: extracted.content,
        length: extracted.length,
        status: 'success'
      });
    } else {
      return res.json({
        url: targetUrl,
        title: 'Non-HTML Content',
        content: `This is a ${contentType} file.`,
        length: 0,
        status: 'non-html'
      });
    }
    
  } catch (error) {
    console.error('Extract error:', error);
    
    return res.status(500).json({
      error: error.message,
      url: url,
      status: 'error'
    });
  }
}