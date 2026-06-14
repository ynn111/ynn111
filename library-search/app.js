let currentCourse = null;
let currentChapter = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  renderCourseCards();
  
  // 绑定回车搜索
  document.getElementById('heroSearch')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doSearch();
  });
  document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doSearch();
  });
});

// 显示首页
function showHome() {
  hideAllViews();
  document.getElementById('homeView').style.display = 'block';
  updateNavActive(0);
  window.scrollTo(0, 0);
}

// 显示课程详情
function showCourse(courseId) {
  currentCourse = courses.find(c => c.id === courseId);
  if (!currentCourse) return;
  
  hideAllViews();
  document.getElementById('courseView').style.display = 'block';
  updateNavActive(-1);
  
  // 设置课程头部
  const header = document.getElementById('courseHeader');
  header.style.setProperty('--course-color', currentCourse.color);
  header.innerHTML = `
    <div class="course-header-inner">
      <div class="breadcrumb">
        <a href="#" onclick="showHome(); return false;">首页</a>
        <span>/</span>
        <span>${currentCourse.name}</span>
      </div>
      <h1>${currentCourse.name}</h1>
      <p>${currentCourse.description}</p>
    </div>
  `;
  
  // 渲染章节列表
  const chapterList = document.getElementById('chapterList');
  chapterList.className = 'chapter-list';
  chapterList.innerHTML = currentCourse.chapters.map((ch, idx) => `
    <div class="chapter-item" id="chapter-${idx}">
      <div class="chapter-title-bar" onclick="toggleChapter(${idx})">
        <h3>${ch.title}</h3>
        <svg class="chapter-toggle" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div class="chapter-sections">
        ${ch.sections.map((sec, sidx) => `
          <div class="section-item" onclick="showSection(${idx}, ${sidx})">
            <h4>${sec.title}</h4>
            <div class="section-keypoints">
              ${sec.keyPoints.map(kp => `<span class="keypoint-tag">${kp}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
  
  window.scrollTo(0, 0);
}

// 展开/收起章节
function toggleChapter(idx) {
  const item = document.getElementById(`chapter-${idx}`);
  item.classList.toggle('expanded');
}

// 当前章节索引
let currentChIdx = 0;

// 显示节内容
function showSection(chIdx, secIdx) {
  const chapter = currentCourse.chapters[chIdx];
  const section = chapter.sections[secIdx];
  currentChapter = chapter;
  currentChIdx = chIdx;
  
  hideAllViews();
  document.getElementById('chapterView').style.display = 'block';
  updateNavActive(-1);
  
  // 设置章节头部
  const header = document.getElementById('chapterHeader');
  header.style.setProperty('--course-color', currentCourse.color);
  header.innerHTML = `
    <div class="chapter-header-inner">
      <div class="breadcrumb">
        <a href="#" onclick="showHome(); return false;">首页</a>
        <span>/</span>
        <a href="#" onclick="showCourse('${currentCourse.id}'); return false;">${currentCourse.name}</a>
        <span>/</span>
        <span>${chapter.title}</span>
      </div>
      <span class="course-tag">${currentCourse.shortName}</span>
      <h1>${section.title}</h1>
    </div>
  `;
  
  // 渲染节内容
  const sectionList = document.getElementById('sectionList');
  sectionList.innerHTML = `
    <!-- 功能按钮 -->
    <div class="function-buttons">
      <button class="func-btn" onclick="showExamPoints(${chIdx})" id="btn-exam">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7.5 18H4v-3.686a2.121 2.121 0 0 1 3-3L16.5 3.5z"></path>
        </svg>
        考点
      </button>
      <button class="func-btn" onclick="showChoiceQuestions(${chIdx})" id="btn-choice">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="m8 11 3 3 7-7"></path>
        </svg>
        选择题
      </button>
      <button class="func-btn" onclick="showEssayQuestions(${chIdx})" id="btn-essay">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        大题
      </button>
    </div>
    
    <!-- 内容区域 -->
    <div id="contentArea">
      <div class="section-detail">
        <h3>本节知识点</h3>
        <ul class="keypoints-list">
          ${section.keyPoints.map(kp => `<li>${kp}</li>`).join('')}
        </ul>
      </div>
      ${chapter.sections.map((sec, idx) => `
        <div class="section-detail" style="opacity: ${idx === secIdx ? '1' : '0.7'};">
          <h3>${sec.title}</h3>
          <ul class="keypoints-list">
            ${sec.keyPoints.map(kp => `<li>${kp}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
    
    <!-- 考点区域 -->
    <div id="examPointsArea" style="display: none;">
      <div class="section-detail exam-section">
        <h3>📌 本章考点</h3>
        <ul class="exam-points-list">
          ${chapter.examPoints?.map((point, idx) => `<li><span class="point-num">${idx + 1}.</span>${point}</li>`).join('') || '<li>暂无考点信息</li>'}
        </ul>
      </div>
    </div>
    
    <!-- 选择题区域 -->
    <div id="choiceQuestionsArea" style="display: none;">
      ${chapter.choiceQuestions?.map((q, idx) => `
        <div class="section-detail question-section">
          <h3>选择题 ${idx + 1}</h3>
          <div class="question-text">${q.question}</div>
          <div class="options-list">
            ${q.options.map((opt, optIdx) => `
              <div class="option-item" onclick="checkAnswer(${idx}, ${optIdx}, this)">
                <span class="option-letter">${String.fromCharCode(65 + optIdx)}</span>
                <span class="option-text">${opt}</span>
                <span class="option-status"></span>
              </div>
            `).join('')}
          </div>
          <div class="question-analysis" id="analysis-${idx}" style="display: none;">
            <div class="analysis-title">💡 解析</div>
            <div class="analysis-content">${q.analysis}</div>
          </div>
        </div>
      `).join('') || '<div class="section-detail"><p>暂无选择题</p></div>'}
    </div>
    
    <!-- 大题区域 -->
    <div id="essayQuestionsArea" style="display: none;">
      ${chapter.essayQuestions?.map((q, idx) => `
        <div class="section-detail essay-section">
          <h3>论述题 ${idx + 1}</h3>
          <div class="question-text">${q.question}</div>
          <div class="answer-container">
            <button class="show-answer-btn" onclick="toggleAnswer(${idx})">展开答案</button>
            <div class="essay-answer" id="essay-answer-${idx}" style="display: none;">
              ${q.answer}
            </div>
          </div>
        </div>
      `).join('') || '<div class="section-detail"><p>暂无大题</p></div>'}
    </div>
  `;
  
  window.scrollTo(0, 0);
}

// 显示考点
function showExamPoints(chIdx) {
  document.getElementById('btn-exam').classList.add('active');
  document.getElementById('btn-choice').classList.remove('active');
  document.getElementById('btn-essay').classList.remove('active');
  
  document.getElementById('contentArea').style.display = 'none';
  document.getElementById('choiceQuestionsArea').style.display = 'none';
  document.getElementById('essayQuestionsArea').style.display = 'none';
  document.getElementById('examPointsArea').style.display = 'block';
}

// 显示选择题
function showChoiceQuestions(chIdx) {
  document.getElementById('btn-exam').classList.remove('active');
  document.getElementById('btn-choice').classList.add('active');
  document.getElementById('btn-essay').classList.remove('active');
  
  document.getElementById('contentArea').style.display = 'none';
  document.getElementById('examPointsArea').style.display = 'none';
  document.getElementById('essayQuestionsArea').style.display = 'none';
  document.getElementById('choiceQuestionsArea').style.display = 'block';
}

// 显示大题
function showEssayQuestions(chIdx) {
  document.getElementById('btn-exam').classList.remove('active');
  document.getElementById('btn-choice').classList.remove('active');
  document.getElementById('btn-essay').classList.add('active');
  
  document.getElementById('contentArea').style.display = 'none';
  document.getElementById('examPointsArea').style.display = 'none';
  document.getElementById('choiceQuestionsArea').style.display = 'none';
  document.getElementById('essayQuestionsArea').style.display = 'block';
}

// 检查选择题答案
function checkAnswer(qIdx, optIdx, element) {
  const chapter = currentCourse.chapters[currentChIdx];
  const question = chapter.choiceQuestions[qIdx];
  
  // 清除之前的样式
  document.querySelectorAll(`#choiceQuestionsArea .question-section:nth-child(${qIdx + 1}) .option-item`).forEach(item => {
    item.classList.remove('correct', 'wrong', 'selected');
  });
  
  // 添加当前选择样式
  element.classList.add('selected');
  
  if (optIdx === question.answer) {
    element.classList.add('correct');
    element.querySelector('.option-status').innerHTML = '✓';
  } else {
    element.classList.add('wrong');
    element.querySelector('.option-status').innerHTML = '✗';
    // 显示正确答案
    document.querySelectorAll(`#choiceQuestionsArea .question-section:nth-child(${qIdx + 1}) .option-item`)[question.answer].classList.add('correct');
  }
  
  // 显示解析
  document.getElementById(`analysis-${qIdx}`).style.display = 'block';
}

// 切换大题答案显示
function toggleAnswer(idx) {
  const answer = document.getElementById(`essay-answer-${idx}`);
  const btn = document.querySelector(`#essayQuestionsArea .essay-section:nth-child(${idx + 1}) .show-answer-btn`);
  
  if (answer.style.display === 'none') {
    answer.style.display = 'block';
    btn.textContent = '收起答案';
  } else {
    answer.style.display = 'none';
    btn.textContent = '展开答案';
  }
}

// 返回课程
function backToCourse() {
  if (currentCourse) {
    showCourse(currentCourse.id);
  }
}

// 显示章节总览
function showAllChapters() {
  hideAllViews();
  
  const view = document.createElement('div');
  view.id = 'allChaptersView';
  view.innerHTML = `
    <div class="search-header">
      <div class="container">
        <h2>章节总览</h2>
        <p>五门课程全部章节一览</p>
      </div>
    </div>
    <div class="container">
      <div class="all-chapters">
        ${courses.map(course => `
          <div class="course-group">
            <div class="course-group-header" style="--course-color: ${course.color}">
              <h3>${course.name}</h3>
              <span class="badge">${course.shortName}</span>
            </div>
            <div class="chapter-grid">
              ${course.chapters.map((ch, idx) => `
                <div class="chapter-grid-item" style="--course-color: ${course.color}" onclick="showCourseChapter('${course.id}', ${idx})">
                  <h4>${ch.title}</h4>
                  <div class="sections-count">${ch.sections.length} 个知识点</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  document.body.insertBefore(view, document.querySelector('.footer'));
  updateNavActive(1);
  window.scrollTo(0, 0);
}

// 显示特定课程的特定章节
function showCourseChapter(courseId, chIdx) {
  currentCourse = courses.find(c => c.id === courseId);
  if (!currentCourse) return;
  
  // 移除总览视图
  const allView = document.getElementById('allChaptersView');
  if (allView) allView.remove();
  
  showCourse(courseId);
  
  // 延迟展开对应章节
  setTimeout(() => {
    const item = document.getElementById(`chapter-${chIdx}`);
    if (item) {
      item.classList.add('expanded');
      item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}

// 显示搜索页
function showSearch() {
  hideAllViews();
  document.getElementById('searchView').style.display = 'block';
  updateNavActive(2);
  window.scrollTo(0, 0);
}

// 执行搜索
function doSearch() {
  const query = (document.getElementById('heroSearch')?.value || document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  if (!query) return;
  
  showSearch();
  document.getElementById('searchInput').value = query;
  
  const results = [];
  courses.forEach(course => {
    course.chapters.forEach(ch => {
      ch.sections.forEach(sec => {
        const matchTitle = sec.title.toLowerCase().includes(query);
        const matchKeyPoints = sec.keyPoints.some(kp => kp.toLowerCase().includes(query));
        
        if (matchTitle || matchKeyPoints) {
          results.push({
            course: course,
            chapter: ch,
            section: sec,
            matchType: matchTitle ? 'title' : 'keyword'
          });
        }
      });
    });
  });
  
  renderSearchResults(results, query);
}

// 渲染搜索结果
function renderSearchResults(results, query) {
  const container = document.getElementById('searchResults');
  
  if (results.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <p>未找到与 "${escapeHtml(query)}" 相关的资料</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="search-results">
      <div class="result-count">共找到 <span>${results.length}</span> 条相关记录</div>
      ${results.map(r => `
        <div class="result-item" style="--result-color: ${r.course.color}" onclick="showSectionFromSearch('${r.course.id}', '${r.chapter.title}', '${r.section.title}')">
          <div class="result-course">${r.course.name}</div>
          <div class="result-title">${highlightText(r.section.title, query)}</div>
          <div class="result-keywords">
            ${r.section.keyPoints.map(kp => {
              const isMatch = kp.toLowerCase().includes(query);
              return `<span class="result-keyword ${isMatch ? 'highlight' : ''}">${highlightText(kp, query)}</span>`;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 从搜索结果跳转到节
function showSectionFromSearch(courseId, chapterTitle, sectionTitle) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return;
  
  currentCourse = course;
  const chIdx = course.chapters.findIndex(ch => ch.title === chapterTitle);
  const secIdx = course.chapters[chIdx]?.sections.findIndex(sec => sec.title === sectionTitle);
  
  if (chIdx >= 0 && secIdx >= 0) {
    showSection(chIdx, secIdx);
  }
}

// 渲染课程卡片
function renderCourseCards() {
  const container = document.getElementById('courseCards');
  container.innerHTML = courses.map(course => `
    <div class="course-card" style="--course-color: ${course.color}" onclick="showCourse('${course.id}')">
      <div class="course-icon" style="background: ${course.color}">${course.shortName}</div>
      <div class="course-short" style="color: ${course.color}">${course.shortName}</div>
      <div class="course-name">${course.name}</div>
      <div class="course-chapters">${course.chapters.length} 章 ${course.chapters.reduce((sum, ch) => sum + ch.sections.length, 0)} 节</div>
    </div>
  `).join('');
}

// 高亮文本
function highlightText(text, query) {
  if (!query) return escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escapeHtml(text).replace(regex, '<span style="color:#c53030;font-weight:600;">$1</span>');
}

// 转义HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 转义正则
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 隐藏所有视图
function hideAllViews() {
  document.getElementById('homeView').style.display = 'none';
  document.getElementById('courseView').style.display = 'none';
  document.getElementById('chapterView').style.display = 'none';
  document.getElementById('searchView').style.display = 'none';
  
  const allView = document.getElementById('allChaptersView');
  if (allView) allView.remove();
}

// 更新导航激活状态
function updateNavActive(index) {
  document.querySelectorAll('.nav a').forEach((a, i) => {
    a.classList.toggle('active', i === index);
  });
}
