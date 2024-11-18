const express = require('express');
const router = express.Router();
const purchaseController = require('../lib/purchase');

// 구매 내역 리스트
router.get('/list', purchaseController.purchaseList);

// 상품 상세 보기
router.get('/detail/:merId', purchaseController.purchaseDetail);

// 결제 처리
router.post('/', purchaseController.completePurchase);

// 결제 내역 조회
router.get('/', purchaseController.purchase);

// 구매 취소
router.post('/cancel/:id', purchaseController.cancelPurchase);

module.exports = router;