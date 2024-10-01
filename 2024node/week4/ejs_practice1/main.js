const { name } = require('ejs');
const express = require('express');
const app = express();
//ejs엔진을 사용하기 위한 코드
app.set('views',__dirname+'/views');
app.set('view engine', 'ejs');
// mysql 추가
var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'nodejs',
    password : '0530',
    database : 'webdb2024'
});
connection.connect();


app.get('/', (req, res) => {
    connection.query('SELECT * FROM topic', (error, results)=>{
        var context = {list:results,
            title:'Welcome'};
            console.log(context)
            res.render('home', context, (err, html)=>
            {res.end(html)})
    });
    connection.end();
});

app.get('/home/test', (req, res) => {
    var context = {
        title:'Welcome!!!!',
        name:'손수민',
        number:'202239895'
    };

    res.render('test', context, (err, html)=> {
        res.end(html) })    
});

app.get('/:id', (req, res) => {
    var id = req.params.id;

var context = {title:id,
    name:'손수민',
    number:'202239895'
};

res.render('home', context, (err, html)=> {
    res.end(html) })
});

app.get('/favicon', (req, res) => res.writeHead(404));
app.listen(3000, () => console.log('Example app listening on port 3000'))