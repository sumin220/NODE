var qs = require('querystring');
const db = require('./db');
var sanitizeHtml = require("sanitize-html");

module.exports = {
    home: (req, res) => {
        db.query('SELECT * FROM topic', (error, topics) => {
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

    page: (req, res) => {
        const id = req.params.pageId;
        db.query('SELECT * FROM topic', (error, topics) => {
            if (error) throw error;

            // JOIN을 사용하여 topic 테이블과 author 테이블을 연결
            db.query(`
      SELECT topic.*, author.name FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id = ?`, [id], (error2, topic) => {
                    if (error2) throw error2;

                    // 작성자의 이름도 함께 body에 표시
                    const menu = `
        <a href="/create">create</a>&nbsp;&nbsp;
        <a href="/update/${id}">update</a>&nbsp;&nbsp;
        <a href="/delete/${id}" onclick="return confirm('정말로 삭제하시겠습니까?');">delete</a>
      `;
                    const body = `<h2>${topic[0].title}</h2><p>${topic[0].descrpt}</p><p>By ${topic[0].name}</p>`;  // 작성자 추가

                    const context = { list: topics, menu, body };

                    req.app.render('home', context, (err, html) => {
                        res.end(html);
                    });
                });
        });
    },

    create: (req, res) => {
        db.query(`SELECT * FROM topic`, (error, topics) => {
            if (error) {
                throw error;
            }
            db.query(`SELECT * FROM author`, (err, authors) => {
                if (err) throw err;
                var i = 0;
                var tag = '';
                while (i < authors.length) {
                    tag += `<option value="${authors[i].id}">${authors[i].name}</option>`;
                    i++;
                }
                var context = {
                    list: topics,
                    menu: `<a href="/create">create</a>`,
                    body: `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p><textarea name="description" placeholder="description"></textarea></p>
            <p><select name="author">${tag}</select></p>
            <p><input type="submit"></p>
          </form>`
                };
                req.app.render('home', context, (err, html) => {
                    if (err) throw err;
                    res.end(html);
                });
            });
        });
    },
    //
    // create_process: (req, res) => {
    //     const sanitizedTitle = sanitizeHtml(req.body.title);
    //     const sanitizedDescription = sanitizeHtml(req.body.description);
    //     const sanitizedAuthorId = sanitizeHtml(req.body.author);  // author_id로 수정
    //
    //     // INSERT 쿼리로 변경
    //     db.query(`INSERT INTO topic (title, descrpt, created, author_id) VALUES (?, ?, NOW(), ?)`,
    //         [sanitizedTitle, sanitizedDescription, sanitizedAuthorId], (error, result) => {
    //             if (error) {
    //                 throw error;
    //             }
    //             res.redirect(`/page/${result.insertId}`);
    //         }
    //     );
    // },

    create_process: (req, res) => {
        var body = '';
        req.on('data', (data) => {
            body += data;
        });
        req.on('end', () => {
            var post = qs.parse(body);
            var sanitizedTitle = sanitizeHtml(post.title);
            var sanitizedDescription = sanitizeHtml(post.description);
            var sanitizedAuthorId = sanitizeHtml(post.author);  // author_id로 수정

            // INSERT 쿼리로 변경
            db.query(`INSERT INTO topic (title, descrpt, created, author_id) VALUES (?, ?, NOW(), ?)`,
                [sanitizedTitle, sanitizedDescription, sanitizedAuthorId], (error, result) => {
                    if (error) {
                        throw error;
                    }
                    // res.writeHead(302, { Location: `/page/${result.insertId}` }); // 생성된 글로 리다이렉션
                    res.redirect(`/page/${result.insertId}`);
                    // res.end();
                });
        });
    },

    update : (req,res)=> {
        var id = req.params.pageId;
        db.query('select * from topic', (error, topics) => {
            if (error) {
                throw error
            }
            db.query(`select * from topic where id = ?`, [id], (error2, topic) => {
                if (error2) {
                    throw error2
                }
                db.query(`SELECT * FROM author`, (error3, authors) => {
                    if (error3) {
                        throw error3
                    }
                    var i = 0;
                    var tag =
                        '';
                    while (i < authors.length) {
                        var selected =
                            '';
                        if (authors[i].id === topic[0].author_id) {
                            selected = 'selected';
                        }
                        tag += `<option value="${authors[i].id}" ${selected}>${authors[i].name}</option>`;
                        i++;
                    }
                    var m = `<a href="/create">create</a>&nbsp;&nbsp;<a href="/update/${topic[0].id}">update</a>`
                    var b = `<form action="/update_process" method="post">
<input type="hidden" name="id" value="${id}">
<p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
<p><textarea name="description" placeholder="description">${topic[0].descrpt}</textarea></p>
<p><select name="author">
${tag}
</select></p>
<p><input type="submit"></p>
</form>`
                    var context = {
                        list: topics,
                        menu: m,
                        body: b
                    };
                    res.render('home', context, (err, html) => {
                        res.end(html)
                    });
                });
            });
        });
    },


    update_process : (req,res)=>{
        var body =
            '';
        req.on('data', (data)=>{
            body += data;
        });
        req.on('end',()=>{
            var post = qs.parse(body);
            var sanitizedTitle = sanitizeHtml(post.title);
            var sanitizedDescription = sanitizeHtml(post.description)
            var sanitizedAuthor = sanitizeHtml(post.author) //추가
            db.query(`update topic set title = ?, descrpt = ?, author_id = ? where id = ?`,
                [sanitizedTitle, sanitizedDescription, sanitizedAuthor, post.id],(error, result)=>{
                    if(error){ throw error }
                    res.writeHead(302, {Location: `/page/${post.id}`}); // redirection
                    res.end();
            });
        })
    },

    delete_process: (req, res) => {
        const id = req.params.pageId;
        db.query('DELETE FROM topic WHERE id = ?', [id], (error, result) => {
            if (error) throw error;
            res.redirect('/');
        });
    }
};