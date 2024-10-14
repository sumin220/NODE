// 202239895 손수민
const express = require('express');
const app = express();
const topic = require('./lib/topic');// topic.js
const author = require('./lib/author');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    topic.home(req, res);
});

app.get('/page/:pageId', (req, res) => {
    topic.page(req, res);
});

// Create page
app.get('/create', (req, res) => {
    topic.create(req, res);
});

// Process the create form
app.post('/create_process', (req, res) => {
    topic.create_process(req, res);
});

// Update page
app.get('/update/:pageId', (req, res) => {
    topic.update(req, res);
});

// Process the update form
app.post('/update_process', (req, res) => {
    topic.update_process(req, res);
});

// Delete page
app.get('/delete/:pageId', (req, res) => {
    topic.delete_process(req, res);
});

// author
app.get('/author', (req, res) => {
    author.create(req,res);
})

app.post('/author/create_process', (req, res) => {
    author.create_process(req, res);
})

app.get('/author/update/:authorId', (req, res) => {
    author.update(req, res);
})

app.post('/author/update_process', (req, res) => {
    author.update_process(req, res);
})

app.get('/author/delete/:authorId', (req, res) => {
    author.delete_process(req, res);
})
app.listen(3000, () => console.log('App is listening on port 3000'));