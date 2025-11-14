#!/bin/bash
# Restore workspace dependencies after publishing

echo "🔄 Restoring workspace dependencies..."

# Restore @curisjs/db peerDependencies
sed -i 's/"@curisjs\/core": "\^0.1.0"/"@curisjs\/core": "workspace:*"/' packages/db/package.json

# Restore @curisjs/cli peerDependencies
sed -i 's/"@curisjs\/core": "\^0.1.0"/"@curisjs\/core": "workspace:*"/' packages/cli/package.json
sed -i 's/"@curisjs\/db": "\^0.1.0"/"@curisjs\/db": "workspace:*"/' packages/cli/package.json

echo "✓ Restored workspace dependencies in:"
echo "  - packages/db/package.json"
echo "  - packages/cli/package.json"
