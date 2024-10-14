var http = requir('http'); //웹서버 기능
var fs = require('fs');
const {response} = require("express"); //파일 처리
var app = http.createServer(function (req, res) {
    //request를 듣고 해야하는 작업들을 정의
    var url = req.url; //요청된 url 정보 획득
    if (req.url == '/') {
        //각 요청에 따른 작업들을 코딩
        url = '/05-index.html';
    }
    if (req.url == '/favicon.ico') {
        return res.writeHead(404);
    }
    res.writeHead(200);
    console.log(__dirname + url);
    response.end((fs.readFileSync(__dirname + url))); //웹브라우저가 요청한 파일의 경로를 콘솔에 출력
});
app.listen(3000);
