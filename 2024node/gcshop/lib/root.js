const db = require('./db');
const {authIsOwner} = require('./util');


module.exports = {
    home: (req, res) => {
        var {login, name, cls} = authIsOwner(req, res)
        var sql1 = 'select * from boardtype;';
        var sql2 = ` select * from product;`
        db.query(sql1, (error, results) => {
            if(error){
                throw error;
            }
            var context = {
                /*********** mainFrame.ejs에 필요한 변수 ***********/
                who: name,
                login: login,
                body: 'test.ejs',
                cls: cls,
                boardtypes: results
            };
            res.render('mainFrame', context, (err, html) => {
                res.end(html)
            }); //render end
        }); //query end
    },
}