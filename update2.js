const fs = require('fs');
// 使用GBK编码读取文件
const iconv = require('iconv-lite');
const buffer = fs.readFileSync('c:\\Users\\杨宁宁\\Desktop\\ynn111\\data.js');
const content = iconv.decode(buffer, 'GBK');
// 添加新题目
const searchStr = 'analysis: "新时代的战略安排是2020年全面建成小康社会，2035年基本实现现代化，2050年建成社会主义现代化强国。"' + '\r\n          }' + '\r\n        ],' + '\r\n        essayQuestions: [';
const replaceStr = 'analysis: "新时代的战略安排是2020年全面建成小康社会，2035年基本实现现代化，2050年建成社会主义现代化强国。"' + '\r\n          },' + '\r\n          {' + '\r\n            question: "中国共产党为什么能，中国特色社会主义为什么好，归根到底是（ ）",' + '\r\n            options: ["马克思主义行，是中国化时代化的马克思主义行", "坚持人民至上", "坚持全面从严治党", "坚持改革开放"],' + '\r\n            answer: 0,' + '\r\n            analysis: "中国共产党为什么能，中国特色社会主义为什么好，归根到底是马克思主义行，是中国化时代化的马克思主义行。"' + '\r\n          }' + '\r\n        ],' + '\r\n        essayQuestions: [';
const newContent = content.replace(searchStr, replaceStr);
// 使用GBK编码写入文件
const newBuffer = iconv.encode(newContent, 'GBK');
fs.writeFileSync('c:\\Users\\杨宁宁\\Desktop\\ynn111\\data.js', newBuffer);
console.log('Updated');
