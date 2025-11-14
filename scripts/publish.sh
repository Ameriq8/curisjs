#!/bin/bash
set -e

echo "🚀 CurisJS Publishing Script"
echo ""

# Check if logged in
if ! npm whoami > /dev/null 2>&1; then
  echo "❌ Not logged in to npm. Run: npm login"
  exit 1
fi

echo "✓ Logged in as: $(npm whoami)"
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
pnpm clean

# Build packages
echo "📦 Building packages..."
pnpm build

# Verify builds
echo "🔍 Verifying builds..."
if [ ! -d "packages/core/dist" ]; then
  echo "❌ Core build failed"
  exit 1
fi
if [ ! -d "packages/db/dist" ]; then
  echo "❌ DB build failed"
  exit 1
fi
if [ ! -d "packages/cli/dist" ]; then
  echo "❌ CLI build failed"
  exit 1
fi
echo "✓ All builds successful"
echo ""

# Fix workspace dependencies
echo "🔧 Fixing workspace dependencies..."
bash scripts/fix-deps.sh
echo ""

# Confirm before publishing
read -p "📤 Ready to publish. Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Publishing cancelled"
  bash scripts/restore-deps.sh
  exit 1
fi

# Publish
echo "📤 Publishing packages..."
pnpm publish -r --access public --no-git-checks

# Restore dependencies
echo ""
echo "🔄 Restoring workspace dependencies..."
bash scripts/restore-deps.sh

echo ""
echo "✅ Published successfully!"
echo ""
echo "Verify at:"
echo "  📦 https://www.npmjs.com/package/@curisjs/core"
echo "  📦 https://www.npmjs.com/package/@curisjs/db"
echo "  📦 https://www.npmjs.com/package/@curisjs/cli"
echo ""
echo "Next steps:"
echo "  1. Test installation: npm install @curisjs/core"
echo "  2. Create git tag: git tag v0.1.0 && git push origin v0.1.0"
echo "  3. Create GitHub release"
