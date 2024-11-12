const db = require('./db');
const { authIsOwner } = require('./util');

module.exports = {
    home: (req, res) => {
        const { login, name, cls } = authIsOwner(req, res);
        const sql1 = 'SELECT * FROM boardtype;';
        const sql2 = 'SELECT * FROM product;';
        const sql3 = 'SELECT * FROM code;';

        db.query(sql1, (error, boardtypes) => {
            if (error) throw error;

            db.query(sql2, (error, products) => {
                if (error) throw error;

                db.query(sql3, (error, codes) => {
                    if (error) throw error;

                    const context = {
                        who: name,
                        login: login,
                        body: 'product.ejs',
                        cls: cls,
                        boardtypes: boardtypes, // Ensure boardtypes is always available
                        products: products,
                        codes: codes,
                        routing: 'view-only',
                    };

                    res.render('mainFrame', context);
                });
            });
        });
    },

    categoryview: (req, res) => {
        const { login, name, cls } = authIsOwner(req, res);
        const categ = req.params.categ;
        const main_id = categ.substring(0, 4);
        const sub_id = categ.substring(4, 8);

        const sqlProduct = 'SELECT * FROM product WHERE main_id = ? AND sub_id = ?;';
        const sqlCode = 'SELECT * FROM code;';

        db.query(sqlCode, (error, codes) => {
            if (error) throw error;

            db.query(sqlProduct, [main_id, sub_id], (error, products) => {
                if (error) throw error;

                const context = {
                    who: name,
                    login: login,
                    body: 'product.ejs',
                    cls: cls,
                    products: products,
                    codes: codes, // category 페이지에서는 항상 `codes` 필요
                    routing: 'view-only' // 'view-only' 모드로 설정하여 수정/삭제/추가 버튼 숨김
                };

                res.render('mainFrame', context);
            });
        });
    },

    search: (req, res) => {
        const { login, name, cls } = authIsOwner(req, res);
        const searchQuery = req.body.search;

        const sqlSearch = `SELECT * FROM product WHERE name LIKE ? OR brand LIKE ? OR supplier LIKE ?;`;
        const sqlBoardtype = 'SELECT * FROM boardtype;';
        const sqlCode = 'SELECT * FROM code;';

        db.query(sqlBoardtype, (error, boardtypes) => {
            if (error) throw error;

            db.query(sqlCode, (error, codes) => {
                if (error) throw error;

                db.query(sqlSearch, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`], (error, products) => {
                    if (error) throw error;

                    const context = {
                        who: name,
                        login: login,
                        body: 'product.ejs',
                        cls: cls,
                        boardtypes: boardtypes,
                        products: products,
                        codes: codes,
                        routing: 'view-only',
                    };

                    res.render('mainFrame', context);
                });
            });
        });
    }
};