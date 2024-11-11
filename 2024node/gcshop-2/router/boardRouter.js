const express = require('express');
const router = express.Router();
const board = require('../lib/board'); // board 모듈을 가져오는 부분

router.get('/type/view', board.typeview);
router.get('/type/create', board.typecreate);
router.post('/type/create_process', board.typecreate_process);
router.get('/type/update/:typeId', board.typeupdate);
router.post('/type/update_process', board.typeupdate_process);
router.get('/type/delete/:typeId', board.typedelete_process);

router.get('/view/:typeId/:pNum', board.view);
router.get('/create/:typeId', board.create);
router.post('/create_process', board.create_process);
router.get('/detail/:boardId/:pNum', board.detail);
router.get('/update/:boardId/:typeId/:pNum', board.update);
router.post('/update_process', board.update_process);
router.get('/delete/:boardId/:typeId/:pNum', board.delete_process);

module.exports = router;