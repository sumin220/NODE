var qs = require('querystring');
const db = require('./db');
var sanitizeHtml = require("sanitize-html");

module.exports = {
    home: (req, res) => {
        db.query('SELECT * FROM topic', (error, topics) => {
            if (error) throw error;

            const context = {
                title: 'Home Page',
                list: topics,
                menu: '<a href="/create">create</a>',
                body: '<h2>Welcome</h2><p>Node.js Start Page</p>'
            };

            req.app.render('home', context, (err, html) => {
                if (err) {
                    return res.status(500).send('Error rendering home page.');
                }
                res.end(html);
            });
        });
    },

    page: (req, res) => {
        const id = req.params.pageId;
        db.query('SELECT * FROM topic', (error, topics) => {
            if (error) throw error;

            db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id = ?`, [id], (error2, topic) => {
                if (error2) throw error2;

                const menu = `
                <a href="/create">create</a>&nbsp;&nbsp;
                <a href="/update/${id}">update</a>&nbsp;&nbsp;
                <a href="/delete/${id}" onclick="return confirm('정말로 삭제하시겠습니까?');">delete</a>
            `;  // 폼 대신 <a> 링크로 변경
                const body = `<h2>${topic[0].title}</h2><p>${topic[0].descrpt}</p><p>By ${topic[0].name}</p>`;

                const context = {title: "page", list: topics, menu: menu, body: body };

                req.app.render('home', context, (err, html) => {
                    if (err) {
                        return res.status(500).send('Error rendering page.');
                    }
                    res.end(html);
                });
            });
        });
    },

    create: (req, res) => {
        db.query('SELECT * FROM topic', (error, topics) => {
            if (error) throw error;

            db.query('SELECT * FROM author', (err, authors) => {
                if (err) throw err;

                let tag = '';
                authors.forEach(author => {
                    tag += `<option value="${author.id}">${author.name}</option>`;
                });

                const context = {
                    title: 'Create Page',
                    list: topics,
                    menu: '',
                    body: `
                        <form action="/create_process" method="post">
                            <p><input type="text" name="title" placeholder="title"></p>
                            <p><textarea name="description" placeholder="description"></textarea></p>
                            <p><select name="author">${tag}</select></p>
                            <p><input type="submit" value="Create"></p>
                        </form>
                    `
                };

                req.app.render('home', context, (err, html) => {
                    if (err) {
                        return res.status(500).send('Error rendering create page.');
                    }
                    res.end(html);
                });
            });
        });
    },

    create_process: (req, res) => {
        const sanitizedTitle = sanitizeHtml(req.body.title);
        const sanitizedDescription = sanitizeHtml(req.body.description);
        const sanitizedAuthorId = sanitizeHtml(req.body.author);

        db.query(`INSERT INTO topic (title, descrpt, created, author_id) VALUES (?, ?, NOW(), ?)`,
            [sanitizedTitle, sanitizedDescription, sanitizedAuthorId], (error, result) => {
                if (error) {
                    console.error('Error inserting into topic:', error);
                    return res.status(500).send('Internal Server Error');
                }
                res.redirect(`/page/${result.insertId}`);
            });
    },

    update: (req, res) => {
        const id = req.params.pageId;
        db.query('SELECT * FROM topic', (error, topics) => {
            if (error) throw error;

            db.query('SELECT * FROM topic WHERE id = ?', [id], (error2, topic) => {
                if (error2) throw error2;

                db.query('SELECT * FROM author', (error3, authors) => {
                    if (error3) throw error3;

                    let tag = '';
                    authors.forEach(author => {
                        let selected = '';
                        if (author.id === topic[0].author_id) {
                            selected = 'selected';
                        }
                        tag += `<option value="${author.id}" ${selected}>${author.name}</option>`;
                    });

                    const main = `<a href="/create">create</a>&nbsp;&nbsp;<a href="/update/${topic[0].id}">update</a>`;
                    const body = `<form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${id}">
                        <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                        <p><textarea name="description" placeholder="description">${topic[0].descrpt}</textarea></p>
                        <p><select name="author">${tag}</select></p>
                        <p><input type="submit"></p>
                    </form>`;

                    const context = {
                        title: 'Update Page',
                        list: topics,
                        menu: main,
                        body: body
                    };

                    res.render('home', context, (err, html) => {
                        if (err) {
                            return res.status(500).send('Error rendering update page.');
                        }
                        res.end(html);
                    });
                });
            });
        });
    },

    update_process: (req, res) => {
        const sanitizedTitle = sanitizeHtml(req.body.title);
        const sanitizedDescription = sanitizeHtml(req.body.description);
        const sanitizedAuthorId = sanitizeHtml(req.body.author);
        const id = req.body.id;

        db.query(`UPDATE topic SET title = ?, descrpt = ?, author_id = ? WHERE id = ?`,
            [sanitizedTitle, sanitizedDescription, sanitizedAuthorId, id], (error, result) => {
                if (error) {
                    console.error('Error updating topic:', error);
                    return res.status(500).send('Internal Server Error');
                }
                res.redirect(`/page/${id}`);
            });
    },

    delete_process: (req, res) => {
        const id = req.params.pageId;  // GET 방식으로 전달된 pageId 사용
        db.query('DELETE FROM topic WHERE id = ?', [id], (error, result) => {
            if (error) {
                console.error('Error deleting topic:', error);
                return res.status(500).send('Internal Server Error');
            }
            res.redirect('/');
        });
    }
};