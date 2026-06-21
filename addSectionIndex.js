const fs = require('fs');

// 读取data.js文件
fs.readFile('./data.js', 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件失败:', err);
    return;
  }

  try {
    // 使用eval解析JavaScript对象
    const courses = eval(data.replace('const courses = ', '').replace(/;$/, ''));
    
    // 遍历每个课程
    courses.forEach(course => {
      course.chapters.forEach(chapter => {
        const sectionCount = chapter.sections ? chapter.sections.length : 1;
        
        // 为单选题添加sectionIndex
        if (chapter.choiceQuestions) {
          chapter.choiceQuestions.forEach((q, index) => {
            if (q.sectionIndex === undefined) {
              // 根据题目数量均匀分配到各个小节
              q.sectionIndex = Math.floor((index / chapter.choiceQuestions.length) * sectionCount);
            }
          });
        }
        
        // 为多选题添加sectionIndex
        if (chapter.multiQuestions) {
          chapter.multiQuestions.forEach((q, index) => {
            if (q.sectionIndex === undefined) {
              q.sectionIndex = Math.floor((index / chapter.multiQuestions.length) * sectionCount);
            }
          });
        }
        
        // 为大题添加sectionIndex
        if (chapter.essayQuestions) {
          chapter.essayQuestions.forEach((q, index) => {
            if (q.sectionIndex === undefined) {
              q.sectionIndex = Math.floor((index / chapter.essayQuestions.length) * sectionCount);
            }
          });
        }
      });
    });

    // 将修改后的数据写回文件
    let output = JSON.stringify(courses, null, 2);
    // 将JSON格式转换回JavaScript格式（单引号）
    output = output.replace(/"([^"]+)":/g, "'$1':");
    output = output.replace(/"([^"]+)"/g, "'$1'");
    output = "const courses = " + output + ";";
    
    fs.writeFile('./data.js', output, 'utf8', (err) => {
      if (err) {
        console.error('写入文件失败:', err);
        return;
      }
      console.log('成功为所有题目添加了sectionIndex属性！');
    });

  } catch (e) {
    console.error('解析文件失败:', e);
    console.log('错误位置:', e.stack);
  }
});