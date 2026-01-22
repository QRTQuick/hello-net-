# 🚀 Deploy Hello Net Browser

## 📋 Deployment Options

### **Option 1: Frontend-Only Deployment (Vercel) - Recommended for Demo**

Deploy just the React frontend to Vercel. This provides:
- ✅ Fast global CDN deployment
- ✅ Basic iframe browsing (works for many sites)
- ✅ AI Reader mode with Gemini AI
- ✅ All UI features (bookmarks, settings, etc.)
- ❌ No proxy for blocked sites (Google, YouTube, etc.)

### **Option 2: Full-Stack Deployment (Railway/Render)**

Deploy both frontend and Express.js backend for full functionality:
- ✅ Complete proxy functionality
- ✅ Access to ALL websites including blocked ones
- ✅ Content extraction and mobile optimization
- ✅ Advanced search suggestions
- 💰 Requires paid hosting for backend

## 🌐 Option 1: Vercel Frontend Deployment

### **Prerequisites**
- GitHub repository (✅ Already done!)
- Vercel account (free)
- Gemini API key

### **Steps**

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub
3. **Import Project** → Select your `hello-net-` repository
4. **Configure Project:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Add Environment Variables:**
   - Key: `GEMINI_API_KEY`
   - Value: Your actual Gemini API key

6. **Deploy!** 🚀

### **What Works in Frontend-Only Mode:**
- ✅ Browse sites that allow iframe embedding
- ✅ AI Reader mode with Gemini AI
- ✅ Bookmarks and settings
- ✅ Search suggestions (basic)
- ✅ Tab management
- ✅ Mobile-optimized interface

### **Limitations:**
- ❌ Can't access Google, YouTube, Facebook (iframe blocked)
- ❌ No content extraction for AI
- ❌ No mobile optimization for sites

## 🚀 Option 2: Full-Stack Deployment

### **Railway Deployment (Recommended)**

1. **Go to [Railway.app](https://railway.app)**
2. **Connect GitHub** repository
3. **Deploy Backend:**
   - Select `server` folder
   - Set start command: `npm start`
   - Add environment variables
4. **Deploy Frontend:**
   - Select root folder
   - Framework: Vite
   - Add backend URL to environment

### **Render Deployment**

1. **Go to [Render.com](https://render.com)**
2. **Create Web Service** for backend
3. **Create Static Site** for frontend
4. **Configure environment variables**

## ⚙️ Environment Variables

### **Frontend (.env.local)**
```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_BACKEND_URL=https://your-backend-url.com  # Only for full-stack
```

### **Backend (server/.env)**
```env
NODE_ENV=production
PORT=8000
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🔧 Local Development

### **Full-Stack (Recommended for Development)**
```bash
# Start everything
python start-express.py

# Or manually:
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend  
npm install
npm run dev
```

### **Frontend-Only**
```bash
npm install
npm run dev
```

## 📱 Testing Your Deployment

### **Frontend-Only Checklist:**
- [ ] Home page loads
- [ ] Can navigate to Wikipedia, Stack Overflow
- [ ] AI Reader works with Gemini API
- [ ] Bookmarks save/load
- [ ] Settings persist
- [ ] Search suggestions appear

### **Full-Stack Checklist:**
- [ ] All frontend features work
- [ ] Can access Google, YouTube via proxy
- [ ] Content extraction works
- [ ] Mobile optimization applies
- [ ] Backend status shows "Online"

## 🐛 Troubleshooting

### **Vercel Build Errors**
- Check `vercel.json` configuration
- Verify environment variables are set
- Check build logs for specific errors

### **API Key Issues**
- Ensure `GEMINI_API_KEY` is set in Vercel dashboard
- Test API key locally first
- Check API key has proper permissions

### **CORS Issues**
- Frontend-only: Expected for blocked sites
- Full-stack: Check backend CORS configuration

## 🎯 Recommended Approach

**For Demo/Portfolio:** Use Option 1 (Vercel frontend-only)
- Fast deployment
- Free hosting
- Shows off the UI and AI features
- Good for showcasing your work

**For Production Use:** Use Option 2 (Full-stack)
- Complete functionality
- Can access any website
- Better user experience
- Requires paid hosting

## 🔗 Quick Deploy Links

- **Vercel:** [Deploy to Vercel](https://vercel.com/new)
- **Railway:** [Deploy to Railway](https://railway.app)
- **Render:** [Deploy to Render](https://render.com)

Your Hello Net Browser is ready for deployment! 🌐