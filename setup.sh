#!/bin/bash

# TikTok Bot - Quick Start Guide

echo "🤖 TikTok Bot - Quick Start"
echo "=========================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Node.js $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install > /dev/null 2>&1

if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Edit .env with your TikTok API credentials"
fi

if [ ! -f config/accounts.json ]; then
    echo "📝 Creating config/accounts.json..."
    cp config/accounts.json.example config/accounts.json
    echo "⚠️  Edit config/accounts.json with your account details"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the bot:"
echo "   npm start"
echo ""
echo "📖 For more info: cat README.md"
