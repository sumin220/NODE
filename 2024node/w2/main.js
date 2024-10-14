const express = require('express');
const {engine} = require("express/lib/application");
const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/' , (req, res) => {
    var context = {
        title: 'Welcome'
    };
    res.render('home', context, (err,html) => {
        res.end(html)
    })
})
app.get('/:id', (req, res) => {})
