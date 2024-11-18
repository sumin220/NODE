const db = require('./db');
const sanitizeHtml = require('sanitize-html');
const { authIsOwner } = require('./util');

module.exports = {
    // 장바구니에 추가
    addToCart: (req, res) => {
        const {mer_id, qty} = req.body;
        const loginid = req.session.loginid;
        const date = new Date().toISOString();

        if (!loginid) {
            return res.send(`<script>
            alert('로그인이 필요합니다.');
            window.location.href = '/login';
        </script>`);
        }

        const checkSQL = `SELECT *
                          FROM cart
                          WHERE loginid = ?
                            AND mer_id = ?`;
        const insertSQL = `INSERT INTO cart (loginid, mer_id, date)
                           VALUES (?, ?, ?)`;

        db.query(checkSQL, [loginid, mer_id], (err, results) => {
            if (err) {
                return res.send(`<script>
                alert('데이터베이스 오류입니다.');
                window.history.back();
            </script>`);
            }

            if (results.length > 0) {
                // 이미 장바구니에 존재하는 경우
                return res.send(`<script>
                alert('이미 장바구니에 존재하는 상품입니다.');
                window.location.href = '/cart';
            </script>`);
            }

            // 새로운 상품 추가
            db.query(insertSQL, [loginid, mer_id, date], (err) => {
                if (err) {
                    return res.send(`<script>
                    alert('상품 추가 중 오류가 발생했습니다.');
                    window.history.back();
                </script>`);
                }

                res.send(`<script>
                alert('장바구니에 상품이 추가되었습니다.');
                window.location.href = '/cart';
            </script>`);
            });
        });
    },

    // 장바구니 보기
    // viewCart 함수 수정
    viewCart: (req, res) => {
        const {name, login, cls} = authIsOwner(req, res);
        const userId = req.session.loginid;

        if (!userId) {
            return res.status(403).send("로그인이 필요합니다.");
        }

        const queries = {
            boardtypes: `SELECT *
                         FROM boardtype;`,
            codes: `SELECT *
                    FROM code;`,
            cartItems: `
                SELECT c.cart_id, c.date, p.name, p.image, p.price
                FROM cart c
                         INNER JOIN product p ON c.mer_id = p.mer_id
                WHERE c.loginid = ?
                ORDER BY c.date DESC;
            `
        };

        // 데이터베이스 쿼리 실행
        db.query(queries.boardtypes, (err1, boardtypes) => {
            if (err1) throw err1;

            db.query(queries.codes, (err2, codes) => {
                if (err2) throw err2;

                db.query(queries.cartItems, [userId], (err3, cartItems) => {
                    if (err3) throw err3;

                    const context = {
                        who: name,
                        login: login,
                        cls: cls,
                        body: 'cart.ejs',
                        cartItems: cartItems || [], // 장바구니 항목 데이터
                        codes: codes || [], // 카테고리 데이터
                        boardtypes: boardtypes || [] // 보드 타입 데이터
                    };

                    // 로그로 데이터 확인
                    console.log("Cart Items:", cartItems);

                    res.render('mainFrame', context, (err, html) => {
                        if (err) throw err;
                        res.end(html);
                    });
                });
            });
        });
    },

    // 장바구니 상품 삭제
    deleteCartItems: (req, res) => {
        const selectedIds = req.body.selected; // 체크된 cart_id 배열

        if (!selectedIds) {
            return res.redirect('/cart'); // 선택된 항목이 없을 경우
        }

        const sql = `DELETE
                     FROM cart
                     WHERE cart_id IN (?)`;

        db.query(sql, [selectedIds], (err) => {
            if (err) throw err;
            res.redirect('/cart');
        });
    },

    // 장바구니 상품 구매
    checkout: (req, res) => {
        const selectedIds = req.body.selected; // 체크된 cart_id 배열
        const qtyData = {}; // 수량 데이터를 저장할 객체

        // req.body에서 qty_<cart_id> 형식의 데이터를 파싱
        Object.keys(req.body).forEach((key) => {
            if (key.startsWith('qty_')) {
                const cartId = key.split('_')[1]; // "qty_9"에서 "9" 추출
                qtyData[cartId] = parseInt(req.body[key], 10) || 1; // 수량 파싱
            }
        });

        const userId = req.session.loginid;

        if (!selectedIds || selectedIds.length === 0) {
            return res.send(`<script>
            alert('구매할 상품을 선택해 주세요.');
            window.location.href = '/cart';
        </script>`);
        }

        const selectSQL = `
            SELECT c.cart_id, c.mer_id, p.price
            FROM cart c
                     INNER JOIN product p ON c.mer_id = p.mer_id
            WHERE c.cart_id IN (?);
        `;
        const insertSQL = `
            INSERT INTO purchase (loginid, mer_id, date, price, qty, total, payYN, cancel, refund)
            VALUES ?;
        `;
        const deleteSQL = `DELETE FROM cart WHERE cart_id IN (?);`;

        db.query(selectSQL, [selectedIds], (err, cartItems) => {
            if (err) {
                return res.send(`<script>
                alert('상품 데이터를 가져오는 중 오류가 발생했습니다.');
                window.history.back();
            </script>`);
            }

            const purchaseData = cartItems.map((item) => {
                const qty = qtyData[item.cart_id] || 1; // 해당 cart_id의 수량
                return [
                    userId,
                    item.mer_id,
                    new Date(), // 구매 날짜
                    item.price,
                    qty, // 수량
                    item.price * qty, // 총 금액
                    'Y', // payYN
                    'N', // cancel
                    'N', // refund
                ];
            });

            db.query(insertSQL, [purchaseData], (err) => {
                if (err) {
                    return res.send(`<script>
                    alert('구매 중 오류가 발생했습니다.');
                    window.history.back();
                </script>`);
                }

                db.query(deleteSQL, [selectedIds], (err) => {
                    if (err) {
                        return res.send(`<script>
                        alert('장바구니에서 상품 삭제 중 오류가 발생했습니다.');
                        window.history.back();
                    </script>`);
                    }

                    res.send(`<script>
                    alert('구매가 완료되었습니다.');
                    window.location.href = '/purchase';
                </script>`);
                });
            });
        });
    },

    viewCartAdmin: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);

        const sql1 = `SELECT * FROM boardtype;`;
        const sql2 = `SELECT * FROM code;`;
        const sql3 = `
            SELECT c.cart_id, c.loginid, p.name AS customer_name, pr.name AS product_name,
                   DATE_FORMAT(c.date, '%Y.%m.%d %H시 %i분 %s초') AS formatted_date
            FROM cart c
                     INNER JOIN person p ON c.loginid = p.loginid
                     INNER JOIN product pr ON c.mer_id = pr.mer_id;
        `;

        db.query(sql1, (err1, boardtypes) => {
            if (err1) {
                console.error("boardtype 쿼리 오류:", err1);
                return;
            }
            db.query(sql2, (err2, codes) => {
                if (err2) {
                    console.error("code 쿼리 오류:", err2);
                    return;
                }
                db.query(sql3, (err3, cartItems) => {
                    if (err3) {
                        console.error("cart 쿼리 오류:", err3);
                        return;
                    }

                    const context = {
                        who: name,
                        login: login,
                        cls: cls,
                        body: 'cartView.ejs', // cartView로 렌더링
                        boardtypes: boardtypes, // boardtype 데이터
                        codes: codes, // code 데이터
                        cartItems: cartItems, // cart 데이터
                    };

                    res.render("mainFrame", context, (err, html) => {
                        if (err) throw err;
                        res.end(html);
                    });
                });
            });
        });
    },

    getUpdateCart: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        const cartId = req.params.cart_id;

        const sql1 = `SELECT * FROM boardtype;`;
        const sql2 = `SELECT * FROM code;`;
        const cartQuery = `SELECT * FROM cart WHERE cart_id = ?`;
        const customersQuery = `SELECT loginid, name FROM person`; // users -> person
        const productsQuery = `SELECT mer_id, name FROM product`;

        db.query(sql1, (err1, boardtypes) => {
            if (err1) {
                console.error("boardtype 데이터 가져오기 오류:", err1);
                return res.send(`<script>
                alert('boardtype 데이터를 가져오는 중 오류가 발생했습니다.');
                window.history.back();
            </script>`);
            }

            db.query(sql2, (err2, codes) => {
                if (err2) {
                    console.error("code 데이터 가져오기 오류:", err2);
                    return res.send(`<script>
                    alert('code 데이터를 가져오는 중 오류가 발생했습니다.');
                    window.history.back();
                </script>`);
                }

                db.query(cartQuery, [cartId], (err3, cartResult) => {
                    if (err3) {
                        console.error("장바구니 데이터 가져오기 오류:", err3);
                        return res.send(`<script>
                        alert('장바구니 데이터를 가져오는 중 오류가 발생했습니다.');
                        window.history.back();
                    </script>`);
                    }

                    db.query(customersQuery, (err4, customers) => {
                        if (err4) {
                            console.error("고객 데이터 가져오기 오류:", err4);
                            return res.send(`<script>
                            alert('고객 데이터를 가져오는 중 오류가 발생했습니다.');
                            window.history.back();
                        </script>`);
                        }

                        db.query(productsQuery, (err5, products) => {
                            if (err5) {
                                console.error("상품 데이터 가져오기 오류:", err5);
                                return res.send(`<script>
                                alert('상품 데이터를 가져오는 중 오류가 발생했습니다.');
                                window.history.back();
                            </script>`);
                            }

                            const context = {
                                who: name,
                                login: login,
                                cls: cls,
                                body: 'cartU.ejs', // cartU.ejs 렌더링
                                boardtypes: boardtypes, // boardtype 데이터
                                codes: codes, // code 데이터
                                cartItem: cartResult[0], // cart 데이터
                                customers: customers, // 사용자 데이터
                                products: products, // 상품 데이터
                            };

                            res.render("mainFrame", context, (err, html) => {
                                if (err) throw err;
                                res.end(html);
                            });
                        });
                    });
                });
            });
        });
    },

    postUpdateCart: (req, res) => {
        const { cart_id, loginid, mer_id } = req.body;

        const updateQuery = `
            UPDATE cart
            SET loginid = ?, mer_id = ?
            WHERE cart_id = ?;
        `;

        db.query(updateQuery, [loginid, mer_id, cart_id], (err) => {
            if (err) {
                console.error("장바구니 수정 오류:", err);
                return res.send(`<script>
                alert('장바구니 수정 중 오류가 발생했습니다.');
                window.history.back();
            </script>`);
            }

            res.send(`<script>
            alert('장바구니 수정이 완료되었습니다.');
            window.location.href = '/cart/view';
        </script>`);
        });
    },


    deleteCart: (req, res) => {
        const { cart_id } = req.body;

        const deleteQuery = `
            DELETE FROM cart
            WHERE cart_id = ?;
        `;
        console.log("요청된 cart_id", cart_id);
        db.query(deleteQuery, [cart_id], (err) => {
            if (err) {
                console.error("장바구니 삭제 오류:", err);
                return res.send(`<script>
                alert('장바구니 삭제 중 오류가 발생했습니다.');
                window.history.back();
            </script>`);
            }

            // 삭제 성공 후 cart/view로 이동
            res.send(`<script>
            alert('장바구니 항목이 삭제되었습니다.');
            window.location.href = '/cart/view';
        </script>`);
        });
    }
}