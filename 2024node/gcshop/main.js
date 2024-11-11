//202239895_손수민
const express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var MySqlStore = require('express-mysql-session')(session);

var options = {
    host : 'localhost',
    user : 'nodejs',
    password: 'nodejs',
    database: 'webdb2024'
};

var sessionStore = new MySqlStore(options);
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    /**
     * 암호화를 하기 위한 secret
     */
    secret : 'keyboard cat',
    resave : false, 
    saveUninitialized: true,
    store: sessionStore
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


const authorRouter = require('./router/authRouter');
const rootRouter = require('./router/rootRouter');
const codeRouter = require('./router/codeRouter');
const productRouter = require('./router/productRouter');
const personRouter = require('./router/personRouter');
const boardRouter = require('./router/boardRouter');


app.use('/', rootRouter);
app.use('/auth', authorRouter);
app.use('/code', codeRouter);
app.use('/product', productRouter);
app.use('/person', personRouter);
app.use('/board', boardRouter);

app.use(express.static('public'));

app.listen(3000, () => console.log('Example app listening on port 3000'));