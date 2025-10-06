# 🎬 Movie Recommendation System

A modern, full-stack movie recommendation platform built with Next.js 15, featuring AI-powered recommendations, user reviews, and social features.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![Turso](https://img.shields.io/badge/Database-Turso-4caf50)

---

## ✨ Features

### 🎯 Core Features
- **Movie Discovery**: Browse 500,000+ movies from TMDB
- **Smart Search**: Real-time search with instant results
- **Genre Filtering**: 19+ genre categories
- **Movie Details**: Cast, crew, ratings, trailers, streaming availability

### 🤖 AI-Powered
- **Personalized Recommendations**: Multi-strategy AI algorithm
- **Collaborative Filtering**: Based on similar users' preferences
- **Content-Based Filtering**: Genre and keyword matching
- **Hidden Gems Discovery**: Find underrated movies

### 👥 Social Features
- **User Reviews & Ratings**: Share your thoughts
- **Follow Friends**: See what your friends are watching
- **Social Sharing**: Instagram, X/Twitter, Reddit, Discord
- **User Profiles**: Customizable profiles with favorite genres

### 🎮 Gamification
- **Achievements System**: Earn badges for activity
- **Watch History**: Track what you've watched
- **Favorites & Watch Later**: Organize your movies

### 🎨 Modern UI/UX
- **SpaceX-Inspired Design**: Minimal, clean, impressive
- **Dark Mode**: Beautiful dark theme with gradients
- **Fully Responsive**: Works on all devices
- **Smooth Animations**: Framer Motion powered

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or bun package manager
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))
- Turso account ([Sign up here](https://turso.tech))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/movie-recommendation-system.git
cd movie-recommendation-system

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Set up database (see DATABASE_SETUP.md for details)
npm run db:push

# 5. (Optional) Seed sample data
npm run db:seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

---

## 🗄️ Database Setup

This project uses **Turso** (SQLite edge database) for fast, global data access.

### Quick Database Setup

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create movie-recommendation-db

# Get credentials
turso db show movie-recommendation-db --url
turso db tokens create movie-recommendation-db

# Add to .env file
TURSO_CONNECTION_URL=your_connection_url
TURSO_AUTH_TOKEN=your_auth_token

# Run migrations
npm run db:push
```

**📚 For detailed database setup instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)**

---

## 📁 Project Structure

```
movie-recommendation-system/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── profile/           # User profile
│   │   ├── reviews/           # Reviews page
│   │   ├── recommendations/   # AI recommendations
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── MovieCard.tsx     # Movie card component
│   │   └── ...
│   ├── db/                    # Database
│   │   ├── schema.ts         # Database schema
│   │   ├── index.ts          # Database connection
│   │   └── seeds/            # Seed data
│   ├── lib/                   # Utilities
│   │   ├── auth.ts           # Authentication
│   │   └── ...
│   └── hooks/                 # Custom React hooks
├── drizzle/                   # Database migrations
├── public/                    # Static assets
├── DATABASE_SETUP.md          # Database setup guide
├── DEPLOYMENT_GUIDE.md        # Deployment guide
└── README.md                  # This file
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:push          # Push schema changes (dev)
npm run db:generate      # Generate migrations (prod)
npm run db:migrate       # Run migrations (prod)
npm run db:studio        # Open Drizzle Studio
npm run db:seed          # Seed sample data

# Type checking
npm run type-check       # Check TypeScript types
```

---

## 🌍 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository

3. **Set Environment Variables** in Vercel:
   ```
   TMDB_API_KEY=your_key
   TURSO_CONNECTION_URL=your_url
   TURSO_AUTH_TOKEN=your_token
   BETTER_AUTH_SECRET=your_secret
   ```

4. **Deploy** and you're live!

**📚 For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

---

## 🔑 Environment Variables

Required variables (add to `.env`):

```env
# TMDB API (Required)
TMDB_API_KEY=your_tmdb_api_key

# Database (Required)
TURSO_CONNECTION_URL=your_turso_url
TURSO_AUTH_TOKEN=your_turso_token

# Authentication (Required)
BETTER_AUTH_SECRET=your_secret

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=your_openai_key
```

See `.env.example` for detailed setup instructions.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui
- **Database**: Turso (SQLite)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **Animation**: Framer Motion
- **External APIs**: TMDB API, OpenAI API
- **Deployment**: Vercel

---

## 📊 Database Schema

### Tables
- **Users & Auth**: user, session, account, verification
- **Movies**: favorites, watchLater, watchHistory, reviews
- **Social**: userFollows, userProfiles
- **Gamification**: achievements, userAchievements
- **Settings**: preferences

See `src/db/schema.ts` for complete schema definition.

---

## 🎓 For College Projects

### Highlights for Your Submission:
- ✅ Modern tech stack (Next.js 15, TypeScript)
- ✅ Full-stack application (Frontend + Backend + Database)
- ✅ External API integration (TMDB, OpenAI)
- ✅ Authentication & authorization
- ✅ Social features (follow, share, reviews)
- ✅ AI-powered recommendations
- ✅ Responsive design
- ✅ Production-ready deployment

### What to Share:
- **Live Demo**: [Your Vercel URL]
- **Source Code**: [Your GitHub URL]
- **Documentation**: This README + guides
- **Database**: Accessible from anywhere via Turso

---

## 📸 Screenshots

### Homepage
![Homepage](./screenshots/homepage.png)

### Movie Details
![Movie Details](./screenshots/movie-details.png)

### Reviews
![Reviews](./screenshots/reviews.png)

### AI Recommendations
![Recommendations](./screenshots/recommendations.png)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🆘 Need Help?

- 📖 Read [DATABASE_SETUP.md](./DATABASE_SETUP.md) for database help
- 🚀 Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment help
- 🐛 [Open an issue](https://github.com/YOUR_USERNAME/movie-recommendation-system/issues)
- 💬 Ask in discussions

---

## 🎉 Credits

- Movie data by [TMDB](https://www.themoviedb.org/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
- Database by [Turso](https://turso.tech/)
- Deployed on [Vercel](https://vercel.com/)

---

**Made with ❤️ for movie lovers everywhere**