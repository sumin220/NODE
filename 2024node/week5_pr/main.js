// 손수민 202239895
const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('./lib/05');
const db = require('./lib/db');  // MySQL 연결
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', './views');

// 메인 페이지 (일정 목록 보기)
app.get('/', (req, res) => {
    schedule.home(req, res, db);
});

// 일정 생성 페이지
app.get('/create', (req, res) => {
    schedule.create(req, res, db);
});

// 일정 생성 처리
app.post('/create_process', (req, res) => {
    schedule.create_process(req, res, db);
});

// 일정 상세 페이지
app.get('/page/:pageId', (req, res) => {
    schedule.page(req, res, db);
});

// 일정 수정 페이지
app.get('/update/:pageId', (req, res) => {
    schedule.update(req, res, db);
});

// 일정 수정 처리
app.post('/update_process', (req, res) => {
    schedule.update_process(req, res, db);
});

// 일정 삭제 처리
app.get('/delete/:pageId', (req, res) => {
    schedule.delete_process(req, res, db);
});


app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});