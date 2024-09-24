var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'nodejs',
    password : '0530',
    database : 'webdb2024'
});

connection.connect();

connection.query('SELECT * from topic', (error, results, fields) => {
    if(error) {
        console.log(error);
    }
    console.log(results);
});
connection.end();
