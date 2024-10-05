module.exports = {
    // 메인 페이지 (일정 목록 보기)
    home: (req, res, connection) => {
        connection.query('SELECT * FROM schedule05', (error, schedules) => {
            if (error) throw error;

            const context = {
                schedules: schedules,
                menu: '<a href="/create">일정생성</a>',
                detail: '<h2>상세일정</h2>'
            };

            res.render('05', context);
        });
    },

    // 일정 상세 페이지 보기
    page: (req, res, connection) => {
        const id = req.params.pageId;
        connection.query('SELECT * FROM schedule05', (error, schedules) => {
            if (error) throw error;

            connection.query('SELECT * FROM schedule05 WHERE id = ?', [id], (error2, schedule) => {
                if (error2) throw error2;

                const context = {
                    schedules: schedules,
                    menu: `<a href="/create">일정생성</a> &nbsp; <a href="/update/${id}">일정수정</a> &nbsp; <a href="/delete/${id}" onclick="return confirm('정말로 삭제하시겠습니까?');">일정삭제</a>`,
                    detail: `
                    <h2>${schedule[0].title}</h2>
                    <p><strong>일정 시작일 :</strong> ${schedule[0].start}</p>
                    <p><strong>일정 종료일 :</strong> ${schedule[0].end}</p>
                    <p><strong>상세 일정 :</strong> ${schedule[0].content}</p>
                `
                };

                res.render('05', context);
            });
        });
    },

    // 일정 생성 페이지
    create: (req, res, connection) => {
        connection.query('SELECT * FROM schedule05', (error, schedules) => {
            if (error) throw error;

            const context = {
                schedules: schedules,
                menu: '<a href="/create">일정생성</a>',
                detail: `
                    <form action="/create_process" method="post">
                        <p><input type="text" name="title" placeholder="일정제목"></p>
                        <p><input type="text" name="start" placeholder="시작날짜(YYYYMMDD)"</p>
                        <p><input type="text" name="end" placeholder="종료날짜(YYYYMMDD)"></p>
                        <p><textarea name="content" placeholder="내용"></textarea></p>
                        <p><input type="submit" value="제출"></p>
                    </form>
                `
            };

            res.render('05', context);
        });
    },

    // 일정 생성 처리
    create_process: (req, res, connection) => {
        const { title, start, end, content } = req.body;
        connection.query(
            'INSERT INTO schedule05 (title, start, end, content, created) VALUES (?, ?, ?, ?, NOW())',
            [title, start, end, content],
            (error, result) => {
                if (error) throw error;
                res.redirect(`/page/${result.insertId}`);
            }
        );
    },

    // 일정 수정 페이지
    update: (req, res, connection) => {
        const id = req.params.pageId;
        connection.query('SELECT * FROM schedule05', (error, schedules) => {
            if (error) throw error;

            connection.query('SELECT * FROM schedule05 WHERE id = ?', [id], (error2, schedule) => {
                if (error2) throw error2;

                const context = {
                    schedules: schedules,
                    menu: `<a href="/create">Create</a> &nbsp; <a href="/update/${id}">Update</a> &nbsp; <a href="/delete/${id}" onclick="return confirm('Are you sure you want to delete this schedule?');">Delete</a>`,
                    detail: `
                        <form action="/update_process" method="post">
                            <input type="hidden" name="id" value="${schedule[0].id}">
                            <p><input type="text" name="title" value="${schedule[0].title}"></p>
                            <p><textarea name="description">${schedule[0].descrpt}</textarea></p>
                            <p><input type="submit" value="Submit"></p>
                        </form>
                    `
                };

                res.render('05', context);
            });
        });
    },

    // 일정 수정 처리
    update_process: (req, res, connection) => {
        const { id, title, description } = req.body;
        connection.query('UPDATE schedule05 SET title = ?, descrpt = ? WHERE id = ?', [title, description, id], (error) => {
            if (error) throw error;
            res.redirect(`/page/${id}`);
        });
    },

    // 일정 삭제 처리
    delete_process: (req, res, connection) => {
        const id = req.params.pageId;
        connection.query('DELETE FROM schedule05 WHERE id = ?', [id], (error) => {
            if (error) throw error;
            res.redirect('/');
        });
    }
};