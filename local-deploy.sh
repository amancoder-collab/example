#!/usr/bin/env bash
set -e  # Exit on any error
set -o pipefail

# --- 1️⃣ Setup environment variables ---
ENVIRONMENT="${1:-development}"  # Allow environment override via parameter
PM2_CONFIG="ecosystem.${ENVIRONMENT}.config.js"
APP_PORT=8001
[ "$ENVIRONMENT" = "production" ] && APP_PORT=8000
DEPLOY_PATH="/home/logicrays/deployments"
APP_NAME="test"
SERVICE_NAME="backend"
APP_NAME_LOCAL="${APP_NAME}-${ENVIRONMENT}"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
RELEASE_DIR="${DEPLOY_PATH}/${APP_NAME}-${ENVIRONMENT}/releases/release_$(git rev-parse HEAD)_${TIMESTAMP}"
CURRENT_LINK="${DEPLOY_PATH}/${APP_NAME}-${ENVIRONMENT}/current"
PREVIOUS_LINK="${DEPLOY_PATH}/${APP_NAME}-${ENVIRONMENT}/previous"
KEEP_RELEASES=5

# --- Helper functions ---
log() {
  echo "$(date +'%Y-%m-%d %H:%M:%S') $1"
}

error_exit() {
  log "❌ ERROR: $1"
  # If we were in the middle of a deployment, attempt rollback
  if [ -L "$PREVIOUS_LINK" ] && [ -d "$(readlink -f "$PREVIOUS_LINK")" ]; then
    log "🔄 Rolling back to previous version..."
    ln -sfn "$(readlink -f "$PREVIOUS_LINK")" "$CURRENT_LINK"
    if pm2 list | grep -q "${APP_NAME_LOCAL}"; then
      pm2 reload "${APP_NAME_LOCAL}" --update-env
      pm2 save
    fi
    log "✅ Rollback complete"
  fi
  exit 1
}

cleanup_old_releases() {
  log "🧹 Cleaning up old releases..."
  cd "${DEPLOY_PATH}/${APP_NAME}-${ENVIRONMENT}/releases" || return
  ls -1td release_* | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf
}

# --- 2️⃣ Create release directory ---
log "🚀 Starting deployment for ${ENVIRONMENT} environment"

# Check if PM2 config exists
if [ ! -f "$PM2_CONFIG" ]; then
  error_exit "PM2 config file $PM2_CONFIG not found"
fi

mkdir -p "${RELEASE_DIR}/logs" || error_exit "Failed to create release directory"
chmod 755 "${RELEASE_DIR}/logs"

log "✅ Created release directory: ${RELEASE_DIR}"

# --- 3️⃣ Build artifacts ---
log "⚙️ Installing dependencies..."
npm ci || error_exit "Failed to install dependencies"

log "⚙️ Building project with esbuild..."
if [ "$ENVIRONMENT" = "production" ]; then
  npm run build:prod || error_exit "Production build failed"
else
  npm run build || error_exit "Build failed"
fi

# --- 4️⃣ Copy build artifacts to release directory ---
log "⚙️ Copying build artifacts..."
rsync -av --exclude="node_modules" --exclude=".git" dist/ "${RELEASE_DIR}/" || error_exit "Failed to copy artifacts"

# Also copy the package.json from dist
if [ -f "dist/package.json" ]; then
  cp dist/package.json "${RELEASE_DIR}/"
fi

# Link environment file
if [ -f "$(pwd)/.env.${ENVIRONMENT}" ]; then
  ln -sf "$(pwd)/.env.${ENVIRONMENT}" "${RELEASE_DIR}/.env"
elif [ -f "$(pwd)/.env" ]; then
  ln -sf "$(pwd)/.env" "${RELEASE_DIR}/.env"
else
  error_exit "No .env file found"
fi

# --- 5️⃣ Install production dependencies ---
log "⚙️ Installing production dependencies in release directory..."
cd "${RELEASE_DIR}" || error_exit "Failed to change to release directory"
npm ci --production || error_exit "Failed to install production dependencies"

# --- 6️⃣ Database migrations ---
log "⚙️ Running database migrations..."
npx prisma migrate deploy || error_exit "Database migration failed"
npx prisma generate || error_exit "Prisma client generation failed"

# Only run seed in development environment
if [ "$ENVIRONMENT" = "development" ]; then
  log "⚙️ Running database seed..."
  NODE_ENV=${ENVIRONMENT} npx prisma db seed || error_exit "Database seed failed"
fi

# --- 7️⃣ Update symlinks for zero-downtime deployment ---
# Store the current as previous before updating
if [ -L "$CURRENT_LINK" ] && [ -d "$(readlink -f "$CURRENT_LINK")" ]; then
  ln -sfn "$(readlink -f "$CURRENT_LINK")" "$PREVIOUS_LINK"
fi

# Point the "current" symlink to this release
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK" || error_exit "Failed to update current symlink"

# --- 8️⃣ Deploy using PM2 ---
log "⚙️ Checking for PM2..."
if ! command -v pm2 &> /dev/null; then
  log "⚙️ Installing PM2..."
  npm install -g pm2 || error_exit "Failed to install PM2"
fi

cd "$CURRENT_LINK" || error_exit "Failed to change to current directory"

# Create a temporary PM2 config that uses our APP_NAME_LOCAL if needed
if [ -f "$PM2_CONFIG" ]; then
  log "⚙️ Using PM2 config: $PM2_CONFIG with app name: ${APP_NAME_LOCAL}"
  # This is a temp solution - a better approach would be to modify the config with jq or similar
  export PM2_APP_NAME="${APP_NAME_LOCAL}"
fi

log "⚙️ Starting or reloading PM2 process..."
if pm2 list | grep -q "${APP_NAME_LOCAL}"; then
  log "🔁 Reloading existing PM2 process: ${APP_NAME_LOCAL}"
  pm2 reload "${APP_NAME_LOCAL}" --update-env || error_exit "Failed to reload PM2 process"
else
  log "🚀 Starting new PM2 process: ${APP_NAME_LOCAL}"
  pm2 start "${PM2_CONFIG}" --update-env --name "${APP_NAME_LOCAL}" || error_exit "Failed to start PM2 process"
fi

pm2 save || log "Warning: Failed to save PM2 process list"

# --- 9️⃣ Verify deployment ---
log "⏳ Waiting for app to start..."
sleep 10

log "🌐 Checking health endpoint..."
max_attempts=5
attempt=1
while [ $attempt -le $max_attempts ]; do
  if response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:${APP_PORT}/health"); then
    if [ "$response" -eq 200 ]; then
      log "✅ Health check passed!"
      break
    fi
  fi
  
  log "Attempt $attempt failed: HTTP $response"
  if [ $attempt -eq $max_attempts ]; then
    error_exit "Health check failed after $max_attempts attempts"
  fi
  sleep 5
  attempt=$((attempt + 1))
done

# --- 🔟 Cleanup ---
cleanup_old_releases

log "✅ Deployment completed successfully!"
exit 0
