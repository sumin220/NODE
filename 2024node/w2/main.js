var http = require('http');
var fs = require('fs');
const urlm = require("url");
var app = http.createServer(function (req, res) {
    var _url = req.url;
    var queryData = urlm.parse(_url, true).query;
    console.log(_url);
    console.log(queryData.id);

    if (req.url == '/') {
        _url = "/index.html";
    }
    if (req.url == '/favicon.ico') {
        return res.writeHead(404);
    }
    res.writeHead(200);
    //readFileSync 매개변수로 넘겨진 변수를 읽음
    var template = `
   
    <!doctype html>
    <html>
    <head>
    <title>
    WEB - ${queryData.id}
    </title>
</head>
   h2 - ${queryData.id}
    <body>
    
</body>
</html>
    `;

    res.end(template);
});
app.listen(3000);