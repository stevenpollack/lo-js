#!/usr/bin/env node

/**
 * Environment Setup Script
 *
 * This script helps with switching between different environment configurations.
 * It copies the specified environment file to .env in the project root.
 *
 * Usage:
 *   node scripts/env-setup.js [env]
 *
 * Where [env] is one of:
 *   - local (default)
 *   - prod
 */

const fs = require('fs');
const path = require('path');

// Get the environment argument
const targetEnv = process.argv[2] || 'local';

// Define the mapping of arguments to environment files
const envFiles = {
  local: 'local.env',
  prod: 'prod.env',
  // Add more as needed
};

// Get the source file path
const sourceFile = envFiles[targetEnv];

if (!sourceFile) {
  console.error(`Error: Unknown environment "${targetEnv}"`);
  console.log('Available environments:');
  Object.keys(envFiles).forEach((env) => {
    console.log(`  - ${env}`);
  });
  process.exit(1);
}

// Check if the source file exists
const sourcePath = path.join(__dirname, '..', sourceFile);
if (!fs.existsSync(sourcePath)) {
  console.error(`Error: Environment file "${sourceFile}" not found`);
  process.exit(1);
}

// Copy the source file to .env
const destPath = path.join(__dirname, '..', '.env');
try {
  fs.copyFileSync(sourcePath, destPath);
  console.log(
    `Successfully set environment to "${targetEnv}" (copied ${sourceFile} to .env)`,
  );
} catch (error) {
  console.error(`Error copying file: ${error.message}`);
  process.exit(1);
}
