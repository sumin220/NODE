const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const topic = require('./lib/topic');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: false }));

// 홈 화면 - 글 목록
app.get('/', (req, res) => {
    topic.home(req, res);
});

// 글 상세 보기
app.get('/page/:pageId', (req, res) => {
    topic.page(req, res);
});

// 글 생성 화면
app.get('/create', (req, res) => {
    topic.create(req, res);
});

// 글 생성 처리
app.post('/create_process', (req, res) => {
    topic.create_process(req, res);
});

// 글 수정 화면
app.get('/update/:pageId', (req, res) => {
    topic.update(req, res);
});

// 글 수정 처리
app.post('/update_process', (req, res) => {
    topic.update_process(req, res);
});

// 글 삭제 처리
app.get('/delete/:pageId', (req, res) => {
    topic.delete_process(req, res);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});