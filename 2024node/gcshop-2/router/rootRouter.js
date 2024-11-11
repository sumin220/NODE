const express = require('express');
const router = express.Router();

var root = require('../lib/root');

router.get('/', (req,res) =>{
    root.home(req,res)
})

module.exports = router;