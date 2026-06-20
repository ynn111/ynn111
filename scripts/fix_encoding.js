const fs = require('fs');
const content = fs.readFileSync('c:/Users/杨宁宁/Desktop/ynn111/data.js', 'utf8');
const fixed = content.replace(/"/g, "'");
fs.writeFileSync('c:/Users/杨宁宁/Desktop/ynn111/data.js', fixed, 'utf8');
console.log('Done');

// Check syntax
try {
    require('c:/Users/杨宁宁/Desktop/ynn111/data.js');
    console.log('Syntax OK');
} catch(e) {
    console.log('Error:', e.message);
}
