const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');
const cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const expressSession = require('express-session');

//DB 관련 코드
var dbConfig = require(__dirname = '/config/db.js');
var conn = dbConfig.init();
dbConfig.connect(conn);


var settingRouter = require('./routes/setting'); // setting 라우터 생성


const app = express();


// 라우터 설정
var router = express.Router();
app.use('/', router);
app.use('/setting', settingRouter); // setting 라우터 등록

router.get('/', function (req, res) {
    console.log('[GET] root');
    if(!req.session.user) {
        res.render('login');
        return;
    }
    res.redirect('/enterance/dashboard');
});


app.listen(app.get("port"), () => {
    console.log('${app.get("port")}에서 서버실행중.');
});

//exports conn;
module.exports = conn;

