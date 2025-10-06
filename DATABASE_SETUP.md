# 🗄️ Database Setup Guide

This project uses **Turso** - a distributed SQLite database optimized for edge computing. It's **free**, **fast**, and **perfect** for Next.js applications.

---

## Why Turso?

- ✅ **Free tier** with generous limits (up to 9GB storage)
- ✅ **Global edge replication** - fast everywhere
- ✅ **SQLite compatibility** - simple and powerful
- ✅ **No cold starts** - instant queries
- ✅ **Easy to use** - one CLI command to set up
- ✅ **Perfect for Vercel** - works seamlessly with serverless

---

## Quick Setup (5 minutes)

### Step 1: Install Turso CLI

**macOS/Linux:**
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://get.tur.so/install.ps1 | iex
```

**Or using Homebrew (macOS):**
```bash
brew install tursodatabase/tap/turso
```

### Step 2: Sign Up & Login

```bash
# Sign up (opens browser)
turso auth signup

# Or login if you already have an account
turso auth login
```

### Step 3: Create Your Database

```bash
# Create a new database
turso db create movie-recommendation-db

# This creates a database and shows you the URL
```

### Step 4: Get Database Credentials

```bash
# Get connection URL
turso db show movie-recommendation-db --url

# Get auth token
turso db tokens create movie-recommendation-db
```

### Step 5: Update .env File

Copy the output from Step 4 and add to your `.env` file:

```env
TURSO_CONNECTION_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...your-token-here
```

### Step 6: Run Database Migrations

```bash
# Install dependencies (if not already installed)
npm install

# Run migrations to create tables
npm run db:push
```

### Step 7: (Optional) Seed Sample Data

```bash
# Seed the database with sample data
npm run db:seed
```

---

## Database Schema

The project includes the following tables:

### Users & Authentication
- **user** - User accounts (id, email, name, emailVerified, image, createdAt, updatedAt)
- **session** - User sessions (id, expiresAt, token, ipAddress, userAgent, userId)
- **account** - OAuth accounts (id, accountId, providerId, userId, accessToken, refreshToken, etc.)
- **verification** - Email verification tokens (id, identifier, value, expiresAt)

### Movie Features
- **favorites** - User's favorite movies (id, userId, movieId, movieTitle, moviePoster, addedAt)
- **watchLater** - Movies saved to watch later (id, userId, movieId, movieTitle, moviePoster, addedAt)
- **watchHistory** - Viewing history (id, userId, movieId, movieTitle, moviePoster, watchedAt, watchDuration)
- **reviews** - User reviews (id, userId, userName, movieId, movieTitle, moviePoster, rating, review, createdAt, updatedAt)

### Social Features
- **userFollows** - Follow relationships (id, followerId, followingId, createdAt)
- **userProfiles** - Extended profiles (id, userId, bio, avatarUrl, favoriteGenres, location, createdAt, updatedAt)

### Gamification
- **achievements** - Achievement definitions (id, name, description, icon, category, points, requirement)
- **userAchievements** - User achievements (id, userId, achievementId, earnedAt)

### Settings
- **preferences** - User preferences (id, sessionId, likedMovies, preferredGenres, searchHistory, createdAt, updatedAt)

---

## Database Commands Reference

### Essential Commands

```bash
# Create a new database
turso db create <database-name>

# List all your databases
turso db list

# Show database details
turso db show <database-name>

# Get database URL
turso db show <database-name> --url

# Create auth token
turso db tokens create <database-name>

# Delete a database
turso db destroy <database-name>
```

### Drizzle ORM Commands (used in this project)

```bash
# Push schema changes to database (use in development)
npm run db:push

# Generate migrations
npm run db:generate

# Run migrations (use in production)
npm run db:migrate

# Open Drizzle Studio (visual database editor)
npm run db:studio
```

### Turso Shell (SQL Console)

```bash
# Open SQL shell
turso db shell movie-recommendation-db

# Run SQL commands directly
turso db shell movie-recommendation-db "SELECT * FROM user;"
```

---

## Deployment Setup

### For Vercel Deployment

1. **Go to your Vercel project** → Settings → Environment Variables

2. **Add these variables:**
   ```
   TURSO_CONNECTION_URL=libsql://your-database-url.turso.io
   TURSO_AUTH_TOKEN=eyJhbGc...your-token-here
   BETTER_AUTH_SECRET=your-generated-secret-here
   ```

3. **Redeploy** your application

4. **Run migrations** on first deploy:
   ```bash
   # In your Vercel deployment, migrations run automatically
   # Or you can manually run: npm run db:push
   ```

### For Other Platforms (Netlify, Railway, etc.)

1. Add the same environment variables in your platform's settings
2. Ensure migrations run during build or deployment
3. Test database connectivity

---

## Accessing Your Database

### Method 1: Drizzle Studio (Visual Interface)

```bash
npm run db:studio
```

Opens at: `https://local.drizzle.studio`

### Method 2: Turso Shell (SQL Console)

```bash
turso db shell movie-recommendation-db
```

### Method 3: Turso Web Dashboard

