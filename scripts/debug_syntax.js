const fs = require('fs');
const content = fs.readFileSync('c:/Users/杨宁宁/Desktop/ynn111/data.js', 'utf8');

// Split into lines
const lines = content.split('\n');

// Try to parse each line as part of a JS expression
let currentLine = 1;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip empty lines and comments
    if (line.trim() === '' || line.trim().startsWith('//')) continue;
    
    // Try to evaluate the line
    try {
        new Function(line);
    } catch (e) {
        console.log('Error at line', i+1, ':', line.substring(0, 80));
        console.log('Error message:', e.message);
        break;
    }
}
