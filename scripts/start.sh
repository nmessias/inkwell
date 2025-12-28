#!/bin/bash
set -e

echo "=== Inkwell Startup ==="

# Ensure data directory exists
mkdir -p /app/data

# Run Better Auth database migration
echo "Running database migrations..."
bunx @better-auth/cli migrate --config ./auth.ts -y

echo "Starting Inkwell server..."
exec bun run src/index.ts
