const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('./lib/05');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', './views');

// 메인 페이지 (일정 목록 보기)
app.get('/', (req, res) => {
    schedule.getAll((schedules) => {
        res.render('05', { schedules: schedules });
    });
});

// 일정 생성 페이지
app.get('/create', (req, res) => {
    schedule.getAll((schedules) => {
        res.render('create', { schedules: schedules });
    });
});

// 일정 생성 처리
app.post('/create_process', (req, res) => {
    schedule.create(req.body, () => {
        res.redirect('/');
    });
});

// 일정 상세 페이지
app.get('/page/:id', (req, res) => {
    schedule.getById(req.params.id, (scheduleData) => {
        res.render('page', { schedule: scheduleData });
    });
});

// 일정 수정 페이지
app.get('/update/:id', (req, res) => {
    schedule.getById(req.params.id, (scheduleData) => {
        res.render('update', { schedule: scheduleData });
    });
});

// 일정 수정 처리
app.post('/update_process', (req, res) => {
    schedule.update(req.body.id, req.body, () => {
        res.redirect('/page/' + req.body.id);
    });
});

// 일정 삭제
app.get('/delete/:id', (req, res) => {
    schedule.delete(req.params.id, () => {
        res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});