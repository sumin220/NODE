const express = require('express');
const router = express.Router();
const code = require('../lib/code');

router.get('/view', code.view);
router.get('/create', code.create);
router.post('/create_process', code.create_process);
router.get('/update/:main_id/:sub_id/:start/:end', code.update);
router.post('/update_process', code.update_process);
router.get('/delete/:main_id/:sub_id/:start/:end', code.delete_process);

module.exports = router;

