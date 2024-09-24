const express = require('express');
const serveStatic = require('serve-static');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.set("port", 3000);

// view engine 템플릿 사용을 명시
app.set('views' , path.join(__dirname, 'views'));
app.set('view engine' , 'ejs');

// 라우터 생성
var mainRouter = require('./routes/main');
var router = express.Router();


// 미들웨어를 등록한다.
app.use(serveStatic(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

// cookie and session assign middleWare
app.use(cookieParser());

// 세션 세팅
app.use(
  expressSession(
    {
      secret: "myKey",
      resave: true,
      saveUninitialized: true,
    })
);

app.use('/', router);
app.use('/main', mainRouter);


router.get('/', function(req, res){
  console.log('[GET] root');
  if(req.session.user){
      res.redirect('/main/intro');
  } else {
      res.render('login');
  }
});

router.get('/login', function(req, res){
  console.log('[GET] auth login');
  res.render('login');
});

router.post('/login', function(req, res){
  console.log('[POST] auth login');
  
  const paramID = req.body.id || req.query.id;
  const pwd = req.body.password || req.query.password;
  console.log('  id: ' + paramID + ', password: ' + pwd);
  if(req.session.user){
    console.log('  이미 로그인 되어 있습니다.');
  } else {
    console.log('  사용자 정보 저장');
    // 세션에 유저가 없다면,
    req.session.user = {
      id: paramID,
      pwd: pwd,
      name: "MyName!!!",
      authorized: true,
    };
    res.redirect('/main');
    // res.render('intro');
  }
});

//router.route('/logout').get(function(req, res){
router.get('/logout', function(req, res){
  if(req.session){
    req.session.destroy(()=>{
        res.redirect('/');
    });
  }
});


app.listen(app.get("port"), () => {
  console.log(`${app.get("port")}에서 서버실행중.`);
});

// css사용
app.use(express.static('public'));