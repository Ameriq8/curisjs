#!/bin/bash
# Fix workspace dependencies for publishing

echo "🔧 Fixing workspace dependencies..."

# Fix @curisjs/db peerDependencies
sed -i 's/"@curisjs\/core": "workspace:\*"/"@curisjs\/core": "^0.1.0"/' packages/db/package.json

# Fix @curisjs/cli peerDependencies
sed -i 's/"@curisjs\/core": "workspace:\*"/"@curisjs\/core": "^0.1.0"/' packages/cli/package.json
sed -i 's/"@curisjs\/db": "workspace:\*"/"@curisjs\/db": "^0.1.0"/' packages/cli/package.json

echo "✓ Fixed workspace dependencies in:"
echo "  - packages/db/package.json"
echo "  - packages/cli/package.json"
