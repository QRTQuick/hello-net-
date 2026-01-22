from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, Response
import httpx
import asyncio
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import re
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Hello Net Browser Backend", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HTTP client with proper headers
async def get_http_client():
    return httpx.AsyncClient(
        headers={
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        },
        timeout=30.0,
        follow_redirects=True
    )

def clean_html_for_mobile(html_content: str, base_url: str) -> str:
    """Clean and optimize HTML for mobile viewing"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove problematic elements
    for tag in soup.find_all(['script', 'noscript', 'iframe', 'embed', 'object']):
        tag.decompose()
    
    # Add mobile viewport if not present
    if not soup.find('meta', attrs={'name': 'viewport'}):
        viewport_meta = soup.new_tag('meta', attrs={
            'name': 'viewport',
            'content': 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        })
        if soup.head:
            soup.head.append(viewport_meta)
    
    # Add mobile-friendly CSS
    mobile_css = soup.new_tag('style')
    mobile_css.string = """
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
    """
    if soup.head:
        soup.head.append(mobile_css)
    
    # Fix relative URLs
    for tag in soup.find_all(['a', 'img', 'link', 'script']):
        for attr in ['href', 'src']:
            if tag.get(attr):
                tag[attr] = urljoin(base_url, tag[attr])
    
    return str(soup)

def extract_text_content(html_content: str) -> dict:
    """Extract clean text content from HTML for AI processing"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove script and style elements
    for script in soup(["script", "style", "nav", "header", "footer", "aside"]):
        script.decompose()
    
    # Get title
    title = soup.find('title')
    title_text = title.get_text().strip() if title else "Untitled"
    
    # Get main content
    main_content = ""
    
    # Try to find main content areas
    content_selectors = [
        'main', 'article', '.content', '.main-content', 
        '.post-content', '.entry-content', '#content', '#main'
    ]
    
    for selector in content_selectors:
        content_elem = soup.select_one(selector)
        if content_elem:
            main_content = content_elem.get_text(separator=' ', strip=True)
            break
    
    # Fallback to body content
    if not main_content:
        body = soup.find('body')
        if body:
            main_content = body.get_text(separator=' ', strip=True)
    
    # Clean up text
    main_content = re.sub(r'\s+', ' ', main_content).strip()
    
    # Limit content length
    if len(main_content) > 5000:
        main_content = main_content[:5000] + "..."
    
    return {
        "title": title_text,
        "content": main_content,
        "length": len(main_content)
    }

@app.get("/")
async def root():
    return {"message": "Hello Net Browser Backend", "status": "running"}

@app.get("/proxy")
async def proxy_website(url: str = Query(..., description="URL to proxy")):
    """Proxy a website and return mobile-optimized HTML"""
    try:
        # Validate URL
        parsed_url = urlparse(url)
        if not parsed_url.scheme:
            url = f"https://{url}"
        
        async with await get_http_client() as client:
            response = await client.get(url)
            response.raise_for_status()
            
            content_type = response.headers.get('content-type', '').lower()
            
            if 'text/html' in content_type:
                # Process HTML content
                cleaned_html = clean_html_for_mobile(response.text, url)
                return HTMLResponse(content=cleaned_html)
            else:
                # Return non-HTML content as-is
                return Response(
                    content=response.content,
                    media_type=content_type,
                    headers={"Access-Control-Allow-Origin": "*"}
                )
                
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"HTTP error: {e}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/extract")
async def extract_content(url: str = Query(..., description="URL to extract content from")):
    """Extract clean text content from a website for AI processing"""
    try:
        # Validate URL
        parsed_url = urlparse(url)
        if not parsed_url.scheme:
            url = f"https://{url}"
        
        async with await get_http_client() as client:
            response = await client.get(url)
            response.raise_for_status()
            
            content_type = response.headers.get('content-type', '').lower()
            
            if 'text/html' in content_type:
                extracted = extract_text_content(response.text)
                return {
                    "url": url,
                    "title": extracted["title"],
                    "content": extracted["content"],
                    "length": extracted["length"],
                    "status": "success"
                }
            else:
                return {
                    "url": url,
                    "title": "Non-HTML Content",
                    "content": f"This is a {content_type} file.",
                    "length": 0,
                    "status": "non-html"
                }
                
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"HTTP error: {e}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "hello-net-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)