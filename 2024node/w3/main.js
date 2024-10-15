const express = require('express');
const app = express();
var db = require('/db')

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');



app.get('/', (req, res) => {

    db.query('SELECT * FROM topic', (error, results) => {
        var context = {
            list: results[0],
            title: 'Welcome'
        }
        console.log(context);
        res.render('home', context, (err, html) =>
            res.end(html));
    });
    db.end();
})

app.get('/favicon.ico', (req, res) => {
    res.writeHead(404);
})

app.listen(3000);