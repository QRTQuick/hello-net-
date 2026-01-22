import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import * as cheerio from 'cheerio';
import UserAgent from 'user-agents';
import { body, query, validationResult } from 'express-validator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://hello-net.vercel.app',
    /\.vercel\.app$/,
    /localhost:\d+$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1,
    });
  }
};

// Mobile-optimized CSS
const MOBILE_CSS = `
<style>
  * { box-sizing: border-box !important; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 16px !important;
    line-height: 1.6 !important;
    margin: 0 !important;
    padding: 10px !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
    word-wrap: break-word !important;
  }
  img, video, iframe, embed, object { 
    max-width: 100% !important;
    height: auto !important;
  }
  table { 
    width: 100% !important;
    font-size: 14px !important;
    border-collapse: collapse !important;
  }
  .container, .wrapper, .content, .main {
    max-width: 100% !important;
    padding: 5px !important;
  }
  pre, code {
    white-space: pre-wrap !important;
    word-break: break-all !important;
  }
  /* Hide problematic elements */
  script, noscript, iframe[src*="ads"], .ad, .advertisement, 
  .popup, .modal, .overlay, .fixed-header, .sticky-nav {
    display: none !important;
  }
  /* Make buttons and links more touch-friendly */
  a, button, input, select, textarea {
    min-height: 44px !important;
    padding: 8px 12px !important;
  }
</style>
`;

// Utility functions
const getRandomUserAgent = () => {
  const userAgent = new UserAgent({ deviceCategory: 'mobile' });
  return userAgent.toString();
};

const optimizeHtmlForMobile = (html, baseUrl) => {
  try {
    const $ = cheerio.load(html);
    
    // Remove problematic elements
    $('script, noscript, iframe[src*="ads"], .ad, .advertisement').remove();
    
    // Add viewport meta tag
    if (!$('meta[name="viewport"]').length) {
      $('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">');
    }
    
    // Add mobile CSS
    $('head').append(MOBILE_CSS);
    
    // Fix relative URLs
    $('a[href], img[src], link[href], script[src]').each((i, elem) => {
      const $elem = $(elem);
      const attr = $elem.attr('href') ? 'href' : 'src';
      const url = $elem.attr(attr);
      
      if (url && !url.startsWith('http') && !url.startsWith('//') && !url.startsWith('data:')) {
        try {
          const absoluteUrl = new URL(url, baseUrl).href;
          $elem.attr(attr, absoluteUrl);
        } catch (e) {
          // Invalid URL, remove the attribute
          $elem.removeAttr(attr);
        }
      }
    });
    
    // Add Hello Net branding
    $('body').prepend(`
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 8px 12px; font-size: 12px; text-align: center; position: sticky; top: 0; z-index: 9999;">
        <span style="font-weight: bold;">📱 Hello Net Browser</span> - 
        <span style="opacity: 0.8;">Mobile Optimized</span>
      </div>
    `);
    
    return $.html();
  } catch (error) {
    console.error('HTML optimization error:', error);
    return html;
  }
};

const extractTextContent = (html) => {
  try {
    const $ = cheerio.load(html);
    
    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .ad, .advertisement').remove();
    
    // Get title
    const title = $('title').text().trim() || 'Untitled';
    
    // Try to find main content
    const contentSelectors = [
      'main', 'article', '.content', '.main-content', 
      '.post-content', '.entry-content', '#content', '#main',
      '.article-body', '.story-body'
    ];
    
    let mainContent = '';
    for (const selector of contentSelectors) {
      const content = $(selector).text();
      if (content && content.length > mainContent.length) {
        mainContent = content;
      }
    }
    
    // Fallback to body content
    if (!mainContent) {
      mainContent = $('body').text();
    }
    
    // Clean up text
    mainContent = mainContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    // Limit content length
    if (mainContent.length > 8000) {
      mainContent = mainContent.substring(0, 8000) + '...';
    }
    
    // Extract metadata
    const description = $('meta[name="description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';
    const author = $('meta[name="author"]').attr('content') || '';
    
    return {
      title,
      content: mainContent,
      description,
      keywords,
      author,
      length: mainContent.length,
      wordCount: mainContent.split(' ').length
    };
  } catch (error) {
    console.error('Content extraction error:', error);
    return {
      title: 'Error',
      content: 'Failed to extract content from this page.',
      description: '',
      keywords: '',
      author: '',
      length: 0,
      wordCount: 0
    };
  }
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'hello-net-express-backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: 'express.js'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hello Net Browser Backend',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      proxy: '/api/proxy?url=<url>',
      extract: '/api/extract?url=<url>',
      screenshot: '/api/screenshot?url=<url>',
      metadata: '/api/metadata?url=<url>',
      search: '/api/search?q=<query>'
    }
  });
});

