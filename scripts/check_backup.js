const fs = require('fs');

// Check backup file
const content = fs.readFileSync('c:/Users/杨宁宁/Desktop/ynn111/data_backup.js', 'utf8');

// Check for invalid characters
let invalidCount = 0;
for (let i = 0; i < content.length; i++) {
    const code = content.charCodeAt(i);
    // Check for replacement character or other control characters
    if (code === 0xFFFD || (code < 32 && code !== 10 && code !== 13 && code !== 9)) {
        invalidCount++;
        if (invalidCount <= 5) {
            console.log('Invalid at', i, ':', code, content.substring(i-10, i+10));
        }
    }
}

console.log('Total invalid characters:', invalidCount);

// Now fix quotes in backup
const fixed = content.replace(/"/g, "'");
fs.writeFileSync('c:/Users/杨宁宁/Desktop/ynn111/data.js', fixed, 'utf8');
console.log('Saved fixed file');

// Verify
try {
    require('c:/Users/杨宁宁/Desktop/ynn111/data.js');
    console.log('Syntax OK');
} catch(e) {
    console.log('Error:', e.message.substring(0, 200));
}
