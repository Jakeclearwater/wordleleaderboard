#!/usr/bin/env node

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
  writeBatch,
  runTransaction
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

  // Show most recent documents by date field
  async showRecent(collectionName, limitCount = 10, dateField = 'date') {
    console.log(`\n=== Most Recent ${collectionName} (by ${dateField}, limited to ${limitCount}) ===`);
    try {
      const q = query(
        collection(this.db, collectionName), 
        orderBy(dateField, 'desc'),
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
        console.log(`${index + 1}. Document ID: ${doc.id}`);
        console.log(`   Date: ${data[dateField]}`);
        console.log(`   Data:`, JSON.stringify(data, null, 2));
        console.log('---');
      });
    } catch (error) {
      console.error(`Error reading recent documents from ${collectionName}:`, error.message);
      console.log(`Tip: Make sure the '${dateField}' field exists and is indexed for ordering.`);
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
  
  // Convert existing date strings to ISO datetime strings
  async convertDatesToISO(collectionName = 'scores', dryRun = true) {
    console.log(`\n=== ${dryRun ? 'DRY RUN - ' : ''}Converting dates to ISO format in ${collectionName} ===`);
    
    try {
      const snapshot = await getDocs(collection(this.db, collectionName));
      
      if (snapshot.empty) {
        console.log('No documents found in this collection.');
        return;
      }

      const documentsToUpdate = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only process documents that have a date field but no isoDate field
        if (data.date && !data.isoDate) {
          // Parse the existing date (YYYY-MM-DD format)
          const dateStr = data.date;
          const dateParts = dateStr.split('-');
          
          if (dateParts.length === 3) {
            // Create ISO datetime that will convert to the original NZ date
            // Use midnight UTC on the original date (which will be 12pm or 1pm NZ time depending on DST)
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
            const day = parseInt(dateParts[2]);
            
            // Create date in UTC at midnight on the original date
            const originalDate = new Date(Date.UTC(year, month, day));
            originalDate.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
            
            const isoDate = originalDate.toISOString();
            
            documentsToUpdate.push({
              id: doc.id,
              originalDate: dateStr,
              isoDate: isoDate,
              data: data
            });
          }
        }
      });

      if (documentsToUpdate.length === 0) {
        console.log('No documents need date conversion. All documents either have isoDate or no date field.');
        return;
      }

      console.log(`Found ${documentsToUpdate.length} documents to convert:`);
      
      documentsToUpdate.forEach((docInfo, index) => {
        console.log(`${index + 1}. Document ID: ${docInfo.id}`);
        console.log(`   Original date: ${docInfo.originalDate}`);
        console.log(`   New ISO date: ${docInfo.isoDate}`);
        console.log(`   Name: ${docInfo.data.name}, Guesses: ${docInfo.data.guesses}`);
      });

      if (!dryRun) {
        console.log('\nUpdating documents...');
        const batch = writeBatch(this.db);
        
        documentsToUpdate.forEach(docInfo => {
          const docRef = doc(this.db, collectionName, docInfo.id);
          batch.update(docRef, {
            isoDate: docInfo.isoDate
          });
        });

        await batch.commit();
        console.log(`✓ Successfully added ISO dates to ${documentsToUpdate.length} documents`);
      } else {
        console.log('\nThis was a dry run. To actually convert dates, use:');
        console.log(`node dba-script.js convert-dates ${collectionName} --execute`);
      }

      return documentsToUpdate.length;
    } catch (error) {
      console.error('Error converting dates to ISO:', error.message);
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
        if (score.isoDate) {
          // Convert ISO datetime to NZ date
          const isoDate = new Date(score.isoDate);
          return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Pacific/Auckland',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).format(isoDate);
        } else if (score.date) {
          return score.date; // Legacy date format
        }
        return null;
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

  async showToday(collectionName, dateField = 'date') {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log(`\n=== Today's ${collectionName} (${today}) ===`);
    
    try {
      const q = query(
        collection(this.db, collectionName),
        where(dateField, '==', today),
        orderBy('__name__') // Secondary sort by document ID for consistent ordering
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log(`No documents found for today (${today}).`);
        return;
      }

      console.log(`Found ${snapshot.size} documents for today:`);
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. Document ID: ${doc.id}`);
        console.log(`   Data:`, JSON.stringify(data, null, 2));
        console.log('---');
      });
    } catch (error) {
      console.error(`Error reading today's documents from ${collectionName}:`, error.message);
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

  // Show help
  showHelp() {
    console.log(`
=== Wordle Leaderboard DBA Tool ===

Usage: node dba-script.js <command> [arguments]

Commands:
  collections                           - List all collections
  show <collection> [limit]            - Show documents in a collection (default limit: 10)
  recent <collection> [limit] [dateField] - Show most recent documents ordered by date
  today <collection> [dateField]       - Show today's documents only
  get <collection> <documentId>        - Get a specific document
  search <collection> <field> <op> <value> [limit] - Search documents
  add <collection> <jsonData>          - Add a new document
  update <collection> <docId> <jsonData> - Update a document
  conditional-update <collection> <field> <op> <value> <jsonData> [--execute] - Update all docs matching condition
  delete <collection> <docId>          - Delete a document
  count <collection>                   - Count documents in a collection
  convert-dates [collection] [--execute] - Convert date strings to ISO format (midnight UTC)
  find-date-errors [collection] [--export] - Find potential date errors and optionally export to files
  fix-names [collection] [--execute]   - Fix problematic names (dry run by default)
  help                                 - Show this help

Examples:
  node dba-script.js collections
  node dba-script.js show scores 5
  node dba-script.js recent scores 10
  node dba-script.js recent scores 5 date
  node dba-script.js today scores
  node dba-script.js search scores name == "John Doe"
  node dba-script.js search scores dnf == true
  node dba-script.js add scores '{"name":"John","score":5,"date":"2025-07-11","dnf":false}'
  node dba-script.js update scores abc123 '{"score":6}'
  node dba-script.js conditional-update scores name == "John🎉" '{"name":"John"}' --execute
  node dba-script.js delete scores abc123
  node dba-script.js count scores
  node dba-script.js convert-dates scores --execute
  node dba-script.js find-date-errors scores
  node dba-script.js find-date-errors scores --export
  node dba-script.js find-emoji-names scores
  node dba-script.js fix-names scores --execute

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
          console.log('Usage: recent <collection> [limit] [dateField]');
          return;
        }
        const recentLimit = args[2] ? parseInt(args[2]) : 10;
        const recentDateField = args[3] || 'date';
        await dba.showRecent(args[1], recentLimit, recentDateField);
        break;

      case 'today':
        if (args.length < 2) {
          console.log('Usage: today <collection> [dateField]');
          return;
        }
        const todayDateField = args[2] || 'date';
        await dba.showToday(args[1], todayDateField);
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

      case 'convert-dates':
        const convertCollection = args[1] || 'scores';
        const convertExecute = args.includes('--execute');
        await dba.convertDatesToISO(convertCollection, !convertExecute);
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