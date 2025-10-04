# 🚀 Movie Recommendation System - Deployment Guide

## Quick Setup for Your College Project

This guide will help you deploy your movie website so you can:
- ✅ Share a live link with your college
- ✅ Make changes and see them update automatically
- ✅ Use GitHub for version control
- ✅ Get automatic deployments on every change

---

## Step 1: Set Up GitHub Repository

### 1.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - Movie Recommendation System"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** button (top right) → **"New repository"**
3. Name it: `movie-recommendation-system`
4. Keep it **Public** (so you can share it easily)
5. **Don't** initialize with README (we already have code)
6. Click **"Create repository"**

### 1.3 Push Your Code to GitHub
```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/movie-recommendation-system.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel (FREE & Automatic)

### Why Vercel?
- ✅ **Free forever** for personal projects
- ✅ **Automatic deployments** from GitHub
- ✅ **Super fast** global CDN
- ✅ **Perfect for Next.js** (built by the same team)
- ✅ **HTTPS by default**

### 2.1 Sign Up for Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your repositories

### 2.2 Import Your Project
1. On Vercel dashboard, click **"Add New Project"**
2. Find your `movie-recommendation-system` repository
3. Click **"Import"**

### 2.3 Configure Environment Variables
In the Vercel import screen, add these environment variables:

**Required:**
```
TMDB_API_KEY=your_tmdb_api_key_here
```

**How to get TMDB API Key:**
1. Go to [themoviedb.org](https://www.themoviedb.org/)
2. Sign up for a free account
3. Go to Settings → API → Request API Key
4. Choose "Developer" option
5. Fill in the form (use your college project details)
6. Copy the **API Key (v3 auth)**

### 2.4 Deploy!
1. Click **"Deploy"**
2. Wait 1-2 minutes for the build to complete
3. You'll get a live URL like: `https://movie-recommendation-system-abc123.vercel.app`

---

## Step 3: Making Changes & Seeing Them Live

### The Workflow (Super Easy!)

1. **Make changes** to your code locally
2. **Test locally** with `npm run dev`
3. **Commit changes**:
   ```bash
   git add .
   git commit -m "Updated movie card design"
   ```
4. **Push to GitHub**:
   ```bash
   git push
   ```
5. **Vercel automatically deploys** (takes ~1 minute)
6. **Your live site updates automatically!** 🎉

### Example Changes You Might Make:

**Change the website title:**
- Edit `src/app/page.tsx`
- Find "MovieHub" and change it to your preferred name
- Commit and push → Live site updates!

**Change colors:**
- Edit `src/app/globals.css`
- Modify the color variables in `:root` or `.dark`
- Commit and push → See your new colors live!

**Add new features:**
- Create new components or pages
- Commit and push → New features go live!

---

## Step 4: Sharing with Your College

### Your Live URLs
After deployment, Vercel gives you:
- **Production URL**: `https://your-project.vercel.app`
- **GitHub URL**: `https://github.com/YOUR_USERNAME/movie-recommendation-system`

### What to Share:
1. **Live Website**: Share the Vercel URL for people to use
2. **Source Code**: Share the GitHub URL to show your code
3. **Deployment Dashboard**: Show Vercel dashboard for deployment stats

### For Your Project Presentation:
```
📱 Live Demo: https://your-project.vercel.app
💻 Source Code: https://github.com/YOUR_USERNAME/movie-recommendation-system
🚀 Deployments: Automatic via GitHub integration
```

---

## Step 5: Custom Domain (Optional but Impressive!)

Want `movies.yourname.com` instead of `xyz.vercel.app`?

1. Buy a domain from [Namecheap](https://namecheap.com) or [Google Domains](https://domains.google) (~$10/year)
2. In Vercel dashboard → Your project → Settings → Domains
3. Add your custom domain
4. Follow Vercel's DNS setup instructions
5. Done! Your site is now at your custom domain

---

## Troubleshooting

### Build Failed?
- Check the error message in Vercel dashboard
- Make sure `TMDB_API_KEY` is set in environment variables
- Try building locally: `npm run build`

### Environment Variables Not Working?
- In Vercel: Project Settings → Environment Variables
- Add them there and redeploy

### Want to Update Environment Variables?
1. Go to Vercel dashboard → Your project
2. Settings → Environment Variables
3. Update the value
4. Redeploy (or push a new commit)

---

## Development Workflow Summary

### Local Development (Testing)
```bash
npm run dev
# Opens http://localhost:3000
# Make changes and test them
```

### Deployment (Going Live)
```bash
git add .
git commit -m "Your change description"
git push
# Vercel automatically deploys!
# Check your live URL in 1-2 minutes
```

---

## Project Features to Highlight

Your movie recommendation system includes:
- ✨ **Modern UI** with SpaceX-inspired minimal design
- 🎬 **TMDB Integration** with 500,000+ movies
- 🔍 **Real-time Search** with instant results
- 🎯 **Genre Filtering** across 19+ categories
- ⭐ **Movie Details** with cast, crew, ratings
- 📝 **Review System** for user feedback
- 🤖 **AI Recommendations** powered by OpenAI
- 📱 **Fully Responsive** works on all devices
- ⚡ **Lightning Fast** with Next.js 15
- 🌙 **Dark Mode** with beautiful gradients

---

## Need Help?

### Common Questions:

**Q: How do I update the site?**
A: Just push to GitHub, Vercel deploys automatically!

**Q: Is it really free?**
A: Yes! Vercel is free for personal projects forever.

**Q: Can I show this in my resume?**
A: Absolutely! Include both the live URL and GitHub repo.

**Q: What if I break something?**
A: Vercel keeps all your deployments. You can rollback anytime!

---

## 🎓 For Your College Submission

### Project Documentation Template:

```
Project Title: Movie Recommendation System
Technology Stack: Next.js 15, React, TypeScript, Tailwind CSS
External APIs: TMDB API, OpenAI API
Features: Search, Filter, Recommendations, Reviews, Details
Live Demo: [Your Vercel URL]
Source Code: [Your GitHub URL]
Deployment: Vercel (CI/CD with GitHub integration)
```

### Screenshots to Include:
1. Homepage with movie grid
2. Search functionality
3. Movie details dialog
4. Reviews page
5. AI recommendations page
6. Mobile responsive view

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy to Vercel
3. ✅ Add TMDB API key
4. ✅ Test your live URL
5. ✅ Share with your college
6. 🎉 Present your project!

**Good luck with your college project! 🚀**