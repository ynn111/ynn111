const fs = require('fs');

// Read backup as binary
const buf = fs.readFileSync('c:/Users/杨宁宁/Desktop/ynn111/data_backup.js');

// Try to detect encoding - check if it starts with valid UTF-8 BOM
if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    console.log('File has UTF-8 BOM');
}

// Convert buffer to string assuming GBK encoding
const iconv = require('iconv-lite');
const gbkStr = iconv.decode(buf, 'gbk');

// Check if conversion worked by looking for valid Chinese characters
const hasChinese = /[\u4e00-\u9fa5]/.test(gbkStr);
console.log('Has valid Chinese after GBK conversion:', hasChinese);

// If not, try UTF-8
if (!hasChinese) {
    const utf8Str = buf.toString('utf8');
    const hasChineseUtf8 = /[\u4e00-\u9fa5]/.test(utf8Str);
    console.log('Has valid Chinese after UTF-8 conversion:', hasChineseUtf8);
    
    if (hasChineseUtf8) {
        // Fix quotes
        const fixed = utf8Str.replace(/"/g, "'");
        fs.writeFileSync('c:/Users/杨宁宁/Desktop/ynn111/data.js', fixed, 'utf8');
        console.log('Saved with UTF-8');
        
        try {
            require('c:/Users/杨宁宁/Desktop/ynn111/data.js');
            console.log('Syntax OK');
        } catch(e) {
            console.log('Error:', e.message);
        }
    }
} else {
    // Fix quotes
    const fixed = gbkStr.replace(/"/g, "'");
    fs.writeFileSync('c:/Users/杨宁宁/Desktop/ynn111/data.js', fixed, 'utf8');
    console.log('Saved with GBK->UTF-8');
    
    try {
        require('c:/Users/杨宁宁/Desktop/ynn111/data.js');
        console.log('Syntax OK');
    } catch(e) {
        console.log('Error:', e.message);
    }
}
