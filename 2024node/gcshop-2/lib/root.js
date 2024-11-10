const db = require('./db');
var sanitizeHtml = require('sanitize-html');

function authIsOwner(req, res) {
    var name = 'Guest';
    var login = false;
    var cls = 'NON';
    if (req.session.is_logined) {
        name = req.session.name;
        login = true;
        cls = req.session.cls;
    }
    return { name, login, cls };
}

module.exports = {
    home: (req, res) => {
        var { login, name, cls } = authIsOwner(req, res);
        var sql2 = `SELECT * FROM product;`;
        db.query(sql2, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('서버 에러가 발생했습니다.');
            }

            var context = {
                who: name,
                login: login,
                body: 'product.ejs',
                cls: cls,
                products: results
            };

            res.render('mainFrame', context, (err, html) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('렌더링 에러가 발생했습니다.');
                }
                res.end(html);
            });
        });
    }
};