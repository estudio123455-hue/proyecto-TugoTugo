#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Starting build process...');

try {
  // Step 1: Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated successfully');

  // Step 2: Try to deploy migrations (optional)
  console.log('🔄 Attempting to deploy migrations...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations deployed successfully');
  } catch (error) {
    console.warn('⚠️  Migration deployment failed (this is OK during build):');
    console.warn(error.message);
    console.log('📝 Migrations will be applied when the app starts');
  }

  // Step 3: Build the application
  console.log('🏗️  Building Next.js application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

console.log('🎉 Build process completed!');
