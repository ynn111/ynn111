const fs = require('fs');

const filePath = 'data.js';
let content = fs.readFileSync(filePath, 'utf-8');

// 找到习概部分的开始
const startIdx = content.indexOf('id: "xigai"');
if (startIdx === -1) {
  console.log('未找到习概部分');
  process.exit(1);
}

// 找到习概部分的结束（下一个课程）
const endIdx = content.indexOf('id: "maerke"');
if (endIdx === -1) {
  console.log('未找到马原部分');
  process.exit(1);
}

// 提取习概部分
let xigaiPart = content.substring(startIdx, endIdx);

// 修复choiceQuestions被破坏的问题
// 找到所有的choiceQuestions: []并修复
xigaiPart = xigaiPart.replace(/choiceQuestions:\s*\[\]/g, 'choiceQuestions: [');

// 找到所有的essayQuestions: []并修复
xigaiPart = xigaiPart.replace(/essayQuestions:\s*\[\]/g, 'essayQuestions: [');

// 现在需要正确关闭数组
// 找到每个章节的sections之前，添加]

// 找到章节结束的位置并添加]
const chapterPattern = /(\}\s*\])\s*(?=\s*sections:)/g;
xigaiPart = xigaiPart.replace(chapterPattern, '],');

// 最后修复
const finalPart = content.substring(0, startIdx) + xigaiPart + content.substring(endIdx);

fs.writeFileSync(filePath, finalPart, 'utf-8');
console.log('已修复数据结构！');
