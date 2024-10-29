const db = require('./db');
const qs = require('querystring');
const sanitizeHtml = require('sanitize-html');
// const cookie = require('cookie');

function authIsOwner(req, res) {
    if (req.session.is_logined) {
        return true;
    } else {
        return false;
    }
}

function authStatusUI(req, res) {
    var login = '<a href="/login">login</a>';

    if (authIsOwner(req, res)) {
        login = '<a href="/logout_process">logout</a>';
    }

    return login;
};

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
    home: (req, res) => {
     db.query('SELECT *FROM TOPIC', (err, topics) => {
         var login = authStatusUI(req, res)

         var m = '<a href="/create">create</a>';
         var b = '<h2> Welcome</h2><p>Node.js Start page</p>';

         if (topics.length == 0) {
             b = '<h2> Welcome </h2><p>자료가 없으니 create 링크를 이용하여 자료를 입력하세요</p>'
         }

         var context = {
             title: "WEB Topic 테이블",
             login: login,
             list: topics,
             menu: m,
             body: b};
         res.render('home', context, (err, html) => {
             res.end(html);
         });
     });

    },

    page: (req, res) => {
        var login = authStatusUI(req, res);

        const id = req.params.pageId;

        db.query(
            'SELECT * FROM topic',
            (err, topics) => {
                if (err) throw err;

                db.query(
                    `SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id = ${id}`,
                    (err2, topic) => {
                        if (err2) throw err2;

                        var menu =
                            `
                        <a href="/create">create</a>&nbsp;&nbsp;
                        <a href="/update/${id}">update</a>&nbsp;&nbsp;
                        <a href="/delete/${id}" onclick='if(confirm("정말로 삭제하시겠습니까?")==false){ return false }'>delete</a>
                        `;

                        var body =
                            `
                        <h2>${topic[0].title}</h2>
                        <p>${topic[0].descrpt}</p>
                        <p>by ${topic[0].name}</p>
                        `;

                        var context = {
                            login: login,
                            title: topic[0].title,
                            list: topics,
                            menu: menu,
                            body: body,
                        };

                        res.render('home', context, (err, html) => res.end(html));
                    }
                );
            }
        );
    },

    create: (req, res) => {
        authIsLogin(req, res);
        var login = authStatusUI(req, res);

        db.query(
            'SELECT * FROM topic',
            (err, topics) => {
                if (err) throw err;

                db.query(
                    'SELECT * FROM author',
                    (err2, authors) => {
                        var i = 0;
                        var tag = '';

                        while(i < authors.length) {
                            tag += `<option value="${authors[i].id}">${authors[i].name}</option>`;
                            i++;
                        }

                        var body =
                            `
                        <form action="/create_process" method="post">
                            <p><input type="text" name="title" placeholder="title"></input></p>
                            <p><textarea name="description" placeholder="description"></textarea></p>
                            <p>
                                <select name="author">
                                    ${tag}
                                </select>
                            </p>
                            <p><input type="submit"></input></p>
                        </form>
                        `;

                        const context = {
                            login: login,
                            title: 'Topic Create',
                            list: topics,
                            menu: '',
                            body:
                                `
                            <form action="/create_process" method="post">
                                <p><input type="text" name="title" placeholder="title"></p>
                                <p><textarea name="description" placeholder="description"></textarea></p>
                                <p>
                                    <select name="author">
                                        ${tag}
                                    </select>
                                </p>
                                <p><input type="submit" value="Create"></p>
                                </form>
                            `
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
                var sanitizedTitle = sanitizeHtml(post.title);
                var sanitizedDescription = sanitizeHtml(post.description);
                var sanitizedAuthorId = sanitizeHtml(post.author);

                db.query(
                    'INSERT INTO topic (title, descrpt, created, author_id) VALUES (?, ?, NOW(), ?)',
                    [sanitizedTitle, sanitizedDescription, sanitizedAuthorId], (err, result) => {
                        if (err) throw err;

                        res.redirect(`/page/${result.insertId}`);
                        res.end();
                    }
                );
            }
        );
    },

    update: (req, res) => {
        authIsLogin(req, res);
        var login = authStatusUI(req, res);

        var id = req.params.pageId;

        db.query(
            'SELECT * FROM topic',
            (err, topics) => {
                if (err) throw err;

                db.query(
                    'SELECT * FROM topic WHERE id = ?',
                    [id], (err2, topic) => {
                        if (err2) throw err2;

                        db.query(
                            'SELECT * FROM author',
                            (err3, authors) => {
                                if (err3) throw err3;

                                var i = 0;
                                var tag = '';

                                while(i < authors.length) {
                                    var selected = '';

                                    if (authors[i].id === topic[0].author_id) {
                                        selected = 'selected';
                                    };

                                    tag += `<option value="${authors[i].id}" ${selected}>${authors[i].name}</option>`;
                                    i++;
                                };

                                var menu =
                                    `
                                <a href="/create">create</a>&nbsp;&nbsp;
                                <a href="/update/${topic[0].id}">update</a>
                                `;

                                var body =
                                    `
                                <form action="/update_process" method="post">
                                    <input type="hidden" name="id" value="${id}"></input>
                                    <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></input></p>
                                    <p><textarea name="description" placeholder="description">${topic[0].descrpt}</textarea></p>
                                    <p>
                                        <select name="author">
                                            ${tag}
                                        </select>
                                    </p>
                                    <p><input type="submit"></input></p>
                                </form>
                                `;

                                var context = {
                                    login: login,
                                    title: topic[0].title,
                                    list: topics,
                                    menu: menu,
                                    body: body,
                                };

                                res.render('home', context, (err, html) => res.end(html));
                            }
                        );
                    }
                );
            }
        );
    },

    update_process: (req, res) => {
        var body = '';
        req.on(
            'data',
            (data) => body += data
        );
        req.on(
            'end',
            () => {
                var post = qs.parse(body);
                var sanitizedTitle = sanitizeHtml(post.title);
                var sanitizedDescription = sanitizeHtml(post.description);
                var sanitizedAuthorId = sanitizeHtml(post.author);

                db.query(
                    'UPDATE topic SET title = ?, descrpt = ?, author_id = ? WHERE id = ?',
                    [sanitizedTitle, sanitizedDescription, sanitizedAuthorId, post.id], (err, result) => {
                        if (err) throw err;

                        res.writeHead(302, { Location: `/page/${post.id}` });
                        res.end();
                    }
                );
            }
        );
    },

    delete_process: (req, res) => {
        if (!authIsOwner(req, res)) {
            authIsLogin(req, res);
            return;
        }

        var id = req.params.pageId;

        db.query(
            'DELETE FROM topic WHERE id = ?',
            [id], (err, result) => {
                if (err) throw err;

                res.redirect('/');
            }
        );
    },

    login : (req, res) => {
        db.query('SELECT *FROM topic', (error, topics) => {
            var m = '<a href="/create">create</a>';
            var b= `<form action="/login_process" method="post">
<p><input type ="text" name="email" placeholder="email"></p>
<p><input type ="text" name="password" placeholder="password"> </p>
<p><input type ="submit"></p>
</form>`
            var context = {
                login: `<a href="/login">login</a>`,
                title: 'Login ID/PW 생성',
                list: topics,
                menu: m,
                body: b};
            req.app.render('home', context, (err,html) => {
                res.end(html);
            })
        })
    },

    login_process: (req, res) => {
        var body = '';

        req.on(
            'data',
            (data) => body += data
        );
        req.on(
            'end', () => {
                var post = qs.parse(body);

                if (post.email === 'bhwang99@gachon.ac.kr' && post.password === '123456') {
                    req.session.is_logined = true;
                    res.redirect('/');
                } else {
                    res.end('who?');
                }
            }
        );
    },

   logout_process : (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/');
    })}
}