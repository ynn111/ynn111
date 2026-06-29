let currentCourse = null;
let currentChapter = null;
let quizStats = { correct: 0, wrong: 0 };

// 当前用户
let currentUser = null;
let authToken = null;

// API基础地址 - 可以在这里修改为你的后端地址
// 例如: let API_BASE = 'https://your-project.glitch.me/api';
let API_BASE = '/api';

// 是否启用远程API模式（如果API不可用会自动降级）
let useRemoteAPI = API_BASE !== '/api';

// 学习进度存储
let learningProgress = {};

// 用户笔记存储
let userNotes = {};

// 错题收藏存储
let wrongQuestions = {};

// API请求封装
async function apiRequest(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API请求失败:', error);
    return { success: false, message: '网络请求失败' };
  }
}

// 本地模拟用户存储
function getLocalUsers() {
  const users = localStorage.getItem('localUsers');
  return users ? JSON.parse(users) : {};
}

function saveLocalUsers(users) {
  localStorage.setItem('localUsers', JSON.stringify(users));
}

// 加载学习进度
async function loadLearningProgress() {
  try {
    if (currentUser && authToken) {
      const result = await apiRequest('/get-all-progress', {
        method: 'GET'
      });
      
      if (result.success) {
        const userProgress = result.progress || {};
        
        const tempSaved = localStorage.getItem('tempLearningProgress');
        if (tempSaved) {
          const tempProgress = JSON.parse(tempSaved);
          Object.keys(tempProgress).forEach(courseId => {
            if (!userProgress[courseId]) {
              userProgress[courseId] = tempProgress[courseId];
            } else {
              Object.keys(tempProgress[courseId]).forEach(chapterId => {
                if (!userProgress[courseId][chapterId]) {
                  userProgress[courseId][chapterId] = tempProgress[courseId][chapterId];
                } else {
                  if (tempProgress[courseId][chapterId].sections) {
                    Object.assign(userProgress[courseId][chapterId].sections, tempProgress[courseId][chapterId].sections);
                  }
                  if (tempProgress[courseId][chapterId].questions) {
                    Object.keys(tempProgress[courseId][chapterId].questions).forEach(sectionId => {
                      if (!userProgress[courseId][chapterId].questions[sectionId]) {
                        userProgress[courseId][chapterId].questions[sectionId] = tempProgress[courseId][chapterId].questions[sectionId];
                      } else {
                        userProgress[courseId][chapterId].questions[sectionId].correct += tempProgress[courseId][chapterId].questions[sectionId].correct || 0;
                        userProgress[courseId][chapterId].questions[sectionId].total += tempProgress[courseId][chapterId].questions[sectionId].total || 0;
                      }
                    });
                  }
                }
              });
            }
          });
          localStorage.removeItem('tempLearningProgress');
        }
        
        return userProgress;
      }
    }
    
    const saved = localStorage.getItem('tempLearningProgress');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('加载学习进度失败:', e);
    return {};
  }
}

// 保存学习进度
async function saveLearningProgress() {
  try {
    if (currentUser && authToken) {
      for (const courseId of Object.keys(learningProgress)) {
        for (const chapterId of Object.keys(learningProgress[courseId])) {
          await apiRequest('/save-progress', {
            method: 'POST',
            body: JSON.stringify({
              courseId,
              chapterId,
              progressData: learningProgress[courseId][chapterId]
            })
          });
        }
      }
    } else {
      localStorage.setItem('tempLearningProgress', JSON.stringify(learningProgress));
    }
  } catch (e) {
    console.error('保存学习进度失败:', e);
  }
}

// 更新学习进度
function updateProgress(courseId, chapterId, sectionId, type, completed = true) {
  if (!learningProgress[courseId]) {
    learningProgress[courseId] = {};
  }
  if (!learningProgress[courseId][chapterId]) {
    learningProgress[courseId][chapterId] = { sections: {}, questions: {} };
  }
  
  if (type === 'section') {
    learningProgress[courseId][chapterId].sections[sectionId] = completed;
  } else if (type === 'question') {
    if (!learningProgress[courseId][chapterId].questions[sectionId]) {
      learningProgress[courseId][chapterId].questions[sectionId] = { correct: 0, total: 0 };
    }
    if (completed) {
      learningProgress[courseId][chapterId].questions[sectionId].correct++;
    }
    learningProgress[courseId][chapterId].questions[sectionId].total++;
  }
  
  saveLearningProgress();
  // 更新UI显示
  renderCourseCards();
  updateGlobalStats();
}

// 获取课程学习进度
function getCourseProgress(courseId) {
  const course = courses.find(c => c.id === courseId);
  if (!course || !learningProgress[courseId]) return 0;
  
  let totalSections = 0;
  let completedSections = 0;
  
  course.chapters.forEach(chapter => {
    totalSections += chapter.sections?.length || 0;
    const chapterProgress = learningProgress[courseId][chapter.id];
    if (chapterProgress) {
      completedSections += Object.values(chapterProgress.sections || {}).filter(Boolean).length;
    }
  });
  
  return totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
}

// 获取章节学习进度
function getChapterProgress(courseId, chapterId) {
  if (!learningProgress[courseId] || !learningProgress[courseId][chapterId]) return 0;
  
  const chapter = courses.find(c => c.id === courseId)?.chapters.find(ch => ch.id === chapterId);
  if (!chapter) return 0;
  
  const totalSections = chapter.sections?.length || 0;
  const completedSections = Object.values(learningProgress[courseId][chapterId].sections || {}).filter(Boolean).length;
  
  return totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
}

// 获取答题统计
function getQuizStats(courseId) {
  if (!learningProgress[courseId]) return { correct: 0, total: 0 };
  
  let correct = 0;
  let total = 0;
  
  Object.values(learningProgress[courseId]).forEach(chapter => {
    Object.values(chapter.questions || {}).forEach(section => {
      correct += section.correct || 0;
      total += section.total || 0;
    });
  });
  
  return { correct, total };
}