Visit: [https://turso.tech/app](https://turso.tech/app)

---

## Database Migration Workflow

### Development (Local Changes)

```bash
# 1. Modify schema in src/db/schema.ts
# 2. Push changes to database
npm run db:push

# 3. Test your changes
npm run dev
```

### Production (Deployment)

```bash
# 1. Generate migration files
npm run db:generate

# 2. Commit migration files
git add drizzle/
git commit -m "Add new table/column"

# 3. Push to GitHub (auto-deploys on Vercel)
git push

# 4. Migrations run automatically on deployment
```

---

## Database Backup & Restore

### Backup Your Database

```bash
# Create a backup
turso db dump movie-recommendation-db > backup.sql

# Or use Turso's built-in backup
turso db backup movie-recommendation-db
```

### Restore from Backup

```bash
# Import SQL file
turso db shell movie-recommendation-db < backup.sql
```

---

## Monitoring & Analytics

### Check Database Usage

```bash
# Show database statistics
turso db show movie-recommendation-db --stats

# Monitor database size
turso db inspect movie-recommendation-db
```

### View Query Performance

```bash
# Open Drizzle Studio for query inspection
npm run db:studio
```

---

## Troubleshooting

### Problem: "Database connection failed"

**Solution:**
1. Check if `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN` are in `.env`
2. Verify credentials: `turso db show movie-recommendation-db`
3. Regenerate token: `turso db tokens create movie-recommendation-db`

### Problem: "Table does not exist"

**Solution:**
```bash
# Run migrations
npm run db:push
```

### Problem: "Authentication failed"

**Solution:**
```bash
# Login again
turso auth login

# Create new token
turso db tokens create movie-recommendation-db
```

### Problem: "Can't access database from another device"

**Solution:**
- Turso is cloud-hosted, so you can access it from anywhere!
- Just copy your `.env` file to the new device
- Or set the same environment variables

### Problem: "Migrations not running on Vercel"

**Solution:**
1. Check Vercel build logs for errors
2. Ensure `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN` are set in Vercel
3. Manually run: `npm run db:push` locally, then redeploy

---

## Switching Databases (Dev/Staging/Production)

### Create Multiple Databases

```bash
# Development
turso db create movie-db-dev

# Staging
turso db create movie-db-staging

# Production
turso db create movie-db-prod
```

### Use Different .env Files

**Development (.env.local):**
```env
TURSO_CONNECTION_URL=libsql://movie-db-dev.turso.io
TURSO_AUTH_TOKEN=dev_token_here
```

**Production (Vercel):**
```env
TURSO_CONNECTION_URL=libsql://movie-db-prod.turso.io
TURSO_AUTH_TOKEN=prod_token_here
```

---

## Database Best Practices

✅ **DO:**
- Use `db:push` for development (fast iteration)
- Use `db:generate` + `db:migrate` for production
- Keep `.env` in `.gitignore`
- Use different databases for dev/staging/prod
- Regularly backup your database
- Monitor database usage

❌ **DON'T:**
- Commit `.env` file to GitHub
- Share your auth tokens publicly
- Use production database for testing
- Delete databases without backups
- Hardcode database credentials

---

## FAQ

### Q: Is Turso free?

**A:** Yes! Free tier includes:
- 9GB total storage
- 1B row reads per month
- 25M row writes per month
- 3 databases
- Perfect for most projects!

### Q: Can I use PostgreSQL/MySQL instead?

**A:** Yes, but you'll need to:
1. Change `dialect: 'turso'` in `drizzle.config.ts`
2. Update connection credentials
3. Modify schema if needed (Turso uses SQLite syntax)

### Q: How do I share my database with team members?

**A:**
```bash
# Create a new token for team member
turso db tokens create movie-recommendation-db

# Share the token and connection URL with them
```

### Q: Can I access my database from mobile/another device?

**A:** Yes! Turso is cloud-hosted. Just:
1. Clone your repository
2. Copy `.env` file or set environment variables
3. Run `npm install` and `npm run dev`

### Q: How do I view my database data?

**A:** Three ways:
1. `npm run db:studio` - Visual interface
2. `turso db shell movie-recommendation-db` - SQL console
3. Turso web dashboard - Browser interface

---

## Getting Help

- 📚 [Turso Documentation](https://docs.turso.tech)
- 💬 [Turso Discord](https://discord.gg/turso)
- 🐙 [GitHub Issues](https://github.com/tursodatabase/turso-cli/issues)
- 📧 [Drizzle Docs](https://orm.drizzle.team)

---

## Quick Reference Card

```bash
# Setup
turso auth login
turso db create movie-db
turso db show movie-db --url
turso db tokens create movie-db

# Development
npm run db:push      # Push schema changes
npm run db:studio    # Visual editor
npm run dev          # Start app

# Production
npm run db:generate  # Create migrations
npm run db:migrate   # Run migrations
git push            # Deploy

# Maintenance
turso db list               # List databases
turso db show movie-db      # Database info
turso db dump movie-db      # Backup
turso db shell movie-db     # SQL console
```

---

**🎉 You're all set! Your database is now accessible from anywhere!**