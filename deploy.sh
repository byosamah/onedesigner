#!/bin/bash

# OneDesigner Production Deployment Script
echo "🚀 Starting OneDesigner deployment to onedesigner.app..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix the errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod

echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your custom domain 'onedesigner.app' in Vercel dashboard"
echo "2. Set up environment variables in Vercel (see PRODUCTION_DEPLOYMENT.md)"
echo "3. Update Supabase authentication URLs"
echo "4. Configure LemonSqueezy webhook URL"
echo "5. Test the deployment!"
echo ""
echo "📖 See PRODUCTION_DEPLOYMENT.md for detailed instructions."