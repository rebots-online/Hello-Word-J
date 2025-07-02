#!/usr/bin/env bash
set -e

# Setup Node dependencies for the root web project
if [ -f package.json ]; then
  echo "Installing root dependencies..."
  npm install
fi

# Setup dependencies for the React Native project
if [ -f HelloWord/package.json ]; then
  echo "Installing HelloWord dependencies..."
  (cd HelloWord && npm install)
fi

echo "Environment setup complete."
