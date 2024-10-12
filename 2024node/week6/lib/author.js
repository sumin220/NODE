const db = require('./db'); // DB 설정을 가져옵니다.
var sanitizeHtml = require('sanitize-html'); // 입력값을 안전하게 처리하는 모듈

module.exports = {
    create: (req, res) => {
        db.query('SELECT * FROM topic', (err, topics) => {
            if (err) throw err;
            db.query('SELECT * FROM author', (err2, authors) => {
                if (err2) throw err2;

                var tag = '<table border="1" style="border-collapse: collapse;">';
                for (let i = 0; i < authors.length; i++) {
                    tag += `<tr>
                        <td>${authors[i].name}</td>
                        <td>${authors[i].profile}</td>
                        <td><a href="/author/update/${authors[i].id}">update</a></td>
                        <td><a href="/author/delete/${authors[i].id}" onclick="if(confirm('정말로 삭제하시겠습니까?')==false){return false;}">delete</a></td>
                    </tr>`;
                }
                tag += '</table>';

                var b = `
                <form action="/author/create_process" method="post">
                    <p><input type="text" name="name" placeholder="name"></p>
                    <p><input type="text" name="profile" placeholder="profile"></p>
                    <p><input type="submit" value="저자 생성"></p>
                </form>`;

                var context = {
                    title: 'Home',
                    list: topics,
                    menu: tag,
                    body: b
                };
                res.render('home', context, (err, html) => res.end(html));
            });
        });
    },

    create_process: (req, res) => {
        const sanitizedName = sanitizeHtml(req.body.name);
        const sanitizedProfile = sanitizeHtml(req.body.profile);

        db.query(`INSERT INTO author (name, profile) VALUES (?, ?)`,
            [sanitizedName, sanitizedProfile], (error, result) => {
                if (error) throw error;
                res.redirect('/author');
            });
    },

    update: (req, res) => {
        const id = req.params.authorId;  // 수정된 부분: authorId 사용
        db.query('SELECT * FROM author WHERE id = ?', [id], (error, author) => {
            if (error) throw error;

            const b = `
                <form action="/author/update_process" method="post">
                    <input type="hidden" name="id" value="${id}">
                    <p><input type="text" name="name" placeholder="name" value="${sanitizeHtml(author[0].name)}"></p>
                    <p><input type="text" name="profile" placeholder="profile" value="${sanitizeHtml(author[0].profile)}"></p>
                    <p><input type="submit"></p>
                </form>`;

            var context = {
                title: 'Update Author',
                list: [], // 필요한 경우 변경 가능
                menu: '', // 필요한 경우 변경 가능
                body: b
            };
            res.render('home', context, (err, html) => {
                res.end(html);
            });
        });
    },

    update_process: (req, res) => {
        const sanitizedName = sanitizeHtml(req.body.name);
        const sanitizedProfile = sanitizeHtml(req.body.profile);

        db.query(`UPDATE author SET name = ?, profile = ? WHERE id = ?`,
            [sanitizedName, sanitizedProfile, req.body.id], (error, result) => {
                if (error) throw error;
                res.redirect('/author'); // 완료 후 author 페이지로 리다이렉트
            });
    },

    delete_process: (req, res) => {
        const id = req.params.authorId;  // 수정된 부분: authorId 사용
        db.query('DELETE FROM author WHERE id = ?', [id], (error, result) => {
            if (error) throw error;
            res.redirect('/author'); // 삭제 후 author 페이지로 리다이렉트
        });
    }
};