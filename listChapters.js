const fs = require('fs');

fs.readFile('./data.js', 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件失败:', err);
    return;
  }
  
  // 移除const courses = 和末尾的分号
  const content = data.replace('const courses = ', '').replace(/;$/, '');
  
  try {
    const courses = eval(content);
    const xigai = courses.find(c => c.name.includes('习近平'));
    
    console.log('习概章节列表:');
    xigai.chapters.forEach((ch, i) => {
      console.log(`${i + 1}. ${ch.title}`);
    });
  } catch (e) {
    console.error('解析失败:', e.message);
  }
});