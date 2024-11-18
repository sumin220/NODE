const express = require('express');
const router = express.Router();
const tableController = require('../lib/table');

// 테이블 목록 보기
router.get('/', tableController.viewTables);

// 테이블 데이터 보기 (해당 테이블 이름)
router.get('/view/:tableName', tableController.viewTableColumns);

// 테이블 데이터 생성
router.get('/create/:tableName', tableController.createRow);

// 테이블 데이터 수정
router.get('/update/:tableName/:rowId', tableController.updateRow);

// 테이블 데이터 삭제
router.post('/delete/:tableName/:rowId', tableController.deleteRow);

module.exports = router;