// Website proxy endpoint
app.get('/api/proxy', [
  rateLimitMiddleware,
  query('url').isURL().withMessage('Valid URL is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { url } = req.query;
  
  try {
    let targetUrl = url;
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://${targetUrl}`;
    }
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
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
      const optimizedHtml = optimizeHtmlForMobile(html, targetUrl);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Proxied-By', 'Hello-Net-Browser');
      res.send(optimizedHtml);
    } else {
      // For non-HTML content, proxy as-is
      const buffer = await response.buffer();
      res.setHeader('Content-Type', contentType);
      res.setHeader('X-Proxied-By', 'Hello-Net-Browser');
      res.send(buffer);
    }
    
  } catch (error) {
    console.error('Proxy error:', error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hello Net - Error</title>
        ${MOBILE_CSS}
      </head>
      <body>
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border-radius: 12px; margin: 20px;">
          <h1 style="margin: 0 0 20px 0;">🚫 Unable to Load Page</h1>
          <p style="margin: 20px 0; opacity: 0.9;">
            Sorry, we couldn't load <strong>${url}</strong>
          </p>
          <p style="font-size: 14px; opacity: 0.7; margin: 20px 0;">
            Error: ${error.message}
          </p>
          <button onclick="history.back()" style="
            background: rgba(255,255,255,0.2); 
            color: white; 
            border: 2px solid rgba(255,255,255,0.3); 
            padding: 12px 24px; 
            border-radius: 8px; 
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
            backdrop-filter: blur(10px);
          ">
            ← Go Back
          </button>
        </div>
      </body>
      </html>
    `;
    
    res.status(500).setHeader('Content-Type', 'text/html; charset=utf-8').send(errorHtml);
  }
});

// Content extraction endpoint
app.get('/api/extract', [
  rateLimitMiddleware,
  query('url').isURL().withMessage('Valid URL is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { url } = req.query;
  
  try {
    let targetUrl = url;
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://${targetUrl}`;
    }
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
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
      
      res.json({
        url: targetUrl,
        ...extracted,
        status: 'success',
        extractedAt: new Date().toISOString()
      });
    } else {
      res.json({
        url: targetUrl,
        title: 'Non-HTML Content',
        content: `This is a ${contentType} file.`,
        description: '',
        keywords: '',
        author: '',
        length: 0,
        wordCount: 0,
        status: 'non-html'
      });
    }
    
  } catch (error) {
    console.error('Extract error:', error);
    res.status(500).json({
      error: error.message,
      url: url,
      status: 'error'
    });
  }
});

// Metadata extraction endpoint
app.get('/api/metadata', [
  rateLimitMiddleware,
  query('url').isURL().withMessage('Valid URL is required')
], async (req, res) => {
  const { url } = req.query;
  
  try {
    let targetUrl = url;
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://${targetUrl}`;
    }
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 15000,
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract comprehensive metadata
    const metadata = {
      url: targetUrl,
      title: $('title').text().trim() || '',
      description: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '',
      keywords: $('meta[name="keywords"]').attr('content') || '',
      author: $('meta[name="author"]').attr('content') || '',
      image: $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '',
      siteName: $('meta[property="og:site_name"]').attr('content') || '',
      type: $('meta[property="og:type"]').attr('content') || 'website',
      locale: $('meta[property="og:locale"]').attr('content') || 'en_US',
      favicon: $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || '/favicon.ico',
      canonical: $('link[rel="canonical"]').attr('href') || targetUrl,
      robots: $('meta[name="robots"]').attr('content') || '',
      viewport: $('meta[name="viewport"]').attr('content') || '',
      charset: $('meta[charset]').attr('charset') || 'utf-8',
      language: $('html').attr('lang') || 'en',
      generator: $('meta[name="generator"]').attr('content') || '',
      theme: $('meta[name="theme-color"]').attr('content') || '',
      extractedAt: new Date().toISOString()
    };
    
    // Fix relative URLs
    if (metadata.image && !metadata.image.startsWith('http')) {
      metadata.image = new URL(metadata.image, targetUrl).href;
    }
    if (metadata.favicon && !metadata.favicon.startsWith('http')) {
      metadata.favicon = new URL(metadata.favicon, targetUrl).href;
    }
    
    res.json(metadata);
    
  } catch (error) {
    console.error('Metadata error:', error);
    res.status(500).json({
      error: error.message,
      url: url,
      status: 'error'
    });
  }
});

// Search suggestions endpoint
app.get('/api/search', [
  rateLimitMiddleware,
  query('q').isLength({ min: 1 }).withMessage('Search query is required')
], async (req, res) => {
  const { q } = req.query;
  
  try {
    // Simple search suggestions (you can integrate with real search APIs)
    const suggestions = [
      `${q} site:wikipedia.org`,
      `${q} site:stackoverflow.com`,
      `${q} site:github.com`,
      `${q} news`,
      `${q} tutorial`,
      `${q} review`,
      `how to ${q}`,
      `what is ${q}`,
      `${q} vs`,
      `best ${q}`
    ].slice(0, 5);
    
    res.json({
      query: q,
      suggestions,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: error.message,
      query: q,
      status: 'error'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🌐 Hello Net Browser Backend (Express.js)
==========================================
🚀 Server running on: http://localhost:${PORT}
📚 API Documentation: http://localhost:${PORT}
🔧 Health Check: http://localhost:${PORT}/health
⚡ Environment: ${process.env.NODE_ENV || 'development'}
==========================================
  `);
});

export default app;