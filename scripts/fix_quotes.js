const fs = require('fs');

// Read current file
const content = fs.readFileSync('c:/Users/杨宁宁/Desktop/ynn111/data.js', 'utf8');

// Replace all Chinese double quotes with single quotes
const fixed = content.replace(/"/g, "'");

// Write back
fs.writeFileSync('c:/Users/杨宁宁/Desktop/ynn111/data.js', fixed, 'utf8');
console.log('Replaced all Chinese quotes');

// Verify syntax
try {
    require('c:/Users/杨宁宁/Desktop/ynn111/data.js');
    console.log('Syntax OK');
} catch(e) {
    console.log('Syntax Error:', e.message);
}
