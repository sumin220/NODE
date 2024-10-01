const qs = require('querystring');

module.exports = {
    home: (req, res, connection) => {
        connection.query('SELECT * FROM topic', (error, topics) => {
            if (error) throw error;

            const context = {
                list: topics,
                menu: '<a href="/create">create</a>',
                body: '<h2>Welcome</h2><p>Node.js Start Page</p>'
            };

            req.app.render('home', context, (err, html) => {
                res.end(html);
            });
        });
    },

    page: (req, res, connection) => {
        const id = req.params.pageId;
        connection.query('SELECT * FROM topic', (error, topics) => {
            if (error) throw error;

            connection.query('SELECT * FROM topic WHERE id = ?', [id], (error2, topic) => {
                if (error2) throw error2;

                const context = {
                    list: topics,
                    menu: `<a href="/create">create</a>&nbsp;&nbsp;<a href="/update/${id}">update</a>&nbsp;&nbsp;<a href="/delete/${id}" onclick="return confirm('정말로 삭제하시겠습니까?');">delete</a>`,
                    body: `<h2>${topic[0].title}</h2><p>${topic[0].descrpt}</p>`
                };

                req.app.render('home', context, (err, html) => {
                    res.end(html);
                });
            });
        });
    },

    create: (req, res, connection) => {
        connection.query('SELECT * FROM topic', (error, topics) => {
            if (error) throw error;

            const body = `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p><textarea name="description" placeholder="description"></textarea></p>
                    <p><input type="submit" value="Submit"></p>
                </form>
            `;

            const context = {
                list: topics,
                menu: '<a href="/create">create</a>',
                body: body
            };

            req.app.render('home', context, (err, html) => {
                res.end(html);
            });
        });
    },

    create_process: (req, res, connection) => {
        const { title, description } = req.body;
        connection.query('INSERT INTO topic (title, descrpt, created) VALUES (?, ?, NOW())', [title, description], (error, result) => {
            if (error) throw error;
            res.redirect(`/page/${result.insertId}`);
        });
    },

    update: (req, res, connection) => {
        const id = req.params.pageId;
        connection.query('SELECT * FROM topic', (error, topics) => {
            if (error) throw error;

            connection.query('SELECT * FROM topic WHERE id = ?', [id], (error2, topic) => {
                if (error2) throw error2;

                const body = `
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${id}">
                        <p><input type="text" name="title" value="${topic[0].title}"></p>
                        <p><textarea name="description">${topic[0].descrpt}</textarea></p>
                        <p><input type="submit" value="Submit"></p>
                    </form>
                `;

                const context = {
                    list: topics,
                    menu: `<a href="/create">create</a>&nbsp;&nbsp;<a href="/update/${id}">update</a>&nbsp;&nbsp;<a href="/delete/${id}" onclick="return confirm('정말로 삭제하시겠습니까?');">delete</a>`,
                    body: body
                };

                req.app.render('home', context, (err, html) => {
                    res.end(html);
                });
            });
        });
    },

    update_process: (req, res, connection) => {
        const { id, title, description } = req.body;
        connection.query('UPDATE topic SET title = ?, descrpt = ? WHERE id = ?', [title, description, id], (error, result) => {
            if (error) throw error;
            res.redirect(`/page/${id}`);
        });
    },

    delete_process: (req, res, connection) => {
        const id = req.params.pageId;
        connection.query('DELETE FROM topic WHERE id = ?', [id], (error, result) => {
            if (error) throw error;
            res.redirect('/');
        });
    }
};