// 获取全局统计
function getGlobalStats() {
  let totalCorrect = 0;
  let totalQuestions = 0;
  let totalCompleted = 0;
  let totalSections = 0;
  
  courses.forEach(course => {
    const stats = getQuizStats(course.id);
    totalCorrect += stats.correct;
    totalQuestions += stats.total;
    
    course.chapters.forEach(chapter => {
      totalSections += chapter.sections?.length || 0;
      if (learningProgress[course.id]?.[chapter.id]) {
        totalCompleted += Object.values(learningProgress[course.id][chapter.id].sections || {}).filter(Boolean).length;
      }
    });
  });
  
  return {
    correct: totalCorrect,
    total: totalQuestions,
    completed: totalCompleted,
    totalSections: totalSections,
    accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    progress: totalSections > 0 ? Math.round((totalCompleted / totalSections) * 100) : 0
  };
}

// 更新全局统计显示
function updateGlobalStats() {
  const stats = getGlobalStats();
  document.getElementById('studyProgress').textContent = `${stats.progress}%`;
}

// 清除学习进度
function clearProgress() {
  learningProgress = {};
  saveLearningProgress();
  showToast('学习进度已清除', 'info');
  renderCourseCards();
  updateGlobalStats();
}

// 用户注册
async function registerUser(username, password) {
  if (!useRemoteAPI) {
    const users = getLocalUsers();
    if (users[username]) {
      return { success: false, message: '用户名已存在' };
    }
    users[username] = { password, id: Date.now(), createdAt: new Date().toISOString() };
    saveLocalUsers(users);
    return { success: true, message: '注册成功' };
  }
  
  const result = await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  if (result.success) {
    authToken = result.token;
    currentUser = result.user;
    localStorage.setItem('authToken', authToken);
    learningProgress = await loadLearningProgress();
  }
  
  return result;
}

// 用户登录
async function loginUser(username, password) {
  if (!useRemoteAPI) {
    const users = getLocalUsers();
    const user = users[username];
    if (!user) {
      return { success: false, message: '用户名或密码错误' };
    }
    if (user.password !== password) {
      return { success: false, message: '用户名或密码错误' };
    }
    const token = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    authToken = token;
    currentUser = { id: user.id, username, createdAt: user.createdAt };
    localStorage.setItem('authToken', token);
    learningProgress = await loadLearningProgress();
    return { success: true, message: '登录成功', token, user: currentUser };
  }
  
  const result = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  if (result.success) {
    authToken = result.token;
    currentUser = result.user;
    localStorage.setItem('authToken', authToken);
    learningProgress = await loadLearningProgress();
  }
  
  return result;
}

// 用户注销
function logoutUser() {
  currentUser = null;
  authToken = null;
  learningProgress = {};
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUserId');
  showToast('已退出登录', 'info');
  renderCourseCards();
  updateGlobalStats();
  updateUserMenu();
}

// 检查是否有保存的token
async function checkRememberedUser() {
  const savedToken = localStorage.getItem('authToken');
  if (savedToken) {
    authToken = savedToken;
    const result = await apiRequest('/user', {
      method: 'GET'
    });
    
    if (result.success) {
      currentUser = result.user;
      learningProgress = await loadLearningProgress();
    } else {
      localStorage.removeItem('authToken');
      authToken = null;
    }
  }
}

// 更新用户菜单
function updateUserMenu() {
  const userMenu = document.getElementById('userMenu');
  if (currentUser) {
    userMenu.innerHTML = `
      <div class="user-info">
        <span class="user-name">${currentUser.username}</span>
      </div>
      <button class="logout-btn" onclick="logoutUser()">退出登录</button>
    `;
  } else {
    userMenu.innerHTML = `
      <button class="login-btn" onclick="showLoginModal()">登录</button>
      <button class="register-btn" onclick="showRegisterModal()">注册</button>
    `;
  }
}

// 显示登录弹窗
function showLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
}

// 显示注册弹窗
function showRegisterModal() {
  document.getElementById('registerModal').style.display = 'flex';
}

// 关闭弹窗
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// 执行注册
async function doRegister() {
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  
  if (!username || !password) {
    showToast('请填写用户名和密码', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showToast('两次输入的密码不一致', 'error');
    return;
  }
  
  const result = await registerUser(username, password);
  showToast(result.message, result.success ? 'success' : 'error');
  
  if (result.success) {
    closeModal('registerModal');
    updateUserMenu();
    renderCourseCards();
    updateGlobalStats();
  }
}

// 执行登录
async function doLogin() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!username || !password) {
    showToast('请填写用户名和密码', 'error');
    return;
  }
  
  const result = await loginUser(username, password);
  showToast(result.message, result.success ? 'success' : 'error');
  
  if (result.success) {
    closeModal('loginModal');
    updateUserMenu();
    renderCourseCards();
    updateGlobalStats();
  }
}

// 显示配置弹窗
function showConfigModal() {
  const savedUrl = localStorage.getItem('apiBaseUrl');
  document.getElementById('apiBaseUrl').value = savedUrl || '';
  document.getElementById('configModal').style.display = 'flex';
}

// 保存配置
function saveConfig() {
  const url = document.getElementById('apiBaseUrl').value.trim();
  localStorage.setItem('apiBaseUrl', url);
  
  if (url) {
    API_BASE = `${url}/api`;
    useRemoteAPI = true;
    showToast('配置已保存，刷新页面生效', 'success');
  } else {
    API_BASE = '/api';
    useRemoteAPI = false;
    showToast('已恢复默认配置，刷新页面生效', 'info');
  }
  
  closeModal('configModal');
}

