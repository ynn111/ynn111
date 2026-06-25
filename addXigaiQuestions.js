const fs = require('fs');

fs.readFile('./data.js', 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件失败:', err);
    return;
  }
  
  // 移除const courses = 和末尾的分号
  let content = data.replace('const courses = ', '').replace(/;$/, '');
  
  try {
    const courses = eval(content);
    const xigai = courses.find(c => c.name.includes('习近平'));
    
    // 第一章：新时代坚持和发展中国特色社会主义
    const chapter1 = xigai.chapters.find(c => c.title.includes('第一章'));
    if (chapter1) {
      chapter1.essayQuestions.push({
        question: "简述中国特色社会主义新时代的内涵。",
        answer: "（1）承前启后、继往开来，继续夺取中国特色社会主义伟大胜利的时代。（2）决胜全面建成小康社会、进而全面建成社会主义现代化强国的时代。（3）全国各族人民团结奋斗、逐步实现全体人民共同富裕的时代。（4）全体中华儿女戮力同心、奋力实现中华民族伟大复兴中国梦的时代。（5）我国不断为人类作出更大贡献的时代。"
      });
    }
    
    // 第二章：以中国式现代化全面推进中华民族伟大复兴
    const chapter2 = xigai.chapters.find(c => c.title.includes('第二章'));
    if (chapter2) {
      chapter2.essayQuestions.push({
        question: "简述中国式现代化国家的重要特征。",
        answer: "（1）人口规模巨大的现代化（2）全体人民共同富裕的现代化（3）物质文明和精神文明相协调的现代化（4）人与自然和谐共生的现代化（5）走和平发展道路的现代化"
      });
    }
    
    // 第五章：全面深化改革开放
    const chapter5 = xigai.chapters.find(c => c.title.includes('第五章'));
    if (chapter5) {
      chapter5.essayQuestions.push({
        question: "简述全面深化改革开放要坚持的正确方法论。",
        answer: "（1）增强全面深化改革的系统性、整体性、协同性（2）加强顶层设计和摸着石头过河（3）统筹改革发展稳定（4）胆子要大、步子要稳（5）坚持重大改革于法有据"
      });
    }
    
    // 第六章：推动高质量发展
    const chapter6 = xigai.chapters.find(c => c.title.includes('第六章'));
    if (chapter6) {
      chapter6.essayQuestions.push({
        question: "简述新发展理念的丰富内涵。",
        answer: "（1）创新：引领发展的第一动力，解决发展动力问题。（2）协调：持续健康发展的内在要求，解决发展不平衡问题。（3）绿色：永续发展的必要条件，解决人与自然和谐共生问题。（4）开放：国家繁荣发展的必由之路，解决发展内外联动问题。（5）共享：中国特色社会主义的本质要求，解决社会公平正义问题。"
      });
    }
    
    // 第七章：实施科教兴国战略
    const chapter7 = xigai.chapters.find(c => c.title.includes('第七章'));
    if (chapter7) {
      chapter7.essayQuestions.push({
        question: "简述办好人民满意的教育的措施。",
        answer: "（1）大力促进教育公平（2）加快建设高质量教育体系（3）提升教育服务经济社会发展能力（4）坚持深化教育改革创新（5）坚持把教师队伍建设作为基础工作"
      });
    }
    
    // 第九章：全面依法治国
    const chapter9 = xigai.chapters.find(c => c.title.includes('第九章'));
    if (chapter9) {
      chapter9.essayQuestions.push({
        question: "简述中国特色社会主义法治体系建设。",
        answer: "（1）完备的法律规范体系（2）高效的法治实施体系（3）严密的法治监督体系（4）有力的法治保障体系（5）完善的党内法规体系"
      });
      chapter9.essayQuestions.push({
        question: "请结合所学知识，试论述如何建设更高水平的法治中国。",
        answer: "（1）完善以宪法为核心的中国特色社会主义法律体系。（2）扎实推进依法行政，建设法治政府。（3）严格公正司法，守住公平正义最后防线。（4）加快建设法治社会，增强全民法治观念。"
      });
    }
    
    // 第十章：建设社会主义文化强国
    const chapter10 = xigai.chapters.find(c => c.title.includes('第十章'));
    if (chapter10) {
      chapter10.essayQuestions.push({
        question: "简述坚定中国特色社会主义文化自信的基础。",
        answer: "（1）中华优秀传统文化：深厚根基。（2）革命文化和社会主义先进文化：坚强基石。（3）中国特色社会主义伟大实践：现实基础。"
      });
    }
    
    // 第十一章：以保障和改善民生为重点加强社会建设
    const chapter11 = xigai.chapters.find(c => c.title.includes('第十一章'));
    if (chapter11) {
      chapter11.essayQuestions.push({
        question: "简述怎样在发展中增进民生福祉。",
        answer: "（1）把握民生与发展关系（2）坚守底线、突出重点、完善制度、引导预期（3）解决群众最关心最直接最现实利益问题（4）坚持尽力而为、量力而行（5）坚持人人尽责、人人享有"
      });
    }
    
    // 添加第十二章到第十七章
    const newChapters = [
      {
        id: 12,
        title: "第十二章 建设社会主义生态文明",
        keyPoints: ["生态文明建设", "绿色发展", "碳达峰碳中和"],
        examPoints: ["生态文明建设的重要性", "绿色发展理念", "碳达峰碳中和目标"],
        choiceQuestions: [],
        essayQuestions: [
          {
            question: "简述加快形成绿色生产方式和生活方式的措施。",
            answer: "（1）推动产业、能源、交通结构优化（2）资源节约集约利用（3）碳达峰碳中和（4）健全绿色发展保障体系（5）转化为全民自觉行动"
          },
          {
            question: "请结合所学知识，试论述习近平生态文明思想的内涵。",
            answer: "核心是\"十个坚持\"：（1）坚持党对生态文明建设的全面领导（2）坚持生态兴则文明兴（3）坚持人与自然和谐共生（4）坚持绿水青山就是金山银山（5）坚持良好生态环境是最普惠的民生福祉（6）坚持绿色发展是发展观的深刻革命（7）坚持统筹山水林田湖草沙系统治理（8）坚持用最严格制度最严密法治保护生态环境（9）坚持把建设美丽中国转化为全体人民自觉行动（10）坚持共谋全球生态文明建设之路"
          }
        ],
        sections: [
          { title: "第一节 生态文明建设的重要性", keyPoints: ["生态文明建设的意义", "绿色发展理念"] },
          { title: "第二节 绿色生产方式和生活方式", keyPoints: ["碳达峰碳中和", "资源节约"] },
          { title: "第三节 习近平生态文明思想", keyPoints: ["十个坚持", "美丽中国"] }
        ]
      },
      {
        id: 13,
        title: "第十三章 统筹发展和安全，推进国家安全体系和能力现代化",
        keyPoints: ["国家安全", "政治安全", "总体国家安全观"],
        examPoints: ["总体国家安全观", "政治安全", "国家安全体系"],
        choiceQuestions: [],
        essayQuestions: [
          {
            question: "简述维护政治安全的措施。",
            answer: "（1）维护政权安全，巩固党的领导和执政地位。（2）维护制度安全，坚持和完善中国特色社会主义制度。（3）维护意识形态安全，巩固马克思主义指导地位。"
          }
        ],
        sections: [
          { title: "第一节 总体国家安全观", keyPoints: ["国家安全的内涵", "总体国家安全观"] },
          { title: "第二节 维护政治安全", keyPoints: ["政权安全", "制度安全", "意识形态安全"] },
          { title: "第三节 国家安全体系和能力现代化", keyPoints: ["国家安全体系", "能力现代化"] }
        ]
      },
      {
        id: 14,
        title: "第十四章 实现建军一百年奋斗目标，开创国防和军队现代化新局面",
        keyPoints: ["强军目标", "国防现代化", "军队建设"],
        examPoints: ["强军目标的内涵", "国防和军队现代化", "党对军队的领导"],
        choiceQuestions: [],
        essayQuestions: [
          {
            question: "简述强军目标的科学内涵。",
            answer: "（1）听党指挥：灵魂，决定政治方向。（2）能打胜仗：核心，反映根本职能。（3）作风优良：保证，关系性质宗旨本色。"
          }
        ],
        sections: [
          { title: "第一节 强军目标", keyPoints: ["听党指挥", "能打胜仗", "作风优良"] },
          { title: "第二节 国防和军队现代化", keyPoints: ["现代化建设", "军事改革"] },
          { title: "第三节 实现建军一百年奋斗目标", keyPoints: ["奋斗目标", "战略安排"] }
        ]
      },
      {
        id: 15,
        title: "第十五章 坚持\"一国两制\"，推进祖国完全统一",
        keyPoints: ["一国两制", "祖国统一", "香港澳门台湾"],
        examPoints: ["一国两制的内涵", "祖国统一大业", "台湾问题"],
        choiceQuestions: [],
        essayQuestions: [
          {
            question: "简述准确把握\"一国两制\"科学内涵的要求。",
            answer: "（1）把握根本宗旨（2）把握\"一国\"与\"两制\"关系（3）中央全面管治权与高度自治权统一（4）爱国者治港治澳（5）依法治港治澳"
          }
        ],
        sections: [
          { title: "第一节 \"一国两制\"的内涵", keyPoints: ["一国与两制", "基本方针"] },
          { title: "第二节 香港和澳门的实践", keyPoints: ["回归后的发展", "治港治澳"] },
          { title: "第三节 推进祖国完全统一", keyPoints: ["台湾问题", "统一大业"] }
        ]
      },
      {
        id: 16,
        title: "第十六章 中国特色大国外交与推动构建人类命运共同体",
        keyPoints: ["大国外交", "人类命运共同体", "全球治理"],
        examPoints: ["中国特色大国外交", "人类命运共同体", "全球治理观"],
        choiceQuestions: [],
        essayQuestions: [
          {
            question: "简述中国特色大国外交坚持的原则要求。",
            answer: "（1）坚持党对对外工作的集中统一领导（2）坚持以中国特色社会主义为根本（3）坚持相互尊重、合作共赢走和平发展道路（4）坚持公平正义引领全球治理（5）坚持国家核心利益为底线"
          },
          {
            question: "试述构建人类命运共同体的内涵。",
            answer: "建设持久和平、普遍安全、共同繁荣、开放包容、清洁美丽的世界。（1）对话协商→持久和平（2）共建共享→普遍安全（3）合作共赢→共同繁荣（4）交流互鉴→开放包容（5）绿色低碳→清洁美丽"
          }
        ],
        sections: [
          { title: "第一节 中国特色大国外交", keyPoints: ["外交原则", "和平发展"] },
          { title: "第二节 构建人类命运共同体", keyPoints: ["内涵", "实践路径"] },
          { title: "第三节 全球治理", keyPoints: ["公平正义", "国际合作"] }
        ]
      },
      {
        id: 17,
        title: "第十七章 坚定不移全面从严治党，推进党的自我革命",
        keyPoints: ["全面从严治党", "党的建设", "自我革命"],
        examPoints: ["全面从严治党", "党的建设新的伟大工程", "自我革命"],
        choiceQuestions: [],
        essayQuestions: [
          {
            question: "简述思想建设是党的基础性建设的原因。",
            answer: "（1）坚守理想信念、坚定革命意志的前提。（2）保持政治清醒坚定、行动团结统一的要求。（3）贯彻理论路线方针、推进事业发展的保障。"
          }
        ],
        sections: [
          { title: "第一节 全面从严治党", keyPoints: ["从严治党", "党的建设"] },
          { title: "第二节 党的自我革命", keyPoints: ["自我革命", "革命性锻造"] },
          { title: "第三节 党的建设新的伟大工程", keyPoints: ["伟大工程", "全面推进"] }
        ]
      }
    ];
    
    // 添加新章节
    xigai.chapters.push(...newChapters);
    
    // 写回文件
    const result = 'const courses = ' + JSON.stringify(courses, null, 2) + ';';
    fs.writeFile('./data.js', result, 'utf8', (err) => {
      if (err) {
        console.error('写入文件失败:', err);
        return;
      }
      console.log('题目已成功添加到习概各章节！');
    });
    
  } catch (e) {
    console.error('解析或处理失败:', e.message);
  }
});