const fs = require('fs');

const filePath = 'data.js';
let content = fs.readFileSync(filePath, 'utf-8');

// 简单直接的方法：使用正则表达式为每个question对象添加sectionIndex
// 找到习概部分
const startMarker = 'id: "xigai"';
const endMarker = 'id: "maerke"';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.log('未找到目标部分');
  process.exit(1);
}

const xigaiPart = content.substring(startIdx, endIdx);

// 分割成章节
const chapters = xigaiPart.split('id: ');
let result = content.substring(0, startIdx) + startMarker;

let globalQuestionCounter = 0;

for (let i = 1; i < chapters.length; i++) {
  let chapter = 'id: ' + chapters[i];
  
  // 计算该章节的sections数量
  const sectionsMatch = chapter.match(/sections:\s*\[([^\]]+)\]/);
  let sectionsCount = 3;
  if (sectionsMatch) {
    const sectionsContent = sectionsMatch[1];
    sectionsCount = (sectionsContent.match(/title:/g) || []).length;
    if (sectionsCount === 0) sectionsCount = 3;
  }
  
  // 为choiceQuestions添加sectionIndex
  chapter = addSectionIndexToQuestionArray(chapter, 'choiceQuestions', globalQuestionCounter, sectionsCount);
  
  // 为essayQuestions添加sectionIndex  
  chapter = addSectionIndexToQuestionArray(chapter, 'essayQuestions', globalQuestionCounter, sectionsCount);
  
  result += chapter;
  
  // 更新全局计数器
  const cqCount = (chapter.match(/choiceQuestions:\s*\[([^\]]+)\]/) || ['', ''])[1].split('question:').length - 1;
  const eqCount = (chapter.match(/essayQuestions:\s*\[([^\]]+)\]/) || ['', ''])[1].split('question:').length - 1;
  globalQuestionCounter += cqCount + eqCount;
}

result += content.substring(endIdx);

fs.writeFileSync(filePath, result, 'utf-8');
console.log('已完成sectionIndex的添加！');

function addSectionIndexToQuestionArray(str, arrayName, startCounter, sectionsCount) {
  const regex = new RegExp(arrayName + ':\\s*\\[([^\\]]+)\\]', 'g');
  
  return str.replace(regex, (match, questionsContent) => {
    // 分割成单个题目
    const questions = questionsContent.split('{question:');
    let resultArray = arrayName + ': [';
    
    for (let i = 1; i < questions.length; i++) {
      const sectionIndex = (startCounter + i - 1) % sectionsCount;
      resultArray += '{sectionIndex: ' + sectionIndex + ', question:' + questions[i];
    }
    
    resultArray += ']';
    return resultArray;
  });
}
