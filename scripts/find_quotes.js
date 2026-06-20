const fs = require('fs');
const content = fs.readFileSync('c:/Users/杨宁宁/Desktop/ynn111/data.js', 'utf8');

// Count Chinese double quotes
const count = (content.match(/"/g) || []).length;
console.log('Chinese quotes count:', count);

// Find and list lines with Chinese quotes
const lines = content.split('\n');
const problematicLines = [];
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('"')) {
        problematicLines.push({ line: i + 1, content: lines[i].substring(0, 100) });
    }
}

console.log('Lines with Chinese quotes:', problematicLines.length);
problematicLines.forEach(item => {
    console.log('Line', item.line + ':', item.content);
});
