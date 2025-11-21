#!/bin/bash

echo "🚀 Starting Career Framework App..."
echo ""

# Navigate to app directory
cd "$(dirname "$0")"

echo "📦 Setting up Prisma..."
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate

echo "🗄️  Pushing database schema..."
npx prisma db push --skip-generate

echo "✅ Setup complete!"
echo ""
echo "🌐 Starting development server on port 3001..."
echo "📍 Access the app at: http://localhost:3001"
echo ""
echo "🔐 Admin Login:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""

npm run dev
