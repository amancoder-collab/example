#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const isProd = args.includes('--prod') || args.includes('--production');
const isWatch = args.includes('--watch');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Build command
const buildCmd = `node esbuild.config.js`;

try {
  console.log(`🚀 Starting build...`);
  
  // Clean dist directory
  console.log('🧹 Cleaning dist directory...');
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });
  
  // Run build
  console.log('⚙️ Running esbuild...');
  execSync(buildCmd, { stdio: 'inherit' });
  
  // Copy necessary files (like prisma schema)
  console.log('📋 Copying additional files...');
  if (fs.existsSync('prisma')) {
    const prismaDir = path.join(distDir, 'prisma');
    if (!fs.existsSync(prismaDir)) {
      fs.mkdirSync(prismaDir, { recursive: true });
    }
    
    if (fs.existsSync('prisma/schema.prisma')) {
      fs.copyFileSync('prisma/schema.prisma', path.join(prismaDir, 'schema.prisma'));
    }
  }
  
  // Copy package.json and update it for production
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (isProd) {
    // Remove dev dependencies for production build
    delete packageJson.devDependencies;
    // Keep only necessary scripts
    packageJson.scripts = {
      start: packageJson.scripts.start || 'node main.js'
    };
  }
  
  fs.writeFileSync(
    path.join(distDir, 'package.json'), 
    JSON.stringify(packageJson, null, 2)
  );
  
  console.log('✅ Build completed successfully!');
  
  if (isWatch) {
    console.log('👀 Watching for changes...');
    // Implement watch mode if needed
  }
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
} 