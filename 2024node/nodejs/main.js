const { name } = require('ejs');
const express = require('express');
const app = express();

// ejs엔진을 사용하기 위한 코드
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// mysql 추가
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'nodejs',
    password: '0530',
    database: 'webdb2024'
});
connection.connect();

app.get('/', (req, res) => {
    connection.query('SELECT * FROM topic', (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).send('Database query error');
            return;
        }

        var context = {
            list: results,
            title: 'Welcome'
        };

        console.log(context);
        res.render('home', context); // res.end() 제거
    });
});

app.get('/favicon', (req, res) => res.writeHead(404));

app.listen(3000, () => console.log('Example app listening on port 3000'));