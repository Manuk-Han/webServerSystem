const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const config = require('./config/db_config');
const todoRoutes = require('./routes/todoRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use('/', todoRoutes);

const connection = mysql.createConnection(config.database);

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Body parser 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/signup', (req, res) => {
  const { id, password } = req.body;
  // 비밀번호 해싱
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      res.status(500).json({ error: 'Password hashing failed' });
      return;
    }
    // 사용자 정보 저장
    const sql = 'INSERT INTO users (id, password) VALUES (?, ?)';
    connection.query(sql, [id, hash], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(200).json({ message: 'User signed up successfully' });
    });
  });
});

// 로그인 API
app.post('/signin', (req, res) => {
  const { id, password } = req.body;
  // 사용자 확인
  const sql = 'SELECT * FROM users WHERE id = ?';
  connection.query(sql, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    // 비밀번호 비교
    bcrypt.compare(password, results[0].password, (err, result) => {
      if (err || !result) {
        res.status(401).json({ error: 'Authentication failed' });
        return;
      }
      // JWT 토큰 생성
      const accessToken = jwt.sign({ id }, 'accessSecret', { expiresIn: '5m' });
      const refreshToken = jwt.sign({ id }, 'refreshSecret', { expiresIn: '14d' });
      res.status(200).json({ accessToken, refreshToken });
    });
  });
});

// access token 갱신 API
app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  // refresh token 검증
  jwt.verify(refreshToken, 'refreshSecret', (err, decoded) => {
    if (err) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }
    // 새로운 access token 생성
    const accessToken = jwt.sign({ id: decoded.id }, 'accessSecret', { expiresIn: '5m' });
    res.status(200).json({ accessToken });
  });
});

// 인증 미들웨어
const auth = (req, res, next) => {
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    res.status(401).json({ error: 'Access token is required' });
    return;
  }
  // access token 검증
  jwt.verify(accessToken, 'accessSecret', (err, decoded) => {
    if (err) {
      res.status(401).json({ error: 'Invalid access token' });
      return;
    }
    req.userId = decoded.id;
    next();
  });
};

// To-Do 항목 생성
app.post('/create', auth, (req, res) => {
  const { title, content } = req.body;
  console.log(req.body.title);

  const sql = 'INSERT INTO todo (title, content, completed) VALUES (?, ?, false)';
  connection.query(sql, [title, content], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: result.insertId, title, content});
  });
});

// To-Do 항목 읽기
app.get('/read', auth, (req, res) => {
  connection.query('SELECT * FROM todo', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// To-Do 항목 업데이트
app.put('/update/:id', (req, res) => {
  const { title, content, completed } = req.body;
  const id = req.params.id;

  const sql = 'UPDATE todo SET title = ?, content = ?, completed = ? WHERE id = ?';
  connection.query(sql, [title, content, completed, id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, title, content, completed });
  });
});

// To-Do 항목 삭제
app.delete('/delete/:id', (req, res) => {
  const id = req.params.id;

  const sql = 'DELETE FROM todo WHERE id = ?';
  connection.query(sql, [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.sendStatus(204);
  });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
