// scripts/generate-version.js
// This script generates a version file from git info at build time

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // Get git commit hash (short)
  const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
  
  // Get git branch
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  
  // Get build timestamp
  const buildTime = new Date().toISOString();
  
  // Get total commit count for versioning
  const commitCount = parseInt(execSync('git rev-list --count HEAD').toString().trim());
  
  // Smart versioning: increment patch for each commit, roll over to minor every 10 commits
  // Base version: 1.0.0
  const baseMajor = 1;
  const baseMinor = 0;
  const basePatch = 0;
  
  // Calculate increments
  const minorIncrement = Math.floor(commitCount / 10);
  const patch = commitCount % 10;
  
  const major = baseMajor;
  const minor = baseMinor + minorIncrement;
  const semver = `${major}.${minor}.${patch}`;

  const versionInfo = {
    version: semver,
    commit: commitHash,
    branch: branch,
    buildTime: buildTime,
    buildTimestamp: Date.now(),
    commitCount: commitCount
  };

  // Write to src/version.json
  const outputPath = join(__dirname, '..', 'src', 'version.json');
  writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));
  
  console.log('✅ Version info generated:', versionInfo);
} catch (error) {
  console.error('❌ Failed to generate version info:', error.message);
  // Fallback version
  const fallback = {
    version: '1.0.0',
    commit: 'unknown',
    branch: 'unknown',
    buildTime: new Date().toISOString(),
    buildTimestamp: Date.now()
  };
  const outputPath = join(__dirname, '..', 'src', 'version.json');
  writeFileSync(outputPath, JSON.stringify(fallback, null, 2));
}
