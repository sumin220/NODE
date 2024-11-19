const db = require('./db');
const sanitizeHtml = require('sanitize-html');
const { authIsOwner } = require('./util');

module.exports = {
    // 지역별 고객 분석 결과 보기
    customerAnalysis: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);

        const sql1 = `
            SELECT address, ROUND((COUNT(*) / (SELECT COUNT(*) FROM person)) * 100, 2) AS rate
            FROM person
            GROUP BY address;
        `;
        const sql2 = `
            SELECT * FROM code;
        `;

        db.query(sql1 + sql2, (err, results) => {
            if (err) {
                console.error("데이터 분석 오류:", err);
                res.status(500).send("데이터 분석 중 오류가 발생했습니다.");
                return;
            }

            // 데이터 값 및 HTML 보안 처리
            const sanitizedPercentage = results[0].map(item => ({
                address: sanitizeHtml(item.address),
                rate: sanitizeHtml(item.rate.toString()),
            }));
            const sanitizedCodes = results[1].map(item => ({
                main_id: sanitizeHtml(item.main_id),
                sub_id: sanitizeHtml(item.sub_id),
                main_name: sanitizeHtml(item.main_name),
                sub_name: sanitizeHtml(item.sub_name),
            }));

            const context = {
                who: sanitizeHtml(name),
                login: sanitizeHtml(login),
                cls: sanitizeHtml(cls),
                body: 'ceoanal.ejs', // 분석 결과를 표시할 EJS
                percentage: sanitizedPercentage, // 보안 처리된 SQL1의 결과
                codes: sanitizedCodes,           // 보안 처리된 SQL2의 결과
            };

            req.app.render('mainFrame', context, (renderErr, html) => {
                if (renderErr) {
                    console.error("뷰 렌더링 오류:", renderErr);
                    res.status(500).send("페이지 렌더링 중 오류가 발생했습니다.");
                } else {
                    res.send(html);
                }
            });
        });
    }
};