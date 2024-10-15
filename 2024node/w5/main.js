const express = require('express');
const req = require("express/lib/request");
const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + 'views');

app.get('/page/:pageId', (req, res) => {
    topic.page(req, res);
})

app.get('/create', (req, res) => {
    topic.create(req, res);
})

app.listen(3000);

