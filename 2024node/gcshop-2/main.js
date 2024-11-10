var express = require('express');
var parseurl = require('parseurl');
var session = require('express-session');
var MySqlStore = require('express-mysql-session')(session);
var options = {
    host: 'localhost',
    user: 'nodejs',
    password: '0530',
    database: 'webdb2024'
};
const bodyParser = require("body-parser");

const rootRouter = require('./router/rootRouter');
const productRouter = require('./router/productRouter');
const authRouter = require('./router/authRouter');
const codeRouter = require('./router/codeRouter');
var personRouter = require('./router/personRouter');

const app = express();

app.use(express.static('public'));

var sessionStore = new MySqlStore(options);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', rootRouter);
app.use('/auth', authRouter);
app.use('/code', codeRouter);
app.use('/product', productRouter);
app.use('/person', personRouter);

app.get('/favicon.ico', (req, res) => res.writeHead(404));

app.listen(3000, function(){
    console.log('Example app listening on port 3000');
});