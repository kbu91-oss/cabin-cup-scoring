#!/bin/bash
# Cabin Cup 2026 — Development Script
echo "🚀 Starting Cabin Cup 2026..."
echo "📍 URL: http://localhost:3000"
echo ""

# Use the directory of this script so it works regardless of cwd
cd "$(dirname "$0")"
npm run dev
