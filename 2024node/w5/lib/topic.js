const db = require('./db');
var qs = require('querystring');

module.exports = {
    page: (req, res) => {
        var id = req.params.id;
        db.query('select *from topic', (err, topics) => {
            if (err) {
                throw err;
            }
            db.query('select *from topic where id = ${id}', (err, topic) => {
                if (err) throw err;


                var m = asdf
                var b = asdf

                var context = {
                    list: topics,
                    menu: m,
                    body: b
                };
                req.app.render('home', context, (err,html) =>
                res.end(html))
            })
        });
    }
}
