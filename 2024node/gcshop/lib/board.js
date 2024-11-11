const db = require('./db');
const sanitizeHtml = require('sanitize-html');
const {authIsOwner} = require('./util');


module.exports = {
    typeview: (req, res) => {
        const {name, login, cls} = authIsOwner(req,res);
        const sql1 = `select * from boardtype; `;

        db.query(sql1, (err,results)=>{
            if(err){
                throw err;
            }
            const context = {
                who: name,
                login: login,
                cls: cls,
                body: 'boardtype.ejs',
                boardtypes: results,
                boardType: results
            }
            req.app.render('mainFrame', context, (err, html) => {
                res.end(html);
            })
        })
    },

    typecreate: (req, res) => {
        const {name, login, cls} = authIsOwner(req,res);
        const sql1 = `select * from boardtype; `;

        db.query(sql1, (err,results)=>{
            if(err){
                throw err;
            }

            const context = {
                who:name,
                login : login,
                cls : cls,
                body: 'boardtypeCU.ejs',
                boardtypes: results,
                boardtype: null
            }
            req.app.render('mainFrame', context, (err, html) => {
                res.end(html);
            })
        })
    },

    typecreate_process: (req, res) => {
        const post = req.body;
        const sanTitle = sanitizeHtml(post.title);
        const sanDescription = sanitizeHtml(post.description);
        const sanNumPage = sanitizeHtml(post.numPerPage);
        const write = post.write_YN;
        const review = post.re_YN;

        db.query(`insert into boardtype (title, description, write_YN, re_YN, numPerPage)
                        values(?,?,?,?,?);`,
            [sanTitle, sanDescription,write,review, sanNumPage ], (err, result) => {
                if (err) {
                    throw err;
                }
                res.redirect(`/board/type/view`);
            }
        )
    },

    typeupdate: (req, res) => {
        const {name, login, cls} = authIsOwner(req,res);
        const sql1 = `select * from boardtype; `;
        const sql2 = `select * from boardtype where type_id = ${req.params.typeId};`;

        db.query(sql1 + sql2, (err,results)=>{
            if(err){
                throw err;
            }

            const context = {
                who:name,
                login : login,
                cls : cls,
                body: 'boardtypeCU.ejs',
                boardtypes: results[0],
                boardtype: results[1]
            }
            req.app.render('mainFrame', context, (err, html) => {
                res.end(html);
            })
        })
    },

    typeupdate_process: (req, res) => {
        const post = req.body;
        const sanTitle = sanitizeHtml(post.title);
        const sanDescription = sanitizeHtml(post.description);
        const sanNumPage = sanitizeHtml(post.numPerPage);
        const write = post.write_YN;
        const review = post.re_YN;
        const typeId = post.type_id;

        db.query(`update boardtype set 
            title = ?, description=?, write_YN=?, re_YN=?, numPerPage=? where type_id=?;`,
            [sanTitle, sanDescription,write,review, sanNumPage,typeId ], (err, result) => {
                if(err){
                    throw err;
                }
                res.redirect(`/board/type/view`);
                res.end();
            }
        )
    },
    typedelete_process: (req, res) => {
        db.query(`delete from boardtype where type_id=?;`,req.params.typeId, (err,result)=>{
            if(err){
                throw err;
            }
            res.redirect(`/board/type/view`);
            res.end();
        })
    },

    view: (req, res) => {
        const {name, login, cls} = authIsOwner(req,res);
        const sanTypeId = sanitizeHtml(req.params.typeId);
        const pNum = req.params.pNum;
        const sql1 = `select * from boardtype;`
        const sql2 = ` select * from boardtype where type_id = ${sanTypeId};`
        const sql3 = ` select count(*) as total from board where type_id = ${sanTypeId};`

        db.query(sql1 + sql2 + sql3 , (err,results)=>{
            if(err){
                throw err;
            }
            const numPerPage = results[1][0].numPerPage;
            const offs = (pNum-1)*numPerPage;
            const totalPages = Math.ceil(results[2][0].total / numPerPage);

            db.query(`select b.board_id as board_id, b.title as title, b.date as date, p.name as name
                from board b inner join person p on b.loginid = p.loginid
                where b.type_id = ? and b.p_id = ? ORDER BY date desc, board_id desc LIMIT ? OFFSET ?`,
                [sanTypeId, 0, numPerPage, offs], (err2,boards)=> {
                if(err2){
                    throw err2;
                }
                    const context = {
                    who: name,
                    login: login,
                    cls: cls,
                    body: "board.ejs",
                    boardtypes: results[0],
                    boards: boards,
                    pNum: pNum,
                    totalPages: totalPages,
                    boardTypeInfo: results[1]
                }

                req.app.render('mainFrame', context, (err, html) => {
                    if(err){
                        throw err;
                    }
                    res.end(html);
                })
            })
        })
    },

    create: (req, res) => {
        const {name, login, cls} = authIsOwner(req,res);
        const sanTypeId = sanitizeHtml(req.params.typeId);
        var sql1 = `select * from boardtype; `;
        var sql2 = `select * from boardtype where type_id=${ sanTypeId }; `;

        db.query(sql1 + sql2 , (err,results)=>{
            if (err){
                throw err;
            }
            const context = {
                who: name,
                login: login,
                cls: cls,
                body: "boardCRU.ejs",
                boardtypes: results[0],
                boardInfo: null,
                userName :req.session.name,
                userLoginId: req.session.loginid,
                boardtypeInfo: results[1],
                mode: 'create'
            }

            req.app.render('mainFrame',context,(err,html)=>{
                if(err){
                    throw err;
                }
                res.end(html);
            })
        })
    },

    create_process: (req, res) => {
        const post = req.body;
        const typeId = post.type_id;
        const loginId = post.loginid;
        const sanTitle = sanitizeHtml(post.title);
        const sanContent = sanitizeHtml(post.content);
        const sanPwd = sanitizeHtml(post.password);

        db.query(`insert into board(type_id, loginid, password, title, date, content,p_id) values(?,?,?,?,NOW(),?,?);`,
            [typeId, loginId, sanPwd, sanTitle, sanContent,0  ], (err,results)=>{
            if(err){
                throw err;
            }
            res.redirect(`/board/view/${typeId}/1`);
            res.end();
        })
    },

    detail: (req, res) => {
        const {name, login, cls} = authIsOwner(req,res);
        const sanBoardId = sanitizeHtml(req.params.boardId);
        const pNum = sanitizeHtml(req.params.pNum);
        const sql1 = `select * from boardtype; `;
        const sql2 = 'select b.board_id as board_id, b.title as title,b.content as content, p.loginid as loginid, '+
                       'b.password as pwd , b.date as date, b.type_id as type_id, p.name as name'+
                ' from board b inner join person p on b.loginid = p.loginid where board_id = '+ sanBoardId + ';';
        db.query(sql1 + sql2, (err,results)=>{
            if(err){
                throw err;
            }

            const context ={
                who:name,
                login: login,
                cls:cls,
                body: 'boardCRU.ejs',
                mode: 'detail',
                boardtypes: results[0],
                boardInfo: results[1],
                pNum: pNum,
                userLoginId: req.session.loginid
            }
            req.app.render('mainFrame', context, (err, html) => {
                if(err){
                    throw err;
                }
                res.end(html);
            })
        })
    },

    update: (req, res) => {
        const {name, login, cls} = authIsOwner(req,res);
        const sanTypeId = sanitizeHtml(req.params.typeId);
        const sanBoardId = sanitizeHtml(req.params.boardId);
        const sanPnum = sanitizeHtml(req.params.pNum);
        const sql1 = `select * from boardtype; `;
        const sql2 = 'select b.board_id as board_id, b.title as title,b.content as content,'+
            'b.password as pwd , b.date as date, b.type_id as type_id, p.name as name'+
            ' from board b inner join person p on b.loginid = p.loginid where board_id = '+ sanBoardId + ';';
        const sql3 = ` select * from boardtype where type_id = ${sanTypeId}`;

        db.query(sql1 + sql2 + sql3, (err,results)=>{
            if (err){
                throw err;
            }
            const context ={
                who:name,
                login: login,
                cls:cls,
                body: 'boardCRU.ejs',
                mode: 'update',
                boardtypes: results[0],
                boardInfo: results[1],
                boardTypeInfo: results[2],
                userLoginId: req.session.loginid,
                pNum: sanPnum,
            }
            req.app.render('mainFrame', context, (err,html)=>{
                if(err){
                    throw err;
                }
                res.end(html);
            })
        })
    },

    update_process: (req, res) => {
        const post = req.body;
        const sanBoardId = sanitizeHtml(post.board_id);
        const sanTypeId = sanitizeHtml(post.type_id);
        const sanPnum = sanitizeHtml(post.pNum);
        const sanPwd = sanitizeHtml(post.password);
        const sanTitle = sanitizeHtml(post.title);
        const sanContent = sanitizeHtml(post.content);

        if(post.realPwd !== sanPwd){
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.end(`<script language=JavaScript type="text/javascript"> alert("비밀번호가 일치하지 않습니다.")
            setTimeout("location.href='http://localhost:3000/board/update/${sanBoardId}/${sanTypeId}/${sanPnum}/'", 1000)
            </script>`)
            return ;
        }

        db.query(`update board set title = ?, date = now(), content=? where board_id = ?`,
            [sanTitle, sanContent, sanBoardId],(err,results)=>{
            if (err){
                throw err;
            }
            res.redirect(`/board/view/${sanTypeId}/${sanPnum}`);
            res.end();
        })


    },

    delete_process: (req, res) => {
        const sanBoardId = sanitizeHtml(req.params.boardId);
        const sanTypeId = sanitizeHtml(req.params.typeId);
        const sanPnum = sanitizeHtml(req.params.pNum);
        db.query(`delete from board where board_id = ?`, [sanBoardId], (err,results)=>{
            if (err){
                throw err;
            }
            res.redirect(`/board/view/${sanTypeId}/${sanPnum}`);
            res.end();
        });

    }
};
