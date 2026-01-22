# 🚀 Deploy Hello Net Browser to Vercel

This guide shows how to deploy your Hello Net Browser to Vercel with serverless API functions.

## ✅ **Yes, Vercel Supports This!**

Vercel has excellent support for:
- ✅ **Node.js/Express.js** serverless functions
- ✅ **React** frontend hosting
- ✅ **API routes** in the `/api` directory
- ✅ **Environment variables** for API keys
- ✅ **Custom domains** and SSL certificates

## 🏗️ **Architecture on Vercel**

```
Frontend (React)     →  Vercel Edge Network
API Functions        →  Vercel Serverless Functions
/api/proxy          →  Website proxy with CORS bypass
/api/extract        →  Content extraction for AI
/api/health         →  Health check endpoint
```

## 📁 **Project Structure for Vercel**

```
hello-net/
├── api/                    # Vercel API functions
│   ├── proxy.js           # Website proxy endpoint
│   ├── extract.js         # Content extraction endpoint
│   └── health.js          # Health check endpoint
├── components/            # React components
├── services/              # Frontend services
├── public/               # Static assets
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies
└── .env.local            # Environment variables
```

## 🚀 **Deploy to Vercel**

### **Option 1: Deploy with Vercel CLI**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add GEMINI_API_KEY
   ```

### **Option 2: Deploy with GitHub**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables in the dashboard

3. **Environment Variables:**
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## ⚙️ **Vercel Configuration**

The `vercel.json` file configures:

```json
{
  "functions": {
    "api/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

## 🔧 **API Endpoints on Vercel**

Once deployed, your API endpoints will be:

- **Proxy:** `https://your-app.vercel.app/api/proxy?url=https://google.com`
- **Extract:** `https://your-app.vercel.app/api/extract?url=https://example.com`
- **Health:** `https://your-app.vercel.app/api/health`

## 🌐 **Frontend Configuration**

The `proxyService.ts` automatically detects the environment:

```typescript
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.vercel.app'  // Your Vercel URL
  : 'http://localhost:3000';            // Local development
```

## 📝 **Deployment Checklist**

- [ ] All API functions in `/api` directory
- [ ] `vercel.json` configuration file
- [ ] Environment variables set in Vercel dashboard
- [ ] Updated `proxyService.ts` with correct URLs
- [ ] Dependencies in `package.json`
- [ ] Git repository connected to Vercel

## 🎯 **Benefits of Vercel Deployment**

✅ **Serverless** - No server management needed  
✅ **Global CDN** - Fast worldwide performance  
✅ **Auto-scaling** - Handles traffic spikes automatically  
✅ **HTTPS** - SSL certificates included  
✅ **Custom domains** - Use your own domain  
✅ **Environment variables** - Secure API key storage  
✅ **Git integration** - Auto-deploy on push  

## 🔍 **Testing Your Deployment**

1. **Frontend:** Visit your Vercel URL
2. **API Health:** `https://your-app.vercel.app/api/health`
3. **Proxy Test:** Try browsing to google.com in your app
4. **AI Reader:** Test the AI content extraction

## 🐛 **Troubleshooting**

### **Function Timeout**
- Vercel has a 10-second timeout for Hobby plan
- Upgrade to Pro for 60-second timeout if needed

### **Memory Limits**
- 1024MB memory limit on Hobby plan
- Optimize large HTML processing if needed

### **CORS Issues**
- Check `vercel.json` CORS headers
- Verify API endpoint URLs in `proxyService.ts`

## 🚀 **Ready to Deploy!**

Your Hello Net Browser is now ready for Vercel deployment with full serverless backend support!