const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'nodejs',
    password: '0530',
    database: 'webdb2024'
});

db.connect();

module.exports = db;