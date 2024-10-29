const db = require('./db');
const qs = require('querystring');
const sanitizeHtml = require('sanitize-html');
const cookie = require('cookie');


function authIsOwner(req, res) {
    var isOwner = false;
    var cookies = {};

    if (req.headers.cookie) {
        cookies = cookie.parse(req.headers.cookie);
    }

    if (cookies.email === 'bhwang99@gachon.ac.kr' && cookies.password === '123456') {
        isOwner = true;
    }

    return isOwner;
}

function authStatusUI(req, res) {
    var login = '<a href="/login">login</a>';

    if (authIsOwner(req, res)) {
        login = '<a href="/logout_process">logout</a>';
    }

    return login;
}

function authIsLogin(req, res) {
    if (authIsOwner(req, res) === false) {
        res.end(
            `
            <script type='text/javascript'>
                alert('login required ~~~');
                <!--
                setTimeout('location.href="http://localhost:3000/"', 1000);
                //-->
            </script>
            `
        );
    }
}

module.exports = {
    create: (req, res) => {
        var login = authStatusUI(req, res);

        db.query(
            'SELECT * FROM topic',
            (err, topics) => {
                if (err) throw err;

                db.query(
                    'SELECT * FROM author',
                    (err2, authors) => {
                        if (err2) throw err2;

                        var tag = '<table border="1" style="border-collapse: collapse;">';
                        for(var i=0; i < authors.length; i++) {
                            tag +=
                                `
                            <tr>
                                <td>${authors[i].name}</td>
                                <td>${authors[i].profile}</td>
                                <td>
                                    <a href="/author/update/${authors[i].id}">update</a>
                                </td>
                                <td>
                                    <a href="/author/delete/${authors[i].id}" onclick='if(confirm("정말로 삭제하시겠습니까?")==false){ return false }'>delete</a>
                                </td>
                            </tr>
                            `;
                        }
                        tag += '</table>';

                        var body = '';
                        if (authIsOwner(req, res)) {
                            body =
                                `
                                <form action="/author/create_process" method="post">
                                    <p><input type="text" name="name" placeholder="name"></input></p>
                                    <p><input type="text" name="profile" placeholder="profile"></input></p>
                                    <p><input type="submit" value="저자생성"></input></p>
                                </form>
                            `;
                        }


                        var context = {
                            login: login,
                            title: 'HomePage - Topic + Author',
                            list: topics,
                            menu: tag,
                            body: body,
                        };

                        res.render('home', context, (err, html) => res.end(html));
                    }
                );
            }
        );
    },

    create_process: (req, res) => {
        var body = '';
        req.on(
            'data',
            (data) => body += data
        );
        req.on(
            'end',
            () => {
                var post = qs.parse(body);
                var sanitizedName = sanitizeHtml(post.name);
                var sanitizedProfile = sanitizeHtml(post.profile);

                db.query(
                    'INSERT INTO author (name, profile) VALUES (?, ?)',
                    [sanitizedName, sanitizedProfile], (err, result) => {
                        if (err) throw err;

                        res.redirect('/author');
                        res.end();
                    }
                );
            }
        );
    },

    update: (req, res) => {
        authIsLogin(req, res);
        var login = authStatusUI(req, res);

        var authorId = req.params.authorId;

        db.query(
            'SELECT * FROM author WHERE id = ?',
            [authorId], (err, author) => {
                if (err) throw err;

                var body =
                    `
                <form action="/author/update_process" method="post">
                    <input type="hidden" name="id" value="${author[0].id}"></input>
                    <p><input type="text" name="name" value="${author[0].name}" placeholder="name"></input></p>
                    <p><input type="text" name="profile" value="${author[0].profile}" placeholder="profile"></input></p>
                    <p><input type="submit" value="수정"></input></p>
                </form>
                `;

                var context = {
                    login: login,
                    title: 'Author Update',
                    list: [],
                    menu: '',
                    body: body,
                };

                res.render('home', context, (err, html) => res.end(html));
            }
        );
    },

    update_process: (req, res) => {
        var body = '';
        req.on('data', (data) => {
            body += data;
        });

        req.on('end', () => {
            var post = qs.parse(body);
            var sanitizedName = sanitizeHtml(post.name);
            var sanitizedProfile = sanitizeHtml(post.profile);
            var authorId = post.id;

            db.query(
                'UPDATE author SET name = ?, profile = ? WHERE id = ?',
                [sanitizedName, sanitizedProfile, authorId],
                (err, result) => {
                    if (err) throw err;

                    res.redirect('/author');
                    res.end();
                }
            );
        });
    },

    delete_process: (req, res) => {
        if (!authIsOwner(req, res)) {
            authIsLogin(req, res);
            return;
        }

        var authorId = req.params.authorId;

        db.query(
            'DELETE FROM author WHERE id = ?',
            [authorId], (err, result) => {
                if (err) throw err;

                res.redirect('/author');
            }
        );
    },

};
