const db = require('./db');
const {authIsOwner} = require('./util');
const { URL } = require('url');

module.exports = {
    home: (req, res) => {
        const {login, name, cls} = authIsOwner(req, res)
        const sql1 = 'select * from boardtype;';
        const sql2 = ` select * from code;`
        const sql3 = ` select * from product;`

        db.query(sql1 + sql2 + sql3, (error, results) => {
            if(error){
                throw error;
            }
            const context = {
                /*********** mainFrame.ejs에 필요한 변수 ***********/
                who: name,
                login: login,
                body: 'product.ejs',
                cls: cls,
                boardtypes: results[0],
                codes: results[1],
                products:results[2],
                routing: "root"
            };
            res.render('mainFrame', context, (err, html) => {
                if(err)
                    throw err;
                res.end(html)
            }); //render end
        }); //query end
    },

    categoryview: (req,res) =>{
        const {login, cls, name} = authIsOwner(req,res);
        const main_id = req.params.categ.substring(0,4);
        const sub_id = req.params.categ.substring(4,8);

        const sql1 = 'select * from boardtype;';
        const sql2 = ` select * from code;`
        const sql3 = ` select * from product where main_id = ${main_id} and sub_id = ${sub_id};`;

        db.query(sql1 + sql2 + sql3, (err, results) => {
            if(err){
                throw err;
            }
            const context = {
                who: name,
                login: login,
                body: 'product.ejs',
                cls: cls,
                boardtypes: results[0],
                codes: results[1],
                products:results[2],
                routing: "root"
            };

            res.render('mainFrame', context, (err, html) => {
                res.end(html)
            }); //render end
        });


    },

    search: (req,res)=>{
        const {login, cls, name} = authIsOwner(req,res);
        const sql1 = 'select * from boardtype;';
        const sql2 = ` select * from code;`
        const sql3 = ` select * from product
                            where name like '%${req.body.search}%' or
                            brand like '%${req.body.search}%' or
                            supplier like '%${req.body.search}%';`;

        db.query(sql1 + sql2 + sql3, (err, results) => {
            if(err){
                throw err;
            }
            const context = {
                who: name,
                login: login,
                body: 'product.ejs',
                cls: cls,
                boardtypes: results[0],
                codes: results[1],
                products:results[2],
                routing: "root"
            };

            res.render('mainFrame', context, (err, html) => {
                res.end(html)
            }); //render end
        });
    },
    detail :(req,res)=>{
        const {name, login, cls} = authIsOwner(req,res);
        const sql1 = 'select * from boardtype;';
        const sql2 = ` select * from code;`
        const sql3 = ` select * from product where mer_id = ${req.params.merId};`

        db.query(sql1 + sql2 + sql3, (error, results) => {
            if(error){
                throw error;
            }

            const context = {
                /*********** mainFrame.ejs에 필요한 변수 ***********/
                who: name,
                login: login,
                body: 'productDetail.ejs',
                cls: cls,
                boardtypes: results[0],
                codes: results[1],
                product:results[2][0],
                routing: "root"
            };

            res.render('mainFrame', context, (err, html) => {
                if(err)
                    throw err;
                res.end(html)
            }); //render end
        });
    }
}