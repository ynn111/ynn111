const fs = require('fs');

// Read file
const content = fs.readFileSync('c:/Users/杨宁宁/Desktop/ynn111/data.js', 'utf8');

// Find the corrupted character
const corrupted = '鐩茶祩鑱ｇ洸璧傞檵蹇欒仦鑱';
const idx = content.indexOf(corrupted);
console.log('Corrupted at index:', idx);

if (idx >= 0) {
    console.log('Context before:', content.substring(Math.max(0, idx-100), idx));
    console.log('Context after:', content.substring(idx, idx+200));
}
