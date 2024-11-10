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

        db.query('SELECT * FROM person', (error, persons) => {
            if (error) {
                console.error(error);
                return res.status(500).send('서버 에러가 발생했습니다.');
            }

            const context = {
                who: name,
                login: login,
                cls: cls,
                body: 'person.ejs',
                persons: persons
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
            body: 'personCU.ejs',
            title: '회원 생성',
            action: '/person/create_process',
            button: `<button class="btn btn-outline-primary btn-sm" type="submit">입력</button>`,
            person: {}
        };

        res.render('mainFrame', context);
    },

    create_process: (req, res) => {
        const { loginid, password, name, address, tel, birth, cls, grade } = req.body;

        db.query(
            'INSERT INTO person (loginid, password, name, address, tel, birth, class, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [loginid, password, name, address, tel, birth, cls, grade],
            (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('서버 에러가 발생했습니다.');
                }
                res.redirect('/person/view');
            }
        );
    },

    update: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        const loginId = req.params.loginId;

        db.query(
            'SELECT * FROM person WHERE loginid = ?',
            [loginId],
            (error, persons) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('서버 에러가 발생했습니다.');
                }

                if (persons.length === 0) {
                    return res.status(404).send('해당 사용자를 찾을 수 없습니다.');
                }

                const context = {
                    who: name,
                    login: login,
                    cls: cls,
                    body: 'personCU.ejs',
                    title: '회원 정보 수정',
                    action: '/person/update_process',
                    button: `<button class="btn btn-outline-primary btn-sm" type="submit">수정</button>`,
                    person: persons[0]
                };

                res.render('mainFrame', context);
            }
        );
    },

    update_process: (req, res) => {
        const { loginid, password, name, address, tel, birth, cls, grade } = req.body;

        db.query(
            'UPDATE person SET password = ?, name = ?, address = ?, tel = ?, birth = ?, class = ?, grade = ? WHERE loginid = ?',
            [password, name, address, tel, birth, cls, grade, loginid],
            (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('서버 에러가 발생했습니다.');
                }

                res.redirect('/person/view');
            }
        );
    },

    delete_process: (req, res) => {
        const loginId = req.params.loginId;

        db.query(
            'DELETE FROM person WHERE loginid = ?',
            [loginId],
            (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('서버 에러가 발생했습니다.');
                }

                res.redirect('/person/view');
            }
        );
    },
};