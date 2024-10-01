const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const topic = require('./topic'); // topic.js

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// MySQL connection
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'nodejs',
    password : '0530',
    database : 'webdb2024'
});
connection.connect();

app.use(bodyParser.urlencoded({ extended: false }));

// Root page - List topics
app.get('/', (req, res) => {
    topic.home(req, res, connection);
});

// Page details (show)
app.get('/page/:pageId', (req, res) => {
    topic.page(req, res, connection);
});

// Create page
app.get('/create', (req, res) => {
    topic.create(req, res, connection);
});

// Process the create form
app.post('/create_process', (req, res) => {
    topic.create_process(req, res, connection);
});

// Update page
app.get('/update/:pageId', (req, res) => {
    topic.update(req, res, connection);
});

// Process the update form
app.post('/update_process', (req, res) => {
    topic.update_process(req, res, connection);
});

// Delete page
app.get('/delete/:pageId', (req, res) => {
    topic.delete_process(req, res, connection);
});

app.listen(3000, () => console.log('App is listening on port 3000'));