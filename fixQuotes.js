const fs = require('fs');

fs.readFile('./data.js', 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件失败:', err);
    return;
  }
  
  // 修复单引号转义问题
  // 匹配 'xxx'yyy' 这种模式，将中间的 ' 转义为 \'
  let fixedData = data;
  
  // 处理 'xxx'yyy' 模式
  const regex = /'([^']+)'([^']+)'/g;
  fixedData = fixedData.replace(regex, (match, p1, p2) => {
    return `'${p1}\\''${p2}'`;
  });
  
  // 处理 ''xxx' 模式
  const regex2 = /''([^']+)'/g;
  fixedData = fixedData.replace(regex2, `'\\'$1\\''`);
  
  // 处理 'xxx'' 模式
  const regex3 = /'([^']+)''/g;
  fixedData = fixedData.replace(regex3, `'$1\\''`);
  
  fs.writeFile('./data.js', fixedData, 'utf8', (err) => {
    if (err) {
      console.error('写入文件失败:', err);
      return;
    }
    console.log('修复完成！');
    
    // 验证修复结果
    try {
      require('./data.js');
      console.log('数据加载成功，课程数量:', require('./data.js').courses.length);
    } catch (e) {
      console.error('修复后仍有错误:', e.message);
    }
  });
});