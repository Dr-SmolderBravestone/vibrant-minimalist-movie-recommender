# 🚀 Movie Recommendation System - Deployment Guide

## Quick Setup for Your College Project

This guide will help you deploy your movie website so you can:
- ✅ Share a live link with your college
- ✅ Make changes and see them update automatically
- ✅ Use GitHub for version control
- ✅ Get automatic deployments on every change
- ✅ **Access database from any device**

---

## 🗄️ Step 0: Database Setup (IMPORTANT!)

**Before deploying, you need to set up your database.** This is crucial because your database will be accessible from anywhere!

### Quick Database Setup

```bash
# 1. Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# 2. Login to Turso
turso auth login

# 3. Create your database
turso db create movie-recommendation-db

# 4. Get your credentials
turso db show movie-recommendation-db --url
turso db tokens create movie-recommendation-db
```

**Copy the output** - you'll need these for `.env` and Vercel!

```env
TURSO_CONNECTION_URL=libsql://movie-db-xyz.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...your-token
```

### Why Turso?
- ✅ **Cloud-hosted** - accessible from ANY device
- ✅ **Free tier** - perfect for college projects
- ✅ **No server needed** - fully managed
- ✅ **Global** - fast everywhere
- ✅ **Easy sharing** - just share the credentials

**📚 For detailed database instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)**

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
TURSO_CONNECTION_URL=your_turso_connection_url
TURSO_AUTH_TOKEN=your_turso_auth_token
BETTER_AUTH_SECRET=your_generated_secret
```

**How to get each variable:**

#### 1. TMDB API Key
1. Go to [themoviedb.org](https://www.themoviedb.org/)
2. Sign up for a free account
3. Go to Settings → API → Request API Key
4. Choose "Developer" option
5. Fill in the form (use your college project details)
6. Copy the **API Key (v3 auth)**

#### 2. Turso Database Credentials
```bash
# Get connection URL
turso db show movie-recommendation-db --url

# Get auth token
turso db tokens create movie-recommendation-db
```

#### 3. Authentication Secret
```bash
# Generate a secure secret
openssl rand -base64 32
```

Or use this online generator: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

### 2.4 Deploy!
1. Click **"Deploy"**
2. Wait 1-2 minutes for the build to complete
3. You'll get a live URL like: `https://movie-recommendation-system-abc123.vercel.app`

---

## 🌍 Accessing Your Database from Any Device

### Your Database is Cloud-Hosted!

Unlike local databases, **Turso is hosted in the cloud**, which means:
- ✅ Access from your laptop, PC, tablet, anywhere!
- ✅ Share with team members easily
- ✅ No need to export/import database files
- ✅ Automatic backups

### Setting Up on a New Device

```bash
# 1. Clone your repository
git clone https://github.com/YOUR_USERNAME/movie-recommendation-system.git
cd movie-recommendation-system

# 2. Install dependencies
npm install

# 3. Create .env file with the SAME credentials
TURSO_CONNECTION_URL=libsql://movie-db-xyz.turso.io  # Same URL
TURSO_AUTH_TOKEN=eyJhbGc...same-token               # Same token
TMDB_API_KEY=your_tmdb_key
BETTER_AUTH_SECRET=your_secret

# 4. Run migrations (if needed)
npm run db:push

# 5. Start development
npm run dev
```

**That's it!** Your database is accessible because it's in the cloud.

### Sharing with Team Members

```bash
# Create a new token for a team member
turso db tokens create movie-recommendation-db

# Share with them:
# 1. The connection URL (from: turso db show movie-recommendation-db --url)
# 2. The new token
```

### Viewing Your Database

**Option 1: Drizzle Studio (Visual Editor)**
```bash
npm run db:studio
# Opens at https://local.drizzle.studio
```

