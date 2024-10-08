const db = require('./db'); // db 설정을 가져옵니다.
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
                    list: topics,
                    menu: tag, // 저자 목록을 메뉴처럼 표시
                    body: b
                };
                res.render('home', context, (err, html) => res.end(html));
            });
        });
    },

    // Create process 메서드
    create_process: (req, res) => {
        var qs = require('querystring'); // 데이터를 파싱하기 위해 querystring 모듈 사용
        var body = '';

        req.on('data', (data) => {
            body += data;
        });

        req.on('end', () => {
            var post = qs.parse(body);
            var sanitizedName = sanitizeHtml(post.name);
            var sanitizedProfile = sanitizeHtml(post.profile);

            // 데이터베이스에 새로운 저자 삽입
            db.query(`INSERT INTO author (name, profile) VALUES (?, ?)`,
                [sanitizedName, sanitizedProfile], (error, result) => {
                    if (error) throw error;
                    res.redirect('/author'); // 완료 후 author 페이지로 리다이렉트
                });
        });
    }
};