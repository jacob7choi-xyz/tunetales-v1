const fs = require('fs');
const path = require('path');

const CRITICAL_FILES = [
  'app/components/StoryCard.tsx',
  'app/components/FloatingNote.tsx',
  'app/components/FloatingNotesLayer.tsx',
  'app/api/generate/route.ts',
  'app/api/spotify/route.ts',
  'app/page.tsx',
  'app/layout.tsx',
];

function verifyFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.length === 0) {
      console.error(`❌ ${filePath} is empty`);
      return false;
    }

    // Basic syntax checks
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      if (!content.includes('export')) {
        console.error(`❌ ${filePath} might be corrupted (no exports found)`);
        return false;
      }
    }

    console.log(`✅ ${filePath} is valid`);
    return true;
  } catch (error) {
    console.error(`❌ Error checking ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  let allValid = true;
  
  for (const file of CRITICAL_FILES) {
    if (!verifyFile(file)) {
      allValid = false;
    }
  }

  if (!allValid) {
    console.error('\n⚠️ Some files are corrupted or empty. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\n✨ All files are valid!');
  }
}

main(); 