**Option 2: Turso Web Dashboard**
Visit: [turso.tech/app](https://turso.tech/app)

**Option 3: Turso CLI**
```bash
turso db shell movie-recommendation-db
# SQL console
```

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
After deployment, you have:
- **Live Website**: `https://your-project.vercel.app`
- **GitHub URL**: `https://github.com/YOUR_USERNAME/movie-recommendation-system`
- **Database Dashboard**: `https://turso.tech/app` (show your database)

### What to Share:
1. **Live Website**: Share the Vercel URL for people to use
2. **Source Code**: Share the GitHub URL to show your code
3. **Database Info**: Explain you're using Turso (cloud database)
4. **Deployment Dashboard**: Show Vercel dashboard for deployment stats

### For Your Project Presentation:
```
📱 Live Demo: https://your-project.vercel.app
💻 Source Code: https://github.com/YOUR_USERNAME/movie-recommendation-system
🗄️ Database: Turso (Cloud-hosted SQLite)
🚀 Deployments: Automatic via GitHub + Vercel
✨ Features: 
   - 500K+ movies from TMDB
   - AI recommendations
   - User reviews & ratings
   - Social features (follow friends)
   - Cloud database (accessible anywhere)
```

### Demo on Any Device

**Show your project on:**
- 💻 Your laptop
- 📱 Your phone
- 🖥️ Lab computer
- 🏫 Presentation screen

Just open the Vercel URL - everything works because your database is in the cloud!

---

## Step 5: Custom Domain (Optional but Impressive!)

Want `movies.yourname.com` instead of `xyz.vercel.app`?

1. Buy a domain from [Namecheap](https://namecheap.com) or [Google Domains](https://domains.google) (~$10/year)
2. In Vercel dashboard → Your project → Settings → Domains
3. Add your custom domain
4. Follow Vercel's DNS setup instructions
5. Done! Your site is now at your custom domain

---

## Database Management Commands

### Quick Reference

```bash
# View all your databases
turso db list

# Get database info
turso db show movie-recommendation-db

# View database in browser
turso db shell movie-recommendation-db

# Backup database
turso db dump movie-recommendation-db > backup.sql

# View database stats
turso db show movie-recommendation-db --stats

# Create new access token
turso db tokens create movie-recommendation-db

# Revoke old token
turso db tokens revoke movie-recommendation-db <token>
```

### Database Migrations

```bash
# Development (local)
npm run db:push          # Push schema changes

# Production
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
```

---

## Troubleshooting

### Build Failed?
- Check the error message in Vercel dashboard
- Make sure ALL environment variables are set:
  - `TMDB_API_KEY`
  - `TURSO_CONNECTION_URL`
  - `TURSO_AUTH_TOKEN`
  - `BETTER_AUTH_SECRET`
- Try building locally: `npm run build`

### Database Connection Failed?
```bash
# 1. Verify your credentials
turso db show movie-recommendation-db

# 2. Test connection locally
npm run db:studio

# 3. Regenerate token if needed
turso db tokens create movie-recommendation-db
```

### Can't Access Database on New Device?
- ✅ Make sure you copied the `.env` file correctly
- ✅ Check that `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN` are set
- ✅ Run `npm run db:push` to sync schema
- ✅ Verify credentials: `turso auth login`

### Environment Variables Not Working?
- In Vercel: Project Settings → Environment Variables
- Add them there and redeploy
- Make sure there are no typos or extra spaces

### Want to Reset Database?
```bash
# Delete and recreate
turso db destroy movie-recommendation-db
turso db create movie-recommendation-db

# Get new credentials
turso db show movie-recommendation-db --url
turso db tokens create movie-recommendation-db

# Update .env and Vercel
# Run migrations
npm run db:push
```

---

## Development Workflow Summary

### Local Development (Testing)
```bash
npm run dev
# Opens http://localhost:3000
# Make changes and test them
# Database is accessible via Turso (cloud)
```

### Deployment (Going Live)
```bash
git add .
git commit -m "Your change description"
git push
# Vercel automatically deploys!
# Database is still the same (cloud-hosted)
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
- 🤖 **AI Recommendations** powered by machine learning
- 👥 **Social Features** - follow friends, share reviews
- 🎮 **Gamification** - achievements and badges
- 🗄️ **Cloud Database** - accessible from anywhere
- 📱 **Fully Responsive** works on all devices
- ⚡ **Lightning Fast** with Next.js 15
- 🌙 **Dark Mode** with beautiful gradients

---

## Need Help?

### Common Questions:

**Q: How do I update the site?**
A: Just push to GitHub, Vercel deploys automatically!

**Q: How do I access my database from another device?**
A: Just clone your repo, copy `.env` file, and run `npm install`. Database is in the cloud!

**Q: Is it really free?**
A: Yes! Both Vercel and Turso have generous free tiers perfect for college projects.

**Q: Can I show this in my resume?**
A: Absolutely! Include both the live URL and GitHub repo.

**Q: What if I break something?**
A: Vercel keeps all your deployments. You can rollback anytime! Database has automatic backups too.

**Q: Can my team members access the database?**
A: Yes! Just create a new token for them:
```bash
turso db tokens create movie-recommendation-db
```
Share the token and connection URL.

---

## 🎓 For Your College Submission

### Project Documentation Template:

```
Project Title: Movie Recommendation System
Technology Stack: Next.js 15, React, TypeScript, Tailwind CSS, Turso DB
External APIs: TMDB API, OpenAI API
Database: Turso (Cloud-hosted SQLite)
Features: 
  - Search & Filter (500K+ movies)
  - AI Recommendations (multi-strategy algorithm)
  - User Authentication (Better Auth)
  - Social Features (follow, reviews, sharing)
  - Gamification (achievements, badges)
  - Cloud Database (accessible anywhere)
Live Demo: [Your Vercel URL]
Source Code: [Your GitHub URL]
Database Dashboard: [Turso Dashboard]
Deployment: Vercel (CI/CD with GitHub integration)
```

### Screenshots to Include:
1. Homepage with movie grid
2. Search functionality
3. Movie details dialog with streaming info
4. Reviews page with social sharing
5. AI recommendations page
6. User profile page
7. Mobile responsive view
8. Database schema (Drizzle Studio screenshot)

### Technical Highlights:
- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Turso (global edge database)
- **ORM**: Drizzle ORM with type-safe queries
- **Authentication**: Better Auth with session management
- **External APIs**: TMDB (movies), OpenAI (recommendations)
- **Deployment**: Vercel with automatic CI/CD
- **Features**: Full-stack, real-time, responsive, cloud-native

---

## Next Steps

1. ✅ Set up Turso database
2. ✅ Push code to GitHub
3. ✅ Deploy to Vercel
4. ✅ Add all environment variables (TMDB + Turso + Auth)
5. ✅ Test your live URL
6. ✅ Test database access from another device
7. ✅ Share with your college
8. 🎉 Present your project!

**Good luck with your college project! 🚀**

---

## Additional Resources

- 📚 [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Detailed database guide
- 📖 [README.md](./README.md) - Project overview
- 🗄️ [Turso Documentation](https://docs.turso.tech)
- ▲ [Vercel Documentation](https://vercel.com/docs)
- 🎬 [TMDB API Docs](https://developers.themoviedb.org)