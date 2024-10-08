const db = require('./db');
const qs = require('querystring');

// 홈 화면 - 글 목록
exports.home = (req, res) => {
    db.query('SELECT * FROM topic', (error, topics) => {
        if (error) throw error;
        const context = {
            list: topics,
            menu: '<a href="/create">create</a>',
            body: '<h2>Welcome</h2><p>Node.js Start Page</p>',
        };
        res.render('home', context);
    });
};

// 글 상세 보기
exports.page = (req, res) => {
    const id = req.params.pageId;
    db.query('SELECT * FROM topic', (error, topics) => {
        if (error) throw error;
        db.query('SELECT * FROM topic WHERE id = ?', [id], (error2, topic) => {
            if (error2) throw error2;
            const context = {
                list: topics,
                menu: `<a href="/create">create</a>&nbsp;&nbsp;<a href="/update/${topic[0].id}">update</a>&nbsp;&nbsp;<a href="/delete/${topic[0].id}" onclick='return confirm("정말로 삭제하시겠습니까?")'>delete</a>`,
                body: `<h2>${topic[0].title}</h2><p>${topic[0].descrpt}</p>`,
            };
            res.render('home', context);
        });
    });
};

// 글 생성 화면
exports.create = (req, res) => {
    db.query('SELECT * FROM topic', (error, topics) => {
        if (error) throw error;
        const context = {
            list: topics,
            menu: '<a href="/create">create</a>',
            body: `<form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p><textarea name="description" placeholder="description"></textarea></p>
              <p><input type="submit"></p>
            </form>`,
        };
        res.render('home', context);
    });
};

// 글 생성 화면
exports.create = (req, res) => {
    db.query('SELECT * FROM topic', (error, topics) => {
        if (error) throw error;
        const context = {
            list: topics,
            menu: '<a href="/create">create</a>',
            body: `<form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p><textarea name="description" placeholder="description"></textarea></p>
              <p><input type="text" name="author_id" placeholder="author_id (optional)"></p>
              <p><input type="submit"></p>
            </form>`,
        };
        res.render('home', context);
    });
};

// 글 생성 처리
exports.create_process = (req, res) => {
    let body = '';
    req.on('data', (data) => {
        body += data;
    });
    req.on('end', () => {
        const post = qs.parse(body);
        const authorId = post.author_id || null;  // author_id가 없으면 null로 저장
        db.query(
            'INSERT INTO topic (title, descrpt, created, author_id) VALUES (?, ?, NOW(), ?)',
            [post.title, post.description, authorId],
            (error, result) => {
                if (error) throw error;
                res.redirect(`/page/${result.insertId}`);
            }
        );
    });
};

// 글 수정 화면
exports.update = (req, res) => {
    const id = req.params.pageId;
    db.query('SELECT * FROM topic', (error, topics) => {
        if (error) throw error;
        db.query('SELECT * FROM topic WHERE id = ?', [id], (error2, topic) => {
            if (error2) throw error2;
            const context = {
                list: topics,
                menu: `<a href="/create">create</a>&nbsp;&nbsp;<a href="/update/${topic[0].id}">update</a>&nbsp;&nbsp;<a href="/delete/${topic[0].id}" onclick='return confirm("정말로 삭제하시겠습니까?")'>delete</a>`,
                body: `<form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p><input type="text" name="title" value="${topic[0].title}"></p>
                <p><textarea name="description">${topic[0].descrpt}</textarea></p>
                <p><input type="text" name="author_id" value="${topic[0].author_id}"></p>
                <p><input type="submit"></p>
              </form>`,
            };
            res.render('home', context);
        });
    });
};

// 글 수정 처리
exports.update_process = (req, res) => {
    let body = '';
    req.on('data', (data) => {
        body += data;
    });
    req.on('end', () => {
        const post = qs.parse(body);
        const authorId = post.author_id || null;  // 수정 시 author_id도 업데이트
        db.query(
            'UPDATE topic SET title = ?, descrpt = ?, author_id = ? WHERE id = ?',
            [post.title, post.description, authorId, post.id],
            (error, result) => {
                if (error) throw error;
                res.redirect(`/page/${post.id}`);
            }
        );
    });
};