var http = require('http');
var fs = require('fs');
var urlm = require('url');
var app = http.createServer(function (req, res) {
    var url = req.url;
    var queryData = urlm.parse(url, true).query;
    console.log(queryData.id);
    var title = queryData.id;
    console.log(url);
    if (url = "/") {
        title = 'welcome';
    }
    if (url = "/favicon.ico") {
        return res.writeHead(404);
    }

    res.writeHead(200);

    var template = fs.readFileSync(__dirname + url);
});
app.listen(3000);