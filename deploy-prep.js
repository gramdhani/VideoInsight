#!/usr/bin/env node

/**
 * Deployment preparation script
 * This script ensures the application is ready for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function log(message) {
  console.log(`[DEPLOY-PREP] ${message}`);
}

function checkEnvironmentVariables() {
  log('Checking environment variables...');
  
  const requiredVars = ['DATABASE_URL', 'SESSION_SECRET', 'REPL_ID'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  log('✅ All required environment variables are set');
  return true;
}

function runBuild() {
  log('Running production build...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    log('✅ Build completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

function verifyBuildOutput() {
  log('Verifying build output...');
  
  const expectedPaths = [
    path.resolve('dist'),
    path.resolve('dist/public'),
    path.resolve('dist/public/index.html'),
    path.resolve('dist/index.js')
  ];
  
  const missingPaths = expectedPaths.filter(filePath => !fs.existsSync(filePath));
  
  if (missingPaths.length > 0) {
    console.error('❌ Missing build files:');
    missingPaths.forEach(filePath => console.error(`  - ${filePath}`));
    return false;
  }
  
  log('✅ All build files are present');
  return true;
}

function setupProductionFiles() {
  log('Setting up production file structure...');
  
  const serverPublicPath = path.resolve('server/public');
  const distPublicPath = path.resolve('dist/public');
  
  try {
    // Ensure server directory exists
    if (!fs.existsSync(path.resolve('server'))) {
      fs.mkdirSync(path.resolve('server'), { recursive: true });
    }
    
    // Copy dist/public to server/public if it doesn't exist
    if (fs.existsSync(distPublicPath) && !fs.existsSync(serverPublicPath)) {
      log('Copying build files to server/public...');
      execSync(`cp -r "${distPublicPath}" "${serverPublicPath}"`, { stdio: 'inherit' });
    }
    
    log('✅ Production file structure ready');
    return true;
  } catch (error) {
    console.error('❌ Failed to setup production files:', error.message);
    return false;
  }
}

function main() {
  log('Starting deployment preparation...');
  
  const steps = [
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'Build Process', fn: runBuild },
    { name: 'Build Verification', fn: verifyBuildOutput },
    { name: 'Production Setup', fn: setupProductionFiles }
  ];
  
  for (const step of steps) {
    if (!step.fn()) {
      console.error(`❌ Deployment preparation failed at: ${step.name}`);
      process.exit(1);
    }
  }
  
  log('🚀 Deployment preparation completed successfully!');
  log('The application is ready for production deployment.');
}

main();