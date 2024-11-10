const express = require('express');
const router = express.Router();
const multer = require('multer');
const product = require('../lib/product');

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/image');
        },
        filename: function (req, file, cb) {
            const newFileName = Buffer.from(file.originalname, "latin1").toString("utf-8");
            cb(null, newFileName);
        }
    })
});

router.get('/view', product.view);
router.get('/create', product.create);
router.post('/create_process', upload.single('uploadFile'), product.create_process);
router.get('/update/:merId', product.update);
router.post('/update_process', upload.single('uploadFile'), product.update_process);
router.get('/delete/:merId', product.delete_process);

module.exports = router;