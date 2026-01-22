# Hello Net Browser

An AI-powered mobile browser with Express.js backend for bypassing CORS restrictions and providing enhanced browsing experiences.

## 🌟 Features

- **Real Web Browsing**: Navigate to actual websites with iframe support and proxy fallback
- **AI Reader Mode**: Intelligent content analysis and summarization using Gemini AI
- **Express.js Backend**: Full-featured Node.js backend for proxy functionality
- **Mobile-Optimized**: Responsive design optimized for mobile devices
- **Advanced Features**: Bookmarks, settings, search suggestions, download capabilities
- **Smart Browsing**: Automatic fallbacks for blocked sites with mobile optimization

## 🏗️ Architecture

### **Frontend (React + TypeScript)**
- Modern React 19 with TypeScript
- Modular component architecture
- Tailwind CSS for styling
- Custom hooks for state management
- Advanced features: bookmarks, settings, search suggestions

### **Backend (Express.js + Node.js)**
- Express.js web server for proxy functionality
- Content extraction and mobile optimization
- CORS handling for cross-origin requests
- Rate limiting and security features
- Comprehensive API endpoints

## 🚀 Quick Start

### **Automatic Startup (Recommended)**
```bash
python start-express.py
```

This will automatically:
- Install all Express.js backend dependencies
- Install all React frontend dependencies
- Start the Express.js backend (port 8000)
- Start the React frontend (port 3000)
- Open the browser automatically

### **Manual Setup**

#### **Backend Setup**
```bash
cd server
npm install
npm run dev
```

#### **Frontend Setup**
```bash
npm install
npm run dev
```

## 📋 Prerequisites

- **Node.js 16+** with npm
- **Python 3.7+** (for startup script)
- **Modern web browser**

## 🔧 Configuration

### **Environment Variables**
Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your free Gemini API key from [ai.google.dev](https://ai.google.dev)

## 🌐 API Endpoints

The Express.js backend provides:

- `GET /health` - Backend health check and status
- `GET /api/proxy?url=<url>` - Proxy websites with mobile optimization
- `GET /api/extract?url=<url>` - Extract clean text content for AI
- `GET /api/metadata?url=<url>` - Get website metadata (title, description, etc.)
- `GET /api/search?q=<query>` - Get search suggestions

## 📱 Features Overview

### **🔍 Enhanced Search**
- Real-time search suggestions
- Recent search history
- Smart dropdown interface
- Clear search history option

### **🔖 Bookmarks System**
- Add/remove bookmarks with one click
- Full bookmarks management panel
- Bookmark organization and search
- Export bookmarks functionality

### **⚙️ Advanced Settings**
- Theme customization (Dark/Light/Auto)
- Proxy mode configuration
- Privacy controls
- Storage management
- Mobile optimization toggles

### **🎛️ Rich Toolbar**
- Backend status indicator
- Download page content
- Share functionality
- Bookmark quick access
- Refresh and external link options

### **📱 Mobile Navigation**
- 6-button bottom navigation
- Working back/forward with history
- Tab management with counter
- Quick access to all features

## 🛠️ Development

### **Project Structure**
```
hello-net/
├── components/          # React components
│   ├── BrowserBar.tsx   # Enhanced search bar
│   ├── HomePage.tsx     # Home page with shortcuts
│   ├── WebView.tsx      # Web viewing with proxy support
│   ├── AIReader.tsx     # AI-powered content reader
│   ├── Bookmarks.tsx    # Bookmark management
│   ├── Settings.tsx     # Settings panel
│   └── ...
├── hooks/              # Custom React hooks
├── services/           # API services
├── utils/              # Utility functions
├── server/             # Express.js backend
│   ├── server.js       # Main Express server
│   └── package.json    # Backend dependencies
├── types.ts            # TypeScript definitions
└── App.tsx             # Main application
```

### **Adding New Features**
1. Create components in `components/`
2. Add services in `services/`
3. Update types in `types.ts`
4. Add backend endpoints in `server/server.js`

## 🚀 Deployment

### **Vercel Deployment**
The app is ready for Vercel deployment with serverless functions:

```bash
npm i -g vercel
vercel
```

### **Environment Variables for Production**
Set in Vercel dashboard or deployment platform:
- `GEMINI_API_KEY` - Your Gemini AI API key

## 🐛 Troubleshooting

### **Backend Issues**
- Ensure Node.js 16+ is installed
- Check if port 8000 is available
- Verify all dependencies are installed: `cd server && npm install`

### **Frontend Issues**
- Ensure Node.js 16+ is installed
- Check if port 3000 is available
- Clear npm cache: `npm cache clean --force`

### **CORS Issues**
- Make sure the Express.js backend is running
- Check backend health at `http://localhost:8000/health`
- Verify CORS configuration in `server/server.js`

## 🔒 Security Features

- Iframe sandboxing for security
- CORS handling through Express.js backend
- Content sanitization and mobile optimization
- Rate limiting to prevent abuse
- Secure API key management
- Helmet.js security headers

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## 🙏 Acknowledgments

- Built with React, TypeScript, and Express.js
- Uses Gemini AI for intelligent content analysis
- Inspired by modern mobile browser experiences
- Mobile-first design principles

---

**🌐 Hello Net Browser** - The browser that thinks before it renders.
