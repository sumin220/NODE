const express = require('express');
const multer = require('multer');
const path = require('path');
const upload = multer({
    storage: multer.diskStorage({
        filename(req,file,cb){
            cb(null,file.originalname);
        },
        destination(req,file,cb){
            cb(null, path.resolve(__dirname, "../public/image/"));
        },
    }),
});

const router = express.Router();
const product = require('../lib/product');


router.get('/view', (req,res)=>{
    product.view(req,res);
})

router.get('/create', (req,res)=>{
    product.create(req,res);
})

router.post('/create_process', upload.single('uploadFile'),(req,res)=>{
    product.create_process(req,res);
})

router.get("/update/:merId", (req,res)=>{
    product.update(req,res);
})
router.post('/update_process', upload.single('uploadFile'), (req,res)=>{
    product.update_process(req,res);
})

router.get('/delete/:merId', (req,res)=>{{
    product.delete_process(req,res);
}})

module.exports = router;