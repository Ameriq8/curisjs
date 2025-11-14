# Publishing CurisJS to npm

This guide walks you through publishing all CurisJS packages to npm.

## Prerequisites

1. **npm Account**: Create one at https://www.npmjs.com/signup
2. **Organization Access**: You need access to `@curisjs` scope or create it
3. **Two-Factor Authentication**: Recommended for security

## Pre-Publishing Checklist

### 1. Login to npm

```bash
npm login
# Enter your username, password, and 2FA code
```

Verify you're logged in:
```bash
npm whoami
```

### 2. Create or Join the @curisjs Organization

Option A: Create the organization (if it doesn't exist)
```bash
# Go to: https://www.npmjs.com/org/create
# Organization name: curisjs
```

Option B: If someone else owns it, ask for access

Option C: Use your personal scope instead
```bash
# Change all package names from @curisjs/xxx to @yourusername/xxx
```

### 3. Build All Packages

```bash
# From monorepo root
pnpm build
```

Verify builds succeeded:
```bash
ls packages/core/dist
ls packages/db/dist
ls packages/cli/dist
```

### 4. Fix Workspace Dependencies

Before publishing, we need to change `workspace:*` to actual versions:

**Run this script:**

```bash
# Create a temporary script
cat > fix-deps.sh << 'EOF'
#!/bin/bash

# Fix @curisjs/db peerDependencies
sed -i 's/"@curisjs\/core": "workspace:\*"/"@curisjs\/core": "^0.1.0"/' packages/db/package.json

# Fix @curisjs/cli peerDependencies
sed -i 's/"@curisjs\/core": "workspace:\*"/"@curisjs\/core": "^0.1.0"/' packages/cli/package.json
sed -i 's/"@curisjs\/db": "workspace:\*"/"@curisjs\/db": "^0.1.0"/' packages/cli/package.json

echo "✓ Fixed workspace dependencies"
EOF

chmod +x fix-deps.sh
./fix-deps.sh
```

### 5. Test Packages Locally

Before publishing, test that packages can be installed:

```bash
# Test core package
cd packages/core
npm pack
# This creates curisjs-core-0.1.0.tgz

# Test installation
cd /tmp
mkdir test-install
cd test-install
npm init -y
npm install /path/to/curisjs/packages/core/curisjs-core-0.1.0.tgz

# Verify it works
node -e "const { createApp } = require('@curisjs/core'); console.log('✓ Core works')"
```

## Publishing Steps

### Method 1: Publish All Packages at Once (Recommended)

```bash
# From monorepo root
pnpm publish -r --access public --no-git-checks
```

This will:
- Publish all packages in correct order
- Set access to public (required for scoped packages)
- Skip git checks (useful if you have uncommitted changes)

### Method 2: Publish Packages Individually

#### Step 1: Publish Core (no dependencies)

```bash
cd packages/core
npm publish --access public
```

#### Step 2: Publish DB (depends on core)

```bash
cd packages/db
npm publish --access public
```

#### Step 3: Publish CLI (depends on core and db)

```bash
cd packages/cli
npm publish --access public
```

### Verify Publication

Check packages are published:
```bash
npm view @curisjs/core
npm view @curisjs/db
npm view @curisjs/cli
```

Or visit:
- https://www.npmjs.com/package/@curisjs/core
- https://www.npmjs.com/package/@curisjs/db
- https://www.npmjs.com/package/@curisjs/cli

## Post-Publishing

### 1. Test Installation

```bash
# In a new directory
mkdir test-curisjs
cd test-curisjs
npm init -y

# Install packages
npm install @curisjs/core
npm install @curisjs/db
npm install -g @curisjs/cli

# Test CLI
curis --version
```

### 2. Update README Badges

Add npm badges to main README.md:

```markdown
[![npm version](https://badge.fury.io/js/@curisjs%2Fcore.svg)](https://www.npmjs.com/package/@curisjs/core)
[![npm downloads](https://img.shields.io/npm/dm/@curisjs/core.svg)](https://www.npmjs.com/package/@curisjs/core)
```

### 3. Restore Workspace Dependencies (for development)

```bash
# Restore workspace:* for local development
cat > restore-deps.sh << 'EOF'
#!/bin/bash

# Restore @curisjs/db peerDependencies
sed -i 's/"@curisjs\/core": "\^0.1.0"/"@curisjs\/core": "workspace:*"/' packages/db/package.json

# Restore @curisjs/cli peerDependencies
sed -i 's/"@curisjs\/core": "\^0.1.0"/"@curisjs\/core": "workspace:*"/' packages/cli/package.json
sed -i 's/"@curisjs\/db": "\^0.1.0"/"@curisjs\/db": "workspace:*"/' packages/cli/package.json

echo "✓ Restored workspace dependencies"
EOF

chmod +x restore-deps.sh
./restore-deps.sh
```

### 4. Create Git Tag

```bash
git add .
git commit -m "chore: publish v0.1.0"
git tag v0.1.0
git push origin develop
git push origin v0.1.0
```

## Publishing Updates

### Patch Release (0.1.0 → 0.1.1)

```bash
# Update version in all packages
cd packages/core && npm version patch
cd ../db && npm version patch
cd ../cli && npm version patch

# Build and publish
pnpm build
./fix-deps.sh
pnpm publish -r --access public
./restore-deps.sh
```

### Minor Release (0.1.0 → 0.2.0)

```bash
cd packages/core && npm version minor
cd ../db && npm version minor
cd ../cli && npm version minor

pnpm build
./fix-deps.sh
pnpm publish -r --access public
./restore-deps.sh
```

### Major Release (0.1.0 → 1.0.0)

```bash
cd packages/core && npm version major
cd ../db && npm version major
cd ../cli && npm version major

pnpm build
./fix-deps.sh
pnpm publish -r --access public
./restore-deps.sh
```

## Automation Script

Create a publish script for easier publishing:

```bash
cat > publish.sh << 'EOF'
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

# Build packages
echo "📦 Building packages..."
pnpm build

# Fix workspace dependencies
echo "🔧 Fixing workspace dependencies..."
./fix-deps.sh

# Publish
echo "📤 Publishing packages..."
pnpm publish -r --access public --no-git-checks

# Restore dependencies
echo "🔄 Restoring workspace dependencies..."
./restore-deps.sh

echo ""
echo "✅ Published successfully!"
echo ""
echo "Verify at:"
echo "  https://www.npmjs.com/package/@curisjs/core"
echo "  https://www.npmjs.com/package/@curisjs/db"
echo "  https://www.npmjs.com/package/@curisjs/cli"
EOF

chmod +x publish.sh
```

Usage:
```bash
./publish.sh
```

## Troubleshooting

### Error: 403 Forbidden

You don't have permission to publish to `@curisjs` scope.

**Solution:**
- Create the organization at https://www.npmjs.com/org/create
- Or change package names to your personal scope

### Error: Package already exists

The version already exists on npm.

**Solution:**
```bash
# Bump version
cd packages/core && npm version patch
```

### Error: ENEEDAUTH

Not logged in to npm.

**Solution:**
```bash
npm login
```

### Error: Missing dependencies

Build failed or dist folder missing.

**Solution:**
```bash
pnpm build
ls packages/core/dist  # Verify build output
```

### Packages published in wrong order

CLI published before core/db.

**Solution:**
- Unpublish if within 72 hours: `npm unpublish @curisjs/cli@0.1.0`
- Or publish missing dependencies first

## Security Best Practices

1. **Enable 2FA**: Go to https://www.npmjs.com/settings/your-username/tfa
2. **Use publish tokens**: Instead of password, use tokens
3. **Review before publishing**: Check `npm pack` output
4. **Monitor downloads**: Check for unusual activity
5. **Deprecate old versions**: `npm deprecate @curisjs/core@0.0.1 "Please upgrade"`

## Useful Commands

```bash
# Check what will be published
npm pack --dry-run

# View published package info
npm view @curisjs/core

# List all versions
npm view @curisjs/core versions

# Deprecate a version
npm deprecate @curisjs/core@0.1.0 "Deprecated message"

# Unpublish (only within 72 hours)
npm unpublish @curisjs/core@0.1.0

# Update package description/keywords without republishing
npm access public @curisjs/core
```

## Checklist Before Publishing

- [ ] All tests pass: `pnpm test`
- [ ] All builds succeed: `pnpm build`
- [ ] Version numbers updated
- [ ] CHANGELOG.md updated
- [ ] README.md up to date
- [ ] LICENSE file present
- [ ] Workspace dependencies fixed
- [ ] Logged in to npm: `npm whoami`
- [ ] Organization access verified
- [ ] Local test installation successful

## After Publishing

- [ ] Verify packages on npmjs.com
- [ ] Test installation: `npm install @curisjs/core`
- [ ] Update documentation
- [ ] Create GitHub release
- [ ] Announce on social media
- [ ] Restore workspace dependencies
- [ ] Commit and tag version

---

Good luck with your first publish! 🎉
