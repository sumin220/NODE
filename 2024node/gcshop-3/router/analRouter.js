const express = require('express');
const router = express.Router();
const analysisController = require('../lib/anal');

router.get('/customer', analysisController.customerAnalysis);


module.exports = router;