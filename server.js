const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'learning_platform_secret_key_2024';

const db = new Low(new JSONFile('./database.json'), {
  users: {},
  learningProgress: {}
});

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未授权' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'token无效' });
    }
    req.user = user;
    next();
  });
}

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '请填写用户名和密码' });
  }

  await db.read();

  if (db.data.users[username]) {
    return res.status(400).json({ success: false, message: '用户名已存在' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();

    db.data.users[username] = {
      id: userId,
      username: username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    await db.write();

    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({
      success: true,
      message: '注册成功',
      token,
      user: { id: userId, username }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '注册失败' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '请填写用户名和密码' });
  }

  await db.read();

  const user = db.data.users[username];
  if (!user) {
    return res.status(400).json({ success: false, message: '用户名不存在' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ success: false, message: '密码错误' });
  }

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
  res.status(200).json({
    success: true,
    message: '登录成功',
    token,
    user: { id: user.id, username: user.username }
  });
});

app.get('/api/user', authenticateToken, async (req, res) => {
  await db.read();

  const user = Object.values(db.data.users).find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  res.status(200).json({ success: true, user: { id: user.id, username: user.username, createdAt: user.createdAt } });
});

app.post('/api/save-progress', authenticateToken, async (req, res) => {
  const { courseId, chapterId, progressData } = req.body;

  if (!courseId || !chapterId || !progressData) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }

  await db.read();

  if (!db.data.learningProgress[req.user.userId]) {
    db.data.learningProgress[req.user.userId] = {};
  }

  if (!db.data.learningProgress[req.user.userId][courseId]) {
    db.data.learningProgress[req.user.userId][courseId] = {};
  }

  db.data.learningProgress[req.user.userId][courseId][chapterId] = {
    ...progressData,
    updatedAt: new Date().toISOString()
  };

  await db.write();

  res.status(200).json({ success: true, message: '进度保存成功' });
});

app.get('/api/get-progress', authenticateToken, async (req, res) => {
  const { courseId } = req.query;

  if (!courseId) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }

  await db.read();

  const userProgress = db.data.learningProgress[req.user.userId] || {};
  const courseProgress = userProgress[courseId] || {};

  res.status(200).json({ success: true, progress: courseProgress });
});

app.get('/api/get-all-progress', authenticateToken, async (req, res) => {
  await db.read();

  const allProgress = db.data.learningProgress[req.user.userId] || {};

  res.status(200).json({ success: true, progress: allProgress });
});

app.use(express.static('.'));

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
