const db = require('./db');
const sanitizeHtml = require('sanitize-html');
const {authIsOwner} = require('./util');

module.exports = {
    view: (req,res)=>{ //person.ejs
        const {name, login, cls} = authIsOwner(req);
        const sql1 = `select * from boardtype; `;
        const sql2 = ` select * from code; `;
        const sql3 = 'select * from person;';

        db.query(sql1 + sql2 + sql3,(err,results)=>{
            if(err){
                throw err;
            }
            const context = {
                who:name,
                login:login,
                body:'person.ejs',
                cls:cls,
                boardtypes: results[0],
                codes: results[1],
                persons: results[2],
            }

            req.app.render('mainFrame', context, (err,html)=>{
                res.end(html);
            })
        })

    },
    create: (req,res)=>{ // personCU.ejs
        const {name, login, cls} = authIsOwner(req);
        const sql1 = `select * from boardtype; `;
        const sql2 = ` select * from code; `;
        db.query(sql1+ sql2 ,(err,results)=>{
            if(err){
                throw err;
            }

            const context = {
                who:name,
                login:login,
                body: "personCU.ejs",
                cls:cls,
                boardtypes: results[0],
                codes: results[1],
                person: null
            }

            req.app.render('mainFrame', context, (err,html)=>{
                res.end(html);
            })
        })
    },
    create_process: (req,res)=>{
        const post = req.body;
        const sanId = sanitizeHtml(post.loginid);
        const sanPwd = sanitizeHtml(post.password);
        const sanName = sanitizeHtml(post.name);
        const sanAddress = sanitizeHtml(post.address);
        const sanTel = sanitizeHtml(post.tel);
        const sanbirth = sanitizeHtml(post.birth);


        db.query(`insert into person values(?,?,?,?,?,?,?,?)`,
            [sanId,sanPwd,sanName,sanAddress,sanTel,sanbirth,post.cls,post.grade],(err,results)=>{
                if(err)
                    throw err;
                res.redirect('/person/view');
                res.end();
            })
    },
    update: (req,res)=>{ // personCU.ejs
        const {name, login, cls} = authIsOwner(req);

        const sql1 = `select * from boardtype; `;
        const sql2 = ` select * from code; `;
        const sql3 = `select * from person where loginid = '${req.params.loginId}';`; // 2차원배열임

        db.query(sql1 + sql2 + sql3 ,(err,results)=>{
            if(err){
                throw err;
            }
            const context = {
                who:name,
                login:login,
                body: "personCU.ejs",
                cls:cls,
                boardtypes: results[0],
                codes: results[1],
                person: results[2],
            }

            req.app.render('mainFrame', context, (err,html)=>{
                res.end(html);
            })
        })
    },
    update_process: (req,res)=>{
        const post = req.body;
        const sanId = sanitizeHtml(post.loginid);
        const sanPwd = sanitizeHtml(post.password);
        const sanName = sanitizeHtml(post.name);
        const sanAddress = sanitizeHtml(post.address);
        const sanTel = sanitizeHtml(post.tel);
        const sanbirth = sanitizeHtml(post.birth);
        const cls = req.body.cls;
        const grade = req.body.grade;

        db.query(`update person set
                                    loginid=?, password = ?, name =?, address = ?, tel = ?, birth = ?, class = ?, grade = ?
                  where loginid = ?;`,[sanId,sanPwd,sanName,sanAddress,sanTel,sanbirth,cls,grade,sanId],
            (err,results)=>{
                if(err){
                    throw err;
                }
                res.redirect('/person/view');
                res.end();
            }
        )
    },
    delete_process: (req,res)=>{
        db.query(`delete from person where loginid = ?`, [req.params.loginId], (err,results)=>{
            if(err){
                throw err;
            }
            res.redirect('/person/view');
            res.end();
        })
    }
}