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
};

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
        db.query(
            'SELECT * FROM topic',
            (err, topics) => {
                if (err) throw err;

                var login = authStatusUI(req, res);

                const context = {
                    login: login,
                    title: 'HomePage',
                    list: topics,
                    menu: '<a href="/create">create</a>',
                    body:
                        `
                    <h2>Welcome</h2>
                    <p>Node.js Start Page</p>
                    `,
                };

                res.render('home', context, (err, html) => res.end(html));
            }
        );
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

    login: (req, res) => {
        db.query(
            'SELECT * FROM topic',
            (err, topics) => {
                if (err) throw err;

                var login = '<a href="/login">login</a>';
                var menu = '';
                var body =
                    `
                <form action="/login_process" method="post">
                    <p><input type="text" name="email" placeholder="email"></input></p>
                    <p><input type="password" name="password" placeholder="password"></input></p>
                    <p><input type="submit" value="제출"></input></p>
                </form>
                `;

                var context = {
                    login: login,
                    title: 'ID/PW 입력해주세요.',
                    list: [],
                    menu: menu,
                    body: body,
                };

                res.render('home', context, (err, html) => res.end(html));
            }
        );
    },

    login_process: (req, res) => {
        var body = '';

        req.on(
            'data',
            (data) => body += data
        );
        req.on(
            'end',
            () => {
                var post = qs.parse(body);

                if (post.email === 'bhwang99@gachon.ac.kr' && post.password === '123456') {
                    res.writeHead(
                        302,
                        {
                            'set-cookie': [
                                `email = ${post.email}`,
                                `password=${post.password}`,
                                `nickname='egoing'`
                            ],
                            Location: '/'
                        }
                    );
                    res.end();
                } else {
                    res.end('who?');
                }
            }
        );
    },

    logout_process: (req, res) => {
        res.writeHead(
            302,
            {
                'set-cookie': [
                    `email=;Max-Age=0`,
                    `password=;Max-Age=0`,
                    `nickname=;Max-Age=0`
                ],
                Location: '/'
            }
        );
        res.end();
    }
}