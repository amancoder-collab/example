#!/bin/bash

# Load environment variables (optional, if using .env)
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

echo "🚀 Starting Prisma drift check for PRODUCTION..."

# Set your production database URL here or load from .env
PROD_DB_URL=$DATABASE_URL

if [ -z "$PROD_DB_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set in your environment."
  exit 1
fi

# Generate the diff script to see what changed
echo "🔎 Checking schema differences..."
npx prisma migrate diff \
  --from-url "$PROD_DB_URL" \
  --to-schema-datamodel prisma/schema.prisma \
  --script \
  --shadow-database-url "$PROD_DB_URL" > drift.sql

echo "✅ Drift check complete. See 'drift.sql' for differences."

# Prompt for next steps
echo ""
echo "⚠️  Please review 'drift.sql' carefully."
echo "⚠️  If there are real differences, create a new migration manually."
echo "⚠️  Example:"
echo "     npx prisma migrate dev --name fix-drift"
echo "     npx prisma migrate resolve --applied <new_migration_name>"
echo ""
echo "🟩 When ready, deploy migrations to production using:"
echo "     npx prisma migrate deploy"
echo ""
echo "🔥 All done. Make sure to back up your production database before deploying!"



