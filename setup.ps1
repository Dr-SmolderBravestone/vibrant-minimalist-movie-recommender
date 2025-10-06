# 🚀 Movie Recommendation System - Quick Setup Script (Windows)
# This script helps you set up the project quickly on Windows

Write-Host "🎬 Movie Recommendation System - Quick Setup" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "📦 Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "⚙️  Setting up environment variables..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env file and add your credentials:" -ForegroundColor Yellow
    Write-Host "   - TMDB_API_KEY (get from https://www.themoviedb.org/settings/api)" -ForegroundColor White
    Write-Host "   - TURSO_CONNECTION_URL (run: turso db show movie-recommendation-db --url)" -ForegroundColor White
    Write-Host "   - TURSO_AUTH_TOKEN (run: turso db tokens create movie-recommendation-db)" -ForegroundColor White
    Write-Host "   - BETTER_AUTH_SECRET (generate at: https://generate-secret.vercel.app/32)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
    Write-Host ""
}

# Check if Turso CLI is installed
Write-Host "🗄️  Checking database setup..." -ForegroundColor Yellow
try {
    $tursoVersion = turso --version
    Write-Host "✅ Turso CLI found" -ForegroundColor Green
    
    # Check if user is logged in
    try {
        turso auth whoami | Out-Null
        Write-Host "✅ Logged in to Turso" -ForegroundColor Green
        
        # Ask if user wants to create database
        Write-Host ""
        $createDb = Read-Host "Would you like to create a new database? (y/n)"
        if ($createDb -eq "y" -or $createDb -eq "Y") {
            $dbName = Read-Host "Enter database name (default: movie-recommendation-db)"
            if ([string]::IsNullOrWhiteSpace($dbName)) {
                $dbName = "movie-recommendation-db"
            }
            
            Write-Host "Creating database: $dbName..." -ForegroundColor Yellow
            turso db create $dbName
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Database created successfully!" -ForegroundColor Green
                Write-Host ""
                Write-Host "🔑 Getting database credentials..." -ForegroundColor Yellow
                Write-Host ""
                Write-Host "📍 Connection URL:" -ForegroundColor Cyan
                turso db show $dbName --url
                Write-Host ""
                Write-Host "🔐 Auth Token:" -ForegroundColor Cyan
                turso db tokens create $dbName
                Write-Host ""
                Write-Host "⚠️  Copy these credentials to your .env file!" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "⚠️  Not logged in to Turso" -ForegroundColor Yellow
        Write-Host "Please run: turso auth login" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️  Turso CLI is not installed" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To install Turso CLI on Windows:" -ForegroundColor White
    Write-Host "  irm https://get.tur.so/install.ps1 | iex" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installing, run these commands:" -ForegroundColor White
    Write-Host "  1. turso auth login" -ForegroundColor Cyan
    Write-Host "  2. turso db create movie-recommendation-db" -ForegroundColor Cyan
    Write-Host "  3. turso db show movie-recommendation-db --url" -ForegroundColor Cyan
    Write-Host "  4. turso db tokens create movie-recommendation-db" -ForegroundColor Cyan
    Write-Host "  5. Add credentials to .env file" -ForegroundColor Cyan
    Write-Host "  6. npm run db:push" -ForegroundColor Cyan
    Write-Host ""
}
Write-Host ""

# Check if .env has required variables
Write-Host "🔍 Checking environment variables..." -ForegroundColor Yellow
$envContent = Get-Content .env -ErrorAction SilentlyContinue
$missingVars = @()

if (-not ($envContent -match "TMDB_API_KEY=(?!.*your_)(?!.*_here).+")) {
    $missingVars += "TMDB_API_KEY"
}

if (-not ($envContent -match "TURSO_CONNECTION_URL=(?!.*your_)(?!.*_here).+")) {
    $missingVars += "TURSO_CONNECTION_URL"
}

if (-not ($envContent -match "TURSO_AUTH_TOKEN=(?!.*your_)(?!.*_here).+")) {
    $missingVars += "TURSO_AUTH_TOKEN"
}

if (-not ($envContent -match "BETTER_AUTH_SECRET=(?!.*your_)(?!.*_here).+")) {
    $missingVars += "BETTER_AUTH_SECRET"
}

if ($missingVars.Count -gt 0) {
    Write-Host "⚠️  Missing environment variables:" -ForegroundColor Yellow
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "Please add these to your .env file before running the app." -ForegroundColor White
} else {
    Write-Host "✅ All required environment variables are set" -ForegroundColor Green
}
Write-Host ""

# Final instructions
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Edit .env file with your credentials" -ForegroundColor White
Write-Host ""
Write-Host "2. Run database migrations:" -ForegroundColor White
Write-Host "   npm run db:push" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. (Optional) Seed sample data:" -ForegroundColor White
Write-Host "   npm run db:seed" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Start development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Open browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - README.md - Project overview" -ForegroundColor White
Write-Host "   - DATABASE_SETUP.md - Database guide" -ForegroundColor White
Write-Host "   - DEPLOYMENT_GUIDE.md - Deployment guide" -ForegroundColor White
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green