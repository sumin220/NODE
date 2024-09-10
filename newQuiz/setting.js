const express = require('express');
var dbConfig = require('./config/db.js');
var router = express.Router();

// mysql 사용자 추가
var conn = dbConfig.init();
dbConfig.connect(conn);

router.get('/', function(req, res) {
    res.send('setting root')
});


router.get('/myinfo', function(req, res) {
    res.send('setting myinfo');
});

module.exports = router;