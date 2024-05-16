const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const config = require("../config/db_config");

const connection = mysql.createConnection(config.database);

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

function hashPassword(password) {
    return bcrypt.hashSync(password, saltRounds);
}

function comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
}

function generateToken(payload) {
    return jwt.sign(payload, 'secretToken');
}

function verifyToken(token) {
    return jwt.verify(token, 'secretToken');
}

module.exports = {
    connection,
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken
};
