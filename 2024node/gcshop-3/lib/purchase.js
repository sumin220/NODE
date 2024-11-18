const db = require('./db');
const sanitizeHtml = require('sanitize-html');
const { authIsOwner } = require('./util');

module.exports = {
    // 상품 상세 보기
    purchaseDetail: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        const merId = sanitizeHtml(req.params.merId);

        const queries = {
            boardtypes: `SELECT * FROM boardtype;`,
            codes: `SELECT * FROM code;`,
            product: `SELECT * FROM product WHERE mer_id = ?;`
        };

        db.query(queries.boardtypes, (err1, boardtypes) => {
            if (err1) throw err1;

            db.query(queries.codes, (err2, codes) => {
                if (err2) throw err2;

                db.query(queries.product, [merId], (err3, products) => {
                    if (err3) throw err3;

                    if (products.length === 0) {
                        // 상품이 없을 경우 에러 메시지 처리
                        return res.status(404).send("상품을 찾을 수 없습니다.");
                    }

                    const context = {
                        who: name,
                        login: login,
                        cls: cls,
                        body: 'purchaseDetail.ejs',
                        boardtypes: boardtypes,
                        codes: codes,
                        product: products[0], // product 데이터 설정
                        user_id: req.session.loginid,
                        routing: "purchase"
                    };

                    res.render('mainFrame', context, (err, html) => {
                        if (err) throw err;
                        res.end(html);
                    });
                });
            });
        });
    },

    // 결제 처리
    completePurchase: (req, res) => {
        const { mer_id, qty } = req.body;
        const userId = req.session.loginid || ''; // 빈 문자열 처리

        if (!userId) {
            return res.status(403).send("로그인이 필요합니다.");
        }

        const sanitizedMerId = sanitizeHtml(mer_id);
        const sanitizedQty = sanitizeHtml(qty);

        // 상품 정보 가져오기
        db.query('SELECT price, stock FROM product WHERE mer_id = ?', [sanitizedMerId], (err, results) => {
            if (err) throw err;

            if (results.length === 0) {
                return res.status(404).send("상품을 찾을 수 없습니다.");
            }

            const product = results[0];
            const total = product.price * sanitizedQty;

            if (sanitizedQty > product.stock) {
                return res.status(400).send("재고가 부족합니다.");
            }

            // 결제 데이터 삽입
            const sql = `INSERT INTO purchase (loginid, mer_id, date, price, qty, total, payYN, cancel, refund)
                         VALUES (?, ?, NOW(), ?, ?, ?, 'Y', 'N', 'N')`;

            db.query(sql, [userId, sanitizedMerId, product.price, sanitizedQty, total], (err2) => {
                if (err2) throw err2;

                // 재고 감소
                db.query('UPDATE product SET stock = stock - ? WHERE mer_id = ?', [sanitizedQty, sanitizedMerId], (err3) => {
                    if (err3) throw err3;
                    res.redirect('/purchase');
                });
            });
        });
    },

    // 구매 내역 리스트
    purchaseList: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        const loginid = req.session.user_id;

        const queryPurchaseList = `SELECT * FROM purchase WHERE loginid = ? ORDER BY date DESC;`;

        db.query(queryPurchaseList, [loginid], (err, results) => {
            if (err) throw err;

            const context = {
                who: name,
                login: login,
                cls: cls,
                body: 'purchaseList.ejs',
                purchases: results
            };

            req.app.render('mainFrame', context, (err, html) => {
                if (err) throw err;
                res.end(html);
            });
        });
    },

    // 구매 취소 처리
    cancelPurchase: (req, res) => {
        const purchaseId = req.params.id; // URL에서 purchase_id를 가져옴

        const sql = `UPDATE purchase SET cancel = 'Y' WHERE purchase_id = ?`;

        db.query(sql, [purchaseId], (err) => {
            if (err) {
                throw err; // 오류 발생 시 처리
            }

            // 업데이트 후 구매 목록으로 리다이렉트
            res.redirect('/purchase');
        });
    },

    // 구매 화면
    purchase: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        const userId = req.session.loginid; // 세션에서 loginid 가져오기

        if (!userId || userId.trim() === "") {
            return res.status(403).send("로그인이 필요합니다.");
        }

        const sql1 = `SELECT * FROM boardtype;`; // 보드 타입 데이터 가져오기
        const sql2 = `SELECT * FROM code;`; // 카테고리 코드 데이터 가져오기
        const queryPurchase = `
        SELECT p.purchase_id, p.qty, p.total, p.date, p.cancel,
               pr.name, pr.image, pr.price
        FROM purchase p
        INNER JOIN product pr ON p.mer_id = pr.mer_id
        WHERE p.loginid = ?
        ORDER BY p.date DESC;
    `;

        // 데이터베이스 쿼리 실행
        db.query(sql1, (err1, boardtypes) => {
            if (err1) throw err1;

            db.query(sql2, (err2, codes) => {
                if (err2) throw err2;

                db.query(queryPurchase, [userId], (err3, results) => {
                    if (err3) throw err3;

                    const context = {
                        who: name,
                        login: login,
                        cls: cls,
                        body: 'purchase.ejs',
                        purchases: results || [], // 구매 내역 데이터
                        codes: codes || [], // 카테고리 데이터
                        boardtypes: boardtypes || [] // 보드 타입 데이터
                    };

                    res.render('mainFrame', context, (err, html) => {
                        if (err) throw err;
                        res.end(html);
                    });
                });
            });
        });
    },

    viewPurchases: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);

        const sql1 = `SELECT * FROM boardtype;`;
        const sql2 = `SELECT * FROM code;`;
        const sql3 = `
            SELECT p.purchase_id, p.loginid, per.name AS customer_name,
                   p.mer_id, pr.name AS product_name,
                   p.date, p.price, p.point, p.qty, p.total,
                   p.payYN, p.cancel, p.refund
            FROM purchase p
                     INNER JOIN person per ON p.loginid = per.loginid
                     INNER JOIN product pr ON p.mer_id = pr.mer_id;
        `;

        db.query(sql1 + sql2 + sql3, (err, results) => {
            if (err) {
                console.error("구매 내역 조회 오류:", err);
                return res.send(`<script>alert('구매 내역 조회 중 오류가 발생했습니다.'); window.history.back();</script>`);
            }

            const context = {
                who: name,
                login: login,
                cls: cls,
                body: 'purchaseView.ejs',
                boardtypes: results[0], // boardtype 데이터
                codes: results[1], // code 데이터
                purchaseItems: results[2], // purchase 데이터
            };

            res.render("mainFrame", context, (err, html) => {
                if (err) throw err;
                res.end(html);
            });
        });
    },

    getUpdatePurchase: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        const purchaseId = req.params.purchase_id;

        const sql1 = `SELECT * FROM boardtype;`;
        const sql2 = `SELECT * FROM code;`;
        const purchaseQuery = `
            SELECT p.*, per.name AS customer_name, pr.name AS product_name
            FROM purchase p
                     INNER JOIN person per ON p.loginid = per.loginid
                     INNER JOIN product pr ON p.mer_id = pr.mer_id
            WHERE p.purchase_id = ?;
        `;
        const customersQuery = `SELECT loginid, name FROM person;`;
        const productsQuery = `SELECT mer_id, name FROM product;`;

        db.query(sql1 + sql2, (err, results) => {
            if (err) {
                console.error("데이터 가져오기 오류:", err);
                return res.send(`<script>alert('데이터를 가져오는 중 오류가 발생했습니다.'); window.history.back();</script>`);
            }

            db.query(purchaseQuery, [purchaseId], (err, purchaseResult) => {
                if (err) {
                    console.error("구매 데이터 가져오기 오류:", err);
                    return res.send(`<script>alert('구매 데이터를 가져오는 중 오류가 발생했습니다.'); window.history.back();</script>`);
                }

                db.query(customersQuery, (err, customers) => {
                    if (err) {
                        console.error("고객 데이터 가져오기 오류:", err);
                        return res.send(`<script>alert('고객 데이터를 가져오는 중 오류가 발생했습니다.'); window.history.back();</script>`);
                    }

                    db.query(productsQuery, (err, products) => {
                        if (err) {
                            console.error("상품 데이터 가져오기 오류:", err);
                            return res.send(`<script>alert('상품 데이터를 가져오는 중 오류가 발생했습니다.'); window.history.back();</script>`);
                        }

                        const context = {
                            who: name,
                            login: login,
                            cls: cls,
                            body: 'purchaseU.ejs',
                            boardtypes: results[0], // boardtype 데이터
                            codes: results[1], // code 데이터
                            purchaseItem: purchaseResult[0], // purchase 데이터
                            customers: customers, // person 데이터
                            products: products, // product 데이터
                        };

                        res.render("mainFrame", context, (err, html) => {
                            if (err) throw err;
                            res.end(html);
                        });
                    });
                });
            });
        });
    },

    postUpdatePurchase: (req, res) => {
        const {
            purchase_id,
            price,
            point,
            qty,
            total,
            payYN,
            cancel,
            refund,
        } = req.body;

        // 기본값 설정
        const qtyValue = qty || 1; // 기본값: 1
        const totalValue = total || price * qtyValue; // 기본값: 가격 * 수량

        const updateQuery = `
        UPDATE purchase
        SET price = ?, point = ?, qty = ?, total = ?, payYN = ?, cancel = ?, refund = ?
        WHERE purchase_id = ?;
    `;
        const updateValues = [price, point, qtyValue, totalValue, payYN, cancel, refund, purchase_id];

        console.log('업데이트 쿼리:', updateQuery);
        console.log('업데이트 값:', updateValues);

        db.query(updateQuery, updateValues, (err) => {
            if (err) {
                console.error('구매 내역 수정 오류:', err);
                return res.send(`<script>
                alert('구매 내역 수정 중 오류가 발생했습니다.');
                window.history.back();
            </script>`);
            }

            // 업데이트 후 데이터 확인
            const checkQuery = 'SELECT * FROM purchase WHERE purchase_id = ?';
            db.query(checkQuery, [purchase_id], (err, result) => {
                if (err) {
                    console.error('업데이트 확인 쿼리 오류:', err);
                    return res.send(`<script>
                    alert('업데이트 확인 중 오류가 발생했습니다.');
                    window.history.back();
                </script>`);
                }
                console.log('업데이트된 데이터:', result);

                res.send(`<script>
                alert('구매 내역이 성공적으로 수정되었습니다.');
                window.location.href = '/purchase/view';
            </script>`);
            });
        });
    },

    deletePurchase: (req, res) => {
        const { purchase_id } = req.body;

        const deleteQuery = `
            DELETE FROM purchase
            WHERE purchase_id = ?;
        `;

        db.query(deleteQuery, [purchase_id], (err) => {
            if (err) {
                console.error("구매 내역 삭제 오류:", err);
                return res.send(`<script>alert('구매 내역 삭제 중 오류가 발생했습니다.'); window.history.back();</script>`);
            }

            res.send(`<script>alert('구매 내역이 삭제되었습니다.'); window.location.href = '/purchase/view';</script>`);
        });
    }
};