#!/usr/bin/env node
/* eslint-disable */

// DBA Script for Wordle Leaderboard Firestore Database
// This script provides basic database administration capabilities

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch
} from 'firebase/firestore';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile() {
  try {
    const envPath = join(__dirname, '.env');
    const envFile = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error loading .env file:', error.message);
    console.log('Please ensure your .env file exists with Firebase credentials');
    process.exit(1);
  }
}

const env = loadEnvFile();

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: env.VITE_API_KEY,
  authDomain: env.VITE_AUTH_DOMAIN,
  projectId: env.VITE_PROJECT_ID,
  storageBucket: env.VITE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_MESSAGING_SENDER_ID,
  appId: env.VITE_APP_ID,
  measurementId: env.VITE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class WordleLeaderboardDBA {
  constructor() {
    this.db = db;
    console.log(`Connected to Firestore project: ${firebaseConfig.projectId}`);
  }

  // List all collections
  async listCollections() {
    console.log('\n=== Available Collections ===');
    // Note: Client SDK doesn't have listCollections(), so we'll check common ones
    const commonCollections = ['leaderboard', 'scores', 'users', 'games', 'daily_scores'];
    
    for (const collectionName of commonCollections) {
      try {
        const snapshot = await getDocs(collection(this.db, collectionName));
        if (!snapshot.empty) {
          console.log(`✓ ${collectionName} (${snapshot.size} documents)`);
        }
      } catch (error) {
        // Collection doesn't exist or no permission
      }
    }
  }

  // Show collection data
  async showCollection(collectionName, limitCount = 10) {
    // Validate limit parameter
    if (isNaN(limitCount) || limitCount <= 0) {
      console.log(`Error: Invalid limit "${limitCount}". Please provide a positive number.`);
      return;
    }
    
    console.log(`\n=== ${collectionName} Collection (limited to ${limitCount} documents) ===`);
    try {
      const q = query(collection(this.db, collectionName), limit(limitCount));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('No documents found in this collection.');
        return;
      }

      snapshot.forEach((doc) => {
        console.log(`Document ID: ${doc.id}`);
        console.log('Data:', JSON.stringify(doc.data(), null, 2));
        console.log('---');
      });
    } catch (error) {
      console.error(`Error reading collection ${collectionName}:`, error.message);
    }
  }

  // Get document by ID
  async getDocument(collectionName, docId) {
    console.log(`\n=== Document: ${collectionName}/${docId} ===`);
    try {
      const docRef = doc(this.db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('Document data:', JSON.stringify(docSnap.data(), null, 2));
      } else {
        console.log('Document does not exist');
      }
    } catch (error) {
      console.error('Error getting document:', error.message);
    }
  }

  // Search documents by field
  async searchDocuments(collectionName, field, operator, value, limitCount = 10) {
    console.log(`\n=== Search: ${collectionName} where ${field} ${operator} ${value} ===`);
    try {
      const q = query(
        collection(this.db, collectionName),
        where(field, operator, value),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('No documents found matching the criteria.');
        return;
      }

      snapshot.forEach((doc) => {
        console.log(`Document ID: ${doc.id}`);
        console.log('Data:', JSON.stringify(doc.data(), null, 2));
        console.log('---');
      });
    } catch (error) {
      console.error('Error searching documents:', error.message);
    }
  }

  // Add a new document
  async addDocument(collectionName, data) {
    console.log(`\n=== Adding document to ${collectionName} ===`);
    try {
      const docRef = await addDoc(collection(this.db, collectionName), data);
      console.log('Document added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error.message);
    }
  }

  // Update a document
  async updateDocument(collectionName, docId, data) {
    console.log(`\n=== Updating document ${collectionName}/${docId} ===`);
    try {
      const docRef = doc(this.db, collectionName, docId);
      await updateDoc(docRef, data);
      console.log('Document updated successfully');
    } catch (error) {
      console.error('Error updating document:', error.message);
    }
  }

  // Delete a document
  async deleteDocument(collectionName, docId) {
    console.log(`\n=== Deleting document ${collectionName}/${docId} ===`);
    try {
      const docRef = doc(this.db, collectionName, docId);
      await deleteDoc(docRef);
      console.log('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error.message);
    }
  }

  // Show most recent documents by isoDate
  async showRecent(collectionName, limitCount = 10) {
    console.log(`\n=== Most Recent ${collectionName} (by isoDate, limited to ${limitCount}) ===`);
    
    try {
      const q = query(
        collection(this.db, collectionName), 
        orderBy('isoDate', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('No documents found in this collection.');
        return;
      }

      console.log(`Found ${snapshot.size} most recent documents:`);
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        const displayDate = `${data.isoDate} (${new Date(data.isoDate).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })})`;
          
        console.log(`${index + 1}. Document ID: ${doc.id}`);
        console.log(`   isoDate: ${displayDate}`);
        console.log(`   Data:`, JSON.stringify(data, null, 2));
        console.log('---');
      });
    } catch (error) {
      console.error(`Error reading recent documents from ${collectionName}:`, error.message);
    }
  }

  // Count documents in a collection
  async countDocuments(collectionName) {
    console.log(`\n=== Counting documents in ${collectionName} ===`);
    try {
      const snapshot = await getDocs(collection(this.db, collectionName));
      console.log(`Total documents: ${snapshot.size}`);
      return snapshot.size;
    } catch (error) {
      console.error('Error counting documents:', error.message);
    }
  }

  // Find potential date errors (same name, same effective date, different scores)
  async findPotentialDateErrors(collectionName = 'scores', exportToFile = false) {
    console.log(`\n=== Finding potential date errors in ${collectionName} ===`);
    
    try {
      const snapshot = await getDocs(collection(this.db, collectionName));
      
      if (snapshot.empty) {
        console.log('No documents found in this collection.');
        return;
      }

      // Helper function to get effective date from a score record
      const getEffectiveDate = (score) => {
        if (!score.isoDate) return null;
        // Convert ISO datetime to NZ date
        const isoDate = new Date(score.isoDate);
        return new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Pacific/Auckland',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(isoDate);
      };

      // Helper function to add/subtract days from a date string
      const adjustDate = (dateStr, days) => {
        const date = new Date(dateStr + 'T00:00:00.000Z');
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
      };

      // Helper function to create ISO datetime for a given date
      const createISODateTime = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
        return new Date(Date.UTC(
          parseInt(year), 
          parseInt(month) - 1, // Month is 0-indexed
          parseInt(day), 
          0, 0, 0, 0 // Midnight UTC
        )).toISOString();
      };

      // Build a lookup of all existing person-date combinations
      const existingCombinations = new Set();
      const allDocs = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const effectiveDate = getEffectiveDate(data);
        
        if (data.name && effectiveDate) {
          existingCombinations.add(`${data.name}_${effectiveDate}`);
          allDocs.push({
            id: doc.id,
            data: data,
            effectiveDate: effectiveDate
          });
        }
      });

      // Group documents by name and effective date
      const groupedDocs = {};
      
      allDocs.forEach((docInfo) => {
        const key = `${docInfo.data.name}_${docInfo.effectiveDate}`;
        
        if (!groupedDocs[key]) {
          groupedDocs[key] = [];
        }
        
        groupedDocs[key].push(docInfo);
      });

      // Find potential issues (groups with more than one document)
      const potentialIssues = Object.entries(groupedDocs).filter(([key, docs]) => docs.length > 1);
      
      if (potentialIssues.length === 0) {
        console.log('✓ No potential date errors found.');
        return;
      }

      console.log(`Found ${potentialIssues.length} potential date error groups:`);
      console.log(`(These are cases where the same person has multiple scores on the same effective date)\n`);
      
      let totalSuggestions = 0;
      const exportCommands = [];
      const exportReport = [];
      
      // Add header to export report
      exportReport.push('='.repeat(80));
      exportReport.push('WORDLE LEADERBOARD - DATE ERROR REMEDIATION REPORT');
      exportReport.push(`Generated: ${new Date().toISOString()}`);
      exportReport.push(`Collection: ${collectionName}`);
      exportReport.push('='.repeat(80));
      exportReport.push('');
      
      potentialIssues.forEach(([key, duplicateDocs], groupIndex) => {
        console.log(`${groupIndex + 1}. Potential issue: ${key}`);
        console.log(`   Found ${duplicateDocs.length} entries for same person/date:`);
        
        exportReport.push(`${groupIndex + 1}. CONFLICT: ${key}`);
        exportReport.push(`   Found ${duplicateDocs.length} entries for same person/date:`);
        
        // Sort by document ID to get consistent ordering
        duplicateDocs.sort((a, b) => a.id.localeCompare(b.id));
        
        duplicateDocs.forEach((docInfo, index) => {
          const logLine = `   ${index + 1}. Document ID: ${docInfo.id}`;
          const detailsLine = `      Name: ${docInfo.data.name}, Guesses: ${docInfo.data.guesses}`;
          const datesLine = `      Date: ${docInfo.data.date}, ISO: ${docInfo.data.isoDate || 'none'}`;
          const dnfLine = `      DNF: ${docInfo.data.dnf}`;
          
          console.log(logLine);
          console.log(detailsLine);
          console.log(datesLine);
          console.log(dnfLine);
          
          exportReport.push(logLine);
          exportReport.push(detailsLine);
          exportReport.push(datesLine);
          exportReport.push(dnfLine);
          
          if (docInfo.data.wordleNumber) {
            const wordleLine = `      Wordle #: ${docInfo.data.wordleNumber}`;
            console.log(wordleLine);
            exportReport.push(wordleLine);
          }
        });
        
        // Find available dates for each duplicate (skip the first one, assume it's correct)
        console.log(`\n   🔧 SUGGESTED FIXES:`);
        exportReport.push('');
        exportReport.push('   🔧 SUGGESTED FIXES:');
        
        for (let i = 1; i < duplicateDocs.length; i++) {
          const docToFix = duplicateDocs[i];
          const currentDate = docToFix.effectiveDate;
          const personName = docToFix.data.name;
          
          // Check dates around the current date (±7 days)
          let suggestedDate = null;
          
          for (let dayOffset of [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7]) {
            const candidateDate = adjustDate(currentDate, dayOffset);
            const candidateKey = `${personName}_${candidateDate}`;
            
            if (!existingCombinations.has(candidateKey)) {
              suggestedDate = candidateDate;
              break;
            }
          }
          
          if (suggestedDate) {
            const newISODate = createISODateTime(suggestedDate);
            const command = `node dba-script.js update scores ${docToFix.id} '{"date":"${suggestedDate}","isoDate":"${newISODate}"}'`;
            
            const fixLine = `   ${i + 1}. Fix for Document ${docToFix.id}:`;
            const moveLine = `      Move from ${currentDate} to ${suggestedDate}`;
            const commandLine = `      Command: ${command}`;
            
            console.log(fixLine);
            console.log(moveLine);
            console.log(commandLine);
            
            exportReport.push(fixLine);
            exportReport.push(moveLine);
            exportReport.push(commandLine);
            
            exportCommands.push(command);
            totalSuggestions++;
            
            // Add this suggested combination to our set to avoid conflicts
            existingCombinations.add(`${personName}_${suggestedDate}`);
          } else {
            const warningLine = `   ${i + 1}. ⚠️  No available date found for Document ${docToFix.id} within ±7 days`;
            const reviewLine = `      Manual review required for: ${personName} on ${currentDate}`;
            
            console.log(warningLine);
            console.log(reviewLine);
            
            exportReport.push(warningLine);
            exportReport.push(reviewLine);
          }
        }
        
        console.log(''); // Empty line between groups
        exportReport.push('');
        exportReport.push('-'.repeat(80));
        exportReport.push('');
      });

      console.log(`\n📊 SUMMARY:`);
      console.log(`   Found ${potentialIssues.length} date conflict groups`);
      console.log(`   Generated ${totalSuggestions} automatic fix suggestions`);
      
      exportReport.push('📊 SUMMARY:');
      exportReport.push(`   Found ${potentialIssues.length} date conflict groups`);
      exportReport.push(`   Generated ${totalSuggestions} automatic fix suggestions`);
      exportReport.push('');

      if (exportToFile && totalSuggestions > 0) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const reportFilename = `date-errors-report-${timestamp}.txt`;
        const commandsFilename = `date-errors-commands-${timestamp}.sh`;
        
        // Write detailed report
        try {
          writeFileSync(reportFilename, exportReport.join('\n'));
          console.log(`\n📄 DETAILED REPORT: Saved to ${reportFilename}`);
        } catch (error) {
          console.error(`Error writing report file: ${error.message}`);
        }
        
        // Write executable commands
        try {
          const commandsContent = [
            '#!/bin/bash',
            '# Date Error Remediation Commands',
            `# Generated: ${new Date().toISOString()}`,
            `# Total commands: ${totalSuggestions}`,
            '',
            'echo "Starting date error remediation..."',
            'echo "Total commands to execute: ' + totalSuggestions + '"',
            'echo ""',
            '',
            ...exportCommands.map((cmd, index) => `echo "Command ${index + 1}/${totalSuggestions}: ${cmd.split(' ').slice(-2).join(' ')}"\n${cmd}`),
            '',
            'echo ""',
            'echo "Date error remediation completed!"'
          ];
          
          writeFileSync(commandsFilename, commandsContent.join('\n'));
          console.log(`📜 BATCH COMMANDS: Saved to ${commandsFilename}`);
          console.log(`   To execute all fixes: chmod +x ${commandsFilename} && ./${commandsFilename}`);
        } catch (error) {
          console.error(`Error writing commands file: ${error.message}`);
        }
      }

      console.log(`\n💡 TIP: You can copy and paste the commands above to fix each issue`);
      if (!exportToFile) {
        console.log(`   Or run: node dba-script.js find-date-errors ${collectionName} --export`);
      }
      console.log(`   Or create a script to run them all at once.`);

      return potentialIssues.length;
    } catch (error) {
      console.error('Error finding potential date errors:', error.message);
    }
  }

  async showToday(collectionName) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const todayStart = `${today}T00:00:00.000Z`;
    const todayEnd = `${today}T23:59:59.999Z`;
    
    console.log(`\n=== Today's ${collectionName} (${today}) ===`);
    console.log(`Searching for records between ${todayStart} and ${todayEnd} (UTC)`);
    
    try {
      const q = query(
        collection(this.db, collectionName),
        where('isoDate', '>=', todayStart),
        where('isoDate', '<=', todayEnd),
        orderBy('isoDate', 'asc')
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log(`No documents found for today (${today}).`);
        return;
      }

      console.log(`Found ${snapshot.size} documents for today:`);
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        const submissionTime = new Date(data.isoDate).toLocaleString('en-NZ', {
          timeZone: 'Pacific/Auckland',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        
        console.log(`${index + 1}. Document ID: ${doc.id}`);
        console.log(`   Submission time (NZ): ${submissionTime}`);
        console.log(`   Data:`, JSON.stringify(data, null, 2));
        console.log('---');
      });
    } catch (error) {
      console.error(`Error reading today's documents from ${collectionName}:`, error.message);
    }
  }

  // Delete scores before a certain date (for yearly reset)
  async deleteScoresBeforeDate(collectionName = 'scores', beforeDate, dryRun = true) {
    console.log(`\n=== ${dryRun ? 'DRY RUN - ' : ''}Deleting scores before ${beforeDate} in ${collectionName} ===`);
    
    // Validate date format (YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(beforeDate)) {
      console.error('Error: Date must be in YYYY-MM-DD format (e.g., 2025-01-01)');
      return;
    }

    try {
      const snapshot = await getDocs(collection(this.db, collectionName));
      
      if (snapshot.empty) {
        console.log('No documents found in this collection.');
        return;
      }

      // Convert beforeDate to ISO format for comparison
      const beforeDateISO = `${beforeDate}T00:00:00.000Z`;

      const documentsToDelete = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        if (data.isoDate && data.isoDate < beforeDateISO) {
          documentsToDelete.push({
            id: docSnap.id,
            date: data.isoDate,
            name: data.name,
            guesses: data.guesses,
            dnf: data.dnf,
            data: data
          });
        }
      });

      if (documentsToDelete.length === 0) {
        console.log(`No documents found before ${beforeDate}.`);
        return;
      }

      // Sort by date for display
      documentsToDelete.sort((a, b) => a.date.localeCompare(b.date));

      console.log(`Found ${documentsToDelete.length} documents to delete:`);
      
      // Show summary by month/year
      const monthCounts = {};
      documentsToDelete.forEach((docInfo) => {
        const monthKey = docInfo.date.substring(0, 7); // YYYY-MM
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
      });

      console.log('\nDocuments by month:');
      Object.keys(monthCounts).sort().forEach(month => {
        console.log(`  ${month}: ${monthCounts[month]} documents`);
      });

      // Show first and last few documents
      console.log('\nFirst 5 documents to delete:');
      documentsToDelete.slice(0, 5).forEach((docInfo, index) => {
        console.log(`  ${index + 1}. ID: ${docInfo.id}, Date: ${docInfo.date}, Name: ${docInfo.name}, Guesses: ${docInfo.guesses}${docInfo.dnf ? ' (DNF)' : ''}`);
      });

      if (documentsToDelete.length > 10) {
        console.log(`  ... (${documentsToDelete.length - 10} more documents) ...`);
      }

      if (documentsToDelete.length > 5) {
        console.log('\nLast 5 documents to delete:');
        documentsToDelete.slice(-5).forEach((docInfo, index) => {
          console.log(`  ${documentsToDelete.length - 4 + index}. ID: ${docInfo.id}, Date: ${docInfo.date}, Name: ${docInfo.name}, Guesses: ${docInfo.guesses}${docInfo.dnf ? ' (DNF)' : ''}`);
        });
      }

      if (!dryRun) {
        console.log(`\n⚠️  DELETING ${documentsToDelete.length} documents...`);
        
        // Delete in batches of 500 (Firestore batch limit)
        const batchSize = 500;
        let deletedCount = 0;

        for (let i = 0; i < documentsToDelete.length; i += batchSize) {
          const batch = writeBatch(this.db);
          const batchDocs = documentsToDelete.slice(i, i + batchSize);
          
          batchDocs.forEach(docInfo => {
            const docRef = doc(this.db, collectionName, docInfo.id);
            batch.delete(docRef);
          });

          await batch.commit();
          deletedCount += batchDocs.length;
          console.log(`  Deleted batch ${Math.floor(i / batchSize) + 1}: ${deletedCount}/${documentsToDelete.length} documents`);
        }

        console.log(`\n✓ Successfully deleted ${deletedCount} documents from ${collectionName}`);
      } else {
        console.log(`\n⚠️  This was a dry run. No documents were deleted.`);
        console.log(`To actually delete these ${documentsToDelete.length} documents, use:`);
        console.log(`  node dba-script.js delete-before ${collectionName} ${beforeDate} --execute`);
      }

      return documentsToDelete.length;
    } catch (error) {
      console.error('Error deleting scores before date:', error.message);
    }
  }

  // Find names with emojis or special characters
  async findProblematicNames(collectionName = 'scores') {
    console.log(`\n=== Finding names with emojis or special characters in ${collectionName} ===`);
    try {
      const snapshot = await getDocs(collection(this.db, collectionName));
      
      if (snapshot.empty) {
        console.log('No documents found in this collection.');
        return;
      }

      const problematicDocs = [];
      const validNamePattern = /^[a-zA-Z ]*$/;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.name && !validNamePattern.test(data.name)) {
          problematicDocs.push({
            id: doc.id,
            name: data.name,
            guesses: data.guesses,
            date: data.date,
            dnf: data.dnf
          });
        }
      });

      if (problematicDocs.length === 0) {
        console.log('✓ No problematic names found. All names contain only letters and spaces.');
        return;
      }

      console.log(`Found ${problematicDocs.length} documents with problematic names:`);
      problematicDocs.forEach((doc, index) => {
        console.log(`${index + 1}. Document ID: ${doc.id}`);
        console.log(`   Name: "${doc.name}"`);
        console.log(`   Guesses: ${doc.guesses}, Date: ${doc.date}, DNF: ${doc.dnf}`);
        console.log('---');
      });

      return problematicDocs;
    } catch (error) {
      console.error('Error finding problematic names:', error.message);
    }
  }

  // Bulk fix names with emojis/special characters
  async fixProblematicNames(collectionName = 'scores', dryRun = true) {
    console.log(`\n=== ${dryRun ? 'DRY RUN - ' : ''}Fixing problematic names in ${collectionName} ===`);
    
    const problematicDocs = await this.findProblematicNames(collectionName);
    
    if (!problematicDocs || problematicDocs.length === 0) {
      return;
    }

    console.log(`\n${dryRun ? 'Would fix' : 'Fixing'} ${problematicDocs.length} documents:`);
    
    for (const docData of problematicDocs) {
      // Remove emojis and special characters, keep only letters and spaces
      const cleanedName = docData.name.replace(/[^a-zA-Z ]/g, '').trim();
      
      if (cleanedName.length === 0) {
        console.log(`⚠️  Document ${docData.id}: Name "${docData.name}" would become empty after cleaning. Skipping.`);
        continue;
      }

      console.log(`Document ${docData.id}:`);
      console.log(`  Before: "${docData.name}"`);
      console.log(`  After:  "${cleanedName}"`);
      
      if (!dryRun) {
        try {
          await this.updateDocument(collectionName, docData.id, { name: cleanedName });
          console.log(`  ✓ Updated successfully`);
        } catch (error) {
          console.log(`  ✗ Failed to update: ${error.message}`);
        }
      } else {
        console.log(`  (dry run - no changes made)`);
      }
      console.log('---');
    }

    if (dryRun) {
      console.log('\nThis was a dry run. To actually make changes, use:');
      console.log(`node dba-script.js fix-names ${collectionName} --execute`);
    }
  }

  // Conditional bulk update - update multiple documents that match a condition
  async conditionalUpdate(collectionName, field, operator, value, updateData, dryRun = true) {
    console.log(`\n=== ${dryRun ? 'DRY RUN - ' : ''}Conditional Update: ${collectionName} where ${field} ${operator} ${value} ===`);
    
    try {
      // First, find all matching documents
      const q = query(
        collection(this.db, collectionName),
        where(field, operator, value)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('No documents found matching the criteria.');
        return;
      }

      console.log(`Found ${snapshot.size} documents matching the criteria:`);
      
      const documentsToUpdate = [];
      snapshot.forEach((doc) => {
        documentsToUpdate.push({
          id: doc.id,
          currentData: doc.data()
        });
        console.log(`Document ID: ${doc.id}`);
        console.log('Current data:', JSON.stringify(doc.data(), null, 2));
        console.log('---');
      });

      console.log(`\n${dryRun ? 'Would update' : 'Updating'} ${documentsToUpdate.length} documents with:`);
      console.log('Update data:', JSON.stringify(updateData, null, 2));

      if (!dryRun) {
        // Use batch update for efficiency
        const batch = writeBatch(this.db);
        
        documentsToUpdate.forEach(docInfo => {
          const docRef = doc(this.db, collectionName, docInfo.id);
          batch.update(docRef, updateData);
        });

        await batch.commit();
        console.log(`✓ Successfully updated ${documentsToUpdate.length} documents`);
      } else {
        console.log('\nThis was a dry run. To actually make changes, add --execute flag');
      }

      return documentsToUpdate.length;
    } catch (error) {
      console.error('Error in conditional update:', error.message);
    }
  }

  // Delete all training scores for a specific user
  async deleteUserTrainingData(username, dryRun = true) {
    console.log(`\n=== ${dryRun ? 'DRY RUN - ' : ''}Deleting training data for user: ${username} ===`);
    
    try {
      const q = query(
        collection(this.db, 'training_scores'),
        where('name', '==', username)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log(`No training data found for user: ${username}`);
        return 0;
      }

      console.log(`Found ${snapshot.size} training score(s) for ${username}:`);
      
      const documentsToDelete = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        documentsToDelete.push({
          id: doc.id,
          data: data
        });
        console.log(`  Document ID: ${doc.id}`);
        console.log(`    Guesses: ${data.guesses}, DNF: ${data.dnf}, Date: ${data.isoDate}`);
      });

      if (!dryRun) {
        // Use batch delete for efficiency
        const batch = writeBatch(this.db);
        
        documentsToDelete.forEach(docInfo => {
          const docRef = doc(this.db, 'training_scores', docInfo.id);
          batch.delete(docRef);
        });

        await batch.commit();
        console.log(`\n✓ Successfully deleted ${documentsToDelete.length} training score(s) for ${username}`);
      } else {
        console.log(`\n⚠️  This was a dry run. No documents were deleted.`);
        console.log(`To actually delete these ${documentsToDelete.length} document(s), use:`);
        console.log(`  node dba-script.js delete-user-training "${username}" --execute`);
      }

      return documentsToDelete.length;
    } catch (error) {
      console.error('Error deleting user training data:', error.message);
      return 0;
    }
  }

  // Show help
  showHelp() {
    console.log(`
=== Wordle Leaderboard DBA Tool ===

Usage: node dba-script.js <command> [arguments]

Commands:
  collections                           - List all collections
  show <collection> [limit]            - Show documents in a collection (default limit: 10)
  recent <collection> [limit]          - Show most recent documents ordered by isoDate
  today <collection>                   - Show today's documents only
  get <collection> <documentId>        - Get a specific document
  search <collection> <field> <op> <value> [limit] - Search documents
  add <collection> <jsonData>          - Add a new document
  update <collection> <docId> <jsonData> - Update a document
  conditional-update <collection> <field> <op> <value> <jsonData> [--execute] - Update all docs matching condition
  delete <collection> <docId>          - Delete a document
  count <collection>                   - Count documents in a collection
  find-date-errors [collection] [--export] - Find potential date errors and optionally export to files
  fix-names [collection] [--execute]   - Fix problematic names (dry run by default)
  delete-before <collection> <date> [--execute] - Delete all scores before a date (for yearly reset)
  delete-user-training <username> [--execute] - Delete all training scores for a specific user
  help                                 - Show this help

Examples:
  node dba-script.js collections
  node dba-script.js show scores 5
  node dba-script.js recent scores 10
  node dba-script.js today scores
  node dba-script.js search scores name == "John Doe"
  node dba-script.js search scores dnf == true
  node dba-script.js add scores '{"name":"John","guesses":5,"isoDate":"2026-01-12T03:45:00.000Z","dnf":false}'
  node dba-script.js update scores abc123 '{"guesses":6}'
  node dba-script.js conditional-update scores name == "John🎉" '{"name":"John"}' --execute
  node dba-script.js delete scores abc123
  node dba-script.js count scores
  node dba-script.js find-date-errors scores
  node dba-script.js find-date-errors scores --export
  node dba-script.js find-emoji-names scores
  node dba-script.js fix-names scores --execute
  node dba-script.js delete-before scores 2026-01-01
  node dba-script.js delete-before scores 2026-01-01 --execute
  node dba-script.js delete-user-training "Damien" --execute

Search operators: ==, !=, <, <=, >, >=, array-contains, in, array-contains-any
    `);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dba = new WordleLeaderboardDBA();

  if (args.length === 0) {
    dba.showHelp();
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'collections':
        await dba.listCollections();
        break;

      case 'show':
        if (args.length < 2) {
          console.log('Usage: show <collection> [limit]');
          return;
        }
        const limit = args[2] ? parseInt(args[2]) : 10;
        await dba.showCollection(args[1], limit);
        break;

      case 'recent':
        if (args.length < 2) {
          console.log('Usage: recent <collection> [limit]');
          return;
        }
        const recentLimit = args[2] ? parseInt(args[2]) : 10;
        await dba.showRecent(args[1], recentLimit);
        break;

      case 'today':
        if (args.length < 2) {
          console.log('Usage: today <collection>');
          return;
        }
        await dba.showToday(args[1]);
        break;

      case 'get':
        if (args.length < 3) {
          console.log('Usage: get <collection> <documentId>');
          return;
        }
        await dba.getDocument(args[1], args[2]);
        break;

      case 'search':
        if (args.length < 5) {
          console.log('Usage: search <collection> <field> <operator> <value> [limit]');
          return;
        }
        const searchLimit = args[5] ? parseInt(args[5]) : 10;
        let searchValue = args[4];
        // Try to parse as number or boolean
        if (!isNaN(searchValue)) {
          searchValue = Number(searchValue);
        } else if (searchValue === 'true') {
          searchValue = true;
        } else if (searchValue === 'false') {
          searchValue = false;
        }
        await dba.searchDocuments(args[1], args[2], args[3], searchValue, searchLimit);
        break;

      case 'add':
        if (args.length < 3) {
          console.log('Usage: add <collection> <jsonData>');
          return;
        }
        const addData = JSON.parse(args[2]);
        await dba.addDocument(args[1], addData);
        break;

      case 'update':
        if (args.length < 4) {
          console.log('Usage: update <collection> <documentId> <jsonData>');
          return;
        }
        const updateData = JSON.parse(args[3]);
        await dba.updateDocument(args[1], args[2], updateData);
        break;

      case 'conditional-update':
        if (args.length < 6) {
          console.log('Usage: conditional-update <collection> <field> <operator> <value> <jsonData> [--execute]');
          return;
        }
        let condValue = args[4];
        // Try to parse as number or boolean
        if (!isNaN(condValue)) {
          condValue = Number(condValue);
        } else if (condValue === 'true') {
          condValue = true;
        } else if (condValue === 'false') {
          condValue = false;
        }
        const condUpdateData = JSON.parse(args[5]);
        const isCondExecute = args.includes('--execute');
        await dba.conditionalUpdate(args[1], args[2], args[3], condValue, condUpdateData, !isCondExecute);
        break;

      case 'delete':
        if (args.length < 3) {
          console.log('Usage: delete <collection> <documentId>');
          return;
        }
        await dba.deleteDocument(args[1], args[2]);
        break;

      case 'count':
        if (args.length < 2) {
          console.log('Usage: count <collection>');
          return;
        }
        await dba.countDocuments(args[1]);
        break;

      case 'find-date-errors':
        const duplicateCollection = args[1] || 'scores';
        const shouldExport = args.includes('--export');
        await dba.findPotentialDateErrors(duplicateCollection, shouldExport);
        break;

      case 'find-emoji-names':
        const findCollection = args[1] || 'scores';
        await dba.findProblematicNames(findCollection);
        break;

      case 'fix-names':
        const fixCollection = args[1] || 'scores';
        const isExecute = args.includes('--execute');
        await dba.fixProblematicNames(fixCollection, !isExecute);
        break;

      case 'delete-before':
        if (args.length < 3) {
          console.log('Usage: delete-before <collection> <date> [--execute]');
          console.log('  <date> must be in YYYY-MM-DD format');
          console.log('  Deletes all scores with dates BEFORE the specified date');
          console.log('  Example: node dba-script.js delete-before scores 2026-01-01 --execute');
          return;
        }
        const deleteBeforeCollection = args[1];
        const deleteBeforeDate = args[2];
        const deleteBeforeExecute = args.includes('--execute');
        await dba.deleteScoresBeforeDate(deleteBeforeCollection, deleteBeforeDate, !deleteBeforeExecute);
        break;

      case 'delete-user-training':
        if (args.length < 2) {
          console.log('Usage: delete-user-training <username> [--execute]');
          console.log('  Deletes all training scores for the specified user');
          console.log('  Example: node dba-script.js delete-user-training "Damien" --execute');
          return;
        }
        const deleteUsername = args[1];
        const deleteUserExecute = args.includes('--execute');
        await dba.deleteUserTrainingData(deleteUsername, !deleteUserExecute);
        break;

      case 'help':
        dba.showHelp();
        break;

      default:
        console.log(`Unknown command: ${command}`);
        dba.showHelp();
    }
  } catch (error) {
    console.error('Error executing command:', error.message);
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n=== Operation completed ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });