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
        var sql2 = ` select * from product;`;
        db.query(sql2, (error, results) => {
            var context = {
                /********* mainFrame.ejs에 필요한 변수 *********/
                who: name,
                login: login,
                body: 'test.ejs',
                cls: cls
            };
            res.render('mainFrame', context, (err, html) => {
                res.end(html);
            }); // render end
        }); // query end
    }
};