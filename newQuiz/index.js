const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');
const cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const expressSession = require('express-session');
var dbConfig = require(__dirname = '/config/db.js');
var settingRouter = require('./routes/setting'); // setting 라우터 생성
