#!/bin/bash

# 💍 Mr & Mrs De Vera Wedding App - Setup Script
# Usage: ./setup.sh

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  💍 Mr & Mrs De Vera Wedding App - Setup                  ║"
echo "║  📅 June 3, 2026                                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js version
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm $(npm -v)"

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  Please update .env with your Firebase credentials"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📂 Verifying assets..."
if [ -d "public/images" ] && [ "$(ls -A public/images/*.jpg 2>/dev/null | wc -l)" -gt 0 ]; then
    echo "✅ Couple photos found: $(ls public/images/couple-*.jpg 2>/dev/null | wc -l) images"
else
    echo "⚠️  No couple photos found in public/images/"
    echo "   Please add your wedding photos as couple-1.jpg through couple-10.jpg"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env with your Firebase credentials"
echo "  2. Add couple photos to public/images/"
echo "  3. Run: npm run dev"
echo ""
echo "🌐 Development server: http://localhost:3000"
echo "════════════════════════════════════════════════════════════"
echo ""
