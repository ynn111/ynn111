const fs = require('fs');
const content = fs.readFileSync('c:/Users/杨宁宁/Desktop/ynn111/data.js', 'utf8');

// Find lines with potential issues
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check for unescaped quotes inside strings
    if (line.includes('盲')) {
        console.log('Line', i+1, ':', line.substring(0, 100));
    }
}
