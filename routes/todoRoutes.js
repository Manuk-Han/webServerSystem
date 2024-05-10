const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const config = require('../config/db_config');

const connection = mysql.createConnection(config.database);

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// To-Do 항목 생성
router.post('/create', (req, res) => {
    const { title, content } = req.body;

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
router.get('/read', (req, res) => {
    connection.query('SELECT * FROM todo', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// To-Do 항목 업데이트
router.put('/update/:id', (req, res) => {
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
router.delete('/delete/:id', (req, res) => {
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

module.exports = router;
function getTodos(connection) {
    return (req, res) => {
        connection.query('SELECT * FROM todo', (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        });
    };
}

// getTodos 함수 내보내기
module.exports = {
    getTodos: getTodos
}