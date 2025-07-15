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
import { readFileSync } from 'fs';
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
  get <collection> <documentId>        - Get a specific document
  search <collection> <field> <op> <value> [limit] - Search documents
  add <collection> <jsonData>          - Add a new document
  update <collection> <docId> <jsonData> - Update a document
  conditional-update <collection> <field> <op> <value> <jsonData> [--execute] - Update all docs matching condition
  delete <collection> <docId>          - Delete a document
  count <collection>                   - Count documents in a collection
  find-emoji-names [collection]        - Find names with emojis or special characters
  fix-names [collection] [--execute]   - Fix problematic names (dry run by default)
  help                                 - Show this help

Examples:
  node dba-script.js collections
  node dba-script.js show scores 5
  node dba-script.js search scores name == "John Doe"
  node dba-script.js search scores dnf == true
  node dba-script.js add scores '{"name":"John","score":5,"date":"2025-07-11","dnf":false}'
  node dba-script.js update scores abc123 '{"score":6}'
  node dba-script.js conditional-update scores name == "John🎉" '{"name":"John"}' --execute
  node dba-script.js delete scores abc123
  node dba-script.js count scores
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
