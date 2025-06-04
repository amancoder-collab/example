#!/bin/bash

# 🚨 Warning
echo "⚠️  WARNING: This will DELETE all migration history and create a new baseline migration '0_init'."
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Aborting."
  exit 1
fi

# Load environment variables from .env (auto export all)
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Ensure PROD_DATABASE_URL is set
: "${PROD_DATABASE_URL:?Need to set PROD_DATABASE_URL in env}"

# Export DATABASE_URL for Prisma CLI to use the same connection string
export DATABASE_URL="$PROD_DATABASE_URL"

echo "🧹 Clearing migration history from the database..."


# Remove "?schema=public" for psql
PSQL_URL="${PROD_DATABASE_URL%\?schema=public}"

echo "🧹 Using psql connection: $PSQL_URL"
psql -d "$PSQL_URL" -c "TRUNCATE TABLE _prisma_migrations;"


echo "🧹 Deleting prisma/migrations folder..."
rm -rf prisma/migrations

echo "📝 Generating baseline SQL script..."
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > baseline.sql

# npx prisma migrate diff \
#   --from-url "$PROD_DATABASE_URL" \
#   --to-schema-datamodel prisma/schema.prisma \
#   --script > baseline.sql

echo "📁 Creating new baseline migration folder..."
mkdir -p prisma/migrations/0_init

mv baseline.sql prisma/migrations/0_init/migration.sql

echo "🔒 Creating migration_lock.toml..."
echo '[lock]' > prisma/migrations/0_init/migration_lock.toml

echo "✅ Marking new baseline migration '0_init' as applied..."
npx prisma migrate resolve --applied 0_init

echo "🔄 Pushing schema to the database..."
npx prisma db push

echo "🚀 Deploying baseline migration..."
npx prisma migrate deploy

echo "🎉 Done! New baseline migration '0_init' created and applied."
