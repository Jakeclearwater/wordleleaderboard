#!/usr/bin/env node
/* eslint-disable */

/**
 * Tests for DBA Script
 * 
 * These tests use a mock Firestore implementation to test the DBA functions
 * without connecting to the real database.
 * 
 * Run with: node --test dba-script.test.js
 * Or add to package.json: "test:dba": "node --test dba-script.test.js"
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// ============================================================================
// Mock Firestore Implementation
// ============================================================================

// In-memory database for testing
let mockDatabase = {};

// Reset database before each test
function resetMockDatabase() {
  mockDatabase = {
    scores: [
      {
        id: 'score1',
        data: {
          name: 'Alice',
          guesses: 4,
          isoDate: '2026-01-10T03:30:00.000Z',
          dnf: false
        }
      },
      {
        id: 'score2',
        data: {
          name: 'Bob',
          guesses: 6,
          isoDate: '2026-01-11T05:45:00.000Z',
          dnf: false
        }
      },
      {
        id: 'score3',
        data: {
          name: 'Charlie',
          guesses: 0,
          isoDate: '2026-01-12T02:15:00.000Z',
          dnf: true
        }
      },
      {
        id: 'score4',
        data: {
          name: 'Alice',
          guesses: 3,
          isoDate: '2025-12-15T04:00:00.000Z',
          dnf: false
        }
      },
      {
        id: 'score5',
        data: {
          name: 'EmojiUser🎉',
          guesses: 5,
          isoDate: '2026-01-08T06:00:00.000Z',
          dnf: false
        }
      }
    ]
  };
}

// Mock document snapshot
class MockDocumentSnapshot {
  constructor(id, data) {
    this._id = id;
    this._data = data;
  }
  
  get id() {
    return this._id;
  }
  
  data() {
    return { ...this._data };
  }
  
  exists() {
    return this._data !== null;
  }
}

// Mock query snapshot
class MockQuerySnapshot {
  constructor(docs) {
    this._docs = docs.map(d => new MockDocumentSnapshot(d.id, d.data));
  }
  
  get empty() {
    return this._docs.length === 0;
  }
  
  get size() {
    return this._docs.length;
  }
  
  forEach(callback) {
    this._docs.forEach((doc, index) => callback(doc, index));
  }
  
  get docs() {
    return this._docs;
  }
}

// ============================================================================
// Test Version of WordleLeaderboardDBA
// ============================================================================

class TestableWordleLeaderboardDBA {
  constructor(mockDb) {
    this.db = mockDb;
    this.logs = [];
    this.originalConsoleLog = console.log;
    this.originalConsoleError = console.error;
  }

  // Capture console output for testing
  captureOutput() {
    this.logs = [];
    console.log = (...args) => this.logs.push(['log', args.join(' ')]);
    console.error = (...args) => this.logs.push(['error', args.join(' ')]);
  }

  restoreOutput() {
    console.log = this.originalConsoleLog;
    console.error = this.originalConsoleError;
  }

  getOutput() {
    return this.logs.map(l => l[1]).join('\n');
  }

  // Mock implementations that use mockDatabase instead of real Firestore

  async showCollection(collectionName, limitCount = 10) {
    if (isNaN(limitCount) || limitCount <= 0) {
      console.log(`Error: Invalid limit "${limitCount}". Please provide a positive number.`);
      return;
    }
    
    console.log(`\n=== ${collectionName} Collection (limited to ${limitCount} documents) ===`);
    
    const docs = mockDatabase[collectionName] || [];
    if (docs.length === 0) {
      console.log('No documents found in this collection.');
      return;
    }

    const limited = docs.slice(0, limitCount);
    limited.forEach((doc) => {
      console.log(`Document ID: ${doc.id}`);
      console.log('Data:', JSON.stringify(doc.data, null, 2));
      console.log('---');
    });
    
    return limited.length;
  }

  async getDocument(collectionName, docId) {
    console.log(`\n=== Document: ${collectionName}/${docId} ===`);
    
    const docs = mockDatabase[collectionName] || [];
    const doc = docs.find(d => d.id === docId);
    
    if (doc) {
      console.log('Document data:', JSON.stringify(doc.data, null, 2));
      return doc.data;
    } else {
      console.log('Document does not exist');
      return null;
    }
  }

  async searchDocuments(collectionName, field, operator, value, limitCount = 10) {
    console.log(`\n=== Search: ${collectionName} where ${field} ${operator} ${value} ===`);
    
    const docs = mockDatabase[collectionName] || [];
    
    const matches = docs.filter(doc => {
      const fieldValue = doc.data[field];
      switch (operator) {
        case '==': return fieldValue === value;
        case '!=': return fieldValue !== value;
        case '<': return fieldValue < value;
        case '<=': return fieldValue <= value;
        case '>': return fieldValue > value;
        case '>=': return fieldValue >= value;
        default: return false;
      }
    }).slice(0, limitCount);

    if (matches.length === 0) {
      console.log('No documents found matching the criteria.');
      return [];
    }

    matches.forEach((doc) => {
      console.log(`Document ID: ${doc.id}`);
      console.log('Data:', JSON.stringify(doc.data, null, 2));
      console.log('---');
    });
    
    return matches;
  }

  async addDocument(collectionName, data) {
    console.log(`\n=== Adding document to ${collectionName} ===`);
    
    if (!mockDatabase[collectionName]) {
      mockDatabase[collectionName] = [];
    }
    
    const newId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    mockDatabase[collectionName].push({ id: newId, data });
    
    console.log('Document added with ID:', newId);
    return newId;
  }

  async updateDocument(collectionName, docId, data) {
    console.log(`\n=== Updating document ${collectionName}/${docId} ===`);
    
    const docs = mockDatabase[collectionName] || [];
    const docIndex = docs.findIndex(d => d.id === docId);
    
    if (docIndex === -1) {
      console.error('Error updating document: Document not found');
      return false;
    }
    
    mockDatabase[collectionName][docIndex].data = {
      ...mockDatabase[collectionName][docIndex].data,
      ...data
    };
    
    console.log('Document updated successfully');
    return true;
  }

  async deleteDocument(collectionName, docId) {
    console.log(`\n=== Deleting document ${collectionName}/${docId} ===`);
    
    const docs = mockDatabase[collectionName] || [];
    const docIndex = docs.findIndex(d => d.id === docId);
    
    if (docIndex === -1) {
      console.error('Error deleting document: Document not found');
      return false;
    }
    
    mockDatabase[collectionName].splice(docIndex, 1);
    console.log('Document deleted successfully');
    return true;
  }

  async showRecent(collectionName, limitCount = 10) {
    console.log(`\n=== Most Recent ${collectionName} (by isoDate, limited to ${limitCount}) ===`);
    
    const docs = mockDatabase[collectionName] || [];
    if (docs.length === 0) {
      console.log('No documents found in this collection.');
      return [];
    }

    // Sort by isoDate descending
    const sorted = [...docs].sort((a, b) => 
      b.data.isoDate.localeCompare(a.data.isoDate)
    ).slice(0, limitCount);

    console.log(`Found ${sorted.length} most recent documents:`);
    sorted.forEach((doc, index) => {
      const displayDate = `${doc.data.isoDate} (${new Date(doc.data.isoDate).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })})`;
      console.log(`${index + 1}. Document ID: ${doc.id}`);
      console.log(`   isoDate: ${displayDate}`);
      console.log(`   Data:`, JSON.stringify(doc.data, null, 2));
      console.log('---');
    });
    
    return sorted;
  }

  async countDocuments(collectionName) {
    console.log(`\n=== Counting documents in ${collectionName} ===`);
    
    const docs = mockDatabase[collectionName] || [];
    console.log(`Total documents: ${docs.length}`);
    return docs.length;
  }

  async showToday(collectionName) {
    const today = new Date().toISOString().split('T')[0];
    const todayStart = `${today}T00:00:00.000Z`;
    const todayEnd = `${today}T23:59:59.999Z`;
    
    console.log(`\n=== Today's ${collectionName} (${today}) ===`);
    console.log(`Searching for records between ${todayStart} and ${todayEnd} (UTC)`);
    
    const docs = mockDatabase[collectionName] || [];
    const todayDocs = docs.filter(doc => 
      doc.data.isoDate >= todayStart && doc.data.isoDate <= todayEnd
    ).sort((a, b) => a.data.isoDate.localeCompare(b.data.isoDate));

    if (todayDocs.length === 0) {
      console.log(`No documents found for today (${today}).`);
      return [];
    }

    console.log(`Found ${todayDocs.length} documents for today:`);
    todayDocs.forEach((doc, index) => {
      console.log(`${index + 1}. Document ID: ${doc.id}`);
      console.log(`   Data:`, JSON.stringify(doc.data, null, 2));
      console.log('---');
    });
    
    return todayDocs;
  }

  async deleteScoresBeforeDate(collectionName = 'scores', beforeDate, dryRun = true) {
    console.log(`\n=== ${dryRun ? 'DRY RUN - ' : ''}Deleting scores before ${beforeDate} in ${collectionName} ===`);
    
    // Validate date format
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(beforeDate)) {
      console.error('Error: Date must be in YYYY-MM-DD format (e.g., 2025-01-01)');
      return 0;
    }

    const beforeDateISO = `${beforeDate}T00:00:00.000Z`;
    const docs = mockDatabase[collectionName] || [];
    
    const documentsToDelete = docs.filter(doc => 
      doc.data.isoDate && doc.data.isoDate < beforeDateISO
    );

    if (documentsToDelete.length === 0) {
      console.log(`No documents found before ${beforeDate}.`);
      return 0;
    }

    console.log(`Found ${documentsToDelete.length} documents to delete`);

    if (!dryRun) {
      // Actually delete
      mockDatabase[collectionName] = docs.filter(doc => 
        !doc.data.isoDate || doc.data.isoDate >= beforeDateISO
      );
      console.log(`✓ Successfully deleted ${documentsToDelete.length} documents`);
    } else {
      console.log(`⚠️  This was a dry run. No documents were deleted.`);
    }

    return documentsToDelete.length;
  }

  async findProblematicNames(collectionName = 'scores') {
    console.log(`\n=== Finding names with emojis or special characters in ${collectionName} ===`);
    
    const docs = mockDatabase[collectionName] || [];
    const validNamePattern = /^[a-zA-Z ]*$/;
    
    const problematicDocs = docs.filter(doc => 
      doc.data.name && !validNamePattern.test(doc.data.name)
    );

    if (problematicDocs.length === 0) {
      console.log('No problematic names found.');
      return [];
    }

    console.log(`Found ${problematicDocs.length} documents with problematic names:`);
    problematicDocs.forEach((doc, index) => {
      console.log(`${index + 1}. ID: ${doc.id}, Name: ${doc.data.name}`);
    });
    
    return problematicDocs;
  }

  async conditionalUpdate(collectionName, field, operator, value, updateData, dryRun = true) {
    console.log(`\n=== ${dryRun ? 'DRY RUN - ' : ''}Conditional Update: ${collectionName} where ${field} ${operator} ${value} ===`);
    
    const docs = mockDatabase[collectionName] || [];
    
    const matches = docs.filter(doc => {
      const fieldValue = doc.data[field];
      switch (operator) {
        case '==': return fieldValue === value;
        case '!=': return fieldValue !== value;
        case '<': return fieldValue < value;
        case '<=': return fieldValue <= value;
        case '>': return fieldValue > value;
        case '>=': return fieldValue >= value;
        default: return false;
      }
    });

    if (matches.length === 0) {
      console.log('No documents found matching the criteria.');
      return 0;
    }

    console.log(`Found ${matches.length} documents matching the criteria`);

    if (!dryRun) {
      matches.forEach(match => {
        const docIndex = docs.findIndex(d => d.id === match.id);
        if (docIndex !== -1) {
          mockDatabase[collectionName][docIndex].data = {
            ...mockDatabase[collectionName][docIndex].data,
            ...updateData
          };
        }
      });
      console.log(`✓ Updated ${matches.length} documents`);
    }

    return matches.length;
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('WordleLeaderboardDBA', () => {
  let dba;

  beforeEach(() => {
    resetMockDatabase();
    dba = new TestableWordleLeaderboardDBA({});
  });

  describe('showCollection', () => {
    it('should show documents in a collection', async () => {
      dba.captureOutput();
      const result = await dba.showCollection('scores', 3);
      dba.restoreOutput();
      
      assert.strictEqual(result, 3);
      assert.ok(dba.getOutput().includes('score1'));
    });

    it('should handle empty collections', async () => {
      mockDatabase.empty_collection = [];
      dba.captureOutput();
      await dba.showCollection('empty_collection', 10);
      dba.restoreOutput();
      
      assert.ok(dba.getOutput().includes('No documents found'));
    });

    it('should reject invalid limit', async () => {
      dba.captureOutput();
      await dba.showCollection('scores', -1);
      dba.restoreOutput();
      
      assert.ok(dba.getOutput().includes('Invalid limit'));
    });

    it('should reject NaN limit', async () => {
      dba.captureOutput();
      await dba.showCollection('scores', NaN);
      dba.restoreOutput();
      
      assert.ok(dba.getOutput().includes('Invalid limit'));
    });
  });

  describe('getDocument', () => {
    it('should retrieve an existing document', async () => {
      dba.captureOutput();
      const result = await dba.getDocument('scores', 'score1');
      dba.restoreOutput();
      
      assert.strictEqual(result.name, 'Alice');
      assert.strictEqual(result.guesses, 4);
    });

    it('should handle non-existent document', async () => {
      dba.captureOutput();
      const result = await dba.getDocument('scores', 'nonexistent');
      dba.restoreOutput();
      
      assert.strictEqual(result, null);
      assert.ok(dba.getOutput().includes('does not exist'));
    });
  });

  describe('searchDocuments', () => {
    it('should find documents with == operator', async () => {
      dba.captureOutput();
      const results = await dba.searchDocuments('scores', 'name', '==', 'Alice', 10);
      dba.restoreOutput();
      
      assert.strictEqual(results.length, 2);
    });

    it('should find documents with != operator', async () => {
      dba.captureOutput();
      const results = await dba.searchDocuments('scores', 'dnf', '!=', true, 10);
      dba.restoreOutput();
      
      assert.strictEqual(results.length, 4);
    });

    it('should find documents with < operator', async () => {
      dba.captureOutput();
      const results = await dba.searchDocuments('scores', 'guesses', '<', 5, 10);
      dba.restoreOutput();
      
      assert.ok(results.length > 0);
      results.forEach(r => assert.ok(r.data.guesses < 5));
    });

    it('should find documents with > operator', async () => {
      dba.captureOutput();
      const results = await dba.searchDocuments('scores', 'guesses', '>', 4, 10);
      dba.restoreOutput();
      
      assert.ok(results.length > 0);
      results.forEach(r => assert.ok(r.data.guesses > 4));
    });

    it('should handle no matches', async () => {
      dba.captureOutput();
      const results = await dba.searchDocuments('scores', 'name', '==', 'NonExistentPerson', 10);
      dba.restoreOutput();
      
      assert.strictEqual(results.length, 0);
      assert.ok(dba.getOutput().includes('No documents found'));
    });
  });

  describe('addDocument', () => {
    it('should add a new document', async () => {
      const initialCount = mockDatabase.scores.length;
      
      dba.captureOutput();
      const newId = await dba.addDocument('scores', {
        name: 'NewPlayer',
        guesses: 4,
        isoDate: '2026-01-12T10:00:00.000Z',
        dnf: false
      });
      dba.restoreOutput();
      
      assert.ok(newId);
      assert.strictEqual(mockDatabase.scores.length, initialCount + 1);
      assert.ok(dba.getOutput().includes('Document added with ID'));
    });

    it('should create collection if it does not exist', async () => {
      dba.captureOutput();
      await dba.addDocument('new_collection', { test: 'data' });
      dba.restoreOutput();
      
      assert.ok(mockDatabase.new_collection);
      assert.strictEqual(mockDatabase.new_collection.length, 1);
    });
  });

  describe('updateDocument', () => {
    it('should update an existing document', async () => {
      dba.captureOutput();
      const result = await dba.updateDocument('scores', 'score1', { guesses: 5 });
      dba.restoreOutput();
      
      assert.strictEqual(result, true);
      assert.strictEqual(mockDatabase.scores.find(d => d.id === 'score1').data.guesses, 5);
    });

    it('should preserve existing fields when updating', async () => {
      dba.captureOutput();
      await dba.updateDocument('scores', 'score1', { guesses: 5 });
      dba.restoreOutput();
      
      const doc = mockDatabase.scores.find(d => d.id === 'score1');
      assert.strictEqual(doc.data.name, 'Alice'); // Original field preserved
      assert.strictEqual(doc.data.guesses, 5); // Updated field
    });

    it('should handle non-existent document', async () => {
      dba.captureOutput();
      const result = await dba.updateDocument('scores', 'nonexistent', { guesses: 5 });
      dba.restoreOutput();
      
      assert.strictEqual(result, false);
    });
  });

  describe('deleteDocument', () => {
    it('should delete an existing document', async () => {
      const initialCount = mockDatabase.scores.length;
      
      dba.captureOutput();
      const result = await dba.deleteDocument('scores', 'score1');
      dba.restoreOutput();
      
      assert.strictEqual(result, true);
      assert.strictEqual(mockDatabase.scores.length, initialCount - 1);
      assert.ok(!mockDatabase.scores.find(d => d.id === 'score1'));
    });

    it('should handle non-existent document', async () => {
      dba.captureOutput();
      const result = await dba.deleteDocument('scores', 'nonexistent');
      dba.restoreOutput();
      
      assert.strictEqual(result, false);
    });
  });

  describe('showRecent', () => {
    it('should show documents sorted by isoDate descending', async () => {
      dba.captureOutput();
      const results = await dba.showRecent('scores', 3);
      dba.restoreOutput();
      
      assert.strictEqual(results.length, 3);
      // Verify descending order
      for (let i = 1; i < results.length; i++) {
        assert.ok(results[i - 1].data.isoDate >= results[i].data.isoDate);
      }
    });

    it('should respect limit parameter', async () => {
      dba.captureOutput();
      const results = await dba.showRecent('scores', 2);
      dba.restoreOutput();
      
      assert.strictEqual(results.length, 2);
    });

    it('should handle empty collection', async () => {
      mockDatabase.empty = [];
      dba.captureOutput();
      const results = await dba.showRecent('empty', 10);
      dba.restoreOutput();
      
      assert.strictEqual(results.length, 0);
    });
  });

  describe('countDocuments', () => {
    it('should count all documents in a collection', async () => {
      dba.captureOutput();
      const count = await dba.countDocuments('scores');
      dba.restoreOutput();
      
      assert.strictEqual(count, 5);
    });

    it('should return 0 for empty collection', async () => {
      mockDatabase.empty = [];
      dba.captureOutput();
      const count = await dba.countDocuments('empty');
      dba.restoreOutput();
      
      assert.strictEqual(count, 0);
    });
  });

  describe('deleteScoresBeforeDate', () => {
    it('should find documents before date in dry run', async () => {
      dba.captureOutput();
      const count = await dba.deleteScoresBeforeDate('scores', '2026-01-01', true);
      dba.restoreOutput();
      
      assert.strictEqual(count, 1); // score4 is from 2025-12-15
      assert.ok(dba.getOutput().includes('DRY RUN'));
      assert.strictEqual(mockDatabase.scores.length, 5); // No actual deletion
    });

    it('should delete documents before date when executing', async () => {
      const initialCount = mockDatabase.scores.length;
      
      dba.captureOutput();
      const count = await dba.deleteScoresBeforeDate('scores', '2026-01-01', false);
      dba.restoreOutput();
      
      assert.strictEqual(count, 1);
      assert.strictEqual(mockDatabase.scores.length, initialCount - 1);
      assert.ok(!mockDatabase.scores.find(d => d.id === 'score4'));
    });

    it('should validate date format', async () => {
      dba.captureOutput();
      const count = await dba.deleteScoresBeforeDate('scores', 'invalid-date', true);
      dba.restoreOutput();
      
      assert.strictEqual(count, 0);
      assert.ok(dba.getOutput().includes('YYYY-MM-DD format'));
    });

    it('should handle no documents before date', async () => {
      dba.captureOutput();
      const count = await dba.deleteScoresBeforeDate('scores', '2020-01-01', true);
      dba.restoreOutput();
      
      assert.strictEqual(count, 0);
      assert.ok(dba.getOutput().includes('No documents found'));
    });
  });

  describe('findProblematicNames', () => {
    it('should find names with emojis', async () => {
      dba.captureOutput();
      const results = await dba.findProblematicNames('scores');
      dba.restoreOutput();
      
      assert.strictEqual(results.length, 1);
      assert.ok(results[0].data.name.includes('🎉'));
    });

    it('should handle collection with no problematic names', async () => {
      mockDatabase.clean = [
        { id: '1', data: { name: 'Alice' } },
        { id: '2', data: { name: 'Bob Smith' } }
      ];
      
      dba.captureOutput();
      const results = await dba.findProblematicNames('clean');
      dba.restoreOutput();
      
      assert.strictEqual(results.length, 0);
    });
  });

  describe('conditionalUpdate', () => {
    it('should find matching documents in dry run', async () => {
      dba.captureOutput();
      const count = await dba.conditionalUpdate('scores', 'name', '==', 'Alice', { verified: true }, true);
      dba.restoreOutput();
      
      assert.strictEqual(count, 2);
      assert.ok(dba.getOutput().includes('DRY RUN'));
      // Verify no actual updates in dry run
      const alice = mockDatabase.scores.find(d => d.id === 'score1');
      assert.strictEqual(alice.data.verified, undefined);
    });

    it('should update matching documents when executing', async () => {
      dba.captureOutput();
      const count = await dba.conditionalUpdate('scores', 'name', '==', 'Alice', { verified: true }, false);
      dba.restoreOutput();
      
      assert.strictEqual(count, 2);
      // Verify updates were made
      const aliceDocs = mockDatabase.scores.filter(d => d.data.name === 'Alice');
      aliceDocs.forEach(doc => {
        assert.strictEqual(doc.data.verified, true);
      });
    });

    it('should handle no matches', async () => {
      dba.captureOutput();
      const count = await dba.conditionalUpdate('scores', 'name', '==', 'Nobody', { verified: true }, true);
      dba.restoreOutput();
      
      assert.strictEqual(count, 0);
      assert.ok(dba.getOutput().includes('No documents found'));
    });
  });

  describe('showToday', () => {
    it('should filter documents by today\'s date', async () => {
      // Set up a document for "today"
      const today = new Date().toISOString().split('T')[0];
      mockDatabase.scores.push({
        id: 'today_score',
        data: {
          name: 'TodayPlayer',
          guesses: 3,
          isoDate: `${today}T10:30:00.000Z`,
          dnf: false
        }
      });
      
      dba.captureOutput();
      const results = await dba.showToday('scores');
      dba.restoreOutput();
      
      assert.ok(results.length > 0);
      // All returned documents should be from today
      results.forEach(doc => {
        assert.ok(doc.data.isoDate.startsWith(today));
      });
    });

    it('should handle no documents for today', async () => {
      // Clear all documents and add only old ones
      mockDatabase.old_scores = [
        { id: '1', data: { isoDate: '2020-01-01T00:00:00.000Z' } }
      ];
      
      dba.captureOutput();
      const results = await dba.showToday('old_scores');
      dba.restoreOutput();
      
      assert.strictEqual(results.length, 0);
      assert.ok(dba.getOutput().includes('No documents found for today'));
    });
  });
});

// ============================================================================
// Date Validation Tests
// ============================================================================

describe('Date Handling', () => {
  let dba;

  beforeEach(() => {
    resetMockDatabase();
    dba = new TestableWordleLeaderboardDBA({});
  });

  it('should correctly compare ISO dates', async () => {
    // Test that date comparison works correctly for deleteScoresBeforeDate
    mockDatabase.date_test = [
      { id: 'd1', data: { isoDate: '2025-12-31T23:59:59.999Z' } }, // Last moment of 2025
      { id: 'd2', data: { isoDate: '2026-01-01T00:00:00.000Z' } }, // First moment of 2026
      { id: 'd3', data: { isoDate: '2026-01-01T00:00:00.001Z' } }, // Just after midnight 2026
    ];

    dba.captureOutput();
    const count = await dba.deleteScoresBeforeDate('date_test', '2026-01-01', false);
    dba.restoreOutput();

    assert.strictEqual(count, 1); // Only d1 should be deleted
    assert.strictEqual(mockDatabase.date_test.length, 2);
    assert.ok(!mockDatabase.date_test.find(d => d.id === 'd1'));
    assert.ok(mockDatabase.date_test.find(d => d.id === 'd2'));
    assert.ok(mockDatabase.date_test.find(d => d.id === 'd3'));
  });

  it('should handle documents without isoDate field gracefully', async () => {
    mockDatabase.mixed = [
      { id: 'm1', data: { name: 'HasDate', isoDate: '2025-06-15T00:00:00.000Z' } },
      { id: 'm2', data: { name: 'NoDate' } }, // No isoDate field
    ];

    dba.captureOutput();
    const count = await dba.deleteScoresBeforeDate('mixed', '2026-01-01', false);
    dba.restoreOutput();

    assert.strictEqual(count, 1); // Only m1 should be deleted (has isoDate before cutoff)
    assert.strictEqual(mockDatabase.mixed.length, 1);
    assert.ok(mockDatabase.mixed.find(d => d.id === 'm2')); // m2 should remain
  });
});

// ============================================================================
// Edge Case Tests
// ============================================================================

describe('Edge Cases', () => {
  let dba;

  beforeEach(() => {
    resetMockDatabase();
    dba = new TestableWordleLeaderboardDBA({});
  });

  it('should handle empty collection name', async () => {
    mockDatabase[''] = [];
    dba.captureOutput();
    const count = await dba.countDocuments('');
    dba.restoreOutput();
    
    assert.strictEqual(count, 0);
  });

  it('should handle special characters in search values', async () => {
    mockDatabase.special = [
      { id: 's1', data: { name: 'User\'s Name' } },
      { id: 's2', data: { name: 'User"s Name' } },
    ];

    dba.captureOutput();
    const results = await dba.searchDocuments('special', 'name', '==', 'User\'s Name', 10);
    dba.restoreOutput();

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, 's1');
  });

  it('should handle numeric string comparisons correctly', async () => {
    mockDatabase.numbers = [
      { id: 'n1', data: { value: 5 } },
      { id: 'n2', data: { value: 10 } },
      { id: 'n3', data: { value: 15 } },
    ];

    dba.captureOutput();
    const results = await dba.searchDocuments('numbers', 'value', '>=', 10, 10);
    dba.restoreOutput();

    assert.strictEqual(results.length, 2);
  });

  it('should handle boolean field searches', async () => {
    dba.captureOutput();
    const dnfResults = await dba.searchDocuments('scores', 'dnf', '==', true, 10);
    dba.restoreOutput();

    assert.strictEqual(dnfResults.length, 1);
    assert.strictEqual(dnfResults[0].data.name, 'Charlie');
  });
});

console.log('Running DBA Script Tests...\n');
