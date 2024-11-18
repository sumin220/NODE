const db = require('./db');
const sanitizeHtml = require('sanitize-html');
const { authIsOwner } = require('./util');

module.exports = {
    // 테이블 목록 보기
    viewTables: (req, res) => { // tableManage.ejs
        const { name, login, cls } = authIsOwner(req, res);
        const sql = `
            SELECT TABLE_NAME, TABLE_COMMENT
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = 'webdb2024';
        `;

        db.query(sql, (err, results) => {
            if (err) throw err;

            const context = {
                who: name,
                login: login,
                body: 'tableManage.ejs',
                cls: cls,
                tables: results
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

        // 테이블 컬럼 및 데이터 조회
        const columnQuery = `
            SELECT COLUMN_NAME, COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'webdb2024' AND TABLE_NAME = ?;
        `;
        const dataQuery = `SELECT * FROM ${tableName};`;

        db.query(columnQuery, [tableName], (err, columns) => {
            if (err) {
                console.error('컬럼 조회 오류:', err);
                return res.status(500).send('컬럼 정보를 가져오는 중 오류가 발생했습니다.');
            }

            db.query(dataQuery, (err, rows) => {
                if (err) {
                    console.error('데이터 조회 오류:', err);
                    return res.status(500).send('데이터를 가져오는 중 오류가 발생했습니다.');
                }

                // 렌더링 컨텍스트 생성
                const context = {
                    who: name,
                    login: login,
                    cls: cls,
                    body: 'tableView.ejs',
                    tableName: tableName,
                    columns: columns,
                    rows: rows,
                };

                res.render('mainFrame', context, (err, html) => {
                    if (err) throw err;
                    res.end(html);
                });
            });
        });
    },

    createRow: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        const tableName = sanitizeHtml(req.params.tableName);

        // 테이블 컬럼 정보 가져오기
        const columnQuery = `
        SELECT COLUMN_NAME, COLUMN_COMMENT 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'webdb2024' AND TABLE_NAME = ?;
    `;

        db.query(columnQuery, [tableName], (err, columns) => {
            if (err) {
                console.error('컬럼 조회 오류:', err);
                return res.status(500).send('컬럼 정보를 가져오는 중 오류가 발생했습니다.');
            }

            const context = {
                who: name,
                login: login,
                cls: cls,
                body: 'tableCU.ejs',
                tableName: tableName,
                columns: columns,
                row: null, // 생성이므로 데이터 없음
            };

            res.render('mainFrame', context, (err, html) => {
                if (err) throw err;
                res.end(html);
            });
        });
    },

    updateRow: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        const tableName = sanitizeHtml(req.params.tableName);
        const rowId = sanitizeHtml(req.params.rowId);

        const columnQuery = `
        SELECT COLUMN_NAME, COLUMN_COMMENT 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'webdb2024' AND TABLE_NAME = ?;
    `;
        const dataQuery = `SELECT * FROM ${tableName} WHERE id = ?;`;

        db.query(columnQuery, [tableName], (err, columns) => {
            if (err) {
                console.error('컬럼 조회 오류:', err);
                return res.status(500).send('컬럼 정보를 가져오는 중 오류가 발생했습니다.');
            }

            db.query(dataQuery, [rowId], (err, rows) => {
                if (err || rows.length === 0) {
                    console.error('데이터 조회 오류:', err);
                    return res.status(404).send('해당 데이터를 찾을 수 없습니다.');
                }

                const context = {
                    who: name,
                    login: login,
                    cls: cls,
                    body: 'tableCU.ejs',
                    tableName: tableName,
                    columns: columns,
                    row: rows[0], // 수정할 데이터
                };

                res.render('mainFrame', context, (err, html) => {
                    if (err) throw err;
                    res.end(html);
                });
            });
        });
    },

    deleteRow: (req, res) => {
        const tableName = sanitizeHtml(req.params.tableName);
        const rowId = sanitizeHtml(req.params.rowId);

        const deleteQuery = `DELETE FROM ${tableName} WHERE id = ?;`;

        db.query(deleteQuery, [rowId], (err) => {
            if (err) {
                console.error('데이터 삭제 오류:', err);
                return res.status(500).send('데이터를 삭제하는 중 오류가 발생했습니다.');
            }

            res.redirect(`/table/view/${tableName}`);
        });
    }
};