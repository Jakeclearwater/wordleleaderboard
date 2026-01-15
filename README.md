# Wordle Leaderboard

An open source Wordle leaderboard application built with React and Firebase Firestore.

**Important: don't break it**

## Local Development

To test the application locally:

```bash
npm run dev
```

This will:
1. Generate the version info
2. Start the Vite dev server

The app will be available at `http://localhost:5173` (or another port if 5173 is busy - check the terminal output).

## dba-script.js

This Node.js script allows administrators to perform basic database administration tasks on the Firestore database via command line interface.

### Requirements

- Node.js (version 14 or higher)
- Firebase project with Firestore enabled
- Valid `.env` file with Firebase credentials

### Setup

1. Ensure your `.env` file contains the required Firebase configuration:
   ```
   VITE_API_KEY=your_api_key
   VITE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_PROJECT_ID=your_project_id
   VITE_STORAGE_BUCKET=your_project.appspot.com
   VITE_MESSAGING_SENDER_ID=your_sender_id
   VITE_APP_ID=your_app_id
   VITE_MEASUREMENT_ID=your_measurement_id
   ```

2. Install dependencies:
   ```bash
   (sudo) npm install firebase-tools
   ```

3. Make the script executable (optional):
   ```bash
   chmod +x dba-script.js
   ```

### Usage

Basic syntax:
```bash
node dba-script.js <command> [arguments]
```

### Available Commands

#### List Collections
```bash
node dba-script.js collections
```
Lists all available collections in the database.

#### Show Collection Data
```bash
node dba-script.js show <collection> [limit]
```
Display documents from a collection (default limit: 10).

**Examples:**
```bash
node dba-script.js show scores 5          # Show first 5 score records
node dba-script.js show scores            # Show first 10 score records
```

#### Get Specific Document
```bash
node dba-script.js get <collection> <documentId>
```
Retrieve a specific document by its ID.

**Example:**
```bash
node dba-script.js get scores iezD4TXVt4CQh62EnNPe
```

#### Search Documents
```bash
node dba-script.js search <collection> <field> <operator> <value> [limit]
```
Search for documents matching specific criteria.

**Supported operators:** `==`, `!=`, `<`, `<=`, `>`, `>=`, `array-contains`, `in`, `array-contains-any`

**Examples:**
```bash
node dba-script.js search scores name == "John Doe"
node dba-script.js search scores guesses > 3
node dba-script.js search scores date == "2025-07-09"
node dba-script.js delete scores iezD4TXVt4CQh62EnNPe
```

#### Add New Document
```bash
node dba-script.js add <collection> '<jsonData>'
```
Add a new document to a collection.

**Example:**
```bash
node dba-script.js add scores '{"name":"Jane Smith","guesses":4,"date":"2025-07-11"}'
```

#### Update Document
```bash
node dba-script.js update <collection> <documentId> '<jsonData>'
```
Update an existing document.

**Example:**
```bash
node dba-script.js update scores iezD4TXVt4CQh62EnNPe '{"guesses":2}'
```

#### Delete Document
```bash
node dba-script.js delete <collection> <documentId>
```
Delete a document from the collection.

**Example:**
```bash
node dba-script.js delete scores iezD4TXVt4CQh62EnNPe
```

#### Count Documents
```bash
node dba-script.js count <collection>
```
Count total documents in a collection.

**Example:**
```bash
node dba-script.js count scores
```

#### Help
```bash
node dba-script.js help
```
Display help information and command usage.

### Common Administrative Tasks

#### Remove Bot/Test Records
1. First, search for suspicious records:
   ```bash
   node dba-script.js search scores name == "John Doe"
   ```

2. Review the results and note the document IDs

3. Delete the unwanted records:
   ```bash
   node dba-script.js delete scores <documentId>
   ```

#### View Recent Submissions
```bash
node dba-script.js search scores date == "2025-07-11" 20
```

#### Find High Scores (1 guess)
```bash
node dba-script.js search scores guesses == 1
```

#### Find Players with Many Attempts
```bash
node dba-script.js search scores guesses > 5
```

### Database Schema

The `scores` collection contains documents with the following structure:
```json
{
  "name": "Player Name",
  "guesses": 3,
  "date": "2025-07-09",
  "dnf": false,
  "wordleNumber": "1234"
}
```

- `name` (string): Player's name
- `guesses` (number): Number of guesses taken (1-6, or 7+ for DNF)
- `date` (string): Date in YYYY-MM-DD format (New Zealand timezone)
- `dnf` (boolean): True if player did not finish (DNF)
- `wordleNumber` (string|null): Wordle puzzle number (extracted from pasted results or estimated for manual entries)

### Teams Integration

When scores are submitted, the application automatically posts to Microsoft Teams with:
- Player name and score
- Hostname/computer information
- DNF status (automatically detected for scores > 6)
- No hostname data is stored in the database for privacy
- All dates are calculated using New Zealand (Pacific/Auckland) timezone

### Security Notes

- This script uses the client-side Firebase SDK with your project credentials
- Ensure your `.env` file is properly secured and not committed to version control
- The script respects Firestore security rules defined in `firestore.rules`
- Regular backups are recommended before performing bulk operations

### Troubleshooting

- **Connection timeout**: Large collections may cause timeouts when listing all documents
- **Permission denied**: Check your Firestore security rules
- **Invalid credentials**: Verify your `.env` file contains correct Firebase configuration
- **Document not found**: Ensure the document ID is correct and exists in the collection

## Development

This is a React + Vite application using Firebase Firestore for data storage.

### Project Structure
- `src/` - React application source code
- `public/` - Static assets
- `dba-script.js` - Database administration script
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore indexes configuration

