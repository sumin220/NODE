var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0530',
    database: 'webdb2024'
});

connection.connect();

connection.query('SELECT *from topic', (err, results, fields) => {
    if (err) {
        throw err;
    }
})
connection.end();