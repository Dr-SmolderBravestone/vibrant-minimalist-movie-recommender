#!/bin/bash

# 🚀 Movie Recommendation System - Quick Setup Script
# This script helps you set up the project quickly

echo "🎬 Movie Recommendation System - Quick Setup"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "📦 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚙️  Setting up environment variables..."
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file from .env.example${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env file and add your credentials:${NC}"
    echo "   - TMDB_API_KEY (get from https://www.themoviedb.org/settings/api)"
    echo "   - TURSO_CONNECTION_URL (run: turso db show movie-recommendation-db --url)"
    echo "   - TURSO_AUTH_TOKEN (run: turso db tokens create movie-recommendation-db)"
    echo "   - BETTER_AUTH_SECRET (run: openssl rand -base64 32)"
    echo ""
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
    echo ""
fi

# Check if Turso CLI is installed
echo "🗄️  Checking database setup..."
if ! command -v turso &> /dev/null; then
    echo -e "${YELLOW}⚠️  Turso CLI is not installed${NC}"
    echo ""
    echo "To install Turso CLI:"
    echo "  macOS/Linux: curl -sSfL https://get.tur.so/install.sh | bash"
    echo "  Windows: irm https://get.tur.so/install.ps1 | iex"
    echo ""
    echo "After installing, run these commands:"
    echo "  1. turso auth login"
    echo "  2. turso db create movie-recommendation-db"
    echo "  3. turso db show movie-recommendation-db --url"
    echo "  4. turso db tokens create movie-recommendation-db"
    echo "  5. Add credentials to .env file"
    echo "  6. npm run db:push"
    echo ""
else
    echo -e "${GREEN}✅ Turso CLI found${NC}"
    
    # Check if user is logged in
    if turso auth whoami &> /dev/null; then
        echo -e "${GREEN}✅ Logged in to Turso${NC}"
        
        # Ask if user wants to create database
        echo ""
        read -p "Would you like to create a new database? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter database name (default: movie-recommendation-db): " db_name
            db_name=${db_name:-movie-recommendation-db}
            
            echo "Creating database: $db_name..."
            turso db create $db_name
            
            if [ $? -eq 0 ]; then
                echo ""
                echo -e "${GREEN}✅ Database created successfully!${NC}"
                echo ""
                echo "🔑 Getting database credentials..."
                echo ""
                echo "📍 Connection URL:"
                turso db show $db_name --url
                echo ""
                echo "🔐 Auth Token:"
                turso db tokens create $db_name
                echo ""
                echo -e "${YELLOW}⚠️  Copy these credentials to your .env file!${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Not logged in to Turso${NC}"
        echo "Please run: turso auth login"
    fi
fi
echo ""

# Check if .env has required variables
echo "🔍 Checking environment variables..."
missing_vars=()

if ! grep -q "TMDB_API_KEY=.*[^_here]" .env 2>/dev/null; then
    missing_vars+=("TMDB_API_KEY")
fi

if ! grep -q "TURSO_CONNECTION_URL=.*[^_here]" .env 2>/dev/null; then
    missing_vars+=("TURSO_CONNECTION_URL")
fi

if ! grep -q "TURSO_AUTH_TOKEN=.*[^_here]" .env 2>/dev/null; then
    missing_vars+=("TURSO_AUTH_TOKEN")
fi

if ! grep -q "BETTER_AUTH_SECRET=.*[^_here]" .env 2>/dev/null; then
    missing_vars+=("BETTER_AUTH_SECRET")
fi

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing environment variables:${NC}"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please add these to your .env file before running the app."
else
    echo -e "${GREEN}✅ All required environment variables are set${NC}"
fi
echo ""

# Final instructions
echo "=============================================="
echo "🎉 Setup Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo ""
echo "1. ${YELLOW}Edit .env file${NC} with your credentials"
echo ""
echo "2. ${YELLOW}Run database migrations:${NC}"
echo "   npm run db:push"
echo ""
echo "3. ${YELLOW}(Optional) Seed sample data:${NC}"
echo "   npm run db:seed"
echo ""
echo "4. ${YELLOW}Start development server:${NC}"
echo "   npm run dev"
echo ""
echo "5. ${YELLOW}Open browser:${NC}"
echo "   http://localhost:3000"
echo ""
echo "=============================================="
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - DATABASE_SETUP.md - Database guide"
echo "   - DEPLOYMENT_GUIDE.md - Deployment guide"
echo "=============================================="
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"