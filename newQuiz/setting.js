const express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.send('setting root')
});


router.get('/myinfo', function(req, res) {
    res.send('setting myinfo');
});

module.exports = router;