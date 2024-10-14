const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0530',
    database: 'webdb2024'
})
connection.connect();

app.get('/', (req, res) => {

    connection.query('SELECT * FROM topic', (error, results) => {
        var context = {
            list: results[0],
            title: 'Welcome'
        }
        console.log(context);
        res.render('home', context, (err, html) =>
            res.end(html));
    });
    connection.end();
})

app.get('/favicon.ico', (req, res) => {
    res.writeHead(404);
})

app.listen(3000);