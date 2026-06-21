const fs = require('fs');

// 读取文件
const content = fs.readFileSync('c:\\Users\\杨宁宁\\Desktop\\ynn111\\data.js', 'utf-8');

// 定义要查找的模式和替换内容
const pattern = /analysis: "新时代的战略安排是2020年全面建成小康社会，2035年基本实现现代化，2050年建成社会主义现代化强国。"\s*\}\s*\]\s*,\s*\n\s*essayQuestions:\s*\[|/;

const replacement = `analysis: "新时代的战略安排是2020年全面建成小康社会，2035年基本实现现代化，2050年建成社会主义现代化强国。"
          },
          {
            question: "中国共产党为什么能，中国特色社会主义为什么好，归根到底是（ ）",
            options: ["马克思主义行，是中国化时代化的马克思主义行", "坚持人民至上", "坚持全面从严治党", "坚持改革开放"],
            answer: 0,
            analysis: "中国共产党为什么能，中国特色社会主义为什么好，归根到底是马克思主义行，是中国化时代化的马克思主义行。"
          }
        ],
        essayQuestions: [`;

// 执行替换
const newContent = content.replace(pattern, replacement);

// 写入文件
fs.writeFileSync('c:\\Users\\杨宁宁\\Desktop\\ynn111\\data.js', newContent, 'utf-8');

console.log('Successfully updated the file');