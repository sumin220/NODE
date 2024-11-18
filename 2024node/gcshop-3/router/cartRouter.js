const express = require('express');
const router = express.Router();
const cartController = require('../lib/cart');

// 장바구니 추가
router.post('/', cartController.addToCart);

// 장바구니 보기
router.get('/', cartController.viewCart);

// 장바구니 상품 삭제 (사용자 장바구니 삭제)
router.post('/delete_items', cartController.deleteCartItems);

// 장바구니 상품 구매
router.post('/checkout', cartController.checkout);

// 관리자용 장바구니 관리
router.get('/view', cartController.viewCartAdmin);

// 장바구니 수정 페이지
router.get('/update/:cart_id', cartController.getUpdateCart);

// 장바구니 수정 처리
router.post('/update_process', cartController.postUpdateCart);

// 관리자용 장바구니 삭제
router.post('/delete', cartController.deleteCart);

module.exports = router;