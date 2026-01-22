import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Mobile-friendly CSS injection
const mobileCSS = `
<style>
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 16px !important;
    line-height: 1.5 !important;
    margin: 0 !important;
    padding: 10px !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
  }
  * { 
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  img { 
    max-width: 100% !important;
    height: auto !important;
  }
  table { 
    width: 100% !important;
    font-size: 14px !important;
  }
  .container, .wrapper, .content {
    max-width: 100% !important;
    padding: 5px !important;
  }
  iframe, embed, object {
    display: none !important;
  }
</style>
`;

function optimizeForMobile(html, baseUrl) {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Remove problematic elements
    const elementsToRemove = document.querySelectorAll('script, noscript, iframe, embed, object');
    elementsToRemove.forEach(el => el.remove());
    
    // Add viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      document.head?.appendChild(viewport);
    }
    
    // Add mobile CSS
    const style = document.createElement('style');
    style.textContent = mobileCSS.replace('<style>', '').replace('</style>', '');
    document.head?.appendChild(style);
    
    // Fix relative URLs
    const links = document.querySelectorAll('a[href], img[src], link[href]');
    links.forEach(el => {
      const attr = el.hasAttribute('href') ? 'href' : 'src';
      const url = el.getAttribute(attr);
      if (url && !url.startsWith('http') && !url.startsWith('//')) {
        try {
          const absoluteUrl = new URL(url, baseUrl).href;
          el.setAttribute(attr, absoluteUrl);
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });
    
    return dom.serialize();
  } catch (error) {
    console.error('Error optimizing HTML:', error);
    return html;
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
      usage: '/api/proxy?url=https://example.com'
    });
  }
  
  try {
    // Validate and normalize URL
    let targetUrl = url;
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://${targetUrl}`;
    }
    
    // Fetch the website with mobile user agent
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
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
      const optimizedHtml = optimizeForMobile(html, targetUrl);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(optimizedHtml);
    } else {
      // For non-HTML content, proxy as-is
      const buffer = await response.buffer();
      res.setHeader('Content-Type', contentType);
      return res.send(buffer);
    }
    
  } catch (error) {
    console.error('Proxy error:', error);
    
    // Return a user-friendly error page
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hello Net - Error</title>
        ${mobileCSS}
      </head>
      <body>
        <div style="text-align: center; padding: 40px 20px;">
          <h1 style="color: #ef4444;">Unable to Load Page</h1>
          <p style="color: #64748b; margin: 20px 0;">
            Sorry, we couldn't load <strong>${url}</strong>
          </p>
          <p style="color: #64748b; font-size: 14px;">
            Error: ${error.message}
          </p>
          <button onclick="history.back()" style="
            background: #6366f1; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 8px; 
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
          ">
            Go Back
          </button>
        </div>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(errorHtml);
  }
}