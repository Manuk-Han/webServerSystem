const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const config = require('./config/db_config');

const app = express();
const port = process.env.PORT || 3000;

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

// To-Do 항목 생성
app.post('/create', (req, res) => {
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
app.get('/read', (req, res) => {
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
