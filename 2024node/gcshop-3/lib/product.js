const db = require('./db');
const sanitizeHtml = require('sanitize-html');
const {authIsOwner} = require('./util');


module.exports = {
    view: (req, res)=>{ // product.ejs
        var {name, login, cls} = authIsOwner(req,res);
        var sql1 = `select * from boardtype; `;
        const sql2 = ` select * from code; `;
        var sql3 = `select * from product; `;

        db.query(sql1 + sql2 + sql3,(err,results)=>{
            if(err){
                throw err;
            }

            var context = {
                who:name,
                login: login,
                body: 'product.ejs',
                cls:cls,
                boardtypes: results[0],
                codes: results[1],
                products: results[2],
                routing: "product"
            };

            res.render("mainFrame", context, (err,html)=>{
                res.end(html);
            });
        })
    },

    create: (req, res)=>{ // productCU.ejs
        var {name, login, cls} = authIsOwner(req,res);
        var sql1 = `select * from boardtype;`;
        var sql2 = `select * from code; `;
        db.query(sql1 + sql2 ,(err,results)=>{
            if(err){
                throw err;
            }
            var context = {
                who:name,
                login:login,
                body: 'productCU.ejs',
                cls:cls,
                boardtypes: results[0],
                categorys: results[1],
                codes: results[1],
                mer : null
            }

            req.app.render('mainFrame', context, (err,html)=>{
                res.end(html);
            })
        }) // 1.query
    },
    create_process: (req, res) => {
        const post = req.body;
        const main_id = req.body.category.substring(0, 4);
        const sub_id = req.body.category.substring(4, 8);
        const sanName = sanitizeHtml(post.name);
        const sanPrice = sanitizeHtml(post.price);
        const sanStock = sanitizeHtml(post.stock);
        const sanBrand = sanitizeHtml(post.brand);
        const sanSupplier = sanitizeHtml(post.supplier);
        const sanImage = sanitizeHtml(post.image);
        const sanSaleYn = sanitizeHtml(post.sale_yn); // 'Y' or 'N'
        const sanSalePrice = post.sale_price ? sanitizeHtml(post.sale_price) : null; // 빈 값이면 NULL

        db.query(
            `INSERT INTO product(main_id, sub_id, name, price, stock, brand, supplier, image, sale_yn, sale_price)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [main_id, sub_id, sanName, sanPrice, sanStock, sanBrand, sanSupplier, sanImage, sanSaleYn, sanSalePrice],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.send(`<script>alert('상품 등록 중 오류가 발생했습니다.'); window.history.back();</script>`);
                }
                res.redirect('/product/view');
            }
        );
    },

    update: (req,res)=>{ // productCU.ejs
        const {name, login , cls} = authIsOwner(req,res);
        const sql1 = `select * from boardtype; `;
        const sql2 = `select * from code; `;
        const sql3 = `select * from product where mer_id = ` + req.params.merId + ';';

        db.query(sql1 + sql2 + sql3,(err,results)=>{
            if(err){
                throw err;
            }
            const context = {
                who:name,
                login : login,
                body : 'productCU.ejs',
                cls : cls,
                boardtypes: results[0],
                categorys: results[1],
                codes: results[1],
                mer: results[2],
            }
            req.app.render('mainFrame', context, (err,html)=>{
                res.end(html);
            })
        })
    },
    update_process: (req,res)=>{
        const post = req.body;
        const merId = req.body.merId;
        const mainId = req.body.category.substring(0,4);
        const subId = req.body.category.substring(4,8);
        const sanName = sanitizeHtml(post.name);
        const sanPrice = sanitizeHtml(post.price);
        const sanStock = sanitizeHtml(post.stock);
        const sanBrand = sanitizeHtml(post.brand);
        const sanSupplier = sanitizeHtml(post.supplier);
        const sanImage = sanitizeHtml(post.image);
        const sanSaleYn = sanitizeHtml(post.sale_yn);
        const sanSalePrice = sanitizeHtml(post.sale_price);

        db.query(`update product set
                                     main_id = ?, sub_id =?, name =?, price = ?,
                                     stock = ?, brand = ?, supplier = ?, sale_yn = ?, sale_price=?, image=? where mer_id = ?`,
            [mainId,subId,sanName,sanPrice,sanStock,sanBrand,sanSupplier,sanSaleYn,sanSalePrice,sanImage,merId],
            (err, result)=>{
                if(err){
                    throw err;
                }
                res.redirect('/product/view');
                res.end();
            }
        )
    },

    delete_process: (req,res)=>{
        const merId = req.params.merId;
        db.query(`delete from product where mer_id = ?`, merId, (err,result)=>{
            if(err){
                throw err;
            }
            res.redirect('/product/view');
            res.end();
        })
    }
}