const express = require('express');
const bodyParser = require('body-parser');

var router = express.Router();

// 미들웨어를 등록한다.
router.use(bodyParser.json());

router.get('/', function(req, res){
  console.log('[GET] main root');
  if(!req.session.user){
    console.log('  어라? 로그인이 안되어 있네? 로그인 화면으로...');
      res.render('login');
      return;
  }
  res.render('intro');
});

router.get('/intro', function(req, res){
  console.log('[GET] main intro');
  if(!req.session.user){
    console.log('  어라? 로그인이 안되어 있네? 로그인 화면으로...');
      res.render('login');
      return;
  }
  res.render('intro');
});

module.exports = router;