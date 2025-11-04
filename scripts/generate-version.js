// scripts/generate-version.js
// This script generates a version file from git info at build time

import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fetch PR information from GitHub
async function fetchPRInfo(owner, repo, commitHash) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/commits/${commitHash}/pulls`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const pulls = JSON.parse(data);
            if (pulls && pulls.length > 0) {
              const pr = pulls[0];
              resolve({
                prNumber: pr.number,
                prTitle: pr.title,
                prBody: pr.body,
                prUrl: pr.html_url,
                prAuthor: pr.user.login,
                prMergedAt: pr.merged_at
              });
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
}

async function generateVersion() {
try {
  // Get git commit hash (short)
  const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
  
  // Get full commit hash for GitHub API
  const fullCommitHash = execSync('git rev-parse HEAD').toString().trim();
  
  // Get git branch
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  
  // Get commit author name
  const author = execSync('git log -1 --pretty=format:"%an"').toString().trim();
  
  // Get commit author email
  const authorEmail = execSync('git log -1 --pretty=format:"%ae"').toString().trim();
  
  // Get commit date
  const commitDate = execSync('git log -1 --pretty=format:"%ai"').toString().trim();
  
  // Get commit message (subject line)
  const commitMessage = execSync('git log -1 --pretty=format:"%s"').toString().trim();
  
  // Get commit body (full description)
  const commitBody = execSync('git log -1 --pretty=format:"%b"').toString().trim();
  
  // Get build timestamp
  const buildTime = new Date().toISOString();
  
  // Get total commit count for versioning
  const commitCount = parseInt(execSync('git rev-list --count HEAD').toString().trim());
  
  // Smart versioning: increment patch for each commit, roll over to minor every 10 commits
  // Base version: 1.0.0
  const baseMajor = 1;
  const baseMinor = 0;
  
  // Calculate increments
  const minorIncrement = Math.floor(commitCount / 10);
  const patch = commitCount % 10;
  
  const major = baseMajor;
  const minor = baseMinor + minorIncrement;
  const semver = `${major}.${minor}.${patch}`;

  // Try to fetch PR information from GitHub
  console.log('🔍 Checking for PR information...');
  const prInfo = await fetchPRInfo('Jakeclearwater', 'wordleleaderboard', fullCommitHash);

  const versionInfo = {
    version: semver,
    commit: commitHash,
    branch: branch,
    buildTime: buildTime,
    buildTimestamp: Date.now(),
    commitCount: commitCount,
    author: author,
    authorEmail: authorEmail,
    commitDate: commitDate,
    commitMessage: commitMessage,
    commitBody: commitBody,
    ...(prInfo && { pr: prInfo })
  };

  // Write to src/version.json
  const outputPath = join(__dirname, '..', 'src', 'version.json');
  writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));
  
  if (prInfo) {
    console.log('✅ Version info generated with PR #' + prInfo.prNumber + ':', versionInfo);
  } else {
    console.log('✅ Version info generated (no PR found):', versionInfo);
  }
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
}

// Run the async function
generateVersion();