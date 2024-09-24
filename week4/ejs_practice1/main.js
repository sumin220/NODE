const express = require('express');
const app = express();
//ejs엔진을 사용하기 위한 코드
app.set('views',__dirname+'/views');
app.set('view engine', 'ejs');
//
app.get('/', (req, res) => {
    var context = {title:'Welcome-1'};
res.render('home', context, (err, html)=> {
    res.end(html) })

})
app.get('/:id', (req, res) => {
    var id = req.params.id;

var context = {title:id};

res.render('home', context, (err, html)=> {
    res.end(html) })
});

app.get('/favicon', (req, res) => res.writeHead(404));
app.listen(3000, () => console.log('Example app listening on port 3000'))