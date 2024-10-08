const express = require('express');
const app = express();
const cookie = require('cookie');

app.get('/', function (req, res) {

    // res.writeHead(200, {
    //     'Set-Cookie': ['yummy_cookie=choco', 'tasty_cookie=strawberry']
    // });
    console.log(req.headers.cookie);
    var cookies = cookie.parse(req.headers.cookie);
    console.log(cookies);
    res.end('Cookie!');
});
app.listen(3000, () => console.log("Cookie Test"));

//시험 범위 쿠키까지