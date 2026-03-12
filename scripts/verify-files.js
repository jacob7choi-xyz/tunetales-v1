#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const criticalFiles = [
  'app/components/StoryCard.tsx',
  'app/components/FloatingNotesLayer.tsx',
  'app/page.tsx',
  'app/layout.tsx',
  'app/not-found.tsx',
  'app/artists/frank-ocean/page.tsx',
  'app/artists/ComingSoonArtist.tsx',
];

let allPassed = true;

console.log('[SCAN] Verifying file integrity...');

for (const file of criticalFiles) {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] ${file} is missing!`);
    allPassed = false;
    continue;
  }

  try {
    execSync(`tsc --noEmit ${filePath}`, { stdio: 'ignore' });
    console.log(`[OK] ${file} is valid`);
  } catch (e) {
    console.error(`[FAIL] ${file} has TypeScript errors`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\n[DONE] All files are valid!');
  console.log('[OK] File verification passed.');
  process.exit(0);
} else {
  console.error('\n[FAIL] File verification failed. Please fix the issues before committing.');
  process.exit(1);
}
