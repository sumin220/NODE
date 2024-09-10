// var http = require('http');
// var fs = require('fs');
// var app = http.createServer(function (request, response) {

//     var url = request.url;
//     if(request.url === '/') {
//         url = '/index.html';
//     }
//     if(request.url == '/favicon.ico') {
//         return response.writeHead(404);
//         response.end();
//         return;
//     }
//     response.writeHead(200);
//     console.log(__dirname + url);
//     response.end(fs.readFileSync(__dirname + url));
// });
// app.listen(3000);



// const express = require('express') // express 모듈을 import, const에 의해 express 변수는 값이 바뀌지 않는다.
// const app = express() // ex[ress() 함수에 의해 Applicaiton 객체를 app에 저장

// app.get('/', (req, res) => res.end('Hello, Express!')) // app.get() 함수로 '/' 경로로 GET 요청
// app.get('/author', (req,res) => res.send('/author'))
// app.listen(3000, () => console.log('Server is running on port 3000'))



// const express = require('express') // express 모듈을 import, const에 의해 express 변수는 값이 바뀌지 않는다.
// const app = express(); // ex[ress() 함수에 의해 Applicaiton 객체를 app에 저장
// var urlm = require('url');

// app.get('/', (req, res) => {
//     var_url = req.url;
//     title = 'hello';
//     var queryData = urlm.parse(_url, true).query
//     console.log(queryData.id);
//     var title = queryData.id;

//     var template = `
//     <!doctype html>
// <html>
// <head>
// <title>WEB1 - ${title}</title>
// <meta charset="utf-8">
// </head>
// <body>
// <h1><a href="/">WEB</a></h1>
// <ol>
// <li><a href="/?id=HTML">HTML</a></li>
// <li><a href="/?id=CSS">CSS</a></li>
// <li><a href="/?id=JavaScript">JavaScript</a></li>
// </ol>
// <h2>${title}</h2>
// <p>Test</p>
// </body>
// </html> ` ;
// res.send(template);
// }) ;
// app.get('/favicon.ico',(req, res)=>res.writeHead(404));
// app.listen(3000, () => console.log('Example app listening on port 3000!')) ;


const express = require('express'); // express 모듈을 import
const app = express(); // express() 함수로 Application 객체 생성
var urlm = require('url'); // url 모듈 import

app.get('/', (req, res) => {
    var _url = req.url; // req.url을 _url 변수에 저장
    var queryData = urlm.parse(_url, true).query; // _url을 파싱하여 queryData 저장
    var title = queryData.id || 'hello'; // queryData.id가 없으면 기본값으로 'hello' 사용

    var template = `
    <!doctype html>
    <html>
    <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1><a href="/">WEB</a></h1>
        <ol>
            <li><a href="/?id=HTML">HTML</a></li>
            <li><a href="/?id=CSS">CSS</a></li>
            <li><a href="/?id=JavaScript">JavaScript</a></li>
        </ol>
        <h2>${title}</h2>
        <p>Test</p>
    </body>
    </html>`;
    
    res.send(template);
});

app.get('/favicon.ico', (req, res) => res.sendStatus(404)); // favicon 처리

app.listen(3000, () => console.log('Example app listening on port 3000!'));