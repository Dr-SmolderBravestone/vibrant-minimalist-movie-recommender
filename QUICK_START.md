# ⚡ Quick Start Guide

**Get your movie recommendation system running in 5 minutes!**

---

## 🚀 Setup (Choose Your Method)

### Method 1: Automated Setup (Recommended)

**macOS/Linux:**
```bash
npm run setup
```

**Windows:**
```bash
npm run setup:windows
```

This script will:
- ✅ Install dependencies
- ✅ Create `.env` file
- ✅ Check for Turso CLI
- ✅ Help you create a database
- ✅ Verify environment variables

### Method 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your credentials

# 3. Set up database (see below)
# 4. Run migrations
npm run db:push

# 5. Start development
npm run dev
```

---

## 🗄️ Database Setup (5 minutes)

### Install Turso CLI

**macOS/Linux:**
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

**Windows:**
```bash
irm https://get.tur.so/install.ps1 | iex
```

### Create Database

```bash
# 1. Login
turso auth login

# 2. Create database
turso db create movie-recommendation-db

# 3. Get connection URL
turso db show movie-recommendation-db --url

# 4. Get auth token
turso db tokens create movie-recommendation-db
```

### Add to .env

```env
TURSO_CONNECTION_URL=libsql://your-db-url.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...your-token
```

---

## 🔑 Get API Keys

### TMDB API Key (Required)

1. Sign up at [themoviedb.org](https://www.themoviedb.org/)
2. Go to Settings → API → Request API Key
3. Choose "Developer"
4. Copy the API Key (v3 auth)

Add to `.env`:
```env
TMDB_API_KEY=your_tmdb_api_key
```

### Auth Secret (Required)

**Generate:**
```bash
openssl rand -base64 32
```

Or use: [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

Add to `.env`:
```env
BETTER_AUTH_SECRET=your_generated_secret
```

---

## 🎯 Run the App

```bash
# 1. Push database schema
npm run db:push

# 2. (Optional) Seed sample data
npm run db:seed

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📱 Access from Another Device

Your database is **cloud-hosted**, so you can access it from anywhere!

### On a New Device:

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/movie-recommendation-system.git
cd movie-recommendation-system

# 2. Install dependencies
npm install

# 3. Copy .env file (with SAME credentials)
# OR create .env with same TURSO credentials

# 4. Start app
npm run dev
```

**That's it!** No database export/import needed.

---

## 🚀 Deploy to Vercel

### Quick Deploy

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Go to vercel.com
# 3. Import your repository
# 4. Add environment variables:
#    - TMDB_API_KEY
#    - TURSO_CONNECTION_URL
#    - TURSO_AUTH_TOKEN
#    - BETTER_AUTH_SECRET
# 5. Deploy!
```

Your live URL: `https://your-project.vercel.app`

---

## 🛠️ Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:push          # Push schema changes (dev)
npm run db:studio        # Open visual database editor
npm run db:seed          # Seed sample data

# Turso CLI
turso db list                           # List all databases
turso db show movie-recommendation-db   # Show database info
turso db shell movie-recommendation-db  # Open SQL console
```

---

## ❓ Troubleshooting

### "Database connection failed"
```bash
# Check credentials
turso db show movie-recommendation-db

# Regenerate token
turso db tokens create movie-recommendation-db
```

### "Table does not exist"
```bash
npm run db:push
```

### "Can't access from another device"
- ✅ Make sure `.env` has correct `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN`
- ✅ Database is cloud-hosted, should work from anywhere
- ✅ Check you're logged in: `turso auth login`

---

## 📚 Full Documentation

- **[README.md](./README.md)** - Complete project overview
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Detailed database guide
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Full deployment instructions

---

## 🎓 For Your College Project

**What to Share:**
- 📱 Live Demo: `https://your-project.vercel.app`
- 💻 Source Code: `https://github.com/YOUR_USERNAME/movie-recommendation-system`
- 🗄️ Database: Turso (cloud-hosted, accessible anywhere)

**Key Features to Highlight:**
- ✨ 500K+ movies from TMDB
- 🤖 AI-powered recommendations
- 👥 Social features (follow, reviews, sharing)
- 🎮 Gamification (achievements, badges)
- 📱 Fully responsive
- 🗄️ Cloud database (accessible from any device)

---

## ✅ Checklist

- [ ] Install Node.js 18+
- [ ] Install Turso CLI
- [ ] Create Turso database
- [ ] Get TMDB API key
- [ ] Generate auth secret
- [ ] Add all credentials to `.env`
- [ ] Run `npm install`
- [ ] Run `npm run db:push`
- [ ] Run `npm run dev`
- [ ] Open `http://localhost:3000`
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Test on another device
- [ ] Share with your college 🎉

---

**🎬 You're ready to go! Happy coding!**