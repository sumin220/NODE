const db = require('./db');
const sanitizeHtml = require('sanitize-html');
const { authIsOwner } = require('./util');

module.exports = {
    // 테이블 목록 보기
    viewTables: (req, res) => { // tableManage.ejs
        const { name, login, cls } = authIsOwner(req, res);
        const sql1 = `
            SELECT TABLE_NAME, TABLE_COMMENT
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = 'webdb2024';
        `;
        const sql2 = `
            SELECT * FROM code;
        `;
        const sql3 = `
            SELECT * FROM boardtype;
        `;

        db.query(sql1 + sql2 + sql3, (err, results) => {
            if (err) throw err;

            const context = {
                who: name,
                login: login,
                body: 'tableManage.ejs',
                cls: cls,
                tables: results[0], // 테이블 목록
                codes: results[1],  // 코드 데이터
                boardtypes: results[2], // boardtype 데이터
            };

            req.app.render('mainFrame', context, (err, html) => {
                if (err) throw err;
                res.end(html);
            });
        });
    },

    // 특정 테이블 데이터 보기
    viewTableColumns: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        const tableName = sanitizeHtml(req.params.tableName);

        const sql1 = `
            SELECT COLUMN_NAME, COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'webdb2024' AND TABLE_NAME = ?;
        `;
        const sql2 = `
            SELECT * FROM code;
        `;
        const sql3 = `
            SELECT * FROM boardtype;
        `;
        const dataQuery = `SELECT * FROM ${sanitizeHtml(tableName)};`;

        db.query(sql1 + sql2 + sql3, [tableName], (err, results) => {
            if (err) {
                console.error('컬럼 및 코드 데이터 조회 오류:', err);
                return res.status(500).send('데이터를 가져오는 중 오류가 발생했습니다.');
            }

            db.query(dataQuery, (err, rows) => {
                if (err) {
                    console.error('테이블 데이터 조회 오류:', err);
                    return res.status(500).send('데이터를 가져오는 중 오류가 발생했습니다.');
                }

                const context = {
                    who: name,
                    login: login,
                    cls: cls,
                    body: 'tableView.ejs',
                    tableName: tableName,
                    columns: results[0],  // 컬럼 데이터
                    codes: results[1],    // 코드 데이터
                    boardtypes: results[2], // boardtype 데이터
                    rows: rows,           // 테이블 데이터
                };

                req.app.render('mainFrame', context, (err, html) => {
                    if (err) throw err;
                    res.end(html);
                });
            });
        });
    },

    // 행 생성
    createRow: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        const tableName = sanitizeHtml(req.params.tableName);

        const sql1 = `
            SELECT COLUMN_NAME, COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'webdb2024' AND TABLE_NAME = ?;
        `;
        const sql2 = `
            SELECT * FROM code;
        `;
        const sql3 = `
            SELECT * FROM boardtype;
        `;

        db.query(sql1 + sql2 + sql3, [tableName], (err, results) => {
            if (err) {
                console.error('컬럼, 코드 및 boardtype 데이터 조회 오류:', err);
                return res.status(500).send('데이터를 가져오는 중 오류가 발생했습니다.');
            }

            const context = {
                who: name,
                login: login,
                cls: cls,
                body: 'tableCU.ejs',
                tableName: tableName,
                columns: results[0],  // 컬럼 데이터
                codes: results[1],    // 코드 데이터
                boardtypes: results[2], // boardtype 데이터
                row: null,            // 생성이므로 데이터 없음
            };

            req.app.render('mainFrame', context, (err, html) => {
                if (err) throw err;
                res.end(html);
            });
        });
    },

    // 행 업데이트
    updateRow: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        const tableName = sanitizeHtml(req.params.tableName);
        const rowId = sanitizeHtml(req.params.rowId);

        const sql1 = `
            SELECT COLUMN_NAME, COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'webdb2024' AND TABLE_NAME = ?;
        `;
        const sql2 = `
            SELECT * FROM code;
        `;
        const sql3 = `
            SELECT * FROM boardtype;
        `;
        const sql4 = `
            SELECT * FROM ${sanitizeHtml(tableName)} WHERE id = ?;
        `;

        db.query(sql1 + sql2 + sql3, [tableName], (err, results) => {
            if (err) {
                console.error('컬럼, 코드 및 boardtype 데이터 조회 오류:', err);
                return res.status(500).send('데이터를 가져오는 중 오류가 발생했습니다.');
            }

            db.query(sql4, [rowId], (err, rows) => {
                if (err || rows.length === 0) {
                    console.error('행 데이터 조회 오류:', err);
                    return res.status(404).send('해당 데이터를 찾을 수 없습니다.');
                }

                const context = {
                    who: name,
                    login: login,
                    cls: cls,
                    body: 'tableCU.ejs',
                    tableName: tableName,
                    columns: results[0],  // 컬럼 데이터
                    codes: results[1],    // 코드 데이터
                    boardtypes: results[2], // boardtype 데이터
                    row: rows[0],         // 수정할 행 데이터
                };

                req.app.render('mainFrame', context, (err, html) => {
                    if (err) throw err;
                    res.end(html);
                });
            });
        });
    },

    // 행 삭제
    deleteRow: (req, res) => {
        const tableName = sanitizeHtml(req.params.tableName);
        const rowId = sanitizeHtml(req.params.rowId);

        const sql = `DELETE FROM ${sanitizeHtml(tableName)} WHERE id = ?;`;

        db.query(sql, [rowId], (err) => {
            if (err) {
                console.error('행 삭제 오류:', err);
                return res.status(500).send('데이터를 삭제하는 중 오류가 발생했습니다.');
            }

            res.redirect(`/table/view/${tableName}`);
        });
    }
};