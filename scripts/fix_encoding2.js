const fs = require('fs');

// Try to read as GBK and convert to UTF-8
try {
    // Read as GBK
    const iconv = require('iconv-lite');
    const gbkBuffer = fs.readFileSync('c:/Users/杨宁宁/Desktop/ynn111/data_backup.js');
    const utf8Str = iconv.decode(gbkBuffer, 'gbk');
    
    // Fix the Chinese quotes issue
    const fixed = utf8Str.replace(/"/g, "'");
    
    // Write as UTF-8
    fs.writeFileSync('c:/Users/杨宁宁/Desktop/ynn111/data.js', fixed, 'utf8');
    console.log('File converted and saved');
    
    // Check syntax
    try {
        require('c:/Users/杨宁宁/Desktop/ynn111/data.js');
        console.log('Syntax OK');
    } catch(e) {
        console.log('Syntax Error:', e.message);
    }
} catch(e) {
    console.log('Error:', e.message);
}
