var http = require('http');
var fs = require('fs');
const urlm = require("url");
var app = http.createServer(function (req, res) {
    var _url = req.url;
    var queryData = urlm.parse(_url, true).query;
    console.log(_url);
    console.log(queryData);

    if (req.url == '/') {
        _url = "/index.html";
    }
    if (req.url == '/favicon.ico') {
        return res.writeHead(404);
    }
    res.writeHead(200);
    //readFileSynd 매개변수로 넘겨진 변수를 일긍ㅁ
    res.end(fs.readFileSync(__dirname + url));
});
app.listen(3000);