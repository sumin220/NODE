const db = require('./db');

function authIsOwner(req, res) {
    let name = 'Guest';
    let login = false;
    let cls = 'NON';
    if (req.session.is_logined) {
        name = req.session.name;
        login = true;
        cls = req.session.cls;
    }
    return { name, login, cls };
}

module.exports = {
    view: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);

        db.query('SELECT * FROM code', (error, codes) => {
            if (error) {
                console.error(error);
                return res.status(500).send('서버 에러가 발생했습니다.');
            }

            const context = {
                who: name,
                login: login,
                cls: cls,
                body: 'code.ejs',
                codes: codes
            };

            res.render('mainFrame', context);
        });
    },

    create: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);

        const context = {
            who: name,
            login: login,
            cls: cls,
            body: 'codeCU.ejs',
            title: '코드 등록',
            update_hidden: '',
            action: '/code/create_process',
            button: `<button class="btn btn-outline-primary btn-sm" type="submit">입력</button>`,
            code: {},
            isUpdate: false
        };

        res.render('mainFrame', context);
    },

    create_process: (req, res) => {
        const body = req.body;

        db.query(
            'INSERT INTO code (main_id, main_name, sub_id, sub_name, start, end) VALUES (?, ?, ?, ?, ?, ?)',
            [
                body.main_id,
                body.main_name,
                body.sub_id,
                body.sub_name,
                body.start,
                body.end
            ],
            (error, result) => {
                if (error) {
                    console.error("DB Insert Error:", error);
                    throw error;
                }
                res.redirect('/code/view');
            }
        );
    },

    update: (req, res) => {
        const main_id = req.params.main_id;
        const sub_id = req.params.sub_id;
        const start = req.params.start;
        const end = req.params.end;

        db.query(
            'SELECT * FROM code WHERE main_id = ? AND sub_id = ? AND start = ? AND end = ?',
            [main_id, sub_id, start, end],
            (error, codes) => {
                if (error) {
                    throw error;
                }

                const { name, login, cls } = authIsOwner(req, res);

                const context = {
                    who: name,
                    login: login,
                    cls: cls,
                    body: 'codeCU.ejs',
                    title: '코드 수정',
                    update_hidden: `
                    <input type="hidden" name="df_main_id" value="${main_id}">
                    <input type="hidden" name="df_sub_id" value="${sub_id}">
                    <input type="hidden" name="df_start" value="${start}">
                    <input type="hidden" name="df_end" value="${end}">
                `,
                    action: '/code/update_process',
                    button: `<button class="btn btn-outline-primary btn-sm" type="submit">수정</button>`,
                    code: codes[0],
                    isUpdate: true
                };

                res.render('mainFrame', context);
            }
        );
    },

    update_process: (req, res) => {
        const body = req.body;
        const df_main_id = body.df_main_id;
        const df_sub_id = body.df_sub_id;
        const df_start = body.df_start;
        const df_end = body.df_end;

        db.query(
            'UPDATE code SET main_name = ?, sub_name = ?, start = ?, end = ? WHERE main_id = ? AND sub_id = ? AND start = ? AND end = ?',
            [
                body.main_name,
                body.sub_name,
                body.start,
                body.end,
                df_main_id,
                df_sub_id,
                df_start,
                df_end
            ],
            (error, result) => {
                if (error) {
                    console.error("DB Update Error:", error);
                    throw error;
                }
                res.redirect('/code/view');
            }
        );
    },

    delete_process: (req, res) => {
        const main_id = req.params.main_id;
        const sub_id = req.params.sub_id;
        const start = req.params.start;
        const end = req.params.end;

        db.query(
            'DELETE FROM code WHERE main_id = ? AND sub_id = ? AND start = ? AND end = ?',
            [main_id, sub_id, start, end],
            (error, result) => {
                if (error) {
                    console.error("DB Delete Error:", error);
                    throw error;
                }
                res.redirect('/code/view');
            }
        );
    }
};

