const express = require('express');
const router = express.Router();
const personController = require('../lib/person');

router.get('/view', personController.view);
router.get('/create', personController.create);
router.post('/create_process', personController.create_process);
router.get('/update/:loginId', personController.update);
router.post('/update_process', personController.update_process);
router.get('/delete/:loginId', personController.delete_process);

module.exports = router;