# 🚀 Git Setup and Push Guide

## Step 1: Initialize Git Repository

```bash
git init
```

## Step 2: Add All Files

```bash
git add .
```

## Step 3: Create Initial Commit

```bash
git commit -m "Initial commit: Hello Net Browser with Express.js backend

Features:
- AI-powered mobile browser with React frontend
- Express.js backend for proxy functionality
- Advanced features: bookmarks, settings, search suggestions
- Mobile-optimized browsing with CORS bypass
- Full tab management and navigation history
- Gemini AI integration for content analysis"
```

## Step 4: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click "New repository" (+ icon in top right)
3. Name it: `hello-net-browser`
4. Description: `AI-powered mobile browser with Express.js backend`
5. Keep it Public (or Private if you prefer)
6. Don't initialize with README (we already have one)
7. Click "Create repository"

## Step 5: Add Remote Origin

Replace `yourusername` with your actual GitHub username:

```bash
git remote add origin https://github.com/yourusername/hello-net-browser.git
```

## Step 6: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

## Alternative: Using GitHub CLI (if installed)

```bash
# Create repo and push in one command
gh repo create hello-net-browser --public --source=. --remote=origin --push
```

## Step 7: Verify Upload

Visit your repository at:
`https://github.com/yourusername/hello-net-browser`

## 🔧 Future Updates

After making changes:

```bash
git add .
git commit -m "Description of your changes"
git push
```

## 📝 Common Git Commands

```bash
# Check status
git status

# See what changed
git diff

# View commit history
git log --oneline

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Merge branch
git merge feature-name
```

## 🚀 Deploy to Vercel (Optional)

1. Connect your GitHub repo to Vercel
2. Set environment variable: `GEMINI_API_KEY`
3. Deploy automatically on every push

## 📦 What's Being Pushed

Your repository will include:
- ✅ React frontend with all components
- ✅ Express.js backend server
- ✅ All new features (bookmarks, settings, etc.)
- ✅ Documentation and setup guides
- ✅ Package.json files for both frontend and backend
- ✅ TypeScript configurations
- ✅ Git ignore file (excludes node_modules, .env files)

## 🔐 Security Note

The `.gitignore` file excludes:
- `.env.local` (your API keys stay private)
- `node_modules/` (dependencies)
- Build files and logs

Your Gemini API key will NOT be pushed to GitHub! ✅