// 测试API连接
async function testAPI() {
  const url = document.getElementById('apiBaseUrl').value.trim();
  if (!url) {
    showToast('请先输入服务器地址', 'error');
    return;
  }
  
  const statusEl = document.getElementById('apiStatus');
  statusEl.textContent = '测试中...';
  statusEl.className = 'status-indicator testing';
  
  try {
    const response = await fetch(`${url}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test', password: 'test' }),
      timeout: 5000
    });
    
    if (response.ok) {
      statusEl.textContent = '连接成功 ✅';
      statusEl.className = 'status-indicator success';
      showToast('API连接成功！', 'success');
    } else {
      statusEl.textContent = '服务器正常但认证失败（预期行为）✅';
      statusEl.className = 'status-indicator success';
      showToast('服务器连接成功！', 'success');
    }
  } catch (e) {
    statusEl.textContent = '连接失败 ❌';
    statusEl.className = 'status-indicator error';
    showToast('无法连接到服务器，请检查地址是否正确', 'error');
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  const savedUrl = localStorage.getItem('apiBaseUrl');
  if (savedUrl) {
    API_BASE = `${savedUrl}/api`;
    useRemoteAPI = true;
  }
  
  loadNotesAndWrongQuestions();
  await checkRememberedUser();
  renderCourseCards();
  createBackToTopButton();
  updateUserMenu();
  updateGlobalStats();
  
  // 绑定回车搜索
  document.getElementById('heroSearch')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doSearch();
  });
  document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doSearch();
  });
  
  // 键盘快捷键
  document.addEventListener('keydown', handleKeyboardShortcuts);
});

// 创建返回顶部按钮
function createBackToTopButton() {
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  `;
  btn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.appendChild(btn);
  
  // 滚动时显示/隐藏按钮
  window.addEventListener('scroll', () => {
    const button = document.getElementById('backToTop');
    if (window.scrollY > 300) {
      button.style.opacity = '1';
      button.style.visibility = 'visible';
    } else {
      button.style.opacity = '0';
      button.style.visibility = 'hidden';
    }
  });
}

// 键盘快捷键
function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + K 聚焦搜索框
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('heroSearch') || document.getElementById('searchInput');
    searchInput?.focus();
  }
  
  // Esc 返回首页
  if (e.key === 'Escape') {
    const currentView = document.querySelector('[style*="display: block"]');
    if (currentView?.id !== 'homeView') {
      showHome();
    }
  }
}

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
  chapterList.innerHTML = currentCourse.chapters.map((ch, idx) => {
    const progress = getChapterProgress(courseId, ch.id);
    return `
      <div class="chapter-item" id="chapter-${idx}">
        <div class="chapter-title-bar" onclick="toggleChapter(${idx})">
          <h3>${ch.title}</h3>
          <span class="chapter-progress-badge">${progress}%</span>
          <svg class="chapter-toggle" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div class="chapter-sections">
          ${ch.sections.map((sec, sidx) => {
            const isCompleted = learningProgress[courseId]?.[ch.id]?.sections?.[sidx];
            return `
              <div class="section-item" onclick="showSection(${idx}, ${sidx})">
                <div class="section-status">${isCompleted ? '✓' : ''}</div>
                <h4>${sec.title}</h4>
                <div class="section-keypoints">
                  ${sec.keyPoints.map(kp => `<span class="keypoint-tag">${kp}</span>`).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
  
  window.scrollTo(0, 0);
}

// 展开/收起章节
function toggleChapter(idx) {
  const item = document.getElementById(`chapter-${idx}`);
  item.classList.toggle('expanded');
}

// 当前章节索引
let currentChIdx = 0;
// 当前节索引
let currentSecIdx = 0;

// 显示节内容
function showSection(chIdx, secIdx) {
  const chapter = currentCourse.chapters[chIdx];
  const section = chapter.sections[secIdx];
  currentChapter = chapter;
  currentChIdx = chIdx;
  currentSecIdx = secIdx;
  
  // 更新学习进度
  updateProgress(currentCourse.id, chapter.id, secIdx, 'section', true);
  
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
      <button class="func-btn" onclick="showExamPoints(${chIdx}, ${secIdx})" id="btn-exam">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7.5 18H4v-3.686a2.121 2.121 0 0 1 3-3L16.5 3.5z"></path>
        </svg>
        考点
      </button>
      <button class="func-btn" onclick="showChoiceQuestions(${chIdx}, ${secIdx})" id="btn-choice">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="m8 11 3 3 7-7"></path>
        </svg>
        单选题
      </button>
      <button class="func-btn" onclick="showMultiQuestions(${chIdx}, ${secIdx})" id="btn-multi">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        多选题
      </button>
      <button class="func-btn" onclick="showEssayQuestions(${chIdx}, ${secIdx})" id="btn-essay">
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
        <h3>📌 ${section.title} 考点</h3>
        <ul class="exam-points-list">
          ${chapter.examPoints?.filter((p, idx) => p.sectionIndex === undefined || p.sectionIndex === null || p.sectionIndex === secIdx).map((point, idx) => `<li><span class="point-num">${idx + 1}.</span>${point}</li>`).join('') || '<li>暂无考点信息</li>'}
        </ul>
      </div>
    </div>
    
    <!-- 单选题区域 -->
    <div id="choiceQuestionsArea" style="display: none;">
      <div class="section-detail questions-section">
        <h3>📝 单选题练习</h3>
        <div class="questions-container">
          ${chapter.choiceQuestions?.filter(q => q.sectionIndex === undefined || q.sectionIndex === null || q.sectionIndex === secIdx).map((q, idx) => `
            <div class="question-section">
              <div class="question-header">
                <span class="question-num">${idx + 1}.</span>
                <span class="question-text">${q.question}</span>
              </div>
              <div class="options-list">
                ${q.options.map((opt, optIdx) => `
                  <div class="option-item" onclick="checkAnswer(${idx}, ${optIdx}, this)">
                    <span class="option-label">${String.fromCharCode(65 + optIdx)}</span>
                    <span class="option-text">${opt}</span>
                    <span class="option-status"></span>
                  </div>
                `).join('')}
              </div>
              <div class="analysis" id="analysis-${idx}" style="display: none;">
                <strong>解析：</strong>${q.analysis || '暂无解析'}
              </div>
            </div>
          `).join('') || '<p>暂无练习题</p>'}
        </div>
      </div>
    </div>
    
    <!-- 多选题区域 -->
    <div id="multiQuestionsArea" style="display: none;">
      <div class="section-detail questions-section">
        <h3>📝 多选题练习</h3>
        <div class="questions-container">
          ${chapter.multiQuestions?.filter(q => q.sectionIndex === undefined || q.sectionIndex === null || q.sectionIndex === secIdx).map((q, idx) => `
            <div class="question-section">
              <div class="question-header">
                <span class="question-num">${idx + 1}.</span>
                <span class="question-text">${q.question}</span>
              </div>
              <div class="options-list">
                ${q.options.map((opt, optIdx) => `
                  <div class="multi-option" data-selected="false" onclick="toggleMultiAnswer(${idx}, ${optIdx}, this)">
                    <span class="option-label">${String.fromCharCode(65 + optIdx)}</span>
                    <span class="option-text">${opt}</span>
                    <span class="option-status"></span>
                  </div>
                `).join('')}
              </div>
              <button class="multi-submit-btn" onclick="checkMultiAnswer(${idx})">提交答案</button>
              <div class="analysis" id="multi-analysis-${idx}" style="display: none;">
                <strong>解析：</strong>${q.analysis || '暂无解析'}
              </div>
            </div>
          `).join('') || '<p>暂无练习题</p>'}
        </div>
      </div>
    </div>
    
    <!-- 大题区域 -->
    <div id="essayQuestionsArea" style="display: none;">
      <div class="section-detail questions-section">
        <h3>📝 简答题/论述题</h3>
        <div class="questions-container">
          ${chapter.essayQuestions?.filter(q => q.sectionIndex === undefined || q.sectionIndex === null || q.sectionIndex === secIdx).map((q, idx) => `
            <div class="essay-question">
              <div class="question-header">
                <span class="question-num">${idx + 1}.</span>
                <span class="question-text">${q.question}</span>
              </div>
              <button class="toggle-answer-btn" onclick="toggleEssayAnswer(${idx})">${q.type === 'discussion' ? '查看论述' : '查看答案'}</button>
              <div class="essay-answer" id="essay-answer-${idx}" style="display: none;">
                <strong>答案：</strong>
                <p>${q.answer}</p>
              </div>
            </div>
          `).join('') || '<p>暂无大题</p>'}
        </div>
      </div>
    </div>
  `;
}

// 返回课程页面
function backToCourse() {
  showCourse(currentCourse.id);
}

// 显示考点
function showExamPoints(chIdx, secIdx) {
  currentChIdx = chIdx;
  currentSecIdx = secIdx;
  showSection(chIdx, secIdx);
  document.getElementById('btn-exam').classList.add('active');
  document.getElementById('btn-choice').classList.remove('active');
  document.getElementById('btn-multi').classList.remove('active');
  document.getElementById('btn-essay').classList.remove('active');
  
  document.getElementById('contentArea').style.display = 'none';
  document.getElementById('examPointsArea').style.display = 'block';
  document.getElementById('choiceQuestionsArea').style.display = 'none';
  document.getElementById('multiQuestionsArea').style.display = 'none';
  document.getElementById('essayQuestionsArea').style.display = 'none';
}

// 显示单选题
function showChoiceQuestions(chIdx, secIdx) {
  currentChIdx = chIdx;
  currentSecIdx = secIdx;
  showSection(chIdx, secIdx);
  document.getElementById('btn-exam').classList.remove('active');
  document.getElementById('btn-choice').classList.add('active');
  document.getElementById('btn-multi').classList.remove('active');
  document.getElementById('btn-essay').classList.remove('active');
  
  document.getElementById('contentArea').style.display = 'none';
  document.getElementById('examPointsArea').style.display = 'none';
  document.getElementById('choiceQuestionsArea').style.display = 'block';
  document.getElementById('multiQuestionsArea').style.display = 'none';
  document.getElementById('essayQuestionsArea').style.display = 'none';
}

// 显示多选题
function showMultiQuestions(chIdx, secIdx) {
  currentChIdx = chIdx;
  currentSecIdx = secIdx;
  showSection(chIdx, secIdx);
  document.getElementById('btn-exam').classList.remove('active');
  document.getElementById('btn-choice').classList.remove('active');
  document.getElementById('btn-multi').classList.add('active');
  document.getElementById('btn-essay').classList.remove('active');
  
  document.getElementById('contentArea').style.display = 'none';
  document.getElementById('examPointsArea').style.display = 'none';
  document.getElementById('choiceQuestionsArea').style.display = 'none';
  document.getElementById('multiQuestionsArea').style.display = 'block';
  document.getElementById('essayQuestionsArea').style.display = 'none';
}

// 显示大题
function showEssayQuestions(chIdx, secIdx) {
  currentChIdx = chIdx;
  currentSecIdx = secIdx;
  showSection(chIdx, secIdx);
  document.getElementById('btn-exam').classList.remove('active');
  document.getElementById('btn-choice').classList.remove('active');
  document.getElementById('btn-multi').classList.remove('active');
  document.getElementById('btn-essay').classList.add('active');
  
  document.getElementById('contentArea').style.display = 'none';
  document.getElementById('examPointsArea').style.display = 'none';
  document.getElementById('choiceQuestionsArea').style.display = 'none';
  document.getElementById('multiQuestionsArea').style.display = 'none';
  document.getElementById('essayQuestionsArea').style.display = 'block';
}

// 切换大题答案显示
function toggleEssayAnswer(idx) {
  const answer = document.getElementById(`essay-answer-${idx}`);
  const btn = document.querySelector(`#essayQuestionsArea .essay-question:nth-child(${idx + 1}) .toggle-answer-btn`);
  if (answer.style.display === 'none') {
    answer.style.display = 'block';
    btn.textContent = '收起答案';
  } else {
    answer.style.display = 'none';
    btn.textContent = '查看答案';
  }
}

// 切换多选题选项选中状态
function toggleMultiAnswer(qIdx, optIdx, element) {
  const isSelected = element.getAttribute('data-selected') === 'true';
  if (isSelected) {
    element.setAttribute('data-selected', 'false');
    element.classList.remove('selected');
  } else {
    element.setAttribute('data-selected', 'true');
    element.classList.add('selected');
  }
}

// 检查多选题答案
function checkMultiAnswer(qIdx) {
  const chapter = currentCourse.chapters[currentChIdx];
  const question = chapter.multiQuestions?.find((q, idx) => {
    const idxInSection = chapter.multiQuestions?.filter(q2 => q2.sectionIndex === undefined || q2.sectionIndex === null || q2.sectionIndex === currentSecIdx).indexOf(q);
    return idxInSection === qIdx;
  });
  
  if (!question) return;
  
  // 获取用户选择的选项
  const selectedOptions = [];
  document.querySelectorAll(`#multiQuestionsArea .question-section:nth-child(${qIdx + 1}) .multi-option`).forEach((item, idx) => {
    if (item.getAttribute('data-selected') === 'true') {
      selectedOptions.push(idx);
    }
  });
  
  // 清除之前的样式
  document.querySelectorAll(`#multiQuestionsArea .question-section:nth-child(${qIdx + 1}) .multi-option`).forEach(item => {
    item.classList.remove('correct', 'wrong', 'selected');
    item.querySelector('.option-status').innerHTML = '';
  });
  
  // 检查答案是否正确
  const correctAnswers = question.answer;
  const isCorrect = selectedOptions.length === correctAnswers.length && 
                    selectedOptions.every(idx => correctAnswers.includes(idx));
  
  if (isCorrect) {
    quizStats.correct++;
    showToast('回答正确！', 'success');
    // 更新学习进度
    updateProgress(currentCourse.id, currentChapter.id, currentSecIdx, 'question', true);
    // 显示正确选项
    correctAnswers.forEach(idx => {
      const option = document.querySelectorAll(`#multiQuestionsArea .question-section:nth-child(${qIdx + 1}) .multi-option`)[idx];
      option.classList.add('correct');
      option.querySelector('.option-status').innerHTML = '✓';
    });
  } else {
    quizStats.wrong++;
    showToast('回答错误，已显示正确答案', 'error');
    // 更新学习进度
    updateProgress(currentCourse.id, currentChapter.id, currentSecIdx, 'question', false);
    // 显示用户错误选择的选项
    selectedOptions.forEach(idx => {
      if (!correctAnswers.includes(idx)) {
        const option = document.querySelectorAll(`#multiQuestionsArea .question-section:nth-child(${qIdx + 1}) .multi-option`)[idx];
        option.classList.add('wrong');
        option.querySelector('.option-status').innerHTML = '✗';
      }
    });
    // 显示正确答案
    correctAnswers.forEach(idx => {
      const option = document.querySelectorAll(`#multiQuestionsArea .question-section:nth-child(${qIdx + 1}) .multi-option`)[idx];
      option.classList.add('correct');
      option.querySelector('.option-status').innerHTML = '✓';
    });
    
    // 收藏错题
    addWrongQuestion(currentCourse.id, currentChapter.id, currentSecIdx, question, selectedOptions);
  }
  
  // 显示解析
  document.getElementById(`multi-analysis-${qIdx}`).style.display = 'block';
  
  // 禁用提交按钮
  document.querySelector(`#multiQuestionsArea .question-section:nth-child(${qIdx + 1}) .multi-submit-btn`).disabled = true;
  
  // 更新答题统计
  updateQuizStats();
}

// 检查选择题答案
function checkAnswer(qIdx, optIdx, element) {
  const chapter = currentCourse.chapters[currentChIdx];
  
  // 找到当前小节对应的题目索引
  const sectionQuestions = chapter.choiceQuestions?.filter(q => q.sectionIndex === undefined || q.sectionIndex === null || q.sectionIndex === currentSecIdx) || [];
  const question = sectionQuestions[qIdx];
  
  if (!question) return;
  
  // 清除之前的样式
  document.querySelectorAll(`#choiceQuestionsArea .question-section:nth-child(${qIdx + 1}) .option-item`).forEach(item => {
    item.classList.remove('correct', 'wrong', 'selected');
    item.querySelector('.option-status').innerHTML = '';
  });
  
  // 添加当前选择样式
  element.classList.add('selected');
  
  // 判断是多选题还是单选题
  if (Array.isArray(question.answer)) {
    // 多选题逻辑
    const isCorrect = question.answer.includes(optIdx);
    
    if (isCorrect) {
      element.classList.add('correct');
      element.querySelector('.option-status').innerHTML = '✓';
      
      // 检查是否所有正确选项都已选中
      const allSelected = question.answer.every(idx => 
        document.querySelectorAll(`#choiceQuestionsArea .question-section:nth-child(${qIdx + 1}) .option-item`)[idx].classList.contains('selected')
      );
      
      if (allSelected) {
        quizStats.correct++;
        showToast('回答正确！', 'success');
        // 更新学习进度
        updateProgress(currentCourse.id, currentChapter.id, currentSecIdx, 'question', true);
        
        // 显示解析
        document.getElementById(`analysis-${qIdx}`).style.display = 'block';
      }
    } else {
      element.classList.add('wrong');
      element.querySelector('.option-status').innerHTML = '✗';
      quizStats.wrong++;
      // 更新学习进度
      updateProgress(currentCourse.id, currentChapter.id, currentSecIdx, 'question', false);
      
      // 显示所有正确答案
      question.answer.forEach(idx => {
        const correctOption = document.querySelectorAll(`#choiceQuestionsArea .question-section:nth-child(${qIdx + 1}) .option-item`)[idx];
        correctOption.classList.add('correct');
        correctOption.querySelector('.option-status').innerHTML = '✓';
      });
      
      showToast('回答错误，已显示正确答案', 'error');

      // 收藏错题
      addWrongQuestion(currentCourse.id, currentChapter.id, currentSecIdx, question, optIdx);

      // 显示解析
      document.getElementById(`analysis-${qIdx}`).style.display = 'block';
    }
  } else {
    // 单选题逻辑
    if (optIdx === question.answer) {
      element.classList.add('correct');
      element.querySelector('.option-status').innerHTML = '✓';
      quizStats.correct++;
      showToast('回答正确！', 'success');
      // 更新学习进度
      updateProgress(currentCourse.id, currentChapter.id, currentSecIdx, 'question', true);
    } else {
      element.classList.add('wrong');
      element.querySelector('.option-status').innerHTML = '✗';
      quizStats.wrong++;
      // 更新学习进度
      updateProgress(currentCourse.id, currentChapter.id, currentSecIdx, 'question', false);
      // 显示正确答案
      const correctOption = document.querySelectorAll(`#choiceQuestionsArea .question-section:nth-child(${qIdx + 1}) .option-item`)[question.answer];
      correctOption.classList.add('correct');
      correctOption.querySelector('.option-status').innerHTML = '✓';
      showToast('回答错误，已显示正确答案', 'error');

      // 收藏错题
      addWrongQuestion(currentCourse.id, currentChapter.id, currentSecIdx, question, optIdx);
    }
    
    // 显示解析
    document.getElementById(`analysis-${qIdx}`).style.display = 'block';
  }
  
  // 更新答题统计
  updateQuizStats();
}

// 更新答题统计显示
function updateQuizStats() {
  const stats = document.getElementById('quizStats');
  if (stats) {
    stats.innerHTML = `
      <span>正确: ${quizStats.correct}</span>
      <span>错误: ${quizStats.wrong}</span>
    `;
  }
}

// ============ 笔记和错题收藏功能 ============

// 加载笔记和错题数据
function loadNotesAndWrongQuestions() {
  try {
    const savedNotes = localStorage.getItem('userNotes');
    userNotes = savedNotes ? JSON.parse(savedNotes) : {};
    const savedWrong = localStorage.getItem('wrongQuestions');
    wrongQuestions = savedWrong ? JSON.parse(savedWrong) : {};
  } catch (e) {
    userNotes = {};
    wrongQuestions = {};
  }
}

// 保存笔记和错题数据
function saveNotesAndWrongQuestions() {
  try {
    localStorage.setItem('userNotes', JSON.stringify(userNotes));
    localStorage.setItem('wrongQuestions', JSON.stringify(wrongQuestions));
  } catch (e) {
    console.error('保存笔记/错题失败:', e);
  }
}

// 获取当前节的笔记key
function getNoteKey() {
  if (!currentCourse || !currentChapter) return null;
  return `${currentCourse.id}_${currentChapter.id}_${currentSecIdx}`;
}

// 获取当前节的错题key
function getWrongKey() {
  if (!currentCourse || !currentChapter) return null;
  return `${currentCourse.id}_${currentChapter.id}_${currentSecIdx}`;
}

// 切换笔记面板
function toggleNotePanel() {
  const panel = document.getElementById('notePanel');
  if (!panel) return;
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    renderNotePanel();
  }
}

// 关闭笔记面板
function closeNotePanel() {
  const panel = document.getElementById('notePanel');
  if (panel) panel.classList.remove('open');
}

// 渲染笔记面板内容
function renderNotePanel() {
  // 切换到笔记标签
  switchNoteTab('notes');
}

// 切换笔记面板标签
function switchNoteTab(tab) {
  const tabBtns = document.querySelectorAll('.note-tab-btn');
  tabBtns.forEach(btn => btn.classList.remove('active'));
  const targetBtn = document.querySelector(`.note-tab-btn[data-tab="${tab}"]`);
  if (targetBtn) targetBtn.classList.add('active');

  const notesContent = document.getElementById('noteTabContent');
  const wrongContent = document.getElementById('wrongTabContent');

  if (tab === 'notes') {
    notesContent.style.display = 'block';
    wrongContent.style.display = 'none';
    renderNotesList();
  } else {
    notesContent.style.display = 'none';
    wrongContent.style.display = 'block';
    renderWrongQuestionsList();
  }
}

// 渲染笔记列表
function renderNotesList() {
  const container = document.getElementById('notesList');
  const noteKey = getNoteKey();
  const currentNote = noteKey ? (userNotes[noteKey] || '') : '';

  container.innerHTML = `
    <div class="note-editor">
      <textarea id="noteTextarea" placeholder="在这里写笔记...">${escapeHtml(currentNote)}</textarea>
      <button class="note-save-btn" onclick="saveCurrentNote()">保存笔记</button>
    </div>
    <div class="note-history">
      <h4>历史笔记</h4>
      ${Object.keys(userNotes).filter(k => userNotes[k].trim()).map(key => {
        const parts = key.split('_');
        const courseId = parts[0];
        const course = courses.find(c => c.id === courseId);
        const courseName = course ? course.shortName : courseId;
        return `
          <div class="note-history-item" onclick="navigateToNote('${key}')">
            <span class="note-course-tag" style="background:${course ? course.color : '#666'}">${courseName}</span>
            <span class="note-preview">${escapeHtml(userNotes[key].substring(0, 50))}${userNotes[key].length > 50 ? '...' : ''}</span>
          </div>
        `;
      }).join('') || '<p class="empty-hint">还没有笔记</p>'}
    </div>
  `;
}

// 保存当前笔记
function saveCurrentNote() {
  const textarea = document.getElementById('noteTextarea');
  if (!textarea) return;
  const noteKey = getNoteKey();
  if (!noteKey) {
    showToast('请先选择一个章节', 'error');
    return;
  }
  userNotes[noteKey] = textarea.value;
  saveNotesAndWrongQuestions();
  showToast('笔记已保存', 'success');
  renderNotesList();
}

// 导航到笔记对应的章节
function navigateToNote(key) {
  const parts = key.split('_');
  const courseId = parts[0];
  const chapterId = parts[1];
  const secIdx = parseInt(parts[2]);

  const course = courses.find(c => c.id === courseId);
  if (!course) return;

  showCourse(courseId);
  setTimeout(() => {
    const chIdx = course.chapters.findIndex(ch => ch.id === chapterId);
    if (chIdx >= 0) {
      showSection(chIdx, secIdx);
      closeNotePanel();
    }
  }, 200);
}

// 收藏当前错题（在答题错误时调用）
function addWrongQuestion(courseId, chapterId, secIdx, question, userAnswer) {
  const key = `${courseId}_${chapterId}_${secIdx}`;
  if (!wrongQuestions[key]) wrongQuestions[key] = [];

  // 检查是否已收藏
  const exists = wrongQuestions[key].some(q => q.question === question.question);
  if (exists) return;

  wrongQuestions[key].push({
    question: question.question,
    options: question.options,
    answer: question.answer,
    analysis: question.analysis || '',
    userAnswer: userAnswer,
    addedAt: new Date().toLocaleString()
  });

  saveNotesAndWrongQuestions();
}

// 渲染错题列表
function renderWrongQuestionsList() {
  const container = document.getElementById('wrongQuestionsList');
  const allWrong = [];

  Object.keys(wrongQuestions).forEach(key => {
    const parts = key.split('_');
    const courseId = parts[0];
    const chapterId = parts[1];
    const course = courses.find(c => c.id === courseId);
    const courseName = course ? course.shortName : courseId;

    wrongQuestions[key].forEach((q, idx) => {
      allWrong.push({ key, idx, courseName, courseColor: course ? course.color : '#666', ...q });
    });
  });

  if (allWrong.length === 0) {
    container.innerHTML = '<p class="empty-hint">还没有收藏错题</p>';
    return;
  }

  container.innerHTML = allWrong.map((q, i) => `
    <div class="wrong-question-item">
      <div class="wrong-q-header">
        <span class="wrong-course-tag" style="background:${q.courseColor}">${q.courseName}</span>
        <button class="wrong-remove-btn" onclick="removeWrongQuestion('${q.key}', ${q.idx})">删除</button>
      </div>
      <div class="wrong-q-text">${escapeHtml(q.question)}</div>
      <div class="wrong-q-answer">正确答案: ${Array.isArray(q.answer) ? q.answer.map(a => String.fromCharCode(65 + a)).join(', ') : String.fromCharCode(65 + q.answer)}</div>
      ${q.analysis ? `<div class="wrong-q-analysis">${escapeHtml(q.analysis)}</div>` : ''}
    </div>
  `).join('');
}

// 删除错题
function removeWrongQuestion(key, idx) {
  if (wrongQuestions[key]) {
    wrongQuestions[key].splice(idx, 1);
    if (wrongQuestions[key].length === 0) delete wrongQuestions[key];
    saveNotesAndWrongQuestions();
    renderWrongQuestionsList();
    showToast('已删除', 'success');
  }
}

// 搜索功能
function doSearch() {
  const query = document.getElementById('heroSearch')?.value || document.getElementById('searchInput')?.value || '';
  if (!query.trim()) return;
  
  hideAllViews();
  
  // 创建搜索结果视图
  let searchView = document.getElementById('searchView');
  if (!searchView) {
    searchView = document.createElement('div');
    searchView.id = 'searchView';
    document.body.appendChild(searchView);
  }
  
  searchView.style.display = 'block';
  updateNavActive(2);
  
  // 搜索逻辑
  const results = [];
  
  courses.forEach(course => {
    course.chapters.forEach(chapter => {
      // 搜索章节标题
      if (chapter.title.includes(query)) {
        results.push({
          type: 'chapter',
          course: course,
          chapter: chapter,
          match: chapter.title
        });
      }
      
      // 搜索节标题
      chapter.sections.forEach(section => {
        if (section.title.includes(query)) {
          results.push({
            type: 'section',
            course: course,
            chapter: chapter,
            section: section,
            match: section.title
          });
        }
        
        // 搜索知识点
        section.keyPoints.forEach(kp => {
          if (kp.includes(query)) {
            results.push({
              type: 'keypoint',
              course: course,
              chapter: chapter,
              section: section,
              match: kp
            });
          }
        });
      });
      
      // 搜索考点
      chapter.examPoints?.forEach(point => {
        if (point.includes(query)) {
          results.push({
            type: 'exampoint',
            course: course,
            chapter: chapter,
            match: point
          });
        }
      });
      
      // 搜索题目
      chapter.choiceQuestions?.forEach(q => {
        if (q.question.includes(query)) {
          results.push({
            type: 'question',
            course: course,
            chapter: chapter,
            match: q.question.substring(0, 50) + '...'
          });
        }
      });
      
      chapter.multiQuestions?.forEach(q => {
        if (q.question.includes(query)) {
          results.push({
            type: 'question',
            course: course,
            chapter: chapter,
            match: q.question.substring(0, 50) + '...'
          });
        }
      });
      
      chapter.essayQuestions?.forEach(q => {
        if (q.question.includes(query)) {
          results.push({
            type: 'essay',
            course: course,
            chapter: chapter,
            match: q.question.substring(0, 50) + '...'
          });
        }
      });
    });
  });
  
  // 渲染搜索结果
  searchView.innerHTML = `
    <div class="search-header">
      <div class="container">
        <h2>资料检索结果</h2>
        <div class="search-box-inline">
          <input type="text" id="searchInput" placeholder="搜索课程章节、知识点..." value="${query}">
          <button onclick="doSearch()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>
        <p>找到 ${results.length} 条结果</p>
      </div>
    </div>
    <div class="container search-results">
      ${results.length > 0 ? results.map((result, idx) => `
        <div class="search-item" onclick="handleSearchResult('${result.course.id}', ${result.chapter.id}, ${result.section ? result.chapter.sections.indexOf(result.section) : 0})">
          <div class="result-type">${result.type === 'chapter' ? '章节' : result.type === 'section' ? '节' : result.type === 'keypoint' ? '知识点' : result.type === 'exampoint' ? '考点' : result.type === 'essay' ? '大题' : '练习题'}</div>
          <div class="result-title">${highlightText(result.match, query)}</div>
          <div class="result-path">${result.course.shortName} > ${result.chapter.title}${result.section ? ' > ' + result.section.title : ''}</div>
        </div>
      `).join('') : '<div class="no-results">未找到相关结果</div>'}
    </div>
  `;
}

// 处理搜索结果点击
function handleSearchResult(courseId, chapterId, sectionIdx) {
  showCourse(courseId);
  setTimeout(() => {
    const chapter = courses.find(c => c.id === courseId)?.chapters.find(ch => ch.id === chapterId);
    if (chapter) {
      const chIdx = courses.find(c => c.id === courseId).chapters.indexOf(chapter);
      showSection(chIdx, sectionIdx);
    }
  }, 100);
}

// 显示检索页面
function showSearch() {
  hideAllViews();
  
  let searchView = document.getElementById('searchView');
  if (!searchView) {
    searchView = document.createElement('div');
    searchView.id = 'searchView';
    document.body.appendChild(searchView);
  }
  
  searchView.style.display = 'block';
  updateNavActive(2);
  
  searchView.innerHTML = `
    <div class="search-header">
      <div class="container">
        <h2>资料检索</h2>
        <div class="search-box-inline">
          <input type="text" id="searchInput" placeholder="搜索课程章节、知识点...">
          <button onclick="doSearch()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>
        <p>输入关键词检索课程内容</p>
      </div>
    </div>
    <div class="container search-results">
      <div class="search-tips">
        <h3>搜索提示</h3>
        <ul>
          <li>支持搜索课程名称、章节标题、知识点</li>
          <li>支持搜索题目内容</li>
          <li>按 Ctrl+K 快速聚焦搜索框</li>
        </ul>
      </div>
    </div>
  `;
}

// 显示所有章节
function showAllChapters() {
  hideAllViews();
  
  let allChaptersView = document.getElementById('allChaptersView');
  if (!allChaptersView) {
    allChaptersView = document.createElement('div');
    allChaptersView.id = 'allChaptersView';
    document.body.appendChild(allChaptersView);
  }
  
  allChaptersView.style.display = 'block';
  updateNavActive(1);
  
  allChaptersView.innerHTML = `
    <div class="search-header">
      <div class="container">
        <h2>章节总览</h2>
        <div class="breadcrumb">
          <a href="#" onclick="showHome(); return false;">首页</a>
          <span>/</span>
          <span>章节总览</span>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="all-chapters-grid">
        ${courses.map(course => `
          <div class="course-section" style="--course-color: ${course.color}">
            <h3 class="course-title">${course.shortName}</h3>
            <div class="chapters-list">
              ${course.chapters.map(chapter => `
                <div class="chapter-link" onclick="showCourse('${course.id}'); setTimeout(() => { const idx = ${course.chapters.indexOf(chapter)}; document.getElementById('chapter-' + idx)?.classList.add('expanded'); }, 100);">
                  ${chapter.title}
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 显示Toast提示
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 12px 24px;
    background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#fc8181' : '#4299e1'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 添加动画样式
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100px); opacity: 0; }
  }
`;
document.head.appendChild(styleSheet);

// 渲染课程卡片
function renderCourseCards() {
  const container = document.getElementById('courseCards');
  container.innerHTML = courses.map(course => {
    const progress = getCourseProgress(course.id);
    const stats = getQuizStats(course.id);
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return `
    <div class="course-card" style="--course-color: ${course.color}" onclick="showCourse('${course.id}')">
      <div class="course-icon" style="background: ${course.color}">${course.shortName}</div>
      <div class="course-short" style="color: ${course.color}">${course.shortName}</div>
      <div class="course-name">${course.name}</div>
      <div class="course-chapters">${course.chapters.length} 章 ${course.chapters.reduce((sum, ch) => sum + ch.sections.length, 0)} 节</div>
      <div class="course-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%; background: ${course.color}"></div>
        </div>
        <div class="progress-info">
          <span>进度: ${progress}%</span>
          <span>答题: ${stats.correct}/${stats.total} (${accuracy}%)</span>
        </div>
      </div>
    </div>
  `;
  }).join('');
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
  
  const searchView = document.getElementById('searchView');
  if (searchView) searchView.style.display = 'none';
  
  const allChaptersView = document.getElementById('allChaptersView');
  if (allChaptersView) allChaptersView.style.display = 'none';
}

// 更新导航激活状态
function updateNavActive(index) {
  document.querySelectorAll('.nav a').forEach((a, i) => {
    a.classList.toggle('active', i === index);
  });
}