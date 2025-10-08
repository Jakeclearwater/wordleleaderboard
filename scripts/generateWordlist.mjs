import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const wordsModulePath = path.resolve('node_modules/wordle-words/index.mjs');

let answers;
let rest;

try {
  ({ answers, rest } = await import(pathToFileURL(wordsModulePath)));
} catch (error) {
  console.error('wordle-words not found. Run "npm install wordle-words@0.0.0" before regenerating the word list.');
  console.error(error);
  process.exit(1);
}

const toUppercaseArrayLiteral = (arr) => arr.map((word) => word.toUpperCase());

const solutions = toUppercaseArrayLiteral(answers);
const extras = toUppercaseArrayLiteral(rest);
const all = Array.from(new Set([...solutions, ...extras]));

const header = `// Auto-generated from wordle-words package\n` +
  `// Regenerate by running: node scripts/generateWordlist.mjs\n` +
  `// Last generated: ${new Date().toISOString()}\n\n`;

const fileContents = `${header}` +
  `export const SOLUTION_WORDS = ${JSON.stringify(solutions)};\n` +
  `export const EXTRA_GUESSES = ${JSON.stringify(extras)};\n` +
  `export const WORD_LIST = ${JSON.stringify(all)};\n` +
  `export const WORD_SET = new Set(WORD_LIST);\n`;

fs.writeFileSync('src/wordlists/wordleWords.js', fileContents + '\n');
