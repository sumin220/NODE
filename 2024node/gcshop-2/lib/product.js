const db = require('./db');

function authIsOwner(req, res) {
    let name = 'Guest';
    let login = false;
    let cls = 'NON';
    if (req.session.is_logined) {
        name = req.session.name;
        login = true;
        cls = req.session.cls;
    }
    return { name, login, cls };
}

module.exports = {
    view: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);

        db.query('SELECT * FROM product', (error, products) => {
            if (error) {
                console.error(error);
                return res.status(500).send('서버 에러가 발생했습니다.');
            }

            const context = {
                who: name,
                login: login,
                cls: cls,
                body: 'product.ejs',
                products: products
            };

            res.render('mainFrame', context);
        });
    },

    create: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);

        db.query('SELECT main_id, main_name, sub_id, sub_name FROM code', (error, categorys) => {
            if (error) {
                console.error(error);
                return res.status(500).send('서버 에러가 발생했습니다.');
            }

            const context = {
                who: name,
                login: login,
                cls: cls,
                body: 'productCU.ejs',
                title: '상품 등록',
                update_hidden: '',
                action: '/product/create_process',
                button: `<button class="btn btn-outline-primary btn-sm" type="submit">입력</button>`,
                code: {},
                categorys: categorys
            };

            res.render('mainFrame', context);
        });
    },

    create_process: (req, res) => {
        const body = req.body;

        // 이미지 경로 설정
        const imagePath = req.file ? `/image/${req.file.filename}` : null;

        db.query(
            'INSERT INTO product (main_id, sub_id, name, price, stock, brand, supplier, image, sale_yn, sale_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [body.main_id, body.sub_id, body.name, body.price, body.stock, body.brand, body.supplier, imagePath, body.sale_yn, body.sale_price],
            (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('서버 에러가 발생했습니다.');
                }
                res.redirect('/product/view');
            }
        );
    },

    update: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        const mer_id = req.params.merId;

        db.query(
            'SELECT * FROM product WHERE mer_id = ?',
            [mer_id],
            (error, products) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('서버 에러가 발생했습니다.');
                }

                if (products.length === 0) {
                    return res.status(404).send('해당 제품을 찾을 수 없습니다.');
                }

                db.query(
                    'SELECT main_id, main_name, sub_id, sub_name FROM code',
                    (error, categorys) => {
                        if (error) {
                            console.error(error);
                            return res.status(500).send('서버 에러가 발생했습니다.');
                        }

                        const context = {
                            who: name,
                            login: login,
                            cls: cls,
                            body: 'productCU.ejs',
                            title: '상품 수정',
                            update_hidden: `<input type="hidden" name="mer_id" value="${mer_id}">`,
                            action: '/product/update_process',
                            button: `<button class="btn btn-outline-primary btn-sm" type="submit">수정</button>`,
                            code: products[0],
                            categorys: categorys
                        };

                        res.render('mainFrame', context);
                    }
                );
            }
        );
    },

    update_process: (req, res) => {
        const body = req.body;
        const mer_id = body.mer_id;

        // 이미지 경로 설정
        const imagePath = req.file ? `/image/${req.file.filename}` : body.image;

        db.query(
            'UPDATE product SET main_id = ?, sub_id = ?, name = ?, price = ?, stock = ?, brand = ?, supplier = ?, image = ?, sale_yn = ?, sale_price = ? WHERE mer_id = ?',
            [body.main_id, body.sub_id, body.name, body.price, body.stock, body.brand, body.supplier, imagePath, body.sale_yn, body.sale_price, mer_id],
            (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('서버 에러가 발생했습니다.');
                }

                res.redirect('/product/view');
            }
        );
    },

    delete_process: (req, res) => {
        const mer_id = req.params.merId;

        db.query(
            'DELETE FROM product WHERE mer_id = ?',
            [mer_id],
            (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('서버 에러가 발생했습니다.');
                }

                res.redirect('/product/view');
            }
        );
    },
};