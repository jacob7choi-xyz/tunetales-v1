#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const criticalFiles = [
  'app/components/StoryCard.tsx',
  'app/components/FloatingNote.tsx',
  'app/components/FloatingNotesLayer.tsx',
  'app/api/generate/route.ts',
  'app/api/spotify/route.ts',
  'app/page.tsx',
  'app/layout.tsx',
];

let allPassed = true;

console.log('🔍 Verifying file integrity...');

for (const file of criticalFiles) {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${file} is missing!`);
    allPassed = false;
    continue;
  }

  try {
    execSync(`tsc --noEmit ${filePath}`, { stdio: 'ignore' });
    console.log(`✅ ${file} is valid`);
  } catch (e) {
    console.error(`❌ ${file} has TypeScript errors`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\n✨ All files are valid!');
  console.log('✅ File verification passed.');
  process.exit(0);
} else {
  console.error('\n❌ File verification failed. Please fix the issues before committing.');
  process.exit(1